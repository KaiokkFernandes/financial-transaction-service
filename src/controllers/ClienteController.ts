import { Request, Response } from 'express';
import { ClienteUseCase } from '../services/ClienteService';

export class ClienteController {
    private clienteUseCase = new ClienteUseCase();

    // Método para criar um novo cliente
    async create(req: Request, res: Response) {
        const { nome } = req.body;

        try {
            const novoCliente = await this.clienteUseCase.create(nome);
            return res.status(201).json(novoCliente);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro interno';
            
            if (errorMessage === 'Nome é obrigatório') {
                return res.status(400).json({ message: errorMessage });
            }
            
            return res.status(500).json({ message: errorMessage });
        }
    }

    // Método para obter todos os clientes
    async listAll(req: Request, res: Response) {
        try {
            const clientes = await this.clienteUseCase.listAll();
            return res.status(200).json(clientes);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro interno';
            return res.status(500).json({ message: errorMessage });
        }
    }

    // Método para buscar cliente por ID
    async findById(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const cliente = await this.clienteUseCase.findById(Number(id));
            return res.status(200).json(cliente);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro interno';
            
            if (errorMessage === 'Cliente não encontrado') {
                return res.status(404).json({ message: errorMessage });
            }
            
            return res.status(500).json({ message: errorMessage });
        }
    }
   // Método para obter os dados do cliente autenticado
    async getById(req: Request, res: Response) {
        const clienteAutenticado = req.cliente;
        const idParaConsultar = parseInt(req.params.id, 10);

    if(!clienteAutenticado){
        return res.status(401).json({ message: 'Cliente não autenticado' });
    
    }
    // Regra de negócio o usuário só pode consultar seus próprios dados.
     if (clienteAutenticado.id !== idParaConsultar) {
      return res.status(403).json({ message: 'Acesso negado. Você só pode consultar seus próprios dados.' });
    }
      try{
        const cliente  = await this.clienteUseCase.findById(idParaConsultar);
        return res.status(200).json(cliente); 

      } catch (error){
         const errorMessage = error instanceof Error ? error.message : 'Erro interno';
         if(errorMessage === 'Cliente não encontrado'){
            return res.status(404).json({ message: errorMessage });
         }
         return res.status(500).json({ message: errorMessage });
      }
    }

    // Método para realizar depósito na conta do cliente
    async deposito(req: Request, res: Response){
        const clienteAutenticado = req.cliente;
        const idParaDepositar =  parseInt(req.params.id, 10);
        const { valor } = req.body;

        if(!clienteAutenticado){
            return res.status(401).json({ message: 'Cliente não autenticado' });
        }

         // Regra de negócio o usuário só pode depositar em sua própria conta.
        if (clienteAutenticado.id !== idParaDepositar) {
          return res.status(403).json({ message: 'Acesso negado. Você só pode depositar em sua própria conta.' });
          }

        try{
          const clienteAtualizado = await this.clienteUseCase.deposito(idParaDepositar, valor);
          return res.status(200).json(clienteAtualizado);
        } catch (error){
         const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor.';
      
         if (errorMessage === 'O valor do depósito deve ser um número positivo.') {
           return res.status(400).json({ message: errorMessage }); 
         }
         if (errorMessage === 'Cliente não encontrado') {
           return res.status(404).json({ message: errorMessage });
          }
          
          return res.status(500).json({ message: errorMessage });
        }
    }

    // Método para realizar transferência entre contas
    async transferencia(req: Request, res: Response){
        const clienteAutenticado = req.cliente;
        const idOrigem = parseInt(req.params.id, 10);
        const {destino_id, valor } = req.body

        if(!clienteAutenticado){
            return res.status(401).json({message: "Cliente não autenticado"});
        }
        
         // Regra de négocio o usuário só pode iniciar transferências de sua própria conta.
        if (clienteAutenticado.id !== idOrigem) {
          return res.status(403).json({ message: 'Acesso negado. Você só pode transferir de sua própria conta.' });
         }

         try{
            await this.clienteUseCase.transferencia(idOrigem, destino_id, valor);
            return res.status(200).json({message: 'Transferencia realizada com sucesso.'})
   
        }catch (error){
      
       const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor.';
   
       if (errorMessage.includes('não encontrado')) {
        return res.status(404).json({ message: errorMessage });
      }
   
      if (errorMessage.includes('Saldo insuficiente') || errorMessage.includes('valor deve ser positivo') || errorMessage.includes('não podem ser a mesma')) {
        return res.status(400).json({ message: errorMessage })
      }
      
      return res.status(500).json({ message: errorMessage });
        
      }

    }
}