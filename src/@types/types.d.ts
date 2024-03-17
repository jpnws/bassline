declare module 'bun' {
  interface Env {
    APP_HOST: string;
    APP_PORT: string;
    DATABASE_URL: string;
    DB_HOST: string;
    DB_PORT: string;
    DB_USER: string;
    DB_PASS: string;
    DB_SSL: string;
    APP_JWT_SECRET: string;
  }
}

type PostBody = {
  id?: number;
  subject: string;
  text: string;
  boardId: number;
  authorId: number;
};

type CommentBody = {
  id?: number;
  text: string;
  postId: number;
  authorId: number;
};

type UserBody = {
  id?: number;
  username: string;
  password?: string;
  role?: 'MEMBER' | 'ADMIN';
};
