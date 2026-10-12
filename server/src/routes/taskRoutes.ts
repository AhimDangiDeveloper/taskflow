import { Router } from 'express';
import { createTask, deleteTask, getTask, listTasks, updateTask } from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTaskRules, taskIdRules, updateTaskRules } from '../validators/taskValidators.js';

export const taskRouter = Router();

taskRouter.use(protect);
taskRouter.get('/', listTasks);
taskRouter.post('/', ...validate(createTaskRules), createTask);
taskRouter.get('/:id', ...validate(taskIdRules), getTask);
taskRouter.patch('/:id', ...validate(updateTaskRules), updateTask);
taskRouter.delete('/:id', ...validate(taskIdRules), deleteTask);
