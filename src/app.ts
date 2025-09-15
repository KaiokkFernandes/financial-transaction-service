import express from 'express';
import clienteRoutes from './routes/clientes.routes';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Api rodando!' });
});

app.use('/clientes', clienteRoutes);

export default app;