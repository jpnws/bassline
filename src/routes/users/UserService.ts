import { User } from 'src/routes/users/UserEntity';
import { IUserRepository } from 'src/routes/users/UserRepository';

export interface IUserService {
  getUserById: (id: number) => Promise<User>;
}

export default class UserService implements IUserService {
  userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  public getUserById = async (id: number) => {
    try {
      return await this.userRepository.findUserById(id);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}
