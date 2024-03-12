export type User = {
  id: number;
  username: string;
  role: string;
};

interface IUserEntity {}

export default class UserEntity {
  user: User;
  constructor(user: User) {
    this.user = user;
  }
}
