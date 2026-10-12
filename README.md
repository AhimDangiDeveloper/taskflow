# TaskFlow

A personal Kanban board. Register, sign in, and move tasks across **To do**, **In progress**, and **Done**.

Built with MongoDB, Express, React, and Node.js. The API and the UI are both TypeScript. Tasks can be dragged between columns or moved with the status menu on each card.

## Project layout

```
client/     React + Vite
server/     Express + Mongoose
```

## Prerequisites

- Node.js 20 or newer
- npm
- A MongoDB database (see below)

## Environment variables

Copy the examples and edit them:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Server (`server/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | API port. Defaults to `5000`. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Secret used to sign login tokens. At least 32 characters. |
| `JWT_EXPIRES_IN` | No | Token lifetime. Defaults to `7d`. |
| `CLIENT_URL` | No | Allowed browser origin. Defaults to `http://localhost:5173`. Comma-separate multiple origins. |
| `NODE_ENV` | No | Set to `production` when deploying. |

### Client (`client/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | No | API base URL. Defaults to `http://localhost:5000/api`. |

`MONGO_URI` and `JWT_SECRET` are both required. `JWT_SECRET` must be at least 32 characters.

### Local MongoDB with Docker

```bash
docker compose up -d
```

Then set:

```
MONGO_URI=mongodb://127.0.0.1:27017/taskflow
```

### MongoDB Atlas

Create a free cluster, allow your IP, and paste the connection string into `MONGO_URI`.

## Run it locally

From the repository root:

```bash
npm run setup
npm run seed
npm run dev
```

`npm run seed` needs MongoDB running and `MONGO_URI` set. It creates the demo accounts below. Running it again leaves an existing account unchanged.

- App: http://localhost:5173
- API: http://localhost:5000
- Health check: http://localhost:5000/api/health

### Demo accounts

Both use the password `password123`. Each board only shows that person's tasks.

| Name | Email |
| --- | --- |
| Ava Shah | `ava@example.com` |
| Leo Martins | `leo@example.com` |

You can also run the sides separately:

```bash
npm run dev:server
npm run dev:client
```

Production builds:

```bash
npm run build
npm start --prefix server
npm run preview --prefix client
```

## What you can do

- Create an account and sign in. Passwords are hashed with bcrypt. The session is a JWT stored in `localStorage`.
- Open a board that only shows your own tasks.
- Create, edit, and delete tasks.
- Change status by dragging a card into another column, using the menu on the card, or editing the task.
- Search the board. Empty columns, loading skeletons, and error toasts are covered.
- The layout stacks on smaller screens.

## API

Every response is `{ "success": true, "data": { ... } }` or `{ "success": false, "message": "...", "requestId": "...", "errors": [{ "msg": "...", "path": "field" }] }`. `requestId` is also returned as the `X-Request-Id` header so a failed call can be traced in the server log.

Task objects use `id`, not a database `_id`. User objects use the same shape: `id`, `name`, `email`, `createdAt`. Passwords are never included.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Process and database status. Returns 503 when MongoDB is down. |
| `POST` | `/api/auth/register` | No | Create an account. Body: `name`, `email`, `password`. |
| `POST` | `/api/auth/login` | No | Sign in. Body: `email`, `password`. |
| `GET` | `/api/auth/me` | Yes | Current user. |
| `GET` | `/api/tasks` | Yes | List your tasks, newest first. |
| `POST` | `/api/tasks` | Yes | Create a task. Body: `title`, optional `description`, optional `status`. |
| `GET` | `/api/tasks/:id` | Yes | Fetch one of your tasks. |
| `PATCH` | `/api/tasks/:id` | Yes | Update `title`, `description`, and/or `status`. |
| `DELETE` | `/api/tasks/:id` | Yes | Delete one of your tasks. |

Send the token as `Authorization: Bearer <token>`.

`status` is one of `To-Do`, `In-Progress`, or `Done`. A missing task and another user's task both return 404. Login failures use the same message whether or not the email exists. Auth routes are limited to 30 attempts per 15 minutes. The API refuses to boot without `MONGO_URI` and a `JWT_SECRET` of at least 32 characters.

## Tests

```bash
npm test
```

The API suite covers registration, login, ownership, status rules, and deletion. It connects to `mongodb://127.0.0.1:27017/taskflow_test` and drops that database when the suite finishes. It does not change the `taskflow` database used for development.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run setup` | Install root, server, and client dependencies. |
| `npm run dev` | Start the API and the React app together. |
| `npm run seed` | Create the demo accounts when they are not already in the database. |
| `npm run build` | Typecheck and build both packages. |
| `npm test` | Run the API test suite. |
