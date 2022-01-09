import { Connection, createConnection } from 'typeorm';
import authConfig from '@config/auth';

import { hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';

let connection: Connection;

let userId = uuidV4();

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
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'admin@finapi.com.br',
      password: '123456',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'Deposit U$100.00',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body.amount).toEqual(100);
  });

  it('should not be able to make a deposit to the account if the user is not found.', async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: uuidV4(),
      expiresIn: expiresIn,
    });

    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: 'Deposit U$100.00',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });

  it('should not be able to withdraw if you do not have enough funds.', async () => {
    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: userId,
      expiresIn: expiresIn,
    });

    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 1000,
        description: 'Deposit U$100.00',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
