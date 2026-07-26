import { ObjectId } from "mongodb";
import LessonModel from "../../models/lesson";

export const GetLessonById = async (
  lesson_id: string,
  organization: ObjectId
) => {
  const lesson = await LessonModel.findOne({
    _id: lesson_id,
    organization,
  }).populate("class");

  return lesson;
};
