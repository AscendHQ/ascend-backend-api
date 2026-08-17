import { ObjectId } from "mongodb";
import { Request, Response } from "express";

import ClassModel from "../models/class";
import OrganizationModel from "../models/organization";
import ResultModel from "../models/result";
import StudentModel from "../models/student";
import SubjectRegistrationModel from "../models/subject_registration";
import { errorResponse, successResponse } from "../utils/responseHandler";

const VALID_TERMS = ["1st Term", "2nd Term", "3rd Term"];

const getNextPeriod = (session: string, term: string) => {
  if (term === "1st Term") return { session, term: "2nd Term" };
  if (term === "2nd Term") return { session, term: "3rd Term" };

  const startYear = Number(session.split("/")[0]);
  return {
    session: `${startYear + 1}/${startYear + 2}`,
    term: "1st Term",
  };
};

const validatePeriod = (session: unknown, term: unknown) =>
  typeof session === "string" &&
  /^\d{4}\/\d{4}$/.test(session) &&
  typeof term === "string" &&
  VALID_TERMS.includes(term);

const getClassReadiness = async (
  organization: ObjectId,
  classRecord: {
    _id: ObjectId;
    name: string;
    level: string;
    section?: string;
    other_section?: string;
  },
  session: string,
  term: string,
) => {
  const processedStudents = await StudentModel.find({
    organization,
    "academic_details.progression_history": {
      $elemMatch: {
        from_session: session,
        from_term: term,
        from_class: classRecord._id,
      },
    },
  }).select("_id");

  const awaitingProgression = await StudentModel.find({
    organization,
    "academic_details.class": classRecord._id,
    is_active: true,
    is_deleted: false,
    $or: [
      { "academic_details.current_session": { $exists: false } },
      {
        "academic_details.current_session": session,
        "academic_details.current_term": term,
      },
    ],
  }).select("_id");

  const processedIds = processedStudents.map((student) => student._id);
  const awaitingIds = awaitingProgression.map((student) => student._id);
  const studentIds = Array.from(
    new Map(
      [...processedIds, ...awaitingIds].map((studentId) => [
        String(studentId),
        studentId,
      ]),
    ).values(),
  );

  const [registeredIds, resultIds] = await Promise.all([
    SubjectRegistrationModel.distinct("student", {
      organization,
      student: { $in: studentIds },
      class: classRecord._id,
      session,
      term,
    }),
    ResultModel.distinct("student", {
      organization,
      student: { $in: studentIds },
      session,
      term,
    }),
  ]);

  const totalStudents = studentIds.length;
  const registeredStudents = registeredIds.length;
  const studentsWithResults = resultIds.length;
  const progressedStudents = processedIds.length;

  return {
    class_id: classRecord._id,
    class_name: classRecord.name,
    level: classRecord.level,
    section: classRecord.section,
    other_section: classRecord.other_section,
    total_students: totalStudents,
    registered_students: registeredStudents,
    students_with_results: studentsWithResults,
    progressed_students: progressedStudents,
    ready_for_progression:
      totalStudents > 0 &&
      registeredStudents === totalStudents &&
      studentsWithResults === totalStudents,
    complete:
      totalStudents === 0 ||
      (registeredStudents === totalStudents &&
        studentsWithResults === totalStudents &&
        progressedStudents === totalStudents),
  };
};

const getReadiness = async (
  organizationId: string,
  session: string,
  term: string,
) => {
  const organization = new ObjectId(organizationId);
  const classes = await ClassModel.find({
    organization,
    is_active: true,
  }).select("name level section other_section");

  const classSummaries = await Promise.all(
    classes.map((classRecord) =>
      getClassReadiness(organization, classRecord as any, session, term),
    ),
  );
  const classesWithStudents = classSummaries.filter(
    (classSummary) => classSummary.total_students > 0,
  );

  return {
    classes: classSummaries,
    ready_to_close:
      classesWithStudents.length > 0 &&
      classesWithStudents.every((classSummary) => classSummary.complete),
  };
};

export const getTermClosingReadiness = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { session, term } = req.query;

    if (!validatePeriod(session, term)) {
      return errorResponse(res, 400, "A valid session and term are required");
    }

    const organization = await OrganizationModel.findById(
      account.organization_id,
    ).select("academic_settings academic_period_history");
    if (!organization) return errorResponse(res, 404, "School not found");

    if (
      organization.academic_settings?.current_session !== session ||
      organization.academic_settings?.current_term !== term
    ) {
      return errorResponse(
        res,
        409,
        "Only the school's current academic period can be closed",
      );
    }

    const readiness = await getReadiness(
      account.organization_id,
      session as string,
      term as string,
    );
    const alreadyClosed = organization.academic_period_history?.some(
      (period) => period.session === session && period.term === term,
    );

    return successResponse(res, 200, {
      session,
      term,
      next_period: getNextPeriod(session as string, term as string),
      already_closed: Boolean(alreadyClosed),
      ...readiness,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const closeAcademicTerm = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { session, term } = req.body;

    if (!validatePeriod(session, term)) {
      return errorResponse(res, 400, "A valid session and term are required");
    }

    const readiness = await getReadiness(
      account.organization_id,
      session,
      term,
    );
    if (!readiness.ready_to_close) {
      return errorResponse(
        res,
        409,
        "Every student must have subject registration, results, and progression completed",
      );
    }

    const nextPeriod = getNextPeriod(session, term);
    const organization = await OrganizationModel.findOneAndUpdate(
      {
        _id: new ObjectId(account.organization_id),
        "academic_settings.current_session": session,
        "academic_settings.current_term": term,
        academic_period_history: {
          $not: { $elemMatch: { session, term } },
        },
      },
      {
        $set: {
          "academic_settings.current_session": nextPeriod.session,
          "academic_settings.current_term": nextPeriod.term,
        },
        $push: {
          academic_period_history: {
            session,
            term,
            closed_at: new Date(),
            closed_by: new ObjectId(account.account_id),
          },
        },
      },
      { new: true },
    ).select("academic_settings academic_period_history");

    if (!organization) {
      return errorResponse(
        res,
        409,
        "This term was already closed or is no longer the current period",
      );
    }

    return successResponse(res, 200, {
      closed_period: { session, term },
      current_period: nextPeriod,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
