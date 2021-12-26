
import { InMemoryUsersRepository } from '@modules/users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetBalanceUseCase } from './GetBalanceUseCase';
import { GetBalanceError } from './GetBalanceError';
import { OperationType } from '@modules/statements/entities/Statement';

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe('show user profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository,
    );
  });

  it('should be able to get statement.', async () => {
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

    await inMemoryStatementsRepository.create({
      amount: 1000,
      description: 'test description',
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    })

    const response = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(response.balance).toBe(0);
    expect(response.statement).toHaveLength(2);
  });

  it('should not be able to get statement if user does not exist.', async () => {
    const response = getBalanceUseCase.execute({
      user_id: 'non-exisiting-user',
    });

    await expect(response).rejects.toBeInstanceOf(GetBalanceError)
  });
});
