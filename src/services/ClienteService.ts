import { AppDataSource } from "../data-source";
import { Cliente } from "../entities/Cliente";

// Service para lidar com a regra de negócio relacionada ao Cliente
export class ClienteUseCase {
    
    private clienteRepository = AppDataSource.getRepository(Cliente);

    async findById(id: number): Promise<Cliente> {
        const cliente = await this.clienteRepository.findOneBy({ id });

        if (!cliente) {
            throw new Error('Cliente não encontrado');
        }

        return cliente;
    }
    
    async create(nome: string): Promise<Cliente> {
        if (!nome || nome.trim() === '') {
            throw new Error('Nome é obrigatório');
        }

        try {
            const novoCliente = this.clienteRepository.create({ nome: nome.trim() });
            return await this.clienteRepository.save(novoCliente);
        } catch (error) {
            throw new Error('Erro ao criar cliente');
        }
    }

    async listAll(): Promise<Cliente[]> {
        try {
            return await this.clienteRepository.find({
                order: { id: 'ASC' }
            });
        } catch (error) {
            throw new Error('Erro ao listar clientes');
        }
    }

    async deposito(clienteId: number, valor: number): Promise<Cliente> {
       if(valor <= 0){
         throw new Error('Valor do depósito deve ser positivo');
       }
       const cliente = await this.findById(clienteId);

       cliente.saldo = Number(cliente.saldo) + valor;  // Atualiza o saldo do cliente
       
       await this.clienteRepository.save(cliente);

         return cliente;
    }
}
