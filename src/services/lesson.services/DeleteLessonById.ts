import { ObjectId } from "mongodb";
import LessonModel from "../../models/lesson";

export const DeleteLessonById = async (
  lesson_id: string,
  organization: ObjectId
) => {
  const lesson = await LessonModel.findOneAndDelete({
    _id: lesson_id,
    organization,
  });

  return lesson;
};
