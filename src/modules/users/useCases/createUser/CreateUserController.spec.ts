import { Connection, createConnection } from 'typeorm';

import request from 'supertest';
import { app } from '../../../../app';

let connection: Connection;

describe('Create user controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create user', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: 'João Pedro',
      email: 'joao@finapi.com.br',
      password: '123456',
    });

    expect(response.status).toBe(201);
  });

  it('should not be able to create a user with the email already registered.', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: 'João Pedro',
      email: 'joao@finapi.com.br',
      password: '123456',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });
});
