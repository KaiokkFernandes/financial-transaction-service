# Guia de Execução - Trabalho 2: Tolerância a Falhas

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Instalação e Configuração](#instalação-e-configuração)
3. [Iniciando o Sistema](#iniciando-o-sistema)
4. [Executando os Experimentos](#executando-os-experimentos)
5. [Análise de Resultados](#análise-de-resultados)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

```bash
# Docker e Docker Compose instalados
docker --version
docker-compose --version

# K6 (via Docker - não precisa instalar localmente)
# Grafana e InfluxDB (opcional, para visualização avançada)
```

---

## 📦 Instalação e Configuração

### Passo 1: Instalar Dependências do Node.js

```bash
# Instalar dependência do PostgreSQL
npm install pg

# Ou instalar todas as dependências
npm install
```

### Passo 2: Verificar Arquivos de Configuração

Certifique-se de que os seguintes arquivos foram criados:

- ✅ `docker-compose-replication.yml` - Orquestração dos serviços
- ✅ `nginx.conf` - Configuração do load balancer
- ✅ `database/postgresql-master.conf` - Config do banco master
- ✅ `database/postgresql-replica.conf` - Config do banco replica
- ✅ `database/pg_hba.conf` - Autenticação do PostgreSQL
- ✅ `database/init-master.sh` - Script de inicialização do master
- ✅ `database/init-replica.sh` - Script de inicialização da replica

---

## 🚀 Iniciando o Sistema

### Opção 1: Iniciar Todos os Serviços

```bash
# Construir e iniciar toda a arquitetura
docker-compose -f docker-compose-replication.yml up --build -d

# Verificar status dos containers
docker-compose -f docker-compose-replication.yml ps
```

Você deverá ver:
- ✅ `financial-db-master` (PostgreSQL Master)
- ✅ `financial-db-replica` (PostgreSQL Replica)
- ✅ `financial-api-1` (API Replica 1)
- ✅ `financial-api-2` (API Replica 2)
- ✅ `financial-api-3` (API Replica 3)
- ✅ `financial-nginx-lb` (Load Balancer)

### Opção 2: Iniciar Serviços Gradualmente

```bash
# 1. Banco de dados primeiro
docker-compose -f docker-compose-replication.yml up -d postgres-master postgres-replica

# 2. Aguardar bancos ficarem saudáveis (20-30s)
docker logs financial-db-master
docker logs financial-db-replica

# 3. Iniciar APIs
docker-compose -f docker-compose-replication.yml up -d api1 api2 api3

# 4. Iniciar Load Balancer
docker-compose -f docker-compose-replication.yml up -d nginx
```

### Verificar Health Checks

```bash
# Health check geral (via Nginx)
curl http://localhost/health

# Health check de cada réplica
curl http://localhost:3001/health  # API 1
curl http://localhost:3002/health  # API 2
curl http://localhost:3003/health  # API 3
```

### Executar Migrations

```bash
# Entrar em uma das réplicas da API
docker exec -it financial-api-1 sh

# Dentro do container
npm run migration:run

# Sair do container
exit
```

### Popular o Banco de Dados

```bash
# Dentro do container da API
docker exec -it financial-api-1 sh
npm run populate:20k
exit
```

---

## 🧪 Executando os Experimentos

### Experimento 1: Baseline (Sem Falhas)

```bash
# Executar cenários A, B, C originais para estabelecer baseline
docker run --rm -i --network host \
  grafana/k6 run - <k6/cenario-a-50-50.js

docker run --rm -i --network host \
  grafana/k6 run - <k6/cenario-b-75-25.js

docker run --rm -i --network host \
  grafana/k6 run - <k6/cenario-c-25-75.js
```

**Métricas a coletar:**
- P50, P95, P99 de latência
- Throughput (req/s)
- Taxa de erro
- Uso de CPU/memória

---

### Experimento 2: Falha de 1 Réplica da API

```bash
# Terminal 1: Iniciar teste
./scripts/run-teste-falha-api.sh
```

```bash
# Terminal 2: Simular falha (após 30s do início)
docker stop financial-api-1

# Aguardar 20s observando as métricas

# Recuperar réplica
docker start financial-api-1
```

**O que observar:**
- ✅ Nginx detecta falha automaticamente (health check)
- ✅ Requisições redistribuídas para api2 e api3
- ✅ Nenhuma requisição falha
- ⚠️ Pequeno aumento na latência (~10-20%)

---

### Experimento 3: Falha de 2 Réplicas da API

```bash
# Terminal 1: Iniciar teste
docker run --rm -i --network host \
  -e BASE_URL=http://localhost \
  grafana/k6 run - <k6/teste-falha-replica-api.js
```

```bash
# Terminal 2: Simular múltiplas falhas
# Aos 30s
docker stop financial-api-1

# Aos 40s
docker stop financial-api-2

# Apenas api3 ativa agora - sistema degradado mas funcional

# Aos 60s - recuperar
docker start financial-api-1
docker start financial-api-2
```

**O que observar:**
- ⚠️ Latência aumenta significativamente (66% de capacidade perdida)
- ✅ Sistema continua respondendo (1 réplica ativa)
- ⚠️ Possível saturação da réplica restante sob alta carga

---

### Experimento 4: Falha do Banco Master

```bash
# Terminal 1: Iniciar teste
./scripts/run-teste-falha-banco.sh
```

```bash
# Terminal 2: Simular falha do master (após 30s)
docker stop financial-db-master

# Observar falhas nos logs
docker logs financial-api-1 --tail 20 -f

# ⚠️ TODAS as operações falharão!
# Requisições retornarão erro de conexão ao banco

# Recuperar após 30s
docker start financial-db-master

# Aguardar reconexão (~10-15s)
```

**O que observar:**
- ❌ Downtime total durante falha do master
- ⏱️ Tempo de detecção: ~5-10s
- ⏱️ Tempo de recuperação: ~10-15s (reconexão automática)
- ⚠️ Réplica não é promovida automaticamente (limitação)

**Nota:** Para auto-failover, seria necessário implementar Patroni ou pgpool.

---

### Experimento 5: Teste de Caos (Múltiplas Falhas)

```bash
# Terminal 1: Iniciar teste
./scripts/run-teste-multiplas-falhas.sh
```

```bash
# Terminal 2: Executar sequência de falhas
# Aos 20s
docker stop financial-api-1

# Aos 30s
docker stop financial-api-2

# Aos 40s
docker stop financial-db-replica  # Banco secundário

# Aos 50s - começar recuperação
docker start financial-api-1

# Aos 60s
docker start financial-api-2

# Aos 70s
docker start financial-db-replica
```

**O que observar:**
- Sistema sobrevive a múltiplas falhas parciais
- Master + 1 API réplica = sistema funcional (degradado)
- Recuperação gradual conforme serviços voltam

---

## 📊 Análise de Resultados

### Métricas a Comparar

| Métrica | Baseline | 1 Réplica Down | 2 Réplicas Down | Master Down |
|---------|----------|----------------|-----------------|-------------|
| **Latência P95** | X ms | X+10% ms | X+50% ms | ∞ (erro) |
| **Throughput** | Y req/s | 0.66Y req/s | 0.33Y req/s | 0 req/s |
| **Taxa de Erro** | 0% | 0% | 0-5% | 100% |
| **Tempo de Detecção** | N/A | 5-10s | 5-10s | 5-10s |
| **Tempo de Recuperação** | N/A | 10-15s | 10-15s | 15-30s |

### Gráficos a Gerar

1. **Latência ao longo do tempo** - mostrar impacto das falhas
2. **Throughput ao longo do tempo** - mostrar degradação
3. **Taxa de erro** - picos durante falhas
4. **Distribuição de carga** - verificar round-robin do Nginx

### Ferramentas de Visualização

#### Opção 1: K6 Cloud (mais simples)

```bash
# Criar conta gratuita em k6.io
# Executar com output para cloud
k6 run --out cloud teste-falha-replica-api.js
```

#### Opção 2: Grafana + InfluxDB (local)

```bash
# Iniciar Grafana e InfluxDB
docker-compose -f docker-compose-k6.yml up -d

# Executar teste com output para InfluxDB
docker run --rm -i --network host \
  grafana/k6 run --out influxdb=http://localhost:8086/k6 \
  - <k6/teste-falha-replica-api.js

# Acessar Grafana
http://localhost:3001
# user: admin, pass: admin
```

---

## 🔍 Comandos de Monitoramento

### Logs em Tempo Real

```bash
# Todos os containers
docker-compose -f docker-compose-replication.yml logs -f

# Apenas APIs
docker-compose -f docker-compose-replication.yml logs -f api1 api2 api3

# Apenas bancos
docker-compose -f docker-compose-replication.yml logs -f postgres-master postgres-replica

# Nginx
docker-compose -f docker-compose-replication.yml logs -f nginx
```

### Status dos Containers

```bash
# Ver health status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Recursos utilizados
docker stats
```

### Verificar Replicação do PostgreSQL

```bash
# Conectar ao master
docker exec -it financial-db-master psql -U finance_user -d financial_db

# Ver status de replicação
SELECT * FROM pg_stat_replication;

# Sair
\q
```

```bash
# Conectar à replica
docker exec -it financial-db-replica psql -U finance_user -d financial_db

# Verificar que está em recovery mode (replica)
SELECT pg_is_in_recovery();
# Deve retornar: t (true)

# Ver lag de replicação
SELECT now() - pg_last_xact_replay_timestamp() AS replication_lag;

# Sair
\q
```

---

## 🛠️ Troubleshooting

### Problema: Containers não iniciam

```bash
# Ver logs detalhados
docker-compose -f docker-compose-replication.yml logs

# Remover tudo e reiniciar
docker-compose -f docker-compose-replication.yml down -v
docker-compose -f docker-compose-replication.yml up --build
```

### Problema: Replicação não funciona

```bash
# Verificar configuração do master
docker exec -it financial-db-master cat /var/lib/postgresql/data/postgresql.conf | grep wal_level

# Ver logs da replica
docker logs financial-db-replica

# Recriar replica
docker-compose -f docker-compose-replication.yml stop postgres-replica
docker volume rm financial-transaction-service_postgres-replica-data
docker-compose -f docker-compose-replication.yml up -d postgres-replica
```

### Problema: Nginx não balanceia carga

```bash
# Verificar configuração
docker exec -it financial-nginx-lb cat /etc/nginx/nginx.conf

# Testar qual réplica responde
for i in {1..10}; do
  curl -s http://localhost/health | jq .replica
done

# Deve mostrar distribuição entre 1, 2 e 3
```

### Problema: Health check falha

```bash
# Verificar endpoint diretamente
curl http://localhost/health

# Ver logs da API
docker logs financial-api-1 --tail 50

# Verificar conexão com banco
docker exec -it financial-api-1 sh
nc -zv postgres-master 5432
exit
```

---

## 📝 Checklist de Validação

Antes de considerar a implementação completa:

- [ ] Todos os 6 containers estão rodando (healthy)
- [ ] Endpoint `/health` responde com status 200
- [ ] Replicação PostgreSQL está ativa (verificar pg_stat_replication)
- [ ] Nginx distribui carga entre as 3 APIs (testar múltiplas requisições)
- [ ] Falha de 1 API não impacta disponibilidade
- [ ] Falha de 2 APIs mantém sistema funcional (degradado)
- [ ] Falha do master causa downtime (esperado sem auto-failover)
- [ ] Recuperação é automática após restart
- [ ] Testes K6 executam sem erros
- [ ] Métricas são coletadas corretamente

---

## 🎯 Próximos Passos

### Melhorias Futuras (fora do escopo do trabalho 2):

1. **Auto-failover do banco:** Implementar Patroni ou pgpool
2. **Monitoramento:** Prometheus + Grafana para métricas em tempo real
3. **Cache:** Redis para reduzir carga no banco
4. **Circuit Breaker:** Implementar padrão de resiliência nas APIs
5. **Backup automático:** Configurar WAL archiving e PITR
6. **TLS/SSL:** Criptografia nas conexões
7. **Rate Limiting:** Proteção contra DDoS no Nginx
8. **Distributed Tracing:** Jaeger ou Zipkin para observabilidade

---

## 📚 Documentação de Referência

- [ARQUITETURA-TOLERANCIA-FALHAS.md](./ARQUITETURA-TOLERANCIA-FALHAS.md) - Análise completa da arquitetura
- [PostgreSQL Streaming Replication](https://www.postgresql.org/docs/current/warm-standby.html)
- [Nginx Load Balancing](https://nginx.org/en/docs/http/load_balancing.html)
- [K6 Documentation](https://k6.io/docs/)

---

## 📧 Suporte

Em caso de dúvidas ou problemas:

1. Consulte a documentação oficial das ferramentas
2. Verifique os logs dos containers
3. Revise a seção de troubleshooting deste guia
4. Consulte os issues do repositório no GitHub
