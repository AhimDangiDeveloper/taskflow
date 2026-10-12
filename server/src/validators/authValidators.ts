import { body } from 'express-validator';

export const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email').trim().toLowerCase().isEmail().withMessage('Enter a valid email'),
  body('password')
    .isString()
    .isLength({ min: 8, max: 72 })
    .withMessage('Password must be at least 8 characters'),
];

export const loginRules = [
  body('email').trim().toLowerCase().isEmail().withMessage('Enter a valid email'),
  body('password').isString().notEmpty().withMessage('Password is required'),
];
