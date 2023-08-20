import LessonModel from "../../models/lesson";

export const DeleteLessonById = async (lesson_id: string) => {
  const lesson = await LessonModel.findByIdAndDelete(lesson_id);

  return lesson;
};
