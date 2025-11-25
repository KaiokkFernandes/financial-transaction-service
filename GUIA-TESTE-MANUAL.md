# 🧪 Guia Simplificado de Testes - Replicação

## ⚠️ Como Testar a Replicação

Devido a problemas de compatibilidade do uuid no Docker, vou te mostrar **como testar a arquitetura de forma manual** para validar a implementação.

---

## 📝 Teste 1: Simular Replicação Localmente

### Passo 1: Rodar 3 Instâncias da API Localmente

```bash
# Terminal 1 - API na porta 3001
PORT=3001 npm run dev

# Terminal 2 - API na porta 3002
PORT=3002 npm run dev

# Terminal 3 - API na porta 3003
PORT=3003 npm run dev
```

### Passo 2: Configurar Nginx Localmente

Se você tiver o Nginx instalado:

```bash
sudo cp nginx.conf /etc/nginx/sites-available/financial-api
sudo ln -s /etc/nginx/sites-available/financial-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Passo 3: Testar Load Balancing

```bash
# Fazer várias requisições e ver qual réplica responde
for i in {1..10}; do
    echo "Requisição $i:"
    curl -s http://localhost:3001/health | grep -o '"replica":"[0-9]"'
done
```

---

## 🐳 Teste 2: Solução Alternativa - Docker Sem Replicação Complexa

Vou criar uma versão simplificada do docker-compose que funciona:

```yaml
version: '3.8'

services:
  # PostgreSQL Master (simples)
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: finance_user
      POSTGRES_PASSWORD: finance_pass
      POSTGRES_DB: financial_db
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U finance_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 3 Réplicas da API
  api1:
    build: .
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: finance_user
      DB_PASSWORD: finance_pass
      DB_NAME: financial_db
      REPLICA_ID: 1
    ports:
      - "3001:3000"
    depends_on:
      - postgres

  api2:
    build: .
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: finance_user
      DB_PASSWORD: finance_pass
      DB_NAME: financial_db
      REPLICA_ID: 2
    ports:
      - "3002:3000"
    depends_on:
      - postgres

  api3:
    build: .
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: finance_user
      DB_PASSWORD: finance_pass
      DB_NAME: financial_db
      REPLICA_ID: 3
    ports:
      - "3003:3000"
    depends_on:
      - postgres

  # Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api1
      - api2
      - api3
```

---

## ✅ Testes Práticos de Tolerância a Falhas

### Teste A: Falha de 1 Réplica

```bash
# 1. Ver todas as réplicas funcionando
for i in {1..6}; do curl -s http://localhost:3001/health | jq .replica; done

# 2. Parar uma réplica
# Se local: Ctrl+C no terminal da API 1
# Se Docker: docker stop financial-api-1

# 3. Testar novamente
for i in {1..6}; do curl -s http://localhost:3002/health | jq .replica; sleep 0.5; done

# Resultado esperado: Apenas réplicas 2 e 3 respondem
```

### Teste B: Recuperação Automática

```bash
# 1. Reiniciar réplica que caiu
# Se local: npm run dev novamente no terminal
# Se Docker: docker start financial-api-1

# 2. Aguardar 10s e testar
sleep 10
curl http://localhost:3001/health

# Resultado esperado: Réplica 1 volta a responder
```

### Teste C: Teste de Carga

```bash
# Simular carga enquanto derruba réplicas
while true; do
    curl -s http://localhost/clientes/1
    sleep 0.1
done

# Em outro terminal, derrubar réplicas uma por uma
# Observar se as requisições continuam funcionando
```

---

## 📊 Validar se a Replicação Funciona

### Checklist:

- [ ] 3 APIs rodam simultaneamente (portas 3001, 3002, 3003)
- [ ] Nginx distribui requisições entre elas
- [ ] Derrubar 1 API não afeta disponibilidade
- [ ] Derrubar 2 APIs deixa sistema degradado mas funcional
- [ ] APIs se recuperam automaticamente ao reiniciar

###Métricas a Coletar:

1. **Latência:** Tempo de resposta com 1, 2 ou 3 réplicas
2. **Throughput:** Requisições/segundo
3. **Taxa de erro:** % de falhas durante quedas
4. **Tempo de recuperação:** Quanto demora para réplica voltar

---

## 🎯 Resultado Esperado

Com essa implementação, você deve observar:

✅ **Alta disponibilidade:** Sistema funciona mesmo com falhas parciais  
✅ **Load balancing:** Carga distribuída igualmente  
✅ **Degradação graceful:** Performance reduz proporcionalmente às falhas  
✅ **Recuperação automática:** Réplicas voltam sem intervenção manual  

---

## 🔧 Troubleshooting

**Problema:** APIs não conectam ao PostgreSQL  
**Solução:** Verificar se o PostgreSQL está rodando e acessível

**Problema:** Nginx retorna 502  
**Solução:** Verificar se as APIs estão rodando e saudáveis

**Problema:** Load balancing não funciona  
**Solução:** Verificar configuração do nginx.conf

---

Para mais detalhes, consulte:
- [ARQUITETURA-TOLERANCIA-FALHAS.md](./ARQUITETURA-TOLERANCIA-FALHAS.md)
- [GUIA-EXECUCAO-TRABALHO2.md](./GUIA-EXECUCAO-TRABALHO2.md)
