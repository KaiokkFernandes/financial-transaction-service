import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';

// Usar SQLite em desenvolvimento, PostgreSQL em produção/Docker
const isProduction = process.env.NODE_ENV === 'production' || process.env.USE_POSTGRES === 'true';

export const AppDataSource = new DataSource(
  isProduction
    ? {
        // Configuração PostgreSQL (produção/Docker)
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER || 'finance_user',
        password: process.env.DB_PASSWORD || 'finance_pass',
        database: process.env.DB_NAME || 'financial_db',
        synchronize: false,
        logging: false,
        entities: [path.join(__dirname, 'entities', '**', '*.{js,ts}')],
        migrations: [path.join(__dirname, 'database', 'migrations', '**', '*.{js,ts}')],
        extra: {
          max: 20,
          min: 5,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }
    : {
        // Configuração SQLite (desenvolvimento local)
        type: 'sqlite',
        database: path.join(__dirname, '..', 'database', 'dbfinance.sqlite'),
        synchronize: false,
        logging: true,
        entities: [path.join(__dirname, 'entities', '**', '*.{js,ts}')],
        migrations: [path.join(__dirname, 'database', 'migrations', '**', '*.{js,ts}')],
      }
);