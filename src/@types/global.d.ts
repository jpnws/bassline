import { JWTPayloadSpec } from '@elysiajs/jwt';

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

declare global {
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

  interface JWTPayload extends JWTPayloadSpec {
    id?: number;
    username?: string;
    role?: string;
  }

  interface ElysiaContext {
    params: { id: number };
    set: { status: number };
    bearer: string;
    jwt: {
      verify: (token: string) => Promise<JWTPayload | false>;
    };
  }
}
