import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';

// Configuração para PostgreSQL com suporte a replicação
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'finance_user',
  password: process.env.DB_PASSWORD || 'finance_pass',
  database: process.env.DB_NAME || 'financial_db',
  synchronize: false, // Usando migrations
  logging: process.env.NODE_ENV !== 'production',
  entities: [path.join(__dirname, 'entities', '**', '*.{js,ts}')],
  migrations: [path.join(__dirname, 'database', 'migrations', '**', '*.{js,ts}')],
  // Configurações de pool de conexões
  extra: {
    max: 20, // Máximo de conexões no pool
    min: 5,  // Mínimo de conexões no pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
});