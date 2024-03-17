import { InvalidInputError } from 'src/errors/InvalidInputError';
import { InvalidPasswordError } from 'src/errors/InvalidPasswordError';
import { ItemAlreadyExistsError } from 'src/errors/ItemAlreadyExistsError';
import { ItemNotFoundError } from 'src/errors/ItemNotFoundError';

import { IJwt } from 'src/auth/AuthController';
import { IAuthEntity } from 'src/auth/AuthEntity';
import { IAuthRepository } from 'src/auth/AuthRepository';

import { v4 as uuidv4 } from 'uuid';

export interface IAuthService {
  signinUser: (
    username: string,
    password: string,
    jwt: IJwt
  ) => Promise<IAuthEntity>;
  signoutUser: () => Promise<void>;
  signupUser: (
    username: string,
    password: string,
    jwt: IJwt
  ) => Promise<IAuthEntity>;
  signInDemoUser: (jwt: IJwt) => Promise<IAuthEntity>;
  signInDemoAdmin: (jwt: IJwt) => Promise<IAuthEntity>;
}

export default class AuthService implements IAuthService {
  authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  public signinUser = async (username: string, password: string, jwt: IJwt) => {
    try {
      if (!username || !password) {
        throw new InvalidInputError('Either username or password was empty.');
      }
      const user = await this.authRepository.getUser(username);
      if (!user) {
        throw new ItemNotFoundError('User was not found.');
      }
      const isMatch = await Bun.password.verify(password, user.hash);
      if (!isMatch) {
        throw new InvalidPasswordError('User provided invalid password.');
      }
      const token = await jwt.sign({
        id: user.id,
        username: username,
        role: user.role,
      });
      return {
        id: user.id,
        token,
      };
    } catch (error) {
      throw error;
    }
  };

  public signInDemoUser = async (jwt: IJwt) => {
    try {
      const uuid = uuidv4();
      const username = `user-${uuid.split('-')[0]}`;
      const password = uuid;
      return await this.signupUser(username, password, jwt);
    } catch (error) {
      throw error;
    }
  };

  public signInDemoAdmin = async (jwt: IJwt) => {
    try {
      const uuid = uuidv4();
      const username = `admin-${uuid.split('-')[0]}`;
      const password = uuid;
      const hash = await Bun.password.hash(password);
      const user = await this.authRepository.addAdmin(username, hash);
      const token = await jwt.sign({
        id: user.id,
        username: user.username,
        role: user.role,
      });
      return {
        id: user.id,
        token,
      };
    } catch (error) {
      throw error;
    }
  };

  public signoutUser = async () => {};

  public signupUser = async (username: string, password: string, jwt: IJwt) => {
    try {
      if (!username || !password) {
        throw new InvalidInputError('Either username or password was empty.');
      }
      const user = await this.authRepository.getUser(username);
      if (user) {
        throw new ItemAlreadyExistsError('Username already in use.');
      }
    } catch (error) {
      throw error;
    }

    try {
      const hash = await Bun.password.hash(password);
      const user = await this.authRepository.addUser(username, hash);
      const token = await jwt.sign({
        id: user.id,
        username: user.username,
        role: user.role,
      });
      return {
        id: user.id,
        token,
      };
    } catch (error) {
      throw error;
    }
  };
}
