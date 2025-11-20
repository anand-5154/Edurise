import { Types } from "mongoose";
import {
  LearningPathCourseDTO,
  LearningPathDTO,
} from "../DTO/learningPath.dto";
import { ILearningPath } from "../models/interfaces/IlearningPath.interface";
import { ICourse } from "../models/interfaces/Icourse.interface";

const mapCourse = (courseEntry: ILearningPath["courses"][number]): LearningPathCourseDTO => {
  const courseData = courseEntry.course as unknown as ICourse & {
    _id?: Types.ObjectId;
  };

  const courseId = courseData?._id
    ? courseData._id.toString()
    : (courseEntry.course as Types.ObjectId).toString();

  return {
    courseId,
    courseTitle: courseData?.title,
    courseThumbnail: courseData?.thumbnail,
    coursePrice: courseData?.price,
    note: courseEntry.note,
    order: courseEntry.order,
    addedAt: courseEntry.addedAt,
  };
};

export const toLearningPathDTO = (path: ILearningPath): LearningPathDTO => {
  const courses = [...(path.courses || [])]
    .sort((a, b) => a.order - b.order)
    .map(mapCourse);

  return {
    id: path._id.toString(),
    title: path.title,
    description: path.description,
    targetDate: path.targetDate ?? null,
    isArchived: path.isArchived,
    courses,
    createdAt: path.createdAt,
    updatedAt: path.updatedAt,
  };
};

export const toLearningPathDTOList = (
  paths: ILearningPath[]
): LearningPathDTO[] => paths.map(toLearningPathDTO);

