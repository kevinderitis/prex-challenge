import express from 'express';
import authRouter from './routes/authRouter';
import filesRouter from './routes/filesRouter';
import connectToDatabase from './config/db';
import config from './config/config';
import { auth } from './middlewares/auth'

const app = express();
const port = config.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToDatabase();

app.use('/api/auth', authRouter);
app.use('/api/files', auth ,filesRouter);


const server = app.listen(port, () => {
  console.log(`Servidor listening on port: ${port}`);
});

server.on('error', error => console.log(error));
