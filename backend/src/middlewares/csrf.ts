import { doubleCsrf } from "csrf-csrf";
import { Request, Response, NextFunction } from 'express';

const { 
  doubleCsrfProtection, 
  generateCsrfToken,
  invalidCsrfTokenError 
} = doubleCsrf({
  getSecret: (req) => req?.cookies?.['_csrf'] || process.env.CSRF_SECRET || 'secret-key-for-csrf',
  getSessionIdentifier: (req) => 'session',
  cookieName: undefined,
  getCsrfTokenFromRequest: (req) => {
    return (req.headers['x-csrf-token'] || req.headers['csrf-token']) as string;
  },
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

export { doubleCsrfProtection as csrfProtection };

export const sendCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  
  const token = generateCsrfToken(req, res);
  const secret = process.env.CSRF_SECRET
  res.cookie('_csrf', secret, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    secure: false,
  });
  
  res.json({ csrfToken: token });
};

export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err !== invalidCsrfTokenError) {
    return next(err);
  }
  
  res.status(403).json({ error: 'Некорректный CSRF токен'});
};