import express from 'express';
import routes from './controller/index.js';

const app = express();
app.use(express.json());
app.use(routes); 

app.get("/", async (req, res) => {
    res.json({message : "hello"})
})
// ← tanpa prefix apapun
export default app;