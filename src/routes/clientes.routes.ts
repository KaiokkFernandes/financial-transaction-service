import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';

const clienteRoutes = Router();
const controller = new ClienteController();

clienteRoutes.post('/', controller.create);

clienteRoutes.get('/', controller.listAll);

export default clienteRoutes;