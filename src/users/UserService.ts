import { IUserEntity } from 'src/users/UserEntity';
import { IUserRepository } from 'src/users/UserRepository';

export interface IUserService {
  getUser: (id: number) => Promise<IUserEntity>;
  addUser: (username: string, password: string) => Promise<IUserEntity>;
  removeUser: (id: number) => Promise<void>;
  updateUser: (
    id: number,
    username: string,
    role: string,
  ) => Promise<IUserEntity>;
}

export default class UserService implements IUserService {
  userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  public getUser = async (id: number) => {
    try {
      return await this.userRepository.get(id);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  public addUser = async (username: string, password: string) => {
    try {
      return await this.userRepository.add(username, password);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  public removeUser = async (id: number) => {
    try {
      return await this.userRepository.delete(id);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  public updateUser = async (id: number, username: string, role: string) => {
    try {
      return await this.userRepository.update(id, username, role);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}
