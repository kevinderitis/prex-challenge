import express from 'express';
import bodyParser from 'body-parser';
import authRouter from './routes/authRouter';
import connectToDatabase from './config/db';
import config from './config/config';

const app = express();
const port = config.PORT;

app.use(bodyParser.json());

connectToDatabase();

app.use('/api/auth', authRouter);


const server = app.listen(port, () => {
  console.log(`Servidor listening on port: ${port}`);
});

server.on('error', error => console.log(error));
