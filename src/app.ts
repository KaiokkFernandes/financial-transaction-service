import express from 'express';
import clienteRoutes from './routes/clientes.routes';
import { AppDataSource } from './data-source';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Api rodando!' });
});

// Health check endpoint para load balancer
app.get('/health', async (req, res) => {
  try {
    // Verificar conexão com banco de dados
    await AppDataSource.query('SELECT 1');
    
    const replicaId = process.env.REPLICA_ID || 'unknown';
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      replica: replicaId,
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      replica: process.env.REPLICA_ID || 'unknown',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.use('/clientes', clienteRoutes);

export default app;