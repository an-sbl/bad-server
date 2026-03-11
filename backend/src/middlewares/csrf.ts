import { doubleCsrf } from "csrf-csrf";
import { Request, Response, NextFunction } from 'express';

const { 
  doubleCsrfProtection, 
  generateCsrfToken,
  invalidCsrfTokenError 
} = doubleCsrf({
  getSecret: () => 'secret-key-for-csrf',
  getSessionIdentifier: (req) => req.cookies?.['_csrf_secret'] || '',
  cookieName: "_csrf_secret",
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    secure: false,
  },
  getCsrfTokenFromRequest: (req) => {
    return (req.headers['x-csrf-token'] || req.headers['csrf-token']) as string;
  },
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

export { doubleCsrfProtection as csrfProtection };

export const sendCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  
  const token = generateCsrfToken(req, res);
  
  res.cookie('_csrf', 'secret-placeholder', {
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