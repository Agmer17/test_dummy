import express from 'express';
import routes from './controller/index.js';

const app = express();

app.use(express.json());

// Register routes
app.use(routes);

export default app;
