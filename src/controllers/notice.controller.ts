import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import { EAccountType } from "../interface";
import ClassModel from "../models/class";
import NoticeModel from "../models/notice";
import StudentModel from "../models/student";
import TeacherProfileModel from "../models/teacher_profile";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { getAccessibleStudentIds } from "../utils/portalAccess";

const VALID_TYPES = ["announcement", "event"];
const VALID_AUDIENCES = ["all", "parents", "students", "teachers"];

const normalizeNotice = (body: any) => {
  const startsAt = new Date(body.starts_at);
  const endsAt = body.ends_at ? new Date(body.ends_at) : undefined;
  const classIds: string[] = Array.isArray(body.class_ids)
    ? [...new Set<string>(body.class_ids.map(String))]
    : [];
  if (
    typeof body.title !== "string" ||
    !body.title.trim() ||
    body.title.trim().length > 150 ||
    typeof body.message !== "string" ||
    !body.message.trim() ||
    body.message.trim().length > 3000 ||
    !VALID_TYPES.includes(body.type) ||
    !VALID_AUDIENCES.includes(body.audience) ||
    Number.isNaN(startsAt.getTime()) ||
    (endsAt && (Number.isNaN(endsAt.getTime()) || endsAt < startsAt)) ||
    classIds.some((classId) => !ObjectId.isValid(classId))
  ) {
    return null;
  }
  return {
    title: body.title.trim(),
    message: body.message.trim(),
    type: body.type,
    audience: body.audience,
    classes: classIds.map((classId) => new ObjectId(classId)),
    starts_at: startsAt,
    ends_at: endsAt,
    is_published: body.is_published !== false,
  };
};

const hasValidTargetClasses = async (
  organization: ObjectId,
  classes: ObjectId[],
) => {
  if (classes.length === 0) return true;
  const classCount = await ClassModel.countDocuments({
    _id: { $in: classes },
    organization,
    is_active: true,
  });
  return classCount === classes.length;
};

export const getNotices = async (req: Request, res: Response) => {
  try {
    const notices = await NoticeModel.find({
      organization: new ObjectId(req.account.organization_id),
    })
      .populate({ path: "classes", select: "name section other_section" })
      .sort({ starts_at: -1 });
    return successResponse(res, 200, notices);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const createNotice = async (req: Request, res: Response) => {
  try {
    const normalized = normalizeNotice(req.body);
    if (!normalized) return errorResponse(res, 400, "Valid notice details are required");
    const organization = new ObjectId(req.account.organization_id);
    if (!(await hasValidTargetClasses(organization, normalized.classes))) {
      return errorResponse(res, 400, "One or more selected classes are invalid");
    }
    const notice = await NoticeModel.create({
      ...normalized,
      organization,
      created_by: new ObjectId(req.account.account_id),
    });
    return successResponse(res, 201, notice);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateNotice = async (req: Request, res: Response) => {
  try {
    const { notice_id } = req.params;
    const normalized = normalizeNotice(req.body);
    if (!ObjectId.isValid(notice_id) || !normalized) {
      return errorResponse(res, 400, "Valid notice details are required");
    }
    const organization = new ObjectId(req.account.organization_id);
    if (!(await hasValidTargetClasses(organization, normalized.classes))) {
      return errorResponse(res, 400, "One or more selected classes are invalid");
    }
    const notice = await NoticeModel.findOneAndUpdate(
      { _id: new ObjectId(notice_id), organization },
      { $set: normalized },
      { new: true, runValidators: true },
    );
    if (!notice) return errorResponse(res, 404, "Notice not found");
    return successResponse(res, 200, notice);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteNotice = async (req: Request, res: Response) => {
  try {
    const { notice_id } = req.params;
    if (!ObjectId.isValid(notice_id)) return errorResponse(res, 400, "Invalid notice");
    const notice = await NoticeModel.findOneAndDelete({
      _id: new ObjectId(notice_id),
      organization: new ObjectId(req.account.organization_id),
    });
    if (!notice) return errorResponse(res, 404, "Notice not found");
    return successResponse(res, 200, "Notice deleted");
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getPortalNotices = async (req: Request, res: Response) => {
  try {
    const organization = new ObjectId(req.account.organization_id);
    let classIds: ObjectId[] = [];
    let audience = "students";
    if (req.account.account_type === EAccountType.TEACHER) {
      const profile = await TeacherProfileModel.findOne({
        account: new ObjectId(req.account.account_id),
        organization,
      });
      const assignments = profile?.assignments as unknown as Array<{
        class: ObjectId;
      }>;
      classIds = assignments?.length
        ? assignments.map((assignment) => assignment.class)
        : ((profile?.classes as ObjectId[]) ?? []);
      audience = "teachers";
    } else {
      const studentIds = await getAccessibleStudentIds(req.account);
      classIds = await StudentModel.find({
        _id: { $in: studentIds },
        organization,
        is_deleted: false,
      }).distinct("academic_details.class");
      audience =
        req.account.account_type === EAccountType.PARENT
          ? "parents"
          : "students";
    }
    const notices = await NoticeModel.find({
      organization,
      is_published: true,
      audience: { $in: ["all", audience] },
      $or: [{ classes: { $size: 0 } }, { classes: { $in: classIds } }],
    })
      .populate({ path: "classes", select: "name section other_section" })
      .sort({ starts_at: -1 })
      .limit(100);
    return successResponse(res, 200, notices);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
