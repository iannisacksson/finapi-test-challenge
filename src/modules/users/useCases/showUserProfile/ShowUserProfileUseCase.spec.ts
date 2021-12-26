
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';
import { ShowUserProfileError } from './ShowUserProfileError';

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('show user profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository,
    );
  });

  it('should be able to show user profile.', async () => {
    const user = await inMemoryUsersRepository.create({
      email: 'iann@email.com',
      name: 'Iann Isacksson',
      password: '123456',
    });

    const responseUser = await showUserProfileUseCase.execute(user.id as string);

    expect(responseUser).toHaveProperty('id');
    expect(responseUser.name).toBe('Iann Isacksson');
    expect(responseUser.email).toBe('iann@email.com');
  });

  it('should not be able to show a user profile if it does not exist.', async () => {
    const response = showUserProfileUseCase.execute('non-existing-user');

    await expect(response).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
