import { AppError } from '@shared/errors/AppError';

import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

jest.mock('@config/auth', () => ({
  jwt: {
    secret: 'teste123',
    expiresIn: '1d',
  },
}));

describe('Authenticate user', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository,
    );
  });

  it('should be able to authenticate user.', async () => {
    await createUserUseCase.execute({
      email: 'iann@email.com',
      name: 'Iann Isacksson',
      password: '123456',
    });

    const token = await authenticateUserUseCase.execute({
      email: 'iann@email.com',
      password: '123456',
    });

    expect(token).toHaveProperty('token');
    expect(typeof token.token).toBe('string');
  });

  it('should not be able to authenticate user with email does not exists.', async () => {
    const response = authenticateUserUseCase.execute({
      email: 'non-existing-user',
      password: '123456',
    });

    await expect(response).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not be able to authenticate user with incorrect password.', async () => {
    await createUserUseCase.execute({
      email: 'iann@email.com',
      name: 'Iann Isacksson',
      password: '123456',
    });

    const response = authenticateUserUseCase.execute({
      email: 'iann@email.com',
      password: 'other-passoword',
    });

    await expect(response).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
