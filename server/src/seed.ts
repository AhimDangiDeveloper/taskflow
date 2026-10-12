import 'dotenv/config';
import mongoose from 'mongoose';
import { Task, type TaskStatus } from './models/Task.js';
import { User } from './models/User.js';

const DEMO_PASSWORD = 'password123';

const accounts: {
  name: string;
  email: string;
  tasks: { title: string; description: string; status: TaskStatus }[];
}[] = [
  {
    name: 'Ava Shah',
    email: 'ava@example.com',
    tasks: [
      {
        title: 'Draft the kickoff notes',
        description: 'Capture goals, owners, and the first milestone.',
        status: 'To-Do',
      },
      {
        title: 'Confirm the API contract',
        description: 'Check task statuses and the auth payload with the client.',
        status: 'To-Do',
      },
      {
        title: 'Build the task board',
        description: 'Three columns, with create and status changes wired up.',
        status: 'In-Progress',
      },
      {
        title: 'Set up the repository',
        description: 'Client and server folders, environment example, and README.',
        status: 'Done',
      },
    ],
  },
  {
    name: 'Leo Martins',
    email: 'leo@example.com',
    tasks: [
      {
        title: 'Review the design handoff',
        description: 'Note spacing and the empty states before implementation.',
        status: 'To-Do',
      },
      {
        title: 'Write the weekly status',
        description: 'What shipped, what is blocked, and what is next.',
        status: 'In-Progress',
      },
      {
        title: 'Ship the login page',
        description: 'Register, sign in, and keep the dashboard private.',
        status: 'Done',
      },
    ],
  },
];

async function seed() {
  const mongoUri = process.env.MONGO_URI?.trim();
  if (!mongoUri) {
    throw new Error('MONGO_URI is required. Copy server/.env.example to server/.env and set it.');
  }

  await mongoose.connect(mongoUri);

  for (const account of accounts) {
    const existing = await User.findOne({ email: account.email });
    if (existing) {
      console.log(`Skipped ${account.email}; that account already exists.`);
      continue;
    }

    const user = await User.create({
      name: account.name,
      email: account.email,
      password: DEMO_PASSWORD,
    });

    await Task.insertMany(account.tasks.map((task) => ({ ...task, userId: user._id })));
    console.log(`Created ${account.email}`);
  }
}

seed()
  .then(() => mongoose.disconnect())
  .catch(async (error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Seed failed');
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  });
