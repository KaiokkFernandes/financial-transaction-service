# Documentação de Testes Unitários

## Visão Geral

Este documento descreve a estrutura e implementação dos testes unitários do **Financial Transaction Service**. Os testes foram implementados usando **Jest** com **TypeScript** para garantir a qualidade e confiabilidade do código.

## Tecnologias Utilizadas

- **Jest**: Framework de testes JavaScript/TypeScript
- **ts-jest**: Preset do Jest para TypeScript
- **@types/jest**: Tipagens TypeScript para Jest

## Estrutura dos Testes

```
src/
├── test/
│   ├── setup.ts              # Configurações globais dos testes
│   └── ClienteService.test.ts # Testes do ClienteService
└── services/
    └── ClienteService.ts      # Service sendo testado
```

### ClienteService

O `ClienteService` possui testes abrangentes para todos os métodos:

#### `findById(id: number)`
- ✅ Retorna cliente quando encontrado
- ✅ Lança erro quando cliente não existe

#### `create(nome: string)`
- ✅ Cria cliente com sucesso
- ✅ Valida nome obrigatório
- ✅ Valida nome não pode ser vazio ou apenas espaços
- ✅ Faz trim do nome antes de salvar
- ✅ Trata erros de banco de dados

####  `listAll()`
- ✅ Retorna lista ordenada de clientes
- ✅ Retorna lista vazia quando não há clientes
- ✅ Trata erros de banco de dados

####  `deposito(clienteId: number, valor: number)`
- ✅ Realiza depósito com sucesso
- ✅ Valida valor deve ser positivo
- ✅ Valida cliente deve existir
- ✅ Atualiza saldo corretamente

####  `transferencia(origemId: number, destinoId: number, valor: number)`
- ✅ Realiza transferência com sucesso
- ✅ Valida valor deve ser positivo
- ✅ Valida origem e destino não podem ser iguais
- ✅ Valida cliente origem deve existir
- ✅ Valida cliente destino deve existir
- ✅ Valida saldo suficiente
- ✅ Processa valores decimais corretamente
- ✅ Utiliza transações do banco de dados

## Executando os Testes

### Comandos Disponíveis

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (re-executa ao modificar arquivos)
npm run test:watch

# Executar testes com relatório de cobertura
npm run test:coverage
```

### Exemplos de Execução

#### Executar todos os testes:
```bash
npm test
```

#### Executar apenas testes do ClienteService:
```bash
npm test ClienteService
```

#### Executar com cobertura:
```bash
npm run test:coverage
```

## Relatório de Cobertura

O relatório de cobertura é gerado na pasta `coverage/` e inclui:

- **Linhas cobertas**: Percentual de linhas executadas
- **Funções cobertas**: Percentual de funções testadas
- **Branches cobertas**: Percentual de ramificações testadas
- **Statements cobertas**: Percentual de declarações testadas

### Visualização da Cobertura

Após executar `npm run test:coverage`, abra o arquivo:
```
coverage/lcov-report/index.html
```

## Configuração do Jest

### jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/app.ts',
    '!src/data-source.ts',
    '!src/database/migrations/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
};
```

### Arquivos Excluídos da Cobertura

- `src/server.ts` - Arquivo de inicialização do servidor
- `src/app.ts` - Configuração do Express
- `src/data-source.ts` - Configuração do TypeORM
- `src/database/migrations/**` - Arquivos de migração

## Mocking

### AppDataSource Mock

Os testes utilizam mocks do TypeORM para simular operações de banco de dados:

```typescript
const mockRepository = {
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

jest.mock('../data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(() => mockRepository),
    transaction: jest.fn(),
  },
}));
```

### Transações Mock

Para testes de transferência, é mockado o sistema de transações:

```typescript
(AppDataSource.transaction as jest.Mock).mockImplementation(async (callback) => {
  return await callback(mockTransactionalEntityManager);
});
```

## adrões de Teste

### Estrutura AAA (Arrange, Act, Assert)

Todos os testes seguem o padrão AAA:

```typescript
it('deve realizar depósito com sucesso', async () => {
  // Arrange - Preparar dados e mocks
  const clienteId = 1;
  const valorDeposito = 150.75;
  const clienteMock = { /* ... */ };
  
  // Act - Executar a ação
  const resultado = await clienteUseCase.deposito(clienteId, valorDeposito);
  
  // Assert - Verificar resultados
  expect(resultado.saldo).toBe(251.25);
  expect(mockRepository.save).toHaveBeenCalled();
});
```

### Nomenclatura de Testes

- Descrição clara do comportamento esperado
- Uso de "deve" para indicar a expectativa
- Cenários positivos e negativos


## Boas Práticas Implementadas

1. **Isolamento**: Cada teste é independente
2. **Mocking**: Dependências externas são mockadas
3. **Cobertura**: Alta cobertura de código
4. **Casos Edge**: Testes para cenários limites
5. **Validações**: Testes para todas as validações de negócio
6. **Transações**: Testes para operações que envolvem múltiplas entidades


