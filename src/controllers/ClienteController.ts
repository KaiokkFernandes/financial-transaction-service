import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Cliente } from '../entities/Cliente';

export class ClienteController {

 // Método para criar um novo cliente
  async create(req: Request, res: Response){
    const {nome} = req.body;

    if(!nome){
        return res.status(400).json({message: 'Nome é obrigatório'});
    }
    try{
      const clienteRepository = AppDataSource.getRepository(Cliente);

      const novoCliente = clienteRepository.create({nome});
        await clienteRepository.save(novoCliente);

        return res.status(201).json(novoCliente);
    }catch(error){
        return res.status(500).json({message: 'Erro ao criar cliente', error});
    }
  }
}