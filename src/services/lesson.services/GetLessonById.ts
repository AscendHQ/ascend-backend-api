import LessonModel from "../../models/lesson";

export const GetLessonById = async (lesson_id: string) => {
  const lesson = await LessonModel.findById(lesson_id);

  return lesson;
};
