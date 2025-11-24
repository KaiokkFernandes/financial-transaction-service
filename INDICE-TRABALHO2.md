# 📚 Índice Completo - Trabalho 2: Tolerância a Falhas

## 🎯 Documentos Principais

### 1. README Principal
- **[README-TRABALHO2.md](./README-TRABALHO2.md)**
  - Visão geral do projeto
  - Quick start
  - Respostas às questões a, b, c
  - Comparação Trabalho 1 vs 2
  
### 2. Arquitetura e Design
- **[ARQUITETURA-TOLERANCIA-FALHAS.md](./ARQUITETURA-TOLERANCIA-FALHAS.md)**
  - Análise da arquitetura atual
  - Proposta de solução com replicação
  - Cenários de falha detalhados
  - Decisões de design e trade-offs
  - Limitações e trabalhos futuros

### 3. Guia de Execução
- **[GUIA-EXECUCAO-TRABALHO2.md](./GUIA-EXECUCAO-TRABALHO2.md)**
  - Passo a passo completo
  - Como executar cada experimento
  - Comandos de monitoramento
  - Troubleshooting
  - Checklist de validação

### 4. Template de Relatório
- **[TEMPLATE-RELATORIO-EXPERIMENTOS.md](./TEMPLATE-RELATORIO-EXPERIMENTOS.md)**
  - Estrutura para documentar resultados
  - Tabelas para métricas
  - Análise comparativa
  - Conclusões e recomendações

---

## 📁 Arquivos de Configuração

### Docker e Containers

| Arquivo | Descrição |
|---------|-----------|
| `docker-compose-replication.yml` | Orquestração de todos os serviços com replicação |
| `Dockerfile` | Imagem da API com health check |
| `nginx.conf` | Configuração do load balancer |

### Banco de Dados

| Arquivo | Descrição |
|---------|-----------|
| `database/postgresql-master.conf` | Configuração do PostgreSQL master |
| `database/postgresql-replica.conf` | Configuração da réplica |
| `database/pg_hba.conf` | Autenticação e permissões |
| `database/init-master.sh` | Script de inicialização do master |
| `database/init-replica.sh` | Script de setup da replicação |

### Código Fonte

| Arquivo | Descrição |
|---------|-----------|
| `src/data-source.ts` | Configuração do TypeORM para PostgreSQL |
| `src/app.ts` | Aplicação com endpoint /health |
| `src/server.ts` | Servidor principal |

---

## 🧪 Scripts de Teste

### Scripts K6

| Arquivo | Descrição | Como Executar |
|---------|-----------|---------------|
| `k6/teste-falha-replica-api.js` | Teste de falha de réplica da API | `./scripts/run-teste-falha-api.sh` |
| `k6/teste-falha-banco.js` | Teste de falha do banco master | `./scripts/run-teste-falha-banco.sh` |
| `k6/teste-multiplas-falhas.js` | Teste de múltiplas falhas simultâneas | `./scripts/run-teste-multiplas-falhas.sh` |

### Scripts Shell

| Arquivo | Descrição |
|---------|-----------|
| `scripts/run-teste-falha-api.sh` | Executor do teste de falha de API |
| `scripts/run-teste-falha-banco.sh` | Executor do teste de falha de banco |
| `scripts/run-teste-multiplas-falhas.sh` | Executor do teste de caos |

---

## 🚀 Comandos Rápidos

### Setup Inicial

```bash
# 1. Instalar dependências
npm install

# 2. Subir arquitetura completa
npm run replication:build

# 3. Verificar status
npm run replication:status

# 4. Ver logs
npm run replication:logs

# 5. Executar migrations
docker exec -it financial-api-1 npm run migration:run

# 6. Popular banco
docker exec -it financial-api-1 npm run populate:20k
```

### Testes de Falha

```bash
# Teste 1: Falha de réplica da API
npm run test:falha-api

# Teste 2: Falha do banco
npm run test:falha-banco

# Teste 3: Múltiplas falhas
npm run test:multiplas-falhas
```

### Comandos de Manutenção

```bash
# Parar todos os serviços
npm run replication:down

# Reiniciar com rebuild
npm run replication:build

# Ver status dos containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Verificar replicação do PostgreSQL
docker exec -it financial-db-master psql -U finance_user -d financial_db -c "SELECT * FROM pg_stat_replication;"
```

---

## 📊 Estrutura dos Experimentos

### Parte 1: Projeto da Arquitetura ✅

- [x] Análise da arquitetura atual
- [x] Identificação de pontos de falha
- [x] Proposta de solução com replicação
- [x] Definição de número de réplicas
- [x] Escolha do protocolo de replicação
- [x] Análise stateful vs stateless
- [x] Documentação de trade-offs

**Documentos:** 
- `ARQUITETURA-TOLERANCIA-FALHAS.md`
- `README-TRABALHO2.md` (seção de respostas)

### Parte 2: Implementação ✅

- [x] Configuração de múltiplas réplicas da API
- [x] Implementação do load balancer (Nginx)
- [x] Migração de SQLite para PostgreSQL
- [x] Configuração de streaming replication
- [x] Implementação de health checks
- [x] Criação de scripts de teste

**Arquivos:**
- `docker-compose-replication.yml`
- `nginx.conf`
- `database/*.conf`
- `src/data-source.ts`
- `src/app.ts`

### Parte 3: Cenários de Experimentos ✅

- [x] Experimento 1: Baseline (sem falhas)
- [x] Experimento 2: Falha de 1 réplica da API
- [x] Experimento 3: Falha de 2 réplicas da API
- [x] Experimento 4: Falha do banco master
- [x] Experimento 5: Teste de caos (múltiplas falhas)

**Scripts:**
- `k6/teste-falha-replica-api.js`
- `k6/teste-falha-banco.js`
- `k6/teste-multiplas-falhas.js`

### Parte 4: Avaliação 📝

- [x] Template de relatório estruturado
- [x] Métricas definidas (latência, throughput, disponibilidade)
- [x] Análise comparativa entre cenários
- [ ] **Execução dos testes e coleta de resultados** (PRÓXIMO PASSO)
- [ ] **Preenchimento do relatório** (PRÓXIMO PASSO)

**Documentos:**
- `TEMPLATE-RELATORIO-EXPERIMENTOS.md` (para preencher)
- `GUIA-EXECUCAO-TRABALHO2.md` (instruções)

---

## 📈 Fluxo de Trabalho Recomendado

```
1. 📖 LER: README-TRABALHO2.md
   └─> Entender visão geral e arquitetura

2. 📖 LER: ARQUITETURA-TOLERANCIA-FALHAS.md
   └─> Compreender decisões de design

3. 🔧 SEGUIR: GUIA-EXECUCAO-TRABALHO2.md
   ├─> Setup inicial
   ├─> Validar ambiente
   └─> Executar experimentos

4. 📊 EXECUTAR: Cada experimento
   ├─> Baseline
   ├─> Falha de 1 API
   ├─> Falha de 2 APIs
   ├─> Falha do banco
   └─> Teste de caos

5. 📝 DOCUMENTAR: TEMPLATE-RELATORIO-EXPERIMENTOS.md
   ├─> Coletar métricas
   ├─> Preencher tabelas
   ├─> Gerar gráficos
   └─> Análise crítica

6. ✅ VALIDAR: Checklist completo
   └─> Todos os objetivos alcançados
```

---

## 🎓 Respostas Resumidas às Questões

### a) O que acontece se um servidor falhar?

**Resposta curta:**
- **API:** Sistema continua funcionando (outras réplicas assumem)
- **Banco Master:** Downtime total (sem auto-failover)
- **Banco Replica:** Sem impacto na disponibilidade

**Detalhes:** Seção 1 de `ARQUITETURA-TOLERANCIA-FALHAS.md`

### b) Quantas réplicas? Como atualizar? Qual protocolo?

**Resposta curta:**
- **3 réplicas da API** (stateless, load balanced)
- **1 Master + 1 Replica** do PostgreSQL
- **Protocolo:** Streaming Replication (assíncrono)
- **Atualização:** Round-robin nas APIs, WAL streaming no banco

**Detalhes:** Seção 2 de `ARQUITETURA-TOLERANCIA-FALHAS.md`

### c) Stateful ou stateless? Impacto?

**Resposta curta:**
- **APIs:** Stateless → fácil replicação, escalabilidade linear
- **Banco:** Stateful → replicação complexa, sincronização necessária

**Detalhes:** Seção 2.c de `ARQUITETURA-TOLERANCIA-FALHAS.md`

---

## 📦 Entregáveis do Trabalho 2

### Código e Configuração
- [x] `docker-compose-replication.yml`
- [x] `nginx.conf`
- [x] Configurações PostgreSQL (`database/*.conf`)
- [x] Código atualizado (`src/data-source.ts`, `src/app.ts`)
- [x] Scripts de teste K6
- [x] Scripts shell de execução

### Documentação
- [x] `README-TRABALHO2.md` - Visão geral
- [x] `ARQUITETURA-TOLERANCIA-FALHAS.md` - Análise técnica
- [x] `GUIA-EXECUCAO-TRABALHO2.md` - Manual de execução
- [x] `TEMPLATE-RELATORIO-EXPERIMENTOS.md` - Template de relatório
- [x] `INDICE-TRABALHO2.md` - Este arquivo

### Execução (A fazer)
- [ ] Executar todos os experimentos
- [ ] Coletar métricas e gráficos
- [ ] Preencher relatório
- [ ] Análise crítica dos resultados

---

## 🔗 Links Rápidos

| Para | Ver |
|------|-----|
| Começar rapidamente | [README-TRABALHO2.md](./README-TRABALHO2.md#quick-start) |
| Entender arquitetura | [ARQUITETURA-TOLERANCIA-FALHAS.md](./ARQUITETURA-TOLERANCIA-FALHAS.md#3-arquitetura-proposta) |
| Executar experimentos | [GUIA-EXECUCAO-TRABALHO2.md](./GUIA-EXECUCAO-TRABALHO2.md#executando-os-experimentos) |
| Troubleshooting | [GUIA-EXECUCAO-TRABALHO2.md](./GUIA-EXECUCAO-TRABALHO2.md#troubleshooting) |
| Documentar resultados | [TEMPLATE-RELATORIO-EXPERIMENTOS.md](./TEMPLATE-RELATORIO-EXPERIMENTOS.md) |

---

## 💡 Dicas

1. **Leia a documentação na ordem:** README → ARQUITETURA → GUIA
2. **Valide cada passo:** Use os health checks frequentemente
3. **Monitore os logs:** `docker-compose logs -f` é seu amigo
4. **Documente em tempo real:** Preencha o relatório durante os testes
5. **Tire screenshots:** Capturas do Grafana/K6 são valiosas

---

## ❓ FAQ

**P: Preciso derrubar o Trabalho 1 antes?**
R: Sim, se estiver usando a mesma porta. Use `docker-compose down` no Trabalho 1.

**P: Posso usar o banco SQLite existente?**
R: Não, o Trabalho 2 usa PostgreSQL. Execute as migrations novamente.

**P: Os testes K6 funcionam sem Grafana?**
R: Sim, o output padrão do K6 no terminal é suficiente.

**P: Como verifico se a replicação está funcionando?**
R: Use o comando em "Comandos de Manutenção" acima.

**P: E se um teste falhar?**
R: Consulte a seção de Troubleshooting no GUIA-EXECUCAO-TRABALHO2.md

---

**Última atualização:** 24 de novembro de 2025  
**Versão:** 1.0  
**Status:** ✅ Implementação completa | 📊 Aguardando execução de testes
