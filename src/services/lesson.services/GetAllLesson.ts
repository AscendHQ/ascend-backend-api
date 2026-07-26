import LessonModel from "../../models/lesson";
import { ICustomInterface } from "../../interface";

export const GetAllLesson = async (
  query: ICustomInterface,
  options: ICustomInterface
) => {
  const { limit, page } = options;
  const lessons = await LessonModel.find(query)
    .populate("class")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total_documents = await LessonModel.countDocuments(query);

  return {
    limit,
    page,
    lessons,
    total_documents,
  };
};
