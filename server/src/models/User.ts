import bcrypt from 'bcryptjs';
import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
  },
  { timestamps: true, versionKey: false },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.set('toJSON', {
  transform(_doc, ret) {
    const safe = ret as { password?: string };
    delete safe.password;
    return ret;
  },
});

export type UserFields = InferSchemaType<typeof userSchema>;

export interface IUser extends UserFields {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const User = mongoose.model<IUser>('User', userSchema);
