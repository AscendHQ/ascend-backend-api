import { UpdateQuery } from "mongoose";
import LessonModel from "../../models/lesson";
import { ILesson } from "../../interface";

export const UpdateLessonById = async (
  lesson_id: string,
  update: UpdateQuery<ILesson>
) => {
  const lesson = await LessonModel.findByIdAndUpdate(lesson_id, update, {
    new: true,
  });

  return lesson;
};
