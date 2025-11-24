# Relatório de Experimentos - Trabalho 2: Tolerância a Falhas

**Projeto:** Financial Transaction Service  
**Data:** [PREENCHER]  
**Responsável:** [PREENCHER]  

---

## 1. Resumo Executivo

Este documento apresenta os resultados dos experimentos realizados para avaliar a tolerância a falhas da arquitetura com replicação implementada no Trabalho 2.

### Principais Resultados

- [ ] Sistema mantém **disponibilidade de X%** com falha de 1 réplica da API
- [ ] Degradação controlada de **Y%** de performance com falha de 2 réplicas
- [ ] Tempo médio de detecção de falhas: **Z segundos**
- [ ] Tempo médio de recuperação: **W segundos**

---

## 2. Configuração do Ambiente

### Especificações do Hardware

```
Processador: [PREENCHER]
RAM: [PREENCHER]
Sistema Operacional: [PREENCHER]
Docker Version: [PREENCHER]
```

### Arquitetura Testada

```
- Nginx Load Balancer: 1 instância
- API Replicas: 3 instâncias
- PostgreSQL Master: 1 instância
- PostgreSQL Replica: 1 instância
```

### Versões dos Componentes

| Componente | Versão |
|------------|--------|
| Node.js | 18-alpine |
| PostgreSQL | 15-alpine |
| Nginx | alpine |
| K6 | latest |

---

## 3. Experimento 1: Baseline (Sistema Normal)

### Objetivo
Estabelecer métricas de referência do sistema operando sem falhas.

### Configuração
- Duração: 120 segundos
- VUs (Virtual Users): 50
- Cenário: 50% leituras, 30% depósitos, 20% saques

### Resultados

#### Latência

| Métrica | Valor | Unidade |
|---------|-------|---------|
| P50 (Mediana) | [PREENCHER] | ms |
| P90 | [PREENCHER] | ms |
| P95 | [PREENCHER] | ms |
| P99 | [PREENCHER] | ms |
| Média | [PREENCHER] | ms |

#### Throughput

| Métrica | Valor | Unidade |
|---------|-------|---------|
| Requisições Totais | [PREENCHER] | req |
| Requisições/segundo | [PREENCHER] | req/s |
| Dados Transferidos | [PREENCHER] | MB |

#### Taxa de Erro

| Métrica | Valor | Unidade |
|---------|-------|---------|
| Requisições com Sucesso | [PREENCHER] | % |
| Requisições com Erro | [PREENCHER] | % |
| Timeouts | [PREENCHER] | count |

#### Uso de Recursos

| Container | CPU (%) | RAM (MB) |
|-----------|---------|----------|
| api1 | [PREENCHER] | [PREENCHER] |
| api2 | [PREENCHER] | [PREENCHER] |
| api3 | [PREENCHER] | [PREENCHER] |
| nginx | [PREENCHER] | [PREENCHER] |
| postgres-master | [PREENCHER] | [PREENCHER] |
| postgres-replica | [PREENCHER] | [PREENCHER] |

### Análise

[DESCREVER COMPORTAMENTO OBSERVADO]

---

## 4. Experimento 2: Falha de 1 Réplica da API

### Objetivo
Avaliar o impacto da falha de uma réplica da API na disponibilidade e performance.

### Procedimento
1. Sistema operando com 3 réplicas
2. Aos 30s: `docker stop financial-api-1`
3. Sistema opera com 2 réplicas por 40s
4. Aos 70s: `docker start financial-api-1`
5. Recuperação e estabilização por 30s

### Resultados

#### Comparação de Latência

| Fase | P50 (ms) | P95 (ms) | P99 (ms) | Variação P95 |
|------|----------|----------|----------|--------------|
| Normal (3 réplicas) | [PREENCHER] | [PREENCHER] | [PREENCHER] | baseline |
| Falha (2 réplicas) | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER]% |
| Recuperação | [PREENCHER] | [PREENCHER] | [PREENCHER] | [PREENCHER]% |

#### Disponibilidade

| Métrica | Valor |
|---------|-------|
| Tempo Total do Teste | [PREENCHER] segundos |
| Tempo de Downtime | [PREENCHER] segundos |
| Disponibilidade | [PREENCHER]% |
| Requisições Perdidas | [PREENCHER] |

#### Tempos de Reação

| Evento | Tempo |
|--------|-------|
| Detecção da Falha (Nginx) | [PREENCHER] segundos |
| Primeira Requisição Afetada | [PREENCHER] segundos |
| Estabilização Completa | [PREENCHER] segundos |

### Observações

**Logs do Nginx durante falha:**
```
[COLAR LOGS RELEVANTES]
```

**Comportamento observado:**
- [ ] Nginx detectou falha automaticamente
- [ ] Requisições redirecionadas para api2 e api3
- [ ] Nenhuma requisição falhou
- [ ] Aumento de latência: [PREENCHER]%

### Análise

[DESCREVER IMPACTO E COMPORTAMENTO]

---

## 5. Experimento 3: Falha de 2 Réplicas da API

### Objetivo
Avaliar sistema sob estresse extremo com apenas 1 réplica ativa.

### Procedimento
1. Aos 30s: `docker stop financial-api-1`
2. Aos 40s: `docker stop financial-api-2`
3. Sistema com 1 réplica por 30s
4. Recuperação gradual

### Resultados

#### Comparação de Performance

| Fase | Throughput (req/s) | P95 Latency (ms) | Taxa de Erro (%) |
|------|-------------------|------------------|------------------|
| 3 réplicas | [PREENCHER] | [PREENCHER] | [PREENCHER] |
| 2 réplicas | [PREENCHER] | [PREENCHER] | [PREENCHER] |
| 1 réplica | [PREENCHER] | [PREENCHER] | [PREENCHER] |

#### Degradação de Capacidade

| Métrica | Valor |
|---------|-------|
| Capacidade com 3 réplicas | 100% (baseline) |
| Capacidade com 2 réplicas | [PREENCHER]% |
| Capacidade com 1 réplica | [PREENCHER]% |

### Observações

**Comportamento do sistema:**
- [ ] Sistema permaneceu responsivo
- [ ] Latência aumentou significativamente
- [ ] Taxa de erro: [PREENCHER]%
- [ ] Recuperação automática funcionou

### Análise

[DESCREVER COMPORTAMENTO EM CONDIÇÃO EXTREMA]

---

## 6. Experimento 4: Falha do Banco Master

### Objetivo
Avaliar impacto de falha crítica do banco de dados principal.

### Procedimento
1. Operação normal por 30s
2. Aos 30s: `docker stop financial-db-master`
3. Sistema sem banco por 30s
4. Aos 60s: `docker start financial-db-master`
5. Aguardar reconexão

### Resultados

#### Impacto da Falha

| Métrica | Valor |
|---------|-------|
| Downtime Total | [PREENCHER] segundos |
| Tempo de Detecção | [PREENCHER] segundos |
| Tempo de Recuperação | [PREENCHER] segundos |
| Requisições Falhadas | [PREENCHER] |
| Taxa de Erro durante Falha | [PREENCHER]% |

#### Timeline da Falha

| Timestamp | Evento |
|-----------|--------|
| T+30s | Master parado |
| T+[X]s | Primeira falha detectada |
| T+60s | Master reiniciado |
| T+[Y]s | Primeira conexão restabelecida |
| T+[Z]s | Sistema totalmente recuperado |

### Observações

**Logs durante falha:**
```
[COLAR ERROS DE CONEXÃO COM BANCO]
```

**Comportamento da Replica:**
- [ ] Replica continuou rodando
- [ ] Replica NÃO foi promovida a master (esperado)
- [ ] Necessidade de failover automático identificada

### Análise

[DESCREVER LIMITAÇÕES E PROPOSTAS DE MELHORIA]

---

## 7. Experimento 5: Teste de Caos (Múltiplas Falhas)

### Objetivo
Simular cenário de múltiplas falhas simultâneas.

### Procedimento
- Sequência orquestrada de falhas em componentes diferentes
- Avaliar resiliência do sistema como um todo

### Resultados

#### Sequência de Eventos

| Tempo | Ação | Impacto Observado |
|-------|------|-------------------|
| 0s | Sistema normal | Baseline |
| 20s | Stop API 1 | [PREENCHER] |
| 30s | Stop API 2 | [PREENCHER] |
| 40s | Stop Replica DB | [PREENCHER] |
| 50s | Start API 1 | [PREENCHER] |
| 60s | Start API 2 | [PREENCHER] |

#### Métricas Agregadas

| Métrica | Valor |
|---------|-------|
| Disponibilidade Geral | [PREENCHER]% |
| Pior Latência P99 | [PREENCHER] ms |
| Taxa de Erro Máxima | [PREENCHER]% |

### Análise

[DESCREVER COMPORTAMENTO EM CENÁRIO CAÓTICO]

---

## 8. Comparação Entre Experimentos

### Tabela Resumo

| Experimento | Disponibilidade | P95 Latency | Taxa de Erro | Observações |
|-------------|-----------------|-------------|--------------|-------------|
| Baseline | [PREENCHER]% | [PREENCHER] ms | [PREENCHER]% | Sistema ideal |
| 1 API down | [PREENCHER]% | [PREENCHER] ms | [PREENCHER]% | Impacto mínimo |
| 2 APIs down | [PREENCHER]% | [PREENCHER] ms | [PREENCHER]% | Degradação aceitável |
| Master down | [PREENCHER]% | ∞ | [PREENCHER]% | Downtime crítico |
| Teste de Caos | [PREENCHER]% | [PREENCHER] ms | [PREENCHER]% | Resiliência parcial |

### Gráfico: Latência ao Longo do Tempo

```
[INSERIR GRÁFICO OU DESCREVER COMPORTAMENTO]
```

### Gráfico: Throughput vs Número de Réplicas

```
[INSERIR GRÁFICO OU DESCREVER RELAÇÃO]
```

---

## 9. Análise Crítica

### Pontos Fortes da Arquitetura

1. **Tolerância a falhas da API:**
   - [DESCREVER]

2. **Load Balancing efetivo:**
   - [DESCREVER]

3. **Recuperação automática:**
   - [DESCREVER]

### Limitações Identificadas

1. **Ausência de auto-failover do banco:**
   - Impacto: [DESCREVER]
   - Solução proposta: Implementar Patroni

2. **Possível saturação com 1 réplica:**
   - Impacto: [DESCREVER]
   - Solução proposta: Aumentar número de réplicas ou implementar circuit breaker

3. **Lag de replicação assíncrona:**
   - Impacto: [DESCREVER]
   - Solução proposta: Considerar replicação síncrona para casos críticos

### Recomendações

1. [PREENCHER]
2. [PREENCHER]
3. [PREENCHER]

---

## 10. Conclusões

### Objetivos Alcançados

- [x] Implementação de arquitetura com replicação
- [x] Testes de falha de componentes individuais
- [x] Avaliação de impacto em métricas de performance
- [x] Documentação completa da solução

### Métricas Finais

| Objetivo | Meta | Resultado | Status |
|----------|------|-----------|--------|
| Disponibilidade com 1 falha | > 99% | [PREENCHER]% | ✅/❌ |
| Latência P95 < 500ms | < 500ms | [PREENCHER] ms | ✅/❌ |
| Taxa de erro < 5% | < 5% | [PREENCHER]% | ✅/❌ |
| Tempo de detecção | < 10s | [PREENCHER] s | ✅/❌ |

### Aprendizados

1. [DESCREVER PRINCIPAIS INSIGHTS]
2. [DESCREVER DESAFIOS ENFRENTADOS]
3. [DESCREVER TRADE-OFFS IDENTIFICADOS]

### Trabalhos Futuros

1. Implementar auto-failover do PostgreSQL
2. Adicionar cache distribuído (Redis)
3. Implementar circuit breaker pattern
4. Expandir monitoramento com Prometheus/Grafana

---

## 11. Anexos

### A. Configurações Utilizadas

- [Link para nginx.conf](./nginx.conf)
- [Link para docker-compose-replication.yml](./docker-compose-replication.yml)
- [Link para postgresql configs](./database/)

### B. Scripts de Teste

- [teste-falha-replica-api.js](./k6/teste-falha-replica-api.js)
- [teste-falha-banco.js](./k6/teste-falha-banco.js)
- [teste-multiplas-falhas.js](./k6/teste-multiplas-falhas.js)

### C. Logs Completos

```
[OPCIONAL: INCLUIR LOGS RELEVANTES]
```

---

**Assinatura:** [NOME]  
**Data:** [DATA]
