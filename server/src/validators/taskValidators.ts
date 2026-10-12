import { body, param } from 'express-validator';
import { TASK_STATUSES } from '../models/Task.js';

const statusMessage = 'Status must be To-Do, In-Progress, or Done';

export const taskIdRules = [param('id').isMongoId().withMessage('Invalid task id')];

export const createTaskRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 120 })
    .withMessage('Title must be 120 characters or fewer'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be 1000 characters or fewer'),
  body('status').optional().isIn([...TASK_STATUSES]).withMessage(statusMessage),
];

export const updateTaskRules = [
  ...taskIdRules,
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 120 })
    .withMessage('Title must be 120 characters or fewer'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be 1000 characters or fewer'),
  body('status').optional().isIn([...TASK_STATUSES]).withMessage(statusMessage),
];
