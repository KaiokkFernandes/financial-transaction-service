import { ClienteUseCase } from '../services/ClienteService';
import { AppDataSource } from '../data-source';
import { Cliente } from '../entities/Cliente';


// Testes unitários para o ClienteService documentação em documentacaoAPI

const mockRepository = {
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

const mockTransactionalEntityManager = {
  findOne: jest.fn(),
  save: jest.fn(),
};

jest.mock('../data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(() => mockRepository),
    transaction: jest.fn(),
  },
}));

describe('ClienteUseCase', () => {
  let clienteUseCase: ClienteUseCase;

  beforeEach(() => {
    clienteUseCase = new ClienteUseCase();
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('deve retornar um cliente quando encontrado', async () => {
      const clienteMock: Cliente = {
        id: 1,
        nome: 'João Silva',
        saldo: 100.50,
        api_key: 'test-api-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        generateApiKey: jest.fn(),
      };

      mockRepository.findOneBy.mockResolvedValue(clienteMock);

      // Act
      const resultado = await clienteUseCase.findById(1);

      // Assert
      expect(resultado).toEqual(clienteMock);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('deve lançar erro quando cliente não for encontrado', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(clienteUseCase.findById(999)).rejects.toThrow('Cliente não encontrado');
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe('create', () => {
    it('deve criar um cliente com sucesso', async () => {
      const nome = 'Maria Santos';
      const clienteCriado: Cliente = {
        id: 1,
        nome: 'Maria Santos',
        saldo: 0,
        api_key: 'generated-api-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        generateApiKey: jest.fn(),
      };

      mockRepository.create.mockReturnValue(clienteCriado);
      mockRepository.save.mockResolvedValue(clienteCriado);

      const resultado = await clienteUseCase.create(nome);

      expect(resultado).toEqual(clienteCriado);
      expect(mockRepository.create).toHaveBeenCalledWith({ nome: 'Maria Santos' });
      expect(mockRepository.save).toHaveBeenCalledWith(clienteCriado);
    });

    it('deve lançar erro quando nome está vazio', async () => {
      await expect(clienteUseCase.create('')).rejects.toThrow('Nome é obrigatório');
      await expect(clienteUseCase.create('   ')).rejects.toThrow('Nome é obrigatório');
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando nome é undefined ou null', async () => {
      await expect(clienteUseCase.create(undefined as any)).rejects.toThrow('Nome é obrigatório');
      await expect(clienteUseCase.create(null as any)).rejects.toThrow('Nome é obrigatório');
    });

    it('deve lançar erro quando falha ao salvar no banco', async () => {
      const nome = 'João Silva';
      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(clienteUseCase.create(nome)).rejects.toThrow('Erro ao criar cliente');
    });

    it('deve fazer trim no nome antes de salvar', async () => {
      const nomeComEspacos = '  Maria Santos  ';
      const clienteCriado: Cliente = {
        id: 1,
        nome: 'Maria Santos',
        saldo: 0,
        api_key: 'generated-api-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        generateApiKey: jest.fn(),
      };

      mockRepository.create.mockReturnValue(clienteCriado);
      mockRepository.save.mockResolvedValue(clienteCriado);

      await clienteUseCase.create(nomeComEspacos);

      expect(mockRepository.create).toHaveBeenCalledWith({ nome: 'Maria Santos' });
    });
  });

  describe('listAll', () => {
    it('deve retornar lista de clientes ordenada por id', async () => {
      const clientesMock: Cliente[] = [
        {
          id: 1,
          nome: 'João Silva',
          saldo: 100.50,
          api_key: 'api-key-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          generateApiKey: jest.fn(),
        },
        {
          id: 2,
          nome: 'Maria Santos',
          saldo: 200.75,
          api_key: 'api-key-2',
          createdAt: new Date(),
          updatedAt: new Date(),
          generateApiKey: jest.fn(),
        },
      ];

      mockRepository.find.mockResolvedValue(clientesMock);
      const resultado = await clienteUseCase.listAll();
      expect(resultado).toEqual(clientesMock);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { id: 'ASC' }
      });
    });

    it('deve retornar lista vazia quando não há clientes', async () => {
      mockRepository.find.mockResolvedValue([]);

      const resultado = await clienteUseCase.listAll();

      expect(resultado).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { id: 'ASC' }
      });
    });

    it('deve lançar erro quando falha ao buscar clientes', async () => {
      mockRepository.find.mockRejectedValue(new Error('Database error'));

      await expect(clienteUseCase.listAll()).rejects.toThrow('Erro ao listar clientes');
    });
  });

  describe('deposito', () => {
    it('deve realizar depósito com sucesso', async () => {
      const clienteId = 1;
      const valorDeposito = 150.75;
      const clienteMock: Cliente = {
        id: 1,
        nome: 'João Silva',
        saldo: 100.50,
        api_key: 'test-api-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        generateApiKey: jest.fn(),
      };

      const clienteAtualizado = { ...clienteMock, saldo: 251.25 };

      mockRepository.findOneBy.mockResolvedValue(clienteMock);
      mockRepository.save.mockResolvedValue(clienteAtualizado);

      const resultado = await clienteUseCase.deposito(clienteId, valorDeposito);

      expect(resultado.saldo).toBe(251.25);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: clienteId });
      expect(mockRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        saldo: 251.25
      }));
    });

    it('deve lançar erro quando valor é negativo', async () => {
      await expect(clienteUseCase.deposito(1, -50)).rejects.toThrow('Valor do depósito deve ser positivo');
      expect(mockRepository.findOneBy).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando valor é zero', async () => {
      await expect(clienteUseCase.deposito(1, 0)).rejects.toThrow('Valor do depósito deve ser positivo');
      expect(mockRepository.findOneBy).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando cliente não for encontrado', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(clienteUseCase.deposito(999, 100)).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('transferencia', () => {
    beforeEach(() => {
      (AppDataSource.transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTransactionalEntityManager);
      });
    });

    it('deve realizar transferência com sucesso', async () => {
      const origemId = 1;
      const destinoId = 2;
      const valor = 50.00;

      const clienteOrigemMock: Cliente = {
        id: 1,
        nome: 'João Silva',
        saldo: 100.50,
        api_key: 'api-key-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        generateApiKey: jest.fn(),
      };

      const clienteDestinoMock: Cliente = {
        id: 2,
        nome: 'Maria Santos',
        saldo: 200.75,
        api_key: 'api-key-2',
        createdAt: new Date(),
        updatedAt: new Date(),
        generateApiKey: jest.fn(),
      };

      mockTransactionalEntityManager.findOne
        .mockResolvedValueOnce(clienteOrigemMock)
        .mockResolvedValueOnce(clienteDestinoMock);

      mockTransactionalEntityManager.save.mockResolvedValue({});

      await clienteUseCase.transferencia(origemId, destinoId, valor);

      expect(mockTransactionalEntityManager.findOne).toHaveBeenCalledTimes(2);
      expect(mockTransactionalEntityManager.save).toHaveBeenCalledTimes(2);
      expect(clienteOrigemMock.saldo).toBe(50.50);
      expect(clienteDestinoMock.saldo).toBe(250.75);
    });

    it('deve lançar erro quando valor é negativo', async () => {
      await expect(clienteUseCase.transferencia(1, 2, -50)).rejects.toThrow('Valor deve ser positivo');
    });

    it('deve lançar erro quando valor é zero', async () => {
      await expect(clienteUseCase.transferencia(1, 2, 0)).rejects.toThrow('Valor deve ser positivo');
    });

    it('deve lançar erro quando origem e destino são iguais', async () => {
      await expect(clienteUseCase.transferencia(1, 1, 50)).rejects.toThrow('Não é possivel transferir para a mesma conta, use o depósito');
    });

    it('deve lançar erro quando cliente de origem não for encontrado', async () => {
      mockTransactionalEntityManager.findOne
        .mockResolvedValueOnce(null);

      await expect(clienteUseCase.transferencia(999, 2, 50)).rejects.toThrow('Cliente de origem não encontrado');
    });

    it('deve lançar erro quando cliente de destino não for encontrado', async () => {
      const clienteOrigemMock: Cliente = {
        id: 1,
        nome: 'João Silva',
        saldo: 100.50,
        api_key: 'api-key-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        generateApiKey: jest.fn(),
      };

      mockTransactionalEntityManager.findOne
        .mockResolvedValueOnce(clienteOrigemMock)
        .mockResolvedValueOnce(null);

      await expect(clienteUseCase.transferencia(1, 999, 50)).rejects.toThrow('Cliente de destino não encontrado');
    });

    it('deve lançar erro quando saldo é insuficiente', async () => {
      const clienteOrigemMock: Cliente = {
        id: 1,
        nome: 'João Silva',
        saldo: 30.00,
        api_key: 'api-key-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        generateApiKey: jest.fn(),
      };

      const clienteDestinoMock: Cliente = {
        id: 2,
        nome: 'Maria Santos',
        saldo: 200.75,
        api_key: 'api-key-2',
        createdAt: new Date(),
        updatedAt: new Date(),
        generateApiKey: jest.fn(),
      };

      mockTransactionalEntityManager.findOne
        .mockResolvedValueOnce(clienteOrigemMock)
        .mockResolvedValueOnce(clienteDestinoMock);

      await expect(clienteUseCase.transferencia(1, 2, 50)).rejects.toThrow('Saldo insuficiente');
    });

    it('deve processar valores decimais corretamente', async () => {
      const clienteOrigemMock: Cliente = {
        id: 1,
        nome: 'João Silva',
        saldo: 100.25,
        api_key: 'api-key-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        generateApiKey: jest.fn(),
      };

      const clienteDestinoMock: Cliente = {
        id: 2,
        nome: 'Maria Santos',
        saldo: 50.75,
        api_key: 'api-key-2',
        createdAt: new Date(),
        updatedAt: new Date(),
        generateApiKey: jest.fn(),
      };

      mockTransactionalEntityManager.findOne
        .mockResolvedValueOnce(clienteOrigemMock)
        .mockResolvedValueOnce(clienteDestinoMock);

      await clienteUseCase.transferencia(1, 2, 25.50);

      expect(clienteOrigemMock.saldo).toBe(74.75);
      expect(clienteDestinoMock.saldo).toBe(76.25);
    });
  });
});
