
import { InMemoryUsersRepository } from '@modules/users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from './CreateStatementUseCase';
import { CreateStatementError } from './CreateStatementError';
import { OperationType } from '@modules/statements/entities/Statement';

let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe('show user profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('should be able to create statement type deposit.', async () => {
    const user = await inMemoryUsersRepository.create({
      email: 'iann@email.com',
      name: 'Iann Isacksson',
      password: '123456',
    });

    const response = await createStatementUseCase.execute({
      amount: 1000,
      description: 'test description',
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    expect(response).toHaveProperty('id');
    expect(response.user_id).toBe(user.id as string);
    expect(response.type).toBe(OperationType.DEPOSIT);
    expect(response.amount).toBe(1000);
  });

  it('should be able to create statement type withdraw.', async () => {
    const user = await inMemoryUsersRepository.create({
      email: 'iann@email.com',
      name: 'Iann Isacksson',
      password: '123456',
    });

   await inMemoryStatementsRepository.create({
      amount: 1000,
      description: 'test description',
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    })

    const response = await createStatementUseCase.execute({
      amount: 1000,
      description: 'test description',
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    });

    expect(response).toHaveProperty('id');
    expect(response.user_id).toBe(user.id as string);
    expect(response.type).toBe(OperationType.WITHDRAW);
    expect(response.amount).toBe(1000);
  });

  it('should not be able to create statement if user does not exist.', async () => {
    const response = createStatementUseCase.execute({
      amount: 1000,
      description: 'test description',
      type: OperationType.WITHDRAW,
      user_id: 'non-exisiting-user',
    });

    await expect(response).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });

  it('should not be able to create statement if user have insufficient funds.', async () => {
    const user = await inMemoryUsersRepository.create({
      email: 'iann@email.com',
      name: 'Iann Isacksson',
      password: '123456',
    });

   await inMemoryStatementsRepository.create({
      amount: 100,
      description: 'test description',
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    })

    const response = createStatementUseCase.execute({
      amount: 1000,
      description: 'test description',
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    });

    await expect(response).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });
});
