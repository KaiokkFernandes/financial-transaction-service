import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { authMiddleware } from '../middlewares/authMiddleware';

const clienteRoutes = Router();
const controller = new ClienteController();

clienteRoutes.post('/', (req, res) => controller.create(req, res));

clienteRoutes.get('/', (req, res) => controller.listAll(req, res));

clienteRoutes.get('/:id', authMiddleware, (req, res) => controller.findById(req, res));

export default clienteRoutes;