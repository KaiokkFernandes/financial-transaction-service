import express from "express";
import 'expressp-async-errors';

const app = express();

app.use(express.json());

app.get('/', (req, res) =>{
 res.json({message:''})
})

export default app;