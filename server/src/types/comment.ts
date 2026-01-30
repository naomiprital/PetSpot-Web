import { ObjectId } from "mongoose";

export interface Comment {
    _id?: ObjectId | string;
    postId: ObjectId | string;
    commentText: string;
    sender: string;
}