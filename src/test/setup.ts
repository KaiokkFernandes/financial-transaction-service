import 'reflect-metadata';

// Mock dos ids 
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-value'),
}));

// Mock do AppDataSource para os testes
jest.mock('../data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
    transaction: jest.fn(),
  },
}));

// Configurações globais para os testes
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});
