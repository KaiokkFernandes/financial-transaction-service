import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { authMiddleware } from '../middlewares/authMiddleware';

const clienteRoutes = Router();
const controller = new ClienteController();

clienteRoutes.post('/', controller.create);

clienteRoutes.get('/', controller.listAll);

clienteRoutes.get('/:id', authMiddleware,  controller.findById);

export default clienteRoutes;