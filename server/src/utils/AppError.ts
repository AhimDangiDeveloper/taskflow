export interface FieldIssue {
  msg: string;
  path?: string;
}

export class AppError extends Error {
  statusCode: number;
  details?: FieldIssue[];

  constructor(message: string, statusCode = 500, details?: FieldIssue[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}
