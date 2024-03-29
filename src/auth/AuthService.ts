import { InvalidInputError } from 'src/errors/InvalidInputError';
import { InvalidPasswordError } from 'src/errors/InvalidPasswordError';
import { ItemAlreadyExistsError } from 'src/errors/ItemAlreadyExistsError';
import { ItemNotFoundError } from 'src/errors/ItemNotFoundError';

import { IJwt } from 'src/auth/AuthController';
import { IAuthEntity } from 'src/auth/AuthEntity';
import { IAuthRepository } from 'src/auth/AuthRepository';

import { v4 as uuidv4 } from 'uuid';

export interface IAuthService {
  signInUser: (
    username: string,
    password: string,
    jwt: IJwt,
  ) => Promise<IAuthEntity>;
  signInDemoUser: (jwt: IJwt) => Promise<IAuthEntity>;
  signInDemoAdmin: (jwt: IJwt) => Promise<IAuthEntity>;
  signUpUser: (
    username: string,
    password: string,
    jwt: IJwt,
  ) => Promise<IAuthEntity>;
  signOutUser: () => Promise<void>;
}

export default class AuthService implements IAuthService {
  authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  public signInUser = async (username: string, password: string, jwt: IJwt) => {
    if (!username || !password) {
      throw new InvalidInputError('Either username or password was empty.');
    }
    if (username.length > 12 || username.length < 6) {
      throw new InvalidInputError(
        'Username must be between 6 and 12 characters.',
      );
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new InvalidInputError('Username must be alphanumeric.');
    }
    if (password.length < 6) {
      throw new InvalidInputError('Password must be at least 6 characters.');
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
  };

  public signInDemoUser = async (jwt: IJwt) => {
    const uuid = uuidv4();
    const username = `u_${uuid.split('-')[0]}`;
    const password = uuid;
    return await this.signUpUser(username, password, jwt);
  };

  public signInDemoAdmin = async (jwt: IJwt) => {
    const uuid = uuidv4();
    const username = `a_${uuid.split('-')[0]}`;
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
  };

  public signUpUser = async (username: string, password: string, jwt: IJwt) => {
    if (!username || !password) {
      throw new InvalidInputError('Either username or password was empty.');
    }
    if (username.length > 12 || username.length < 6) {
      throw new InvalidInputError(
        'Username must be between 6 and 12 characters.',
      );
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new InvalidInputError('Username must be alphanumeric.');
    }
    if (password.length < 6) {
      throw new InvalidInputError('Password must be at least 6 characters.');
    }
    const userExists = await this.authRepository.getUser(username);
    if (userExists) {
      throw new ItemAlreadyExistsError('Username already in use.');
    }
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
  };

  public signOutUser = async () => {};
}
