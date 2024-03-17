export interface IBoardEntity {
  id: number;
  name: string;
  createdAt: string;
}

export default class BoardEntity implements IBoardEntity {
  id: number;
  name: string;
  createdAt: string;

  constructor(id: number, name: string, createdAt: string) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
  }
}
