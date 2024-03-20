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
