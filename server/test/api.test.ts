import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import mongoose from 'mongoose';
import request from 'supertest';
import type { Express } from 'express';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/taskflow_test';

const { createApp } = await import('../src/app.js');

let app: Express;

before(async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  await mongoose.connection.dropDatabase();
  app = createApp();
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('TaskFlow API', () => {
  let tokenA = '';
  let tokenB = '';
  let taskId = '';

  it('reports a healthy database', async () => {
    const response = await request(app).get('/api/health');
    assert.equal(response.status, 200);
    assert.equal(response.body.data.database, 'up');
    assert.ok(response.headers['x-request-id']);
  });

  it('rejects an invalid registration', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'A',
      email: 'not-an-email',
      password: 'short',
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.ok(response.body.errors.some((issue: { path: string }) => issue.path === 'email'));
  });

  it('registers a user without returning the password', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Ava Shah',
      email: 'ava@example.com',
      password: 'password123',
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.user.email, 'ava@example.com');
    assert.equal(response.body.data.user.password, undefined);
    tokenA = response.body.data.token;
    assert.ok(tokenA);
  });

  it('rejects a duplicate email', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Ava Shah',
      email: 'ava@example.com',
      password: 'password123',
    });
    assert.equal(response.status, 409);
  });

  it('rejects a wrong password without confirming the account exists differently', async () => {
    const known = await request(app).post('/api/auth/login').send({
      email: 'ava@example.com',
      password: 'wrongpass',
    });
    const unknown = await request(app).post('/api/auth/login').send({
      email: 'missing@example.com',
      password: 'wrongpass',
    });

    assert.equal(known.status, 401);
    assert.equal(unknown.status, 401);
    assert.equal(known.body.message, unknown.body.message);
  });

  it('requires authentication for tasks', async () => {
    const response = await request(app).get('/api/tasks');
    assert.equal(response.status, 401);
  });

  it('creates, lists, updates, and isolates tasks', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Draft proposal', description: 'Outline the first section', status: 'To-Do' });

    assert.equal(created.status, 201);
    assert.equal(created.body.data.task.status, 'To-Do');
    assert.equal(created.body.data.task._id, undefined);
    taskId = created.body.data.task.id;

    const moved = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ status: 'In-Progress' });
    assert.equal(moved.status, 200);
    assert.equal(moved.body.data.task.status, 'In-Progress');

    const listed = await request(app).get('/api/tasks').set('Authorization', `Bearer ${tokenA}`);
    assert.equal(listed.body.data.tasks.length, 1);

    const other = await request(app).post('/api/auth/register').send({
      name: 'Ben Roy',
      email: 'ben@example.com',
      password: 'password123',
    });
    tokenB = other.body.data.token;

    const hidden = await request(app).get(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${tokenB}`);
    assert.equal(hidden.status, 404);

    const empty = await request(app).get('/api/tasks').set('Authorization', `Bearer ${tokenB}`);
    assert.deepEqual(empty.body.data.tasks, []);
  });

  it('rejects a status outside the board', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Later', status: 'Blocked' });
    assert.equal(response.status, 400);
  });

  it('deletes only the owner task', async () => {
    const blocked = await request(app).delete(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${tokenB}`);
    assert.equal(blocked.status, 404);

    const removed = await request(app).delete(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${tokenA}`);
    assert.equal(removed.status, 200);

    const missing = await request(app).get(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${tokenA}`);
    assert.equal(missing.status, 404);
  });
});
