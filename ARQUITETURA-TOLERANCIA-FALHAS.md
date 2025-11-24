# Arquitetura de Tolerância a Falhas - Trabalho 2

## 1. Análise da Arquitetura Atual

### a) O que acontece se um dos servidores web ou do banco de dados falhar?

#### **Situação Atual (Trabalho 1):**

A arquitetura atual possui **PONTO ÚNICO DE FALHA (SPOF - Single Point of Failure)**:

- **1 instância da API** rodando na porta 3000
- **1 banco de dados SQLite** (arquivo local `database/dbfinance.sqlite`)

#### **Impactos de Falhas:**

**Se o servidor web falhar:**
- ❌ A API fica completamente indisponível
- ❌ Todas as requisições retornam erro de conexão
- ❌ Perda de disponibilidade: 100%
- ❌ Tempo de recuperação depende de restart manual

**Se o banco de dados falhar:**
- ❌ Todas as operações de leitura/escrita falham
- ❌ API continua rodando mas sem funcionalidade
- ❌ Potencial perda de dados se o arquivo SQLite corromper
- ❌ SQLite não suporta replicação nativa

**Conclusão:** A arquitetura atual **NÃO** possui tolerância a falhas. Qualquer falha resulta em indisponibilidade total do serviço.

---

## 2. Proposta de Solução com Replicação

### b) Quantas réplicas serão usadas? Como atualizar as réplicas? Qual o protocolo?

#### **Número de Réplicas:**

**Servidores Web (API):**
- **3 réplicas** da aplicação Node.js/Express
- Motivo: Tolerância a falha de até 2 instâncias mantendo 1 ativa
- Balanceamento de carga entre as réplicas usando **Nginx** (round-robin)

**Banco de Dados:**
- **1 Master (Primary)** + **1 Replica (Standby)**
- Migração de SQLite para **PostgreSQL** (suporta replicação)
- Motivo: PostgreSQL oferece streaming replication nativo

#### **Protocolo de Atualização das Réplicas:**

**Para a API (Stateless):**
- Não há necessidade de sincronização de estado entre réplicas
- Cada réplica é independente e conecta-se ao banco de dados
- Load balancer distribui requisições automaticamente

**Para o Banco de Dados:**
```
┌──────────────────────────────────────────────────┐
│         POSTGRESQL STREAMING REPLICATION          │
└──────────────────────────────────────────────────┘

1. MASTER (Primary Database)
   ↓
   ├─ Recebe todas as operações de ESCRITA
   ├─ Registra mudanças no WAL (Write-Ahead Log)
   └─ Transmite WAL via streaming para réplica

2. REPLICA (Standby Database)
   ↓
   ├─ Recebe WAL do master continuamente
   ├─ Aplica mudanças em modo assíncrono
   └─ Disponível para operações de LEITURA

Protocolo: STREAMING REPLICATION (Assíncrono)
```

**Características:**
- ✅ **Replicação Assíncrona:** Master não espera confirmação da réplica
- ✅ **Baixa latência:** Escritas rápidas no master
- ⚠️ **Eventual consistency:** Pequeno atraso (ms) entre master e réplica
- ✅ **Hot Standby:** Réplica pode servir queries de leitura

**Estratégia de Roteamento:**
```
┌─────────────────────────────────────────┐
│  OPERAÇÕES DE ESCRITA → MASTER          │
│  (POST /deposito, POST /saque, etc.)    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  OPERAÇÕES DE LEITURA → MASTER ou       │
│  REPLICA (GET /clientes, GET /clientes/:id) │
└─────────────────────────────────────────┘
```

#### **Impacto na Solução:**

**Positivo:**
- ✅ Alta disponibilidade: Serviço continua funcionando com falhas parciais
- ✅ Escalabilidade horizontal: Mais réplicas = mais throughput
- ✅ Distribuição de carga de leitura entre master e replica
- ✅ Recuperação automática de falhas (health checks + restart)

**Desafios:**
- ⚠️ Complexidade aumentada na infraestrutura
- ⚠️ Necessidade de monitoramento robusto
- ⚠️ Possível inconsistência temporária em leituras na réplica
- ⚠️ Migração de SQLite para PostgreSQL requer ajustes

---

### c) Os servidores são stateful ou stateless? Como isso impacta na solução?

#### **Análise:**

**API (Servidores Web):**
```
┌─────────────────────────────────────────┐
│         STATELESS                       │
└─────────────────────────────────────────┘

- Não armazena estado de sessão
- Autenticação via API Key (Bearer Token)
- Cada requisição é independente
- Estado persiste apenas no banco de dados
```

**Impacto positivo do design stateless:**
- ✅ Fácil de replicar: todas as réplicas são idênticas
- ✅ Load balancer pode rotear qualquer requisição para qualquer réplica
- ✅ Sem necessidade de sticky sessions
- ✅ Escalabilidade linear: adicionar réplicas = aumentar capacidade
- ✅ Falha de uma réplica não afeta requisições futuras

**Banco de Dados:**
```
┌─────────────────────────────────────────┐
│         STATEFUL                        │
└─────────────────────────────────────────┘

- Armazena todo o estado persistente
- Master e Replica mantêm sincronização
- Failover requer promoção de replica
```

**Impacto do design stateful no banco:**
- ⚠️ Replicação necessária para tolerância a falhas
- ⚠️ Failover mais complexo (promoção de replica a master)
- ⚠️ Possível perda de dados em falha catastrófica
- ✅ Separação clara de responsabilidades

---

## 3. Arquitetura Proposta

```
                           INTERNET
                              │
                              ▼
                    ┌──────────────────┐
                    │  NGINX (LB)      │
                    │  Port: 80        │
                    │  Algorithm:      │
                    │  Round Robin     │
                    └──────────────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │ API      │  │ API      │  │ API      │
         │ Replica 1│  │ Replica 2│  │ Replica 3│
         │ :3001    │  │ :3002    │  │ :3003    │
         └──────────┘  └──────────┘  └──────────┘
                 │            │            │
                 └────────────┼────────────┘
                              ▼
                    ┌──────────────────┐
                    │ PostgreSQL       │
                    │ MASTER           │
                    │ Port: 5432       │
                    └──────────────────┘
                              │
                              │ Streaming
                              │ Replication
                              ▼
                    ┌──────────────────┐
                    │ PostgreSQL       │
                    │ REPLICA          │
                    │ Port: 5433       │
                    └──────────────────┘
```

### Componentes:

1. **Nginx Load Balancer**
   - Distribui requisições entre as 3 réplicas da API
   - Health checks a cada 5 segundos
   - Remove réplicas não saudáveis do pool

2. **3 Réplicas da API**
   - Stateless, podem ser escaladas horizontalmente
   - Todas conectam ao PostgreSQL Master para escritas
   - Podem ler do Master ou Replica

3. **PostgreSQL Master**
   - Recebe todas as escritas
   - Streaming replication para replica
   - WAL archiving para backup

4. **PostgreSQL Replica**
   - Hot standby para leitura
   - Sincronização assíncrona
   - Pode ser promovida a master em caso de falha

---

## 4. Cenários de Falha e Comportamento

### Cenário 1: Falha de 1 Réplica da API

```
Estado Inicial: 3 réplicas ativas
Falha: API Replica 2 crash
Comportamento:
├─ Nginx detecta falha via health check (5s)
├─ Remove replica 2 do pool de balanceamento
├─ Requisições redistribuídas para replicas 1 e 3
└─ Disponibilidade: 100% (sem interrupção)

Impacto: 33% de redução de capacidade
Recovery: Restart automático da replica 2
```

### Cenário 2: Falha de 2 Réplicas da API

```
Estado: Apenas 1 réplica ativa
Comportamento:
├─ Nginx roteia todo tráfego para replica ativa
├─ Maior latência sob carga alta
└─ Disponibilidade: 100% (com degradação)

Impacto: 66% de redução de capacidade
Recovery: Restart automático das réplicas
```

### Cenário 3: Falha do PostgreSQL Master

```
Falha Crítica: Master database crash
Comportamento MANUAL (sem auto-failover):
├─ Aplicação retorna erros de conexão
├─ Necessário promover replica manualmente
└─ Downtime: ~30-60 segundos

Comportamento AUTOMÁTICO (com ferramenta como Patroni):
├─ Detecção automática da falha
├─ Promoção automática da replica a master
├─ Atualização das APIs para novo master
└─ Downtime: ~5-10 segundos

Perda de dados: Transações não replicadas (< 1s)
```

### Cenário 4: Falha da PostgreSQL Replica

```
Falha: Replica database crash
Comportamento:
├─ Master continua operando normalmente
├─ Escritas não afetadas
├─ Leituras redirecionadas ao master
└─ Disponibilidade: 100%

Impacto: Aumento de carga no master
Recovery: Restart e resync da replica
```

---

## 5. Plano de Implementação

### Fase 1: Infraestrutura

- [x] Criar arquivo nginx.conf para load balancing
- [x] Configurar PostgreSQL master e replica
- [x] Atualizar docker-compose.yml com todos serviços
- [x] Configurar health checks

### Fase 2: Código da Aplicação

- [x] Migrar de SQLite para PostgreSQL
- [x] Atualizar data-source.ts
- [x] Adicionar endpoint /health
- [x] Instalar dependência pg (PostgreSQL driver)
- [x] Atualizar migrations para PostgreSQL

### Fase 3: Testes e Validação

- [x] Criar scripts K6 para teste de falhas
- [x] Simular falha de réplicas da API
- [x] Simular falha do banco master
- [x] Medir impacto em latência e throughput
- [x] Documentar resultados

---

## 6. Métricas de Avaliação

### Experimentos Planejados:

1. **Teste de Baseline (sem falhas)**
   - Executar cenários A, B, C do K6
   - Medir: latência P95, throughput, taxa de erro

2. **Teste com Falha de 1 Réplica API**
   - Derrubar 1 réplica durante teste
   - Medir: tempo de detecção, impacto em latência

3. **Teste com Falha de 2 Réplicas API**
   - Derrubar 2 réplicas durante teste
   - Medir: degradação de performance

4. **Teste com Falha do Master DB**
   - Simular crash do master
   - Medir: downtime, perda de requisições

5. **Teste de Recuperação**
   - Reiniciar réplicas falhadas
   - Medir: tempo de recuperação total

### Métricas Esperadas:

- **Disponibilidade:** > 99.9%
- **Impacto de falha de 1 API:** < 5% aumento latência
- **Tempo de detecção:** < 10s
- **Tempo de recuperação:** < 30s

---

## 7. Referências e Decisões de Design

### Por que PostgreSQL?
- Streaming replication nativo
- Alta performance
- Compatível com TypeORM
- Comunidade ativa

### Por que Nginx?
- Leve e eficiente
- Health checks nativos
- Configuração simples
- Usado em produção globalmente

### Por que 3 Réplicas API?
- Balanceamento ideal entre custo e disponibilidade
- Tolerância a múltiplas falhas
- Escalabilidade futura

### Por que Replicação Assíncrona?
- Melhor performance de escrita
- Adequado para caso de uso financeiro com leituras frequentes
- Trade-off aceitável entre consistência e latência

---

## 8. Limitações e Trabalhos Futuros

### Limitações Atuais:
- Failover do banco não é automático (requer intervenção manual)
- Possível perda de transações não replicadas em falha do master
- Sem monitoramento centralizado (Prometheus/Grafana para métricas)

### Melhorias Futuras:
- Implementar Patroni para auto-failover do PostgreSQL
- Adicionar cache (Redis) para reduzir carga no banco
- Circuit breaker pattern para resiliência
- Distributed tracing (Jaeger/Zipkin)
- Backup automático e disaster recovery
