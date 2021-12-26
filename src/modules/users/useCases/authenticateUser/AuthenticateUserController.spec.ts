import { Connection, createConnection } from 'typeorm';

import { hash } from 'bcryptjs';
import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';

let connection: Connection;

describe('Create category controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash('123456', 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password)
    values('${id}', 'Admin', 'admin@finapi.com.br', '${password}')
    `,
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'admin@finapi.com.br',
      password: '123456',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should not be able to authenticate user with email does not exists.', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'non-exsting-user@rentx.com.br',
      password: '123456',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Incorrect email or password');
  });

  it('should not be able to authenticate user with incorrect password.', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'admin@finapi.com.br',
      password: 'incorrect-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Incorrect email or password');
  });
});
