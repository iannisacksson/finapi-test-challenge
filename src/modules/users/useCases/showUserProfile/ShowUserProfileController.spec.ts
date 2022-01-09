import { Connection, createConnection } from 'typeorm';
import authConfig from '@config/auth';

import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';

let connection: Connection;

const userId = uuidV4();

describe('Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash('123456', 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password)
    values('${userId}', 'Admin', 'admin@finapi.com.br', '${password}')
    `,
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show user profile', async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: userId,
      expiresIn: expiresIn,
    });

    const response = await request(app)
      .get(`/api/v1/profile`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });

  it('should not be able to show the user profile if it does not exist.', async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: uuidV4(),
      expiresIn: expiresIn,
    });

    const response = await request(app)
      .get(`/api/v1/profile`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
