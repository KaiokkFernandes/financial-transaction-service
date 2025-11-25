# 🛡️ Trabalho 2: Tolerância a Falhas com Replicação

## 📖 Visão Geral

Este trabalho implementa uma arquitetura distribuída com tolerância a falhas para o serviço de transações financeiras, usando replicação de servidores e banco de dados.

## 🎯 Objetivos

1. ✅ **Garantir alta disponibilidade** mesmo com falhas de componentes
2. ✅ **Implementar replicação** de servidores web e banco de dados
3. ✅ **Avaliar impacto de falhas** através de experimentos controlados
4. ✅ **Documentar arquitetura** e decisões de design

## 🏗️ Arquitetura Implementada

```
┌─────────────────────────────────────────────────────┐
│                    NGINX Load Balancer              │
│                    (Round Robin)                    │
└─────────────────────────────────────────────────────┘
           │                │                │
           ▼                ▼                ▼
    ┌──────────┐     ┌──────────┐     ┌──────────┐
    │  API 1   │     │  API 2   │     │  API 3   │
    │  :3001   │     │  :3002   │     │  :3003   │
    └──────────┘     └──────────┘     └──────────┘
           │                │                │
           └────────────────┼────────────────┘
                            ▼
                ┌───────────────────────┐
                │  PostgreSQL MASTER    │
                │        :5432          │
                └───────────────────────┘
                            │
                            │ Streaming Replication
                            ▼
                ┌───────────────────────┐
                │  PostgreSQL REPLICA   │
                │        :5433          │
                └───────────────────────┘
```

## 📊 Respostas às Questões

### a) O que acontece se um dos servidores web ou do banco de dados falhar?

**Arquitetura Atual (Trabalho 1):**
- ❌ Ponto único de falha
- ❌ Indisponibilidade total

**Arquitetura Proposta (Trabalho 2):**
- ✅ **Falha de 1 API:** Sistema continua funcionando (2 réplicas restantes)
- ✅ **Falha de 2 APIs:** Sistema degradado mas funcional (1 réplica)
- ⚠️ **Falha do Master DB:** Downtime até restart (sem auto-failover)
- ✅ **Falha da Replica DB:** Sem impacto na disponibilidade

### b) Quantas réplicas? Como atualizar? Qual protocolo?

**Réplicas:**
- **3 réplicas da API** (stateless)
- **1 Master + 1 Replica** do PostgreSQL

**Protocolo de Replicação:**
- **PostgreSQL Streaming Replication (Assíncrono)**
- WAL (Write-Ahead Log) transmitido continuamente
- Eventual consistency (~milissegundos de atraso)

**Estratégia de Atualização:**
- APIs: Load balancer distribui automaticamente (round-robin)
- Banco: Escritas → Master | Leituras → Master ou Replica

**Impacto:**
- ✅ Alta disponibilidade
- ✅ Escalabilidade horizontal
- ⚠️ Complexidade aumentada
- ⚠️ Possível inconsistência temporária

### c) Servidores stateful ou stateless? Impacto?

**APIs:** **STATELESS**
- ✅ Fácil replicação (réplicas idênticas)
- ✅ Qualquer réplica pode atender qualquer requisição
- ✅ Sem sticky sessions necessárias
- ✅ Escalabilidade linear

**Banco de Dados:** **STATEFUL**
- ⚠️ Replicação mais complexa
- ⚠️ Sincronização necessária
- ⚠️ Failover requer promoção de replica
- ✅ Separação clara de responsabilidades

## 🚀 Quick Start

### 1. Instalar Dependências

```bash
npm install
```

### 2. Iniciar Arquitetura Completa

```bash
docker-compose -f docker-compose-replication.yml up --build -d
```

### 3. Verificar Status

```bash
# Status dos containers
docker-compose -f docker-compose-replication.yml ps

# Health check
curl http://localhost/health
```

### 4. Popular Banco de Dados

```bash
docker exec -it financial-api-1 sh
npm run migration:run
npm run populate:20k
exit
```

### 5. Executar Testes de Falha

```bash
# Teste de falha de réplica da API
./scripts/run-teste-falha-api.sh

# Teste de falha do banco
./scripts/run-teste-falha-banco.sh

# Teste de múltiplas falhas
./scripts/run-teste-multiplas-falhas.sh
```

## 🧪 Experimentos

### Experimento 1: Baseline (Sem Falhas)
Estabelecer métricas de referência.

```bash
docker run --rm -i --network host \
  grafana/k6 run - <k6/cenario-a-50-50.js
```

### Experimento 2: Falha de 1 Réplica API

```bash
# Terminal 1: Iniciar teste
./scripts/run-teste-falha-api.sh

# Terminal 2: Aos 30s
docker stop financial-api-1
# Aos 50s
docker start financial-api-1
```

**Resultado Esperado:**
- ✅ 0% de downtime
- ⚠️ ~10-20% aumento de latência
- ✅ Recuperação automática

### Experimento 3: Falha de 2 Réplicas API

```bash
# Simular falha de 2 réplicas
docker stop financial-api-1
docker stop financial-api-2
# Apenas api3 ativa - sistema degradado
```

**Resultado Esperado:**
- ✅ Sistema funciona com degradação
- ⚠️ ~50% aumento de latência
- ⚠️ Possível saturação sob alta carga

### Experimento 4: Falha do Master DB

```bash
# Terminal 1: Iniciar teste
./scripts/run-teste-falha-banco.sh

# Terminal 2: Aos 30s
docker stop financial-db-master
# Aos 60s
docker start financial-db-master
```

**Resultado Esperado:**
- ❌ Downtime total (~30-45s)
- ⏱️ Detecção: 5-10s
- ⏱️ Recuperação: 10-15s

### Experimento 5: Teste de Caos

```bash
./scripts/run-teste-multiplas-falhas.sh
# Seguir instruções no terminal
```

## 📊 Métricas Avaliadas

| Métrica | Descrição |
|---------|-----------|
| **Disponibilidade** | % de uptime durante falhas |
| **Latência P95** | 95º percentil de tempo de resposta |
| **Throughput** | Requisições/segundo |
| **Taxa de Erro** | % de requisições falhadas |
| **Tempo de Detecção** | Tempo para detectar falha |
| **Tempo de Recuperação** | Tempo para recuperar de falha |

## 📁 Estrutura de Arquivos

```
├── docker-compose-replication.yml  # Orquestração completa
├── nginx.conf                      # Configuração load balancer
├── database/
│   ├── postgresql-master.conf     # Config master DB
│   ├── postgresql-replica.conf    # Config replica DB
│   ├── pg_hba.conf                # Autenticação
│   ├── init-master.sh             # Setup master
│   └── init-replica.sh            # Setup replica
├── k6/
│   ├── teste-falha-replica-api.js # Teste falha API
│   ├── teste-falha-banco.js       # Teste falha DB
│   └── teste-multiplas-falhas.js  # Teste caos
├── scripts/
│   ├── run-teste-falha-api.sh     # Executor teste API
│   ├── run-teste-falha-banco.sh   # Executor teste DB
│   └── run-teste-multiplas-falhas.sh
├── ARQUITETURA-TOLERANCIA-FALHAS.md
├── GUIA-EXECUCAO-TRABALHO2.md
└── TEMPLATE-RELATORIO-EXPERIMENTOS.md
```

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [ARQUITETURA-TOLERANCIA-FALHAS.md](./ARQUITETURA-TOLERANCIA-FALHAS.md) | Análise completa da arquitetura, decisões de design e cenários de falha |
| [GUIA-EXECUCAO-TRABALHO2.md](./GUIA-EXECUCAO-TRABALHO2.md) | Guia passo-a-passo para executar e avaliar a solução |
| [TEMPLATE-RELATORIO-EXPERIMENTOS.md](./TEMPLATE-RELATORIO-EXPERIMENTOS.md) | Template para documentar resultados dos experimentos |

## 🔧 Comandos Úteis

### Monitoramento

```bash
# Logs em tempo real
docker-compose -f docker-compose-replication.yml logs -f

# Status dos containers
docker ps --format "table {{.Names}}\t{{.Status}}"

# Recursos utilizados
docker stats

# Verificar replicação do PostgreSQL
docker exec -it financial-db-master psql -U finance_user -d financial_db -c "SELECT * FROM pg_stat_replication;"
```

### Simulação de Falhas

```bash
# Derrubar réplica específica
docker stop financial-api-1
docker stop financial-api-2
docker stop financial-api-3

# Derrubar banco
docker stop financial-db-master
docker stop financial-db-replica

# Recuperar serviços
docker start financial-api-1
docker start financial-db-master
```

### Limpeza

```bash
# Parar todos os serviços
docker-compose -f docker-compose-replication.yml down

# Remover volumes (CUIDADO: apaga dados)
docker-compose -f docker-compose-replication.yml down -v

# Rebuild completo
docker-compose -f docker-compose-replication.yml up --build --force-recreate
```

## ⚠️ Limitações Conhecidas

1. **Sem auto-failover do banco:** Falha do master requer intervenção manual
2. **Replicação assíncrona:** Possível perda de transações não replicadas
3. **Sem monitoramento centralizado:** Métricas dependem do K6
4. **Sem circuit breaker:** Falhas em cascata possíveis sob alta carga

## 🔮 Melhorias Futuras

- [ ] Implementar Patroni para auto-failover do PostgreSQL
- [ ] Adicionar Redis para cache distribuído
- [ ] Circuit breaker pattern nas APIs
- [ ] Prometheus + Grafana para monitoramento
- [ ] Distributed tracing (Jaeger)
- [ ] Backup automático e disaster recovery

## 🎓 Comparação: Trabalho 1 vs Trabalho 2

| Aspecto | Trabalho 1 | Trabalho 2 |
|---------|------------|------------|
| **APIs** | 1 instância | 3 instâncias + LB |
| **Banco** | SQLite local | PostgreSQL com replica |
| **Disponibilidade** | ~90% (SPOF) | ~99%+ (tolerante) |
| **Escalabilidade** | Vertical | Horizontal |
| **Falha de API** | Downtime total | Sem impacto |
| **Falha de DB** | Downtime total | Downtime parcial |
| **Complexidade** | Baixa | Alta |
| **Custo** | Baixo | Médio |

## 📊 Resultados Esperados

### Disponibilidade por Cenário

| Cenário | Disponibilidade | Performance |
|---------|-----------------|-------------|
| Sistema Normal | 100% | 100% |
| 1 API down | 100% | 90-95% |
| 2 APIs down | 100% | 50-70% |
| Master DB down | 0% (downtime) | N/A |
| Replica DB down | 100% | 95-100% |

### Trade-offs Identificados

**Consistência vs Disponibilidade:**
- Escolha: Disponibilidade (CAP Theorem)
- Replicação assíncrona favorece disponibilidade
- Eventual consistency aceitável (~ms)

**Simplicidade vs Resiliência:**
- Escolha: Resiliência
- Arquitetura mais complexa
- Operação e manutenção mais sofisticadas

## 🤝 Contribuição

Para contribuir com melhorias:

1. Fork o repositório
2. Crie uma branch: `git checkout -b melhoria-tolerancia-falhas`
3. Commit suas mudanças: `git commit -m 'Adiciona XYZ'`
4. Push para a branch: `git push origin melhoria-tolerancia-falhas`
5. Abra um Pull Request

## 📄 Licença

Este projeto é parte de um trabalho acadêmico.

## 👥 Autores

[PREENCHER COM INFORMAÇÕES DA EQUIPE]

## 📧 Contato

[PREENCHER]

---

**Nota:** Este é o Trabalho 2 que estende o Trabalho 1 com capacidades de tolerância a falhas. Para executar o sistema original (sem replicação), use `docker-compose.yml` em vez de `docker-compose-replication.yml`.
