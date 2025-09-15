import 'reflect-metadata';
import { DataSource } from 'typeorm';

import path from 'path';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: path.join(__dirname, '..', 'database', 'dbfinance.sqlite'),
  synchronize: false, // Vou utilizar migrations então não precisamos desse parâmetro true
  logging: true,
  entities: [path.join(__dirname, 'entities', '**', '*.{js,ts}')],
  migrations: [path.join(__dirname, 'database', 'migrations', '**', '*.{js,ts}')],
});