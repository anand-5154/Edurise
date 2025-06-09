import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  student: mongoose.Types.ObjectId;
  instructor: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'Instructor',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model<IMessage>('Message', messageSchema); 