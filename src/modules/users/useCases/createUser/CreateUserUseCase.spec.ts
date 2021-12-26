
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from './CreateUserUseCase';
import { CreateUserError } from './CreateUserError';

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('Create user', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(
      inMemoryUsersRepository,
    );
  });

  it('should be able to create user.', async () => {
    const user = await createUserUseCase.execute({
      email: 'iann@email.com',
      name: 'Iann Isacksson',
      password: '123456',
    });

    expect(user.name).toBe('Iann Isacksson');
    expect(user.email).toBe('iann@email.com');
  });

  it('should not be able to create a user with the email already registered.', async () => {
    await inMemoryUsersRepository.create({
      email: 'iann@email.com',
      name: 'Iann Isacksson',
      password: '123456',
    })

    const response = createUserUseCase.execute({
      email: 'iann@email.com',
      name: 'Iann Isacksson',
      password: '123456',
    });

    await expect(response).rejects.toBeInstanceOf(CreateUserError);
  });
});
