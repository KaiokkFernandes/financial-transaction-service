import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { authMiddleware } from '../middlewares/authMiddleware';

const clienteRoutes = Router();
const controller = new ClienteController();

clienteRoutes.post('/', (req, res) => controller.create(req, res));

clienteRoutes.get('/', (req, res) => controller.listAll(req, res));

clienteRoutes.get('/:id', authMiddleware, (req, res) => controller.getById(req, res));

clienteRoutes.post('/:id/deposito', authMiddleware, (req, res) => controller.deposito(req, res));

clienteRoutes.post('/:id/transferencia', authMiddleware, (req, res) => controller.transferencia(req, res));

export default clienteRoutes;