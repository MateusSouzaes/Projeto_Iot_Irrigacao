import 'express-session';

declare module 'express-serve-static-core' {
  interface Request {
    flash(type: string, message?: any): unknown[];
    addFlash(type: string, message: any): void;
    session: {
      flash?: { [key: string]: unknown[] };
      [key: string]: any;
    };
  }
}
