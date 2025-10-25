# Guia de Testes de Carga com K6 e Grafana

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração Inicial](#configuração-inicial)
4. [População do Banco de Dados](#população-do-banco-de-dados)
5. [Executando os Testes](#executando-os-testes)
6. [Visualização no Grafana](#visualização-no-grafana)
7. [Análise dos Resultados](#análise-dos-resultados)
8. [Cenários de Teste](#cenários-de-teste)
9. [Comparação de Datasets](#comparação-de-datasets)

---

## 🎯 Visão Geral

Este guia descreve como realizar testes de desempenho na aplicação **Financial Transaction Service** usando:

- **K6**: Ferramenta de teste de carga moderna
- **InfluxDB**: Banco de dados de séries temporais para armazenar métricas
- **Grafana**: Plataforma de visualização e análise de métricas

### Objetivos dos Testes

Avaliar o desempenho da aplicação CRUD em três cenários diferentes:

- **Cenário A**: 50% leituras / 50% escritas (50 + 50 usuários)
- **Cenário B**: 75% leituras / 25% escritas (75 + 25 usuários)
- **Cenário C**: 25% leituras / 75% escritas (25 + 75 usuários)

---

## 🔧 Pré-requisitos

### Ferramentas Necessárias

1. **Node.js** 18+ instalado
2. **K6** instalado no Windows
   ```powershell
   # Verifique se está instalado
   k6 version
   ```
   Se não estiver instalado, baixe em: https://k6.io/docs/get-started/installation/

3. **Docker Desktop** instalado e rodando
   ```powershell
   docker --version
   docker-compose --version
   ```

### Verificar Instalação do K6

```powershell
k6 version
# Saída esperada: k6 v0.x.x
```

---

## ⚙️ Configuração Inicial

### Passo 1: Instalar Dependências do Projeto

```powershell
cd c:\Users\Kaio vittor\Documents\Projetos\ProjetoDistribuidos\financial-transaction-service
npm install
```

### Passo 2: Iniciar InfluxDB e Grafana

```powershell
# Iniciar os containers do InfluxDB e Grafana
npm run k6:setup

# Ou manualmente:
docker-compose -f docker-compose-k6.yml up -d influxdb grafana
```

Aguarde alguns segundos para os serviços iniciarem.

### Passo 3: Verificar se os Serviços Estão Rodando

```powershell
docker ps
```

Você deve ver containers:
- `influxdb` na porta 8086
- `grafana` na porta 3001

### Passo 4: Acessar o Grafana

Abra o navegador em: **http://localhost:3001**

- **Usuário**: `admin`
- **Senha**: `admin`

---

## 📊 População do Banco de Dados

### Gerar 50.000 Registros (Dataset Completo)

```powershell
# Popular com 50.000 clientes
npm run populate:50k

# Ou especificar quantidade customizada
npm run populate -- 50000
```

O script irá:
1. ✅ Conectar ao banco de dados SQLite
2. 📦 Gerar 50.000 clientes com dados realistas
3. 💾 Salvar em lotes de 1.000 para melhor desempenho
4. 📝 Exportar API keys para `k6/clientes-data.json`
5. 📈 Exibir estatísticas finais

**Tempo estimado**: 2-5 minutos

### Exemplo de Saída:

```
🚀 Iniciando população do banco de dados com 50000 registros...
✅ Conexão com banco de dados estabelecida
📊 Clientes existentes no banco: 0
📦 Processando em 50 lotes de 1000 registros
⏳ Progresso: 10.0% (5000/50000 registros)
⏳ Progresso: 20.0% (10000/50000 registros)
...
✅ População do banco concluída com sucesso!

📈 Estatísticas:
   Total de clientes: 50000
   Soma de todos os saldos: R$ 245678.90
   Saldo médio: R$ 4.91

📝 Exportando API keys para arquivo...
✅ API keys exportadas para: k6/clientes-data.json
🎉 Script finalizado com sucesso!
```

### Gerar 20.000 Registros (Dataset Reduzido)

Para comparar o desempenho com menos dados:

```powershell
# Popular com 20.000 clientes
npm run populate:20k

# Ou
npm run populate -- 20000
```

---

## 🚀 Executando os Testes

### Passo 1: Iniciar a Aplicação

Em um terminal separado:

```powershell
# Compilar e iniciar
npm run build
npm start

# Ou em modo desenvolvimento
npm run dev
```

Verifique se a aplicação está rodando: **http://localhost:3000**

### Passo 2: Executar Cenário A (50/50)

**Opção 1: Script Batch (Recomendado)**
```powershell
cd k6
.\run-cenario-a.bat
```

**Opção 2: Comando Direto**
```powershell
k6 run --out influxdb=http://localhost:8086/k6 k6/cenario-a-50-50.js
```

### Passo 3: Executar Cenário B (75/25)

```powershell
cd k6
.\run-cenario-b.bat
```

### Passo 4: Executar Cenário C (25/75)

```powershell
cd k6
.\run-cenario-c.bat
```

### Durante o Teste

O K6 mostrará métricas em tempo real no terminal:

```
     ✓ GET /clientes/:id - status 200
     ✓ POST /deposito - status 200

     checks.........................: 99.82% ✓ 14567  ✗ 26
     data_received..................: 4.5 MB 15 kB/s
     data_sent......................: 2.1 MB 7.0 kB/s
     http_req_duration..............: avg=125.4ms min=45ms med=98ms max=2.1s p(95)=287ms
     http_req_failed................: 0.10%  ✓ 26     ✗ 14567
     http_reqs......................: 14593  48.64/s
     iteration_duration.............: avg=5.2s   min=2.1s med=4.8s max=12s
     vus............................: 100    min=100  max=100
```

---

## 📈 Visualização no Grafana

### Configurar Dashboard

1. **Acessar Grafana**: http://localhost:3001
2. **Login**: admin / admin
3. **Criar Novo Dashboard**:
   - Clique em "+" → "Dashboard"
   - Clique em "Add visualization"
   - Selecione "InfluxDB-K6"

### Métricas Importantes para Adicionar

#### 1. Taxa de Requisições por Segundo (RPS)

```sql
SELECT mean("value") FROM "http_reqs" 
WHERE $timeFilter 
GROUP BY time($__interval)
```

#### 2. Tempo de Resposta (P95)

```sql
SELECT percentile("value", 95) FROM "http_req_duration" 
WHERE $timeFilter 
GROUP BY time($__interval)
```

#### 3. Taxa de Erro

```sql
SELECT mean("value")*100 FROM "http_req_failed" 
WHERE $timeFilter 
GROUP BY time($__interval)
```

#### 4. Usuários Virtuais Ativos

```sql
SELECT mean("value") FROM "vus" 
WHERE $timeFilter 
GROUP BY time($__interval)
```

#### 5. Latência por Endpoint

```sql
SELECT mean("value") FROM "http_req_duration" 
WHERE $timeFilter 
GROUP BY time($__interval), "name"
```

### Dashboard Pré-Configurado

Você pode importar um dashboard K6 pronto:

1. No Grafana, clique em "+" → "Import"
2. Use o ID: **2587** (Dashboard oficial do K6)
3. Selecione o datasource "InfluxDB-K6"
4. Clique em "Import"

---

## 📊 Análise dos Resultados

### Métricas-Chave

| Métrica | Descrição | Meta Ideal |
|---------|-----------|------------|
| **http_req_duration** | Tempo médio de resposta | < 200ms |
| **http_req_duration (p95)** | 95% das requisições | < 500ms |
| **http_req_failed** | Taxa de falha | < 1% |
| **http_reqs** | Requisições por segundo | Quanto maior, melhor |
| **checks** | Verificações bem-sucedidas | > 99% |

### Exemplo de Análise

```
Cenário A (50/50):
- RPS: 150 req/s
- P95 Latência: 320ms
- Taxa de Erro: 0.5%
- Throughput: Alta

Cenário B (75/25):
- RPS: 180 req/s
- P95 Latência: 280ms
- Taxa de Erro: 0.3%
- Throughput: Maior (mais leituras são mais rápidas)

Cenário C (25/75):
- RPS: 120 req/s
- P95 Latência: 450ms
- Taxa de Erro: 1.2%
- Throughput: Menor (mais escritas são mais lentas)
```

### Interpretação

**Leituras (GET)** são geralmente:
- ✅ Mais rápidas
- ✅ Menos custosas em termos de CPU
- ✅ Podem ser cacheadas

**Escritas (POST)** são:
- ⚠️ Mais lentas (precisam persistir dados)
- ⚠️ Podem causar contenção no banco
- ⚠️ Transações podem bloquear recursos

---

## 🎭 Cenários de Teste

### Cenário A: 50% Leituras / 50% Escritas

**Características**:
- 50 VUs fazendo leituras (GET /clientes/:id)
- 50 VUs fazendo escritas (POST /deposito, /transferencia)
- Duração: 5 minutos
- Total: 100 usuários simultâneos

**Operações de Leitura**:
- Buscar cliente por ID (90%)
- Listar todos os clientes (10%)

**Operações de Escrita**:
- Depósitos (70%)
- Transferências (30%)

**Quando Usar**:
- Simula uso balanceado da aplicação
- Testa capacidade de lidar com operações mistas

---

### Cenário B: 75% Leituras / 25% Escritas

**Características**:
- 75 VUs fazendo leituras
- 25 VUs fazendo escritas
- Simula aplicação focada em consultas

**Quando Usar**:
- Aplicações de dashboard/relatórios
- Sistemas de consulta de saldo
- APIs públicas de leitura

**Expectativa**:
- ✅ Melhor throughput geral
- ✅ Latência menor
- ✅ Menos contenção no banco

---

### Cenário C: 25% Leituras / 75% Escritas

**Características**:
- 25 VUs fazendo leituras
- 75 VUs fazendo escritas
- Simula alta carga transacional

**Quando Usar**:
- Sistemas de pagamento em horário de pico
- Eventos de alto volume de transações
- Black Friday / Promoções

**Expectativa**:
- ⚠️ Maior latência
- ⚠️ Possível contenção no banco SQLite
- ⚠️ Taxa de erro pode aumentar

---

## 🔍 Comparação de Datasets

### Teste com 50.000 Registros

```powershell
# Popular banco
npm run populate:50k

# Executar todos os cenários
cd k6
.\run-cenario-a.bat
.\run-cenario-b.bat
.\run-cenario-c.bat
```

### Teste com 20.000 Registros

```powershell
# Limpar banco antigo
rm database/dbfinance.sqlite

# Recriar estrutura
npm run migration:run

# Popular com 20k
npm run populate:20k

# Executar mesmos cenários
cd k6
.\run-cenario-a.bat
.\run-cenario-b.bat
.\run-cenario-c.bat
```

### Comparação Esperada

| Aspecto | 50k Registros | 20k Registros |
|---------|---------------|---------------|
| **Tamanho do DB** | ~50 MB | ~20 MB |
| **Tempo de Leitura** | Ligeiramente maior | Mais rápido |
| **Tempo de Escrita** | Similar | Similar |
| **Uso de Memória** | Maior | Menor |
| **Cache Hit Rate** | Menor | Maior |

**Observação**: SQLite é eficiente para datasets pequenos/médios. A diferença pode ser mínima para operações indexadas (busca por ID).

---

## 📝 Gerando Relatórios

### Relatório HTML do K6

```powershell
k6 run --out json=resultados.json k6/cenario-a-50-50.js

# Converter para HTML (requer k6-reporter)
k6-to-junit resultados.json
```

### Exportar Dados do Grafana

1. No dashboard, clique no título do painel
2. "Share" → "Export"
3. Salve como JSON ou PNG

### Comparar Resultados

Crie uma planilha com:

| Cenário | Dataset | RPS | P95 Latência | Taxa Erro |
|---------|---------|-----|--------------|-----------|
| A (50/50) | 50k | 150 | 320ms | 0.5% |
| A (50/50) | 20k | 165 | 280ms | 0.3% |
| B (75/25) | 50k | 180 | 280ms | 0.3% |
| B (75/25) | 20k | 195 | 250ms | 0.2% |
| C (25/75) | 50k | 120 | 450ms | 1.2% |
| C (25/75) | 20k | 135 | 380ms | 0.8% |

---

## 🛠️ Comandos Úteis

### Docker

```powershell
# Iniciar InfluxDB e Grafana
npm run k6:setup

# Parar serviços
npm run k6:down

# Ver logs
docker-compose -f docker-compose-k6.yml logs -f

# Resetar tudo
docker-compose -f docker-compose-k6.yml down -v
```

### Banco de Dados

```powershell
# Popular 50k
npm run populate:50k

# Popular 20k
npm run populate:20k

# Popular quantidade customizada
npm run populate -- 35000

# Verificar total de registros (usando TypeORM CLI)
npm run typeorm query "SELECT COUNT(*) as total FROM clientes"
```

### K6

```powershell
# Teste rápido (30 segundos)
k6 run --duration 30s k6/cenario-a-50-50.js

# Teste com menos usuários
k6 run --vus 10 --duration 1m k6/cenario-a-50-50.js

# Ver apenas resumo final
k6 run --quiet k6/cenario-a-50-50.js
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module clientes-data.json"

**Solução**: Execute o script de população primeiro
```powershell
npm run populate:50k
```

### Erro: K6 não envia dados para InfluxDB

**Solução**: Verifique se o InfluxDB está rodando
```powershell
docker ps | findstr influxdb
curl http://localhost:8086/ping
```

### Erro: "SQLITE_BUSY: database is locked"

**Solução**: SQLite tem limitações com escritas concorrentes. Isso é esperado em cenários com muitas escritas simultâneas. Considere:
- Reduzir número de VUs
- Usar PostgreSQL/MySQL em produção

### Grafana não mostra dados

**Solução**:
1. Verifique se o datasource está configurado corretamente
2. Certifique-se de que o K6 está enviando dados: `--out influxdb=http://localhost:8086/k6`
3. Verifique o range de tempo no Grafana (últimos 15 minutos)

---

## 📚 Recursos Adicionais

- **Documentação K6**: https://k6.io/docs/
- **Grafana Tutorials**: https://grafana.com/tutorials/
- **InfluxDB Docs**: https://docs.influxdata.com/influxdb/v1.8/

---

## ✅ Checklist de Execução

- [ ] Docker Desktop rodando
- [ ] InfluxDB e Grafana iniciados (`npm run k6:setup`)
- [ ] Banco de dados populado (`npm run populate:50k`)
- [ ] Aplicação rodando (`npm run dev`)
- [ ] Grafana acessível em http://localhost:3001
- [ ] Arquivo `k6/clientes-data.json` existe
- [ ] Executar Cenário A
- [ ] Executar Cenário B
- [ ] Executar Cenário C
- [ ] Analisar resultados no Grafana
- [ ] Repetir com dataset de 20k
- [ ] Comparar resultados
- [ ] Gerar relatório final

---

**Dica**: Execute os testes em horários diferentes para obter médias mais precisas e identificar variações de desempenho!
