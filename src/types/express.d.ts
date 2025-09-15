import { Cliente } from "../entities/Cliente";

// Esse arquivo e para tipar a requisição do express
// Assim o typeScript reconhece que a requisição pode ter um cliente
declare global {
    namespace Express {
        export interface Request {
            cliente?: Cliente;
        }
    }
}