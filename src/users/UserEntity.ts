export interface IUserEntity {
  id?: number | undefined;
  username?: string | undefined;
  role?: string | undefined;
}

export default class UserEntity implements IUserEntity {
  id: number | undefined;
  username: string | undefined;
  role: string | undefined;
  constructor(id?: number, username?: string, role?: string) {
    this.id = id;
    this.username = username;
    this.role = role;
  }
}
