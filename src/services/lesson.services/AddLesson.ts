import LessonModel from "../../models/lesson";
import { ILesson } from "../../interface";

export const AddLesson = async (payload: ILesson) => {
  const lesson = await LessonModel.create(payload);

  return lesson;
};
