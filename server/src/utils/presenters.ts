interface PublicUserSource {
  _id: { toString(): string };
  name: string;
  email: string;
  createdAt: Date;
}

interface PublicTaskSource {
  _id: { toString(): string };
  title: string;
  description?: string;
  status: string;
  userId: { toString(): string };
  createdAt: Date;
  updatedAt: Date;
}

export function toPublicUser(user: PublicUserSource) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export function toPublicTask(task: PublicTaskSource) {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    userId: task.userId.toString(),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}
