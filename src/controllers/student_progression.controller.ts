import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import ClassModel from "../models/class";
import ResultModel from "../models/result";
import StudentModel from "../models/student";
import { errorResponse, successResponse } from "../utils/responseHandler";

type ProgressionDecision = "advanced" | "promoted" | "repeated" | "graduated";

type ProgressionEntry = {
  student_id: string;
  decision: ProgressionDecision;
  target_class_id?: string;
};

const VALID_DECISIONS: ProgressionDecision[] = [
  "advanced",
  "promoted",
  "repeated",
  "graduated",
];

const TERM_VARIANTS: Record<string, string[]> = {
  "1st Term": ["1st Term", "1st term", "first_term"],
  "2nd Term": ["2nd Term", "2nd term", "second_term"],
  "3rd Term": ["3rd Term", "3rd term", "third_term"],
};

const calculateAverage = (blocks: Array<{ total?: number }> = []) => {
  if (blocks.length === 0) return undefined;
  const total = blocks.reduce(
    (sum, block) => sum + Number(block.total ?? 0),
    0,
  );
  return Math.round((total / blocks.length) * 100) / 100;
};

const getNextPeriod = (session: string, term: string) => {
  if (term === "1st Term") return { session, term: "2nd Term" };
  if (term === "2nd Term") return { session, term: "3rd Term" };

  const startYear = Number(session.split("/")[0]);
  return {
    session: `${startYear + 1}/${startYear + 2}`,
    term: "1st Term",
  };
};

export const getProgressionStudents = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { class_id, session, term } = req.query;

    if (!class_id || !session || !term || !ObjectId.isValid(String(class_id))) {
      return errorResponse(res, 400, "Class, session and term are required");
    }

    const organization = new ObjectId(account.organization_id);
    const classObjectId = new ObjectId(String(class_id));
    const classExists = await ClassModel.exists({
      _id: classObjectId,
      organization,
      is_active: true,
    });

    if (!classExists) return errorResponse(res, 404, "Class not found");

    const students = await StudentModel.find({
      organization,
      "academic_details.class": classObjectId,
      is_active: true,
      is_deleted: false,
    }).select("registration_number personal_information academic_details");

    const studentIds = students.map((student) => student._id);
    const results = await ResultModel.find({
      organization,
      student: { $in: studentIds },
      session,
      term: { $in: TERM_VARIANTS[String(term)] ?? [String(term)] },
    }).select("student blocks");

    const averages = new Map(
      results.map((result) => [
        String(result.student),
        calculateAverage(result.blocks),
      ]),
    );

    const response = students.map((student) => {
      const resultAverage = averages.get(String(student._id));
      const alreadyProcessed =
        student.academic_details.progression_history?.some(
          (history) =>
            history.from_session === session &&
            history.from_term === term &&
            String(history.from_class) === String(class_id),
        );

      return {
        _id: student._id,
        registration_number: student.registration_number,
        personal_information: student.personal_information,
        result_average: resultAverage,
        has_result: resultAverage !== undefined,
        already_processed: Boolean(alreadyProcessed),
      };
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const progressStudents = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      from_session,
      from_term,
      from_class_id,
      to_session,
      to_term,
      entries,
    } = req.body as {
      from_session: string;
      from_term: string;
      from_class_id: string;
      to_session: string;
      to_term: string;
      entries: ProgressionEntry[];
    };

    if (
      !from_session ||
      !from_term ||
      !to_session ||
      !to_term ||
      !ObjectId.isValid(from_class_id) ||
      !Array.isArray(entries) ||
      entries.length === 0
    ) {
      return errorResponse(
        res,
        400,
        "Complete progression details are required",
      );
    }

    const expectedPeriod = getNextPeriod(from_session, from_term);
    if (
      expectedPeriod.session !== to_session ||
      expectedPeriod.term !== to_term ||
      !/^\d{4}\/\d{4}$/.test(from_session) ||
      !TERM_VARIANTS[from_term]
    ) {
      return errorResponse(
        res,
        400,
        "The academic progression period is invalid",
      );
    }

    const organization = new ObjectId(account.organization_id);
    const fromClass = new ObjectId(from_class_id);
    const studentIds = entries.map((entry) => entry.student_id);

    if (studentIds.some((id) => !ObjectId.isValid(id))) {
      return errorResponse(res, 400, "A student selection is invalid");
    }

    const students = await StudentModel.find({
      _id: { $in: studentIds.map((id) => new ObjectId(id)) },
      organization,
      "academic_details.class": fromClass,
      is_active: true,
      is_deleted: false,
    });

    if (students.length !== entries.length) {
      return errorResponse(
        res,
        400,
        "One or more students no longer belong to the selected class",
      );
    }

    const targetClassIds = entries
      .map((entry) => entry.target_class_id)
      .filter((id): id is string => Boolean(id));
    if (targetClassIds.some((id) => !ObjectId.isValid(id))) {
      return errorResponse(res, 400, "A target class selection is invalid");
    }

    const uniqueTargetIds = [...new Set(targetClassIds)];
    const targetClasses = await ClassModel.countDocuments({
      _id: { $in: uniqueTargetIds.map((id) => new ObjectId(id)) },
      organization,
      is_active: true,
    });
    if (targetClasses !== uniqueTargetIds.length) {
      return errorResponse(
        res,
        400,
        "A target class does not belong to this school",
      );
    }

    const studentById = new Map(
      students.map((student) => [String(student._id), student]),
    );
    for (const entry of entries) {
      const student = studentById.get(entry.student_id)!;
      if (!VALID_DECISIONS.includes(entry.decision)) {
        return errorResponse(res, 400, "A progression decision is invalid");
      }
      if (
        student.academic_details.current_session &&
        (student.academic_details.current_session !== from_session ||
          student.academic_details.current_term !== from_term)
      ) {
        return errorResponse(
          res,
          409,
          `${student.registration_number} is no longer in the selected academic period`,
        );
      }

      const isYearEnd = from_term === "3rd Term";
      if (
        (!isYearEnd && entry.decision !== "advanced") ||
        (isYearEnd && entry.decision === "advanced")
      ) {
        return errorResponse(
          res,
          400,
          "The decision does not match the selected term",
        );
      }
      if (
        entry.decision === "repeated" &&
        entry.target_class_id !== from_class_id
      ) {
        return errorResponse(
          res,
          400,
          "A repeating student must remain in the same class",
        );
      }
      if (
        entry.decision === "promoted" &&
        entry.target_class_id === from_class_id
      ) {
        return errorResponse(
          res,
          400,
          "Choose a different class for a promoted student",
        );
      }
      if (
        entry.decision === "advanced" &&
        entry.target_class_id !== from_class_id
      ) {
        return errorResponse(
          res,
          400,
          "Students stay in the same class between terms",
        );
      }
      const wasProcessed = student.academic_details.progression_history?.some(
        (history) =>
          history.from_session === from_session &&
          history.from_term === from_term &&
          String(history.from_class) === from_class_id,
      );
      if (wasProcessed) {
        return errorResponse(
          res,
          409,
          `${student.registration_number} has already been processed for this term`,
        );
      }
      if (entry.decision !== "graduated" && !entry.target_class_id) {
        return errorResponse(
          res,
          400,
          "Every continuing student needs a target class",
        );
      }
    }

    const results = await ResultModel.find({
      organization,
      student: { $in: students.map((student) => student._id) },
      session: from_session,
      term: { $in: TERM_VARIANTS[from_term] ?? [from_term] },
    }).select("student blocks");
    const averages = new Map(
      results.map((result) => [
        String(result.student),
        calculateAverage(result.blocks),
      ]),
    );

    const operations = entries.map((entry) => {
      const targetClass = entry.target_class_id
        ? new ObjectId(entry.target_class_id)
        : undefined;
      const setUpdate: Record<string, unknown> = {
        "academic_details.current_session": to_session,
        "academic_details.current_term": to_term,
      };
      if (targetClass) setUpdate["academic_details.class"] = targetClass;
      if (entry.decision === "graduated") setUpdate.is_active = false;

      return {
        updateOne: {
          filter: { _id: new ObjectId(entry.student_id), organization },
          update: {
            $set: setUpdate,
            $push: {
              "academic_details.progression_history": {
                from_session,
                from_term,
                from_class: fromClass,
                to_session,
                to_term,
                to_class: targetClass,
                decision: entry.decision,
                result_average: averages.get(entry.student_id),
                processed_at: new Date(),
                processed_by: new ObjectId(account.account_id),
              },
            },
          },
        },
      };
    });

    await StudentModel.bulkWrite(operations as any);
    return successResponse(res, 200, { processed: entries.length });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
