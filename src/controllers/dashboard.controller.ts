import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { GetDashboard } from "../services/dashboard.services";
import { ICustomInterface } from "../interface";
import ClassModel from "../models/class";
import FeeStructureModel from "../models/fee_structure";
import OrganizationModel from "../models/organization";
import ParentProfileModel from "../models/parent_profile";
import StaffModel from "../models/staff";
import StudentModel from "../models/student";
import StudentProfileModel from "../models/student_profile";
import SubjectModel from "../models/subject";
import SubjectRegistrationModel from "../models/subject_registration";
import TeacherProfileModel from "../models/teacher_profile";
import TimetableModel from "../models/timetable";

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const { account } = req;

    const query: ICustomInterface = {
      organization: new ObjectId(account.organization_id),
    };

    const response = await GetDashboard(query);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getSchoolSetupStatus = async (req: Request, res: Response) => {
  try {
    const organization = new ObjectId(req.account.organization_id);
    const school = await OrganizationModel.findById(organization).select(
      "name description address academic_settings",
    );

    if (!school) return errorResponse(res, 404, "School not found");

    const profileComplete = Boolean(
      school.name?.trim() &&
        school.description?.trim() &&
        school.address?.street?.trim() &&
        school.address?.country?.trim(),
    );
    const academicPeriodComplete = Boolean(
      school.academic_settings?.current_session &&
        school.academic_settings?.current_term,
    );
    const currentPeriod = {
      organization,
      session: school.academic_settings?.current_session ?? "__not_configured__",
      term: school.academic_settings?.current_term ?? "__not_configured__",
    };
    const [
      classes,
      subjects,
      students,
      staff,
      teacherPortals,
      timetables,
      subjectRegistrations,
      feeStructures,
      parentPortals,
      studentPortals,
    ] = await Promise.all([
      ClassModel.countDocuments({ organization, is_active: true }),
      SubjectModel.countDocuments({ organization }),
      StudentModel.countDocuments({
        organization,
        is_deleted: false,
        is_active: true,
      }),
      StaffModel.countDocuments({
        organization,
        date_deleted: { $exists: false },
      }),
      TeacherProfileModel.countDocuments({ organization }),
      TimetableModel.countDocuments({ organization }),
      SubjectRegistrationModel.countDocuments(currentPeriod),
      FeeStructureModel.countDocuments({ ...currentPeriod, is_active: true }),
      ParentProfileModel.countDocuments({ organization }),
      StudentProfileModel.countDocuments({ organization }),
    ]);

    return successResponse(res, 200, {
      profile_complete: profileComplete,
      academic_period_complete: academicPeriodComplete,
      classes,
      subjects,
      students,
      staff,
      teacher_portals: teacherPortals,
      timetables,
      subject_registrations: subjectRegistrations,
      fee_structures: feeStructures,
      parent_portals: parentPortals,
      student_portals: studentPortals,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
