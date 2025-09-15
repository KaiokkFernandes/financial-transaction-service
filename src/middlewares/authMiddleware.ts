import {Request, Response, NextFunction} from 'express';
import { AppDataSource } from '../data-source';
import { Cliente } from '../entities/Cliente';


export const authMiddleware = async(
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const authHeader = req.headers.authorization;  // Aqui é para pegar a apikey do header

  if(!authHeader){
      return res.status(401).json({message: 'API Key não fornecida'});
  }

  const parts = authHeader.split(' ');
  const apiKey = parts[1]; // Pega a parte da chave

    try{
      const clienteRepository = AppDataSource.getRepository(Cliente);
      const cliente =  await clienteRepository.findOneBy({api_key: apiKey});

      if(!cliente){
        return res.status(401).json({message: 'API Key inválida'});
      }


      req.cliente = cliente;  // se funcionar corretamente adiciona o cliente na requisição


      next();
    } catch (error) {
        return res.status(500).json({message: 'Erro interno do servidor'});
    }
}