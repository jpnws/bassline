export interface IAuthEntity {
  id: number;
  token: string;
}

export default class AuthEntity implements IAuthEntity {
  id: number;
  token: string;

  constructor(id: number, token: string) {
    this.id = id;
    this.token = token;
  }
}
