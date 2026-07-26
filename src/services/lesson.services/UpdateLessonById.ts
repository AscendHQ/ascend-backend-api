import { UpdateQuery } from "mongoose";
import { ObjectId } from "mongodb";
import LessonModel from "../../models/lesson";
import { ILesson } from "../../interface";

export const UpdateLessonById = async (
  lesson_id: string,
  organization: ObjectId,
  update: UpdateQuery<ILesson>
) => {
  const lesson = await LessonModel.findOneAndUpdate(
    { _id: lesson_id, organization },
    update,
    { new: true }
  );

  return lesson;
};
