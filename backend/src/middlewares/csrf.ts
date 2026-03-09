import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';

export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'strict'
  }
});

export const sendCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  res.json({ csrfToken: req.csrfToken() });
};

export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }
  
  res.status(403).json({ error: 'Некорректный CSRF токен'});
};