import type { Types } from 'mongoose';
import { Task, type TaskStatus } from '../models/Task.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData } from '../utils/http.js';
import { toPublicTask } from '../utils/presenters.js';

function requireUserId(userId: Types.ObjectId | undefined) {
  if (!userId) {
    throw new AppError('Authentication required', 401);
  }
  return userId;
}

function routeParam(value: string | string[] | undefined) {
  const id = Array.isArray(value) ? value[0] : value;
  if (!id) throw new AppError('Task not found', 404);
  return id;
}

async function findOwnedTask(id: string, userId: Types.ObjectId) {
  const task = await Task.findOne({ _id: id, userId });
  if (!task) {
    throw new AppError('Task not found', 404);
  }
  return task;
}

export const listTasks = asyncHandler(async (req, res) => {
  const userId = requireUserId(req.user?._id);
  const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
  sendData(res, { tasks: tasks.map(toPublicTask) });
});

export const getTask = asyncHandler(async (req, res) => {
  const userId = requireUserId(req.user?._id);
  const task = await findOwnedTask(routeParam(req.params.id), userId);
  sendData(res, { task: toPublicTask(task) });
});

export const createTask = asyncHandler(async (req, res) => {
  const userId = requireUserId(req.user?._id);
  const { title, description, status } = req.body as {
    title: string;
    description?: string;
    status?: TaskStatus;
  };

  const task = await Task.create({
    title,
    description: description ?? '',
    status: status ?? 'To-Do',
    userId,
  });

  sendData(res, { task: toPublicTask(task) }, 201);
});

export const updateTask = asyncHandler(async (req, res) => {
  const userId = requireUserId(req.user?._id);
  const { title, description, status } = req.body as {
    title?: string;
    description?: string;
    status?: TaskStatus;
  };

  if (title === undefined && description === undefined && status === undefined) {
    throw new AppError('Provide at least one field to update', 400);
  }

  const task = await findOwnedTask(routeParam(req.params.id), userId);
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  await task.save();

  sendData(res, { task: toPublicTask(task) });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const userId = requireUserId(req.user?._id);
  const task = await findOwnedTask(routeParam(req.params.id), userId);
  await task.deleteOne();
  sendData(res, { message: 'Task deleted' });
});
