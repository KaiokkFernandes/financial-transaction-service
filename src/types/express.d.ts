import { Cliente } from "../entities/Cliente";

// Esse arquivo e para tipar a requisição do express
declare global {
    namespace Express {
        export interface Request {
            cliente?: Cliente;
        }
    }
}

