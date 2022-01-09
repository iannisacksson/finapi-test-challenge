import { Connection, createConnection } from 'typeorm';
import authConfig from '@config/auth';

import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';

let connection: Connection;

const userId = uuidV4();

const { secret, expiresIn } = authConfig.jwt;

describe('Create statement controller', () => {
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

  it('should be able to make a deposit to the account', async () => {
    const token = sign({}, secret, {
      subject: userId,
      expiresIn: expiresIn,
    });

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body.balance).toEqual(0);
  });

  it('should not be able to make a deposit to the account if the user is not found.', async () => {
    const token = sign({}, secret, {
      subject: uuidV4(),
      expiresIn: expiresIn,
    });

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
