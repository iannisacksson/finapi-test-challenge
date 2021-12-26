
import { InMemoryUsersRepository } from '@modules/users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';
import { GetStatementOperationError } from './GetStatementOperationError';
import { OperationType } from '@modules/statements/entities/Statement';

let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe('show user profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('should be able to get statement.', async () => {
    const user = await inMemoryUsersRepository.create({
      email: 'iann@email.com',
      name: 'Iann Isacksson',
      password: '123456',
    });

    const statement = await inMemoryStatementsRepository.create({
      amount: 1000,
      description: 'test description',
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    })

    const response = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(response.id).toBe(statement.id);
  });

  it('should not be able to get statement if user does not exist.', async () => {
    const response = getStatementOperationUseCase.execute({
      user_id: 'non-exisiting-user',
      statement_id: 'statement.id'
    });

    await expect(response).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  });

  it('should not be able to get statement if user does not exist.', async () => {
    const user = await inMemoryUsersRepository.create({
      email: 'iann@email.com',
      name: 'Iann Isacksson',
      password: '123456',
    });

    const response = getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: 'statement.id'
    });

    await expect(response).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  });
});
