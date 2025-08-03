import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      uuid: string;
      role?: string;
      [key: string]: any;
    };
  }
}
