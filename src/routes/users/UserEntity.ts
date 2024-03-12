interface User {
  id: number;
  username: string;
  role: string;
}

export default class UserEntity {
  user: User;
  constructor(user: User) {
    this.user = user;
  }
}
