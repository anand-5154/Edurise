import { ReviewDTO } from "../../DTO/review.dto";
import { IReview } from "../../models/interfaces/Ireview.interface";

export interface IReviewService{
    submitReview(courseId: string, userId: string, rating: number, text: string):Promise<IReview>
    getReviewsByCourse(courseId:string):Promise<ReviewDTO[]>
}
