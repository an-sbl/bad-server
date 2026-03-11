import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import rateLimit from 'express-rate-limit'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

import { csrfProtection, sendCsrfToken, csrfErrorHandler } from './middlewares/csrf'

const { PORT = 3000 } = process.env
const { ORIGIN_ALLOW } = process.env
const app = express()

app.use(cookieParser())

app.use(cors({ 
    origin: ORIGIN_ALLOW,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
// app.use(express.static(path.join(__dirname, 'public')));
const limiter = rateLimit({
  windowMs: 30 * 1000, 
  max: 50,
  message: { error: 'Слишком много запросов. Сервер устает обрабатывать так быстро' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Применяем ко всем маршрутам
app.use(limiter);

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(json({ 
    limit: '5mb'
}))
app.use(urlencoded({ 
    extended: true, 
    limit: '5mb'
}))

app.get('/auth/csrf-token', csrfProtection, sendCsrfToken)

app.use((req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        csrfProtection(req, res, next);
    } else {
        next();
    }
});

app.options('*', cors())
app.use(routes)
app.use(errors())
app.use(csrfErrorHandler)
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
