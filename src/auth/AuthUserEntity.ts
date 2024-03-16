export interface IAuthUserEntity {
  id: number;
  username: string;
  hash: string;
  role: string;
}

export default class AuthUserEntity implements IAuthUserEntity {
  id: number;
  username: string;
  hash: string;
  role: string;

  constructor(id: number, username: string, hash: string, role: string) {
    this.id = id;
    this.username = username;
    this.hash = hash;
    this.role = role;
  }
}
