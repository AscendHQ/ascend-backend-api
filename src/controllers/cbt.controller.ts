import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import CbtAttemptModel from "../models/cbt_attempt";
import CbtExamModel from "../models/cbt_exam";
import ClassModel from "../models/class";
import StudentModel from "../models/student";
import StudentProfileModel from "../models/student_profile";
import SubjectModel from "../models/subject";
import SubjectRegistrationModel from "../models/subject_registration";
import { errorResponse, successResponse } from "../utils/responseHandler";

type QuestionInput = {
  prompt?: unknown;
  options?: unknown;
  correct_option?: unknown;
  marks?: unknown;
};

const validId = (value: unknown): value is string =>
  typeof value === "string" && ObjectId.isValid(value);

const referenceId = (value: unknown) => {
  if (value && typeof value === "object" && "_id" in value) {
    return (value as { _id: ObjectId })._id;
  }
  return value as ObjectId;
};

const sanitizeQuestion = (question: any) => ({
  _id: String(question._id),
  prompt: question.prompt,
  options: question.options,
  marks: question.marks,
});

const normalizeQuestions = (questions: unknown) => {
  if (!Array.isArray(questions) || questions.length === 0) return undefined;
  const normalized = questions.map((input: QuestionInput) => {
    const prompt = typeof input.prompt === "string" ? input.prompt.trim() : "";
    const options = Array.isArray(input.options)
      ? input.options.map((option) => String(option).trim()).filter(Boolean)
      : [];
    const correctOption = Number(input.correct_option);
    const marks = Number(input.marks ?? 1);
    if (
      !prompt ||
      options.length < 2 ||
      options.length > 6 ||
      new Set(options).size !== options.length ||
      !Number.isInteger(correctOption) ||
      correctOption < 0 ||
      correctOption >= options.length ||
      !Number.isFinite(marks) ||
      marks < 1
    ) {
      return undefined;
    }
    return {
      prompt,
      options,
      correct_option: correctOption,
      marks,
    };
  });
  return normalized.every(Boolean) ? normalized : undefined;
};

const getStudent = async (req: Request) => {
  const organization = new ObjectId(req.account.organization_id);
  const profile = await StudentProfileModel.findOne({
    organization,
    account: new ObjectId(req.account.account_id),
  });
  if (!profile) return undefined;
  return StudentModel.findOne({
    _id: profile.student,
    organization,
    is_deleted: false,
    is_active: true,
  }).select("academic_details.class registration_number personal_information");
};

const studentCanTakeSubject = async (
  organization: ObjectId,
  studentId: ObjectId,
  classId: ObjectId,
  session: string,
  term: string,
  subjectId: ObjectId,
) => {
  const isCoreSubject = () =>
    SubjectModel.exists({
      _id: subjectId,
      organization,
      classes: classId,
      type: "core",
    });
  const registration = await SubjectRegistrationModel.findOne({
    organization,
    student: studentId,
    class: classId,
    session,
    term,
  }).select("selected_subjects additional_subjects");
  if (!registration) return Boolean(await isCoreSubject());
  const registrationData = registration.toObject();
  if (
    Object.prototype.hasOwnProperty.call(registrationData, "selected_subjects")
  ) {
    return (registration.selected_subjects ?? []).some(
      (item) => String(item) === String(subjectId),
    );
  }
  const isLegacyElective = (registration.additional_subjects ?? []).some(
    (item) => String(item) === String(subjectId),
  );
  if (isLegacyElective) return true;
  return Boolean(await isCoreSubject());
};

const submitAttemptDocument = async (attempt: any, exam: any) => {
  const selected = new Map(
    attempt.answers.map((answer: any) => [
      String(answer.question_id),
      answer.selected_option,
    ]),
  );
  const score = exam.questions.reduce(
    (total: number, question: any) =>
      selected.get(String(question._id)) === question.correct_option
        ? total + question.marks
        : total,
    0,
  );
  attempt.status = "submitted";
  attempt.submitted_at = new Date();
  attempt.score = score;
  attempt.total_marks = exam.total_marks;
  attempt.percentage = Number(((score / exam.total_marks) * 100).toFixed(2));
  await attempt.save();
  return attempt;
};

export const createCbtExam = async (req: Request, res: Response) => {
  try {
    const organization = new ObjectId(req.account.organization_id);
    const {
      title,
      instructions,
      class_id,
      subject_id,
      session,
      term,
      duration_minutes,
      starts_at,
      ends_at,
      questions,
    } = req.body;
    const normalizedQuestions = normalizeQuestions(questions);
    const startsAt = new Date(starts_at);
    const endsAt = new Date(ends_at);
    const duration = Number(duration_minutes);
    if (
      typeof title !== "string" ||
      !title.trim() ||
      !validId(class_id) ||
      !validId(subject_id) ||
      typeof session !== "string" ||
      !session.trim() ||
      !["1st Term", "2nd Term", "3rd Term"].includes(term) ||
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 300 ||
      Number.isNaN(startsAt.getTime()) ||
      Number.isNaN(endsAt.getTime()) ||
      endsAt <= startsAt ||
      !normalizedQuestions
    ) {
      return errorResponse(
        res,
        400,
        "Valid CBT examination details are required",
      );
    }
    const [classExists, subjectExists] = await Promise.all([
      ClassModel.exists({ _id: new ObjectId(class_id), organization }),
      SubjectModel.exists({ _id: new ObjectId(subject_id), organization }),
    ]);
    if (!classExists || !subjectExists) {
      return errorResponse(
        res,
        400,
        "The selected class or subject is invalid",
      );
    }
    const totalMarks = normalizedQuestions.reduce(
      (total, question) => total + (question?.marks ?? 0),
      0,
    );
    const exam = await CbtExamModel.create({
      organization,
      title: title.trim(),
      instructions,
      class: new ObjectId(class_id),
      subject: new ObjectId(subject_id),
      session: session.trim(),
      term,
      duration_minutes: duration,
      starts_at: startsAt,
      ends_at: endsAt,
      questions: normalizedQuestions,
      total_marks: totalMarks,
      created_by: new ObjectId(req.account.account_id),
    });
    return successResponse(res, 201, exam);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const listCbtExams = async (req: Request, res: Response) => {
  try {
    const exams = await CbtExamModel.find({
      organization: new ObjectId(req.account.organization_id),
    })
      .populate({ path: "class", select: "name section other_section" })
      .populate({ path: "subject", select: "name code" })
      .sort({ starts_at: -1 });
    const examIds = exams.map((exam) => exam._id);
    const counts = await CbtAttemptModel.aggregate([
      { $match: { exam: { $in: examIds } } },
      {
        $group: {
          _id: "$exam",
          attempts: { $sum: 1 },
          submitted: {
            $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] },
          },
        },
      },
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item]));
    return successResponse(
      res,
      200,
      exams.map((exam) => ({
        ...exam.toObject(),
        question_count: exam.questions.length,
        attempt_count: countMap.get(String(exam._id))?.attempts ?? 0,
        submitted_count: countMap.get(String(exam._id))?.submitted ?? 0,
      })),
    );
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateCbtExamStatus = async (req: Request, res: Response) => {
  try {
    const { exam_id } = req.params;
    const { status } = req.body;
    if (
      !validId(exam_id) ||
      !["draft", "published", "closed"].includes(status)
    ) {
      return errorResponse(res, 400, "A valid examination status is required");
    }
    const exam = await CbtExamModel.findOneAndUpdate(
      {
        _id: new ObjectId(exam_id),
        organization: new ObjectId(req.account.organization_id),
      },
      { $set: { status } },
      { new: true },
    );
    if (!exam) return errorResponse(res, 404, "CBT examination not found");
    return successResponse(res, 200, exam);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const listStudentCbtExams = async (req: Request, res: Response) => {
  try {
    const organization = new ObjectId(req.account.organization_id);
    const student = await getStudent(req);
    const classId = student?.academic_details?.class;
    if (!student || !classId)
      return errorResponse(res, 404, "Student class not found");
    const exams = await CbtExamModel.find({
      organization,
      class: classId,
      status: { $in: ["published", "closed"] },
    })
      .select("-questions")
      .populate({ path: "subject", select: "name code" })
      .sort({ starts_at: -1 })
      .lean();
    const eligibleExams = (
      await Promise.all(
        exams.map(async (exam) =>
          (await studentCanTakeSubject(
            organization,
            student._id,
            referenceId(classId),
            exam.session,
            exam.term,
            referenceId(exam.subject),
          ))
            ? exam
            : undefined,
        ),
      )
    ).filter((exam): exam is (typeof exams)[number] => Boolean(exam));
    const attempts = await CbtAttemptModel.find({
      organization,
      student: student._id,
      exam: { $in: eligibleExams.map((exam) => exam._id) },
    }).lean();
    const attemptMap = new Map(
      attempts.map((item) => [String(item.exam), item]),
    );
    return successResponse(
      res,
      200,
      eligibleExams.map((exam) => ({
        ...exam,
        attempt: attemptMap.get(String(exam._id)),
      })),
    );
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const startCbtAttempt = async (req: Request, res: Response) => {
  try {
    const { exam_id } = req.params;
    if (!validId(exam_id))
      return errorResponse(res, 400, "Invalid examination");
    const organization = new ObjectId(req.account.organization_id);
    const student = await getStudent(req);
    if (!student) return errorResponse(res, 404, "Student not found");
    const exam: any = await CbtExamModel.findOne({
      _id: new ObjectId(exam_id),
      organization,
      class: student.academic_details?.class,
      status: "published",
    });
    if (!exam) return errorResponse(res, 404, "Examination is not available");
    const isRegistered = await studentCanTakeSubject(
      organization,
      student._id,
      referenceId(student.academic_details.class),
      exam.session,
      exam.term,
      referenceId(exam.subject),
    );
    if (!isRegistered) {
      return errorResponse(
        res,
        403,
        "Student is not registered for this subject",
      );
    }
    const now = new Date();
    if (now < exam.starts_at)
      return errorResponse(res, 409, "Examination has not started");
    if (now > exam.ends_at)
      return errorResponse(res, 409, "Examination has ended");
    let attempt: any = await CbtAttemptModel.findOne({
      organization,
      exam: exam._id,
      student: student._id,
    });
    if (attempt?.status === "submitted") {
      return errorResponse(
        res,
        409,
        "This examination has already been submitted",
      );
    }
    if (!attempt) {
      const durationEnd = new Date(
        now.getTime() + exam.duration_minutes * 60000,
      );
      attempt = await CbtAttemptModel.create({
        organization,
        exam: exam._id,
        student: student._id,
        started_at: now,
        expires_at: durationEnd < exam.ends_at ? durationEnd : exam.ends_at,
      });
    }
    if (new Date() >= attempt.expires_at) {
      await submitAttemptDocument(attempt, exam);
      return errorResponse(res, 409, "Examination time has elapsed");
    }
    return successResponse(res, 200, {
      attempt: {
        _id: attempt._id,
        answers: attempt.answers,
        expires_at: attempt.expires_at,
        status: attempt.status,
      },
      exam: {
        _id: exam._id,
        title: exam.title,
        instructions: exam.instructions,
        subject: exam.subject,
        session: exam.session,
        term: exam.term,
        total_marks: exam.total_marks,
        questions: exam.questions.map(sanitizeQuestion),
      },
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const saveCbtAnswer = async (req: Request, res: Response) => {
  try {
    const { attempt_id } = req.params;
    const { question_id, selected_option } = req.body;
    if (
      !validId(attempt_id) ||
      !validId(question_id) ||
      !Number.isInteger(selected_option)
    ) {
      return errorResponse(res, 400, "A valid answer is required");
    }
    const organization = new ObjectId(req.account.organization_id);
    const student = await getStudent(req);
    const attempt: any = await CbtAttemptModel.findOne({
      _id: new ObjectId(attempt_id),
      organization,
      student: student?._id,
      status: "in_progress",
    });
    if (!attempt) return errorResponse(res, 404, "Active attempt not found");
    const exam: any = await CbtExamModel.findById(attempt.exam);
    const question = exam?.questions.id(question_id);
    if (
      !question ||
      selected_option < 0 ||
      selected_option >= question.options.length
    ) {
      return errorResponse(res, 400, "Answer option is invalid");
    }
    if (new Date() >= attempt.expires_at) {
      await submitAttemptDocument(attempt, exam);
      return errorResponse(res, 409, "Examination time has elapsed");
    }
    const answer = attempt.answers.find(
      (item: any) => String(item.question_id) === question_id,
    );
    if (answer) answer.selected_option = selected_option;
    else
      attempt.answers.push({
        question_id: new ObjectId(question_id),
        selected_option,
      });
    await attempt.save();
    return successResponse(res, 200, { saved: true });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const submitCbtAttempt = async (req: Request, res: Response) => {
  try {
    const { attempt_id } = req.params;
    if (!validId(attempt_id)) return errorResponse(res, 400, "Invalid attempt");
    const organization = new ObjectId(req.account.organization_id);
    const student = await getStudent(req);
    const attempt: any = await CbtAttemptModel.findOne({
      _id: new ObjectId(attempt_id),
      organization,
      student: student?._id,
    });
    if (!attempt) return errorResponse(res, 404, "Attempt not found");
    if (attempt.status === "submitted")
      return successResponse(res, 200, attempt);
    const exam: any = await CbtExamModel.findById(attempt.exam);
    if (!exam) return errorResponse(res, 404, "Examination not found");
    await submitAttemptDocument(attempt, exam);
    return successResponse(res, 200, attempt);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const listCbtExamAttempts = async (req: Request, res: Response) => {
  try {
    const { exam_id } = req.params;
    if (!validId(exam_id))
      return errorResponse(res, 400, "Invalid examination");
    const organization = new ObjectId(req.account.organization_id);
    const exam = await CbtExamModel.exists({
      _id: new ObjectId(exam_id),
      organization,
    });
    if (!exam) return errorResponse(res, 404, "Examination not found");
    const attempts = await CbtAttemptModel.find({
      organization,
      exam: new ObjectId(exam_id),
    })
      .populate({
        path: "student",
        select: "registration_number personal_information",
      })
      .sort({ submitted_at: -1, started_at: -1 });
    return successResponse(res, 200, attempts);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
