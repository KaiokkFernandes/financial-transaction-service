# Documentação das rotas da API

## URL Base

```
http://localhost:3000
```

## Autenticação

A maioria dos endpoints requer autenticação via API Key. A chave deve ser enviada no header `Authorization` no formato:

```
Authorization: Bearer {sua_api_key_aqui}
```

### Configuração no Insomnia

1. **Header de Autenticação:**
   - Key: `Authorization`
   - Value: `Bearer 550e8400-e29b-41d4-a716-446655440000`

2. **Exemplo Visual:**
```
Header Name: Authorization
Header Value: Bearer 550e8400-e29b-41d4-a716-446655440000
```

## Endpoints Disponíveis

### Status da API

#### GET /

Verifica se a API está funcionando.

**Autenticação:** Não requerida

**Resposta de Sucesso:**
```json
{
  "message": "Api rodando!"
}
```

### Gerenciamento de Clientes

#### POST /clientes

Cria um novo cliente no sistema.

**Autenticação:** Não requerida

**Parâmetros do Body:**
```json
{
  "nome": "string (obrigatório)"
}
```

**Exemplo no Insomnia:**
```
Método: POST
URL: http://localhost:3000/clientes
Headers: 
  Content-Type: application/json
Body (JSON):
{
  "nome": "João Silva"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva"
  }'
```

**Resposta de Sucesso (201):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "saldo": 0.00,
  "api_key": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-09-16T10:30:00.000Z",
  "updatedAt": "2025-09-16T10:30:00.000Z"
}
```

**Possíveis Erros:**
- `400 Bad Request`: Nome é obrigatório
- `500 Internal Server Error`: Erro interno do servidor

#### GET /clientes

Lista todos os clientes cadastrados no sistema.

**Autenticação:** Não requerida

**Exemplo no Insomnia:**
```
Método: GET
URL: http://localhost:3000/clientes
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/clientes
```

**Resposta de Sucesso (200):**
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "saldo": 150.75,
    "api_key": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-09-16T10:30:00.000Z",
    "updatedAt": "2025-09-16T11:15:00.000Z"
  },
  {
    "id": 2,
    "nome": "Maria Santos",
    "saldo": 300.50,
    "api_key": "660f9511-f39c-52e5-b827-557766551111",
    "createdAt": "2025-09-16T10:45:00.000Z",
    "updatedAt": "2025-09-16T10:45:00.000Z"
  }
]
```

**Possíveis Erros:**
- `500 Internal Server Error`: Erro interno do servidor

#### GET /clientes/{id}

Busca um cliente específico por ID.

**Autenticação:** Requerida

**Parâmetros da URL:**
- `id`: ID do cliente (number)

**Exemplo no Insomnia:**
```
Método: GET
URL: http://localhost:3000/clientes/1
Headers:
  Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/clientes/1 \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000"
```

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "saldo": 150.75,
  "api_key": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-09-16T10:30:00.000Z",
  "updatedAt": "2025-09-16T11:15:00.000Z"
}
```

**Possíveis Erros:**
- `401 Unauthorized`: API Key não fornecida ou inválida
- `403 Forbidden`: Acesso negado (usuário só pode consultar seus próprios dados)
- `404 Not Found`: Cliente não encontrado
- `500 Internal Server Error`: Erro interno do servidor

### Operações Financeiras

#### POST /clientes/{id}/deposito

Realiza um depósito na conta do cliente.

**Autenticação:** Requerida

**Regra de Negócio:** O usuário só pode depositar em sua própria conta.

**Parâmetros da URL:**
- `id`: ID do cliente (number)

**Parâmetros do Body:**
```json
{
  "valor": "number (obrigatório, deve ser positivo)"
}
```

**Exemplo no Insomnia:**
```
Método: POST
URL: http://localhost:3000/clientes/1/deposito
Headers:
  Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000
  Content-Type: application/json
Body (JSON):
{
  "valor": 100.50
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/clientes/1/deposito \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 100.50
  }'
```

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "saldo": 251.25,
  "api_key": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-09-16T10:30:00.000Z",
  "updatedAt": "2025-09-16T11:30:00.000Z"
}
```

**Possíveis Erros:**
- `400 Bad Request`: Valor deve ser positivo
- `401 Unauthorized`: Cliente não autenticado
- `403 Forbidden`: Acesso negado (usuário só pode depositar em sua própria conta)
- `404 Not Found`: Cliente não encontrado
- `500 Internal Server Error`: Erro interno do servidor

#### POST /clientes/{id}/transferencia

Realiza uma transferência entre contas.

**Autenticação:** Requerida

**Regra de Negócio:** O usuário só pode iniciar transferências de sua própria conta.

**Parâmetros da URL:**
- `id`: ID do cliente origem (number)

**Parâmetros do Body:**
```json
{
  "destino_id": "number (obrigatório)",
  "valor": "number (obrigatório, deve ser positivo)"
}
```

**Exemplo no Insomnia:**
```
Método: POST
URL: http://localhost:3000/clientes/1/transferencia
Headers:
  Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000
  Content-Type: application/json
Body (JSON):
{
  "destino_id": 2,
  "valor": 50.00
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/clientes/1/transferencia \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{
    "destino_id": 2,
    "valor": 50.00
  }'
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Transferencia realizada com sucesso."
}
```

**Possíveis Erros:**
- `400 Bad Request`: 
  - Valor deve ser positivo
  - Saldo insuficiente
  - Origem e destino não podem ser a mesma conta
- `401 Unauthorized`: Cliente não autenticado
- `403 Forbidden`: Acesso negado (usuário só pode transferir de sua própria conta)
- `404 Not Found`: Cliente de origem ou destino não encontrado
- `500 Internal Server Error`: Erro interno do servidor

## Códigos de Status HTTP

### Códigos de Sucesso

- `200 OK`: Requisição processada com sucesso
- `201 Created`: Recurso criado com sucesso

### Códigos de Erro

- `400 Bad Request`: Dados da requisição inválidos
- `401 Unauthorized`: Autenticação necessária ou inválida
- `403 Forbidden`: Acesso negado por regras de negócio
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

## Formato de Resposta de Erro

Todas as respostas de erro seguem o formato:

```json
{
  "message": "Descrição do erro"
}
```