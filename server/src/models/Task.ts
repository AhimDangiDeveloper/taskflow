import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export const TASK_STATUSES = ['To-Do', 'In-Progress', 'Done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    status: { type: String, enum: TASK_STATUSES, default: 'To-Do', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false },
);

taskSchema.index({ userId: 1, createdAt: -1 });

export type TaskFields = InferSchemaType<typeof taskSchema>;

export interface ITask extends TaskFields {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const Task = mongoose.model<ITask>('Task', taskSchema);
