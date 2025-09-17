# Financial Transaction Service

Serviço de transações financeiras desenvolvido em Node.js com TypeScript. 

## Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Express.js** - Framework web para Node.js
- **TypeORM** - ORM para TypeScript e JavaScript
- **SQLite** - Banco de dados relacional leve
- **Jest** - Framework de testes
- **Docker** - Containerização da aplicação
- **UUID** - Geração de identificadores únicos

## Banco de Dados

O projeto utiliza **SQLite** como banco de dados, com o arquivo localizado em `database/dbfinance.sqlite`. O banco é gerenciado através do TypeORM com sistema de migrações.

### Estrutura do Banco

- **Tabela clientes**: Armazena informações dos clientes com campos para id, nome, saldo, api_key e timestamps

## Documentação

A documentação completa da API e dos testes está disponível na pasta `documentacaoAPI/`:

- **api-endpoints.md** - Documentação detalhada de todas as rotas da API, incluindo exemplos de requisições e respostas
- **testes-unitarios.md** - Documentação dos testes automatizados implementados

## Estrutura do Projeto

```
src/
├── controllers/        # Controllers da aplicação (padrão RESTful)
├── entities/          # Entidades do banco de dados (Models)
├── services/          # Lógica de negócio
├── routes/            # Definição das rotas da API
├── middlewares/       # Middlewares de autenticação e validação
├── database/          # Configurações e migrações do banco
├── test/              # Testes automatizados
└── types/             # Definições de tipos TypeScript
```

## Arquitetura

O projeto segue os princípios da arquitetura RESTful com separação clara de responsabilidades:

- **Models (Entities)**: Representam as entidades do banco de dados usando decorators do TypeORM
- **Controllers**: Gerenciam as requisições HTTP e coordenam as operações
- **Services**: Contêm a lógica de negócio e regras da aplicação
- **Routes**: Definem os endpoints da API seguindo padrões REST
- **Middlewares**: Implementam autenticação e validações

## Testes Automatizados

O projeto possui testes automatizados utilizando Jest, cobrindo:

- Testes unitários dos services
- Cobertura de código automatizada


## Como Iniciar o Projeto

### Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn
- Docker (opcional)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/KaiokkFernandes/financial-transaction-service.git
cd financial-transaction-service
```

2. Instale as dependências:
```bash
npm install
```

3. Execute as migrações do banco de dados:
```bash
npm run migration:run
```

### Executando em Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Executando com Docker

1. Construa e execute o container:
```bash
docker-compose up --build
```

2. A aplicação estará disponível em `http://localhost:3000`

### Scripts Disponíveis

- `npm run build` - Compila o projeto TypeScript
- `npm start` - Inicia a aplicação em produção
- `npm run dev` - Inicia em modo de desenvolvimento com hot reload
- `npm test` - Executa os testes
- `npm run test:watch` - Executa os testes em modo watch
- `npm run test:coverage` - Executa os testes com relatório de cobertura
- `npm run migration:generate` - Gera nova migração
- `npm run migration:run` - Executa as migrações pendentes

## Estrutura da API

A API segue o padrão RESTful com os seguintes endpoints principais:

- `GET /` - Status da API
- `POST /clientes` - Criação de novos clientes
- `GET /clientes` - Listagem de clientes
- `GET /clientes/:id` - Busca cliente por ID
- `POST /clientes/:id/deposito` - Realizar depósito
- `POST /clientes/:id/saque` - Realizar saque

## Autenticação

A API utiliza autenticação via API Key, gerada automaticamente para cada cliente criado. A chave deve ser enviada no header `Authorization` no formato Bearer Token.

Espero que gostem!😊😊