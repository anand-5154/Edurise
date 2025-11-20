import { Types } from "mongoose";
import LearningPathModel from "../../models/implementations/learningPathModel";
import { ILearningPath } from "../../models/interfaces/IlearningPath.interface";
import {
  CreateLearningPathPayload,
  ILearningPathRepository,
  UpdateLearningPathPayload,
} from "../interfaces/IlearningPath.interface";

export class LearningPathRepository implements ILearningPathRepository {
  async createPath(
    userId: string,
    payload: CreateLearningPathPayload
  ): Promise<ILearningPath> {
    const courses = (payload.courses ?? []).map((course, index) => ({
      course: new Types.ObjectId(course.courseId),
      note: course.note,
      order: index,
      addedAt: new Date(),
    }));

    return LearningPathModel.create({
      user: new Types.ObjectId(userId),
      title: payload.title,
      description: payload.description,
      targetDate: payload.targetDate ?? undefined,
      courses,
    });
  }

  async listPaths(userId: string): Promise<ILearningPath[]> {
    return LearningPathModel.find({ user: userId })
      .sort({ updatedAt: -1 })
      .populate("courses.course", "title thumbnail price");
  }

  async findById(pathId: string, userId: string): Promise<ILearningPath | null> {
    return LearningPathModel.findOne({ _id: pathId, user: userId }).populate(
      "courses.course",
      "title thumbnail price"
    );
  }

  async updatePath(
    pathId: string,
    userId: string,
    payload: UpdateLearningPathPayload
  ): Promise<ILearningPath | null> {
    return LearningPathModel.findOneAndUpdate(
      { _id: pathId, user: userId },
      {
        $set: {
          ...(payload.title !== undefined ? { title: payload.title } : {}),
          ...(payload.description !== undefined
            ? { description: payload.description }
            : {}),
          ...(payload.targetDate !== undefined
            ? { targetDate: payload.targetDate }
            : {}),
          ...(payload.isArchived !== undefined
            ? { isArchived: payload.isArchived }
            : {}),
        },
      },
      { new: true }
    ).populate("courses.course", "title thumbnail price");
  }

  async deletePath(pathId: string, userId: string): Promise<boolean> {
    const result = await LearningPathModel.deleteOne({
      _id: pathId,
      user: userId,
    });
    return result.deletedCount === 1;
  }

  async addCourse(
    pathId: string,
    userId: string,
    courseId: string,
    note?: string
  ): Promise<ILearningPath | null> {
    const path = await LearningPathModel.findOne({ _id: pathId, user: userId });
    if (!path) return null;

    const alreadyExists = path.courses.some((c) =>
      c.course.toString() === courseId
    );
    if (alreadyExists) {
      return path;
    }

    path.courses.push({
      course: new Types.ObjectId(courseId),
      note,
      order: path.courses.length,
      addedAt: new Date(),
    });

    await path.save();
    return path.populate("courses.course", "title thumbnail price");
  }

  async removeCourse(
    pathId: string,
    userId: string,
    courseId: string
  ): Promise<ILearningPath | null> {
    const path = await LearningPathModel.findOne({ _id: pathId, user: userId });
    if (!path) return null;

    path.courses = path.courses
      .filter((course) => course.course.toString() !== courseId)
      .map((course, index) => ({
        course: course.course,
        note: course.note,
        addedAt: course.addedAt,
        order: index,
      })) as typeof path.courses;

    await path.save();
    return path.populate("courses.course", "title thumbnail price");
  }

  async reorderCourses(
    pathId: string,
    userId: string,
    orderedCourseIds: string[]
  ): Promise<ILearningPath | null> {
    const path = await LearningPathModel.findOne({ _id: pathId, user: userId });
    if (!path) return null;

    const courseMap = new Map(
      path.courses.map((course) => [course.course.toString(), course])
    );

    const reordered = orderedCourseIds
      .map((courseId, index) => {
        const existing = courseMap.get(courseId);
        if (!existing) return null;
        return {
          course: existing.course,
          note: existing.note,
          addedAt: existing.addedAt,
          order: index,
        };
      })
      .filter((course): course is NonNullable<typeof course> => course !== null);

    path.courses = reordered as typeof path.courses;

    await path.save();
    return path.populate("courses.course", "title thumbnail price");
  }
}

