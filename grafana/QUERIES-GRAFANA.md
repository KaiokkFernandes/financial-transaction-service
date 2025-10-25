# Queries Úteis para Grafana + InfluxDB

Este documento contém queries prontas para usar no Grafana ao visualizar os resultados dos testes K6.

## 📊 Configuração Inicial

**Datasource**: InfluxDB-K6  
**Database**: k6  
**Time Range**: Last 15 minutes (ou conforme duração do teste)

---

## 🎯 Queries Principais

### 1. Taxa de Requisições por Segundo (RPS)

Mostra quantas requisições a aplicação está processando por segundo.

```sql
SELECT mean("value") 
FROM "http_reqs" 
WHERE $timeFilter 
GROUP BY time($__interval) fill(null)
```

**Tipo de Visualização**: Time series (Graph)  
**Y-Axis**: Requisições/segundo

---

### 2. Tempo de Resposta - Percentil 95 (P95)

Mostra que 95% das requisições foram respondidas neste tempo ou menos.

```sql
SELECT percentile("value", 95) 
FROM "http_req_duration" 
WHERE $timeFilter 
GROUP BY time($__interval) fill(null)
```

**Tipo de Visualização**: Time series (Graph)  
**Y-Axis**: Milissegundos (ms)  
**Threshold**: Linha vermelha em 500ms

---

### 3. Tempo de Resposta Médio

```sql
SELECT mean("value") 
FROM "http_req_duration" 
WHERE $timeFilter 
GROUP BY time($__interval) fill(null)
```

**Tipo de Visualização**: Time series (Graph)  
**Y-Axis**: Milissegundos (ms)

---

### 4. Taxa de Erro (%)

Porcentagem de requisições que falharam.

```sql
SELECT mean("value") * 100 
FROM "http_req_failed" 
WHERE $timeFilter 
GROUP BY time($__interval) fill(null)
```

**Tipo de Visualização**: Time series (Graph)  
**Y-Axis**: Porcentagem (%)  
**Threshold**: Linha amarela em 1%, vermelha em 5%

---

### 5. Usuários Virtuais Ativos

Quantos usuários simultâneos estavam executando requisições.

```sql
SELECT mean("value") 
FROM "vus" 
WHERE $timeFilter 
GROUP BY time($__interval) fill(null)
```

**Tipo de Visualização**: Time series (Graph)  
**Y-Axis**: Usuários

---

### 6. Latência por Endpoint

Compara o tempo de resposta de cada endpoint.

```sql
SELECT mean("value") 
FROM "http_req_duration" 
WHERE $timeFilter 
GROUP BY time($__interval), "name" fill(null)
```

**Tipo de Visualização**: Time series (Graph)  
**Legend**: `{{name}}`  
**Y-Axis**: Milissegundos (ms)

---

### 7. Requisições Bem-Sucedidas vs Falhadas

```sql
-- Bem-sucedidas
SELECT count("value") 
FROM "http_reqs" 
WHERE $timeFilter AND "status" =~ /^2/ 
GROUP BY time($__interval)

-- Falhadas
SELECT count("value") 
FROM "http_reqs" 
WHERE $timeFilter AND "status" !~ /^2/ 
GROUP BY time($__interval)
```

**Tipo de Visualização**: Stacked bar chart

---

### 8. Checks - Taxa de Sucesso

Porcentagem de validações que passaram.

```sql
SELECT mean("value") * 100 
FROM "checks" 
WHERE $timeFilter 
GROUP BY time($__interval) fill(null)
```

**Tipo de Visualização**: Stat (Single value)  
**Formato**: Porcentagem (%)  
**Thresholds**: Verde > 99%, Amarelo > 95%, Vermelho < 95%

---

### 9. Dados Enviados (Throughput)

```sql
SELECT sum("value") 
FROM "data_sent" 
WHERE $timeFilter 
GROUP BY time($__interval) fill(null)
```

**Tipo de Visualização**: Time series (Graph)  
**Y-Axis**: Bytes (usar auto-scale para KB/MB)

---

### 10. Dados Recebidos

```sql
SELECT sum("value") 
FROM "data_received" 
WHERE $timeFilter 
GROUP BY time($__interval) fill(null)
```

**Tipo de Visualização**: Time series (Graph)  
**Y-Axis**: Bytes

---

### 11. Distribuição de Latência (Heatmap)

```sql
SELECT percentile("value", 50) as "p50",
       percentile("value", 90) as "p90",
       percentile("value", 95) as "p95",
       percentile("value", 99) as "p99"
FROM "http_req_duration"
WHERE $timeFilter
GROUP BY time($__interval) fill(null)
```

**Tipo de Visualização**: Time series (Graph)  
**Multiple Series**: Mostra P50, P90, P95, P99

---

### 12. Requisições por Status HTTP

```sql
SELECT count("value")
FROM "http_reqs"
WHERE $timeFilter
GROUP BY time($__interval), "status" fill(null)
```

**Tipo de Visualização**: Time series (Stacked)  
**Legend**: `{{status}}`

---

### 13. Top Endpoints Mais Lentos

```sql
SELECT mean("value") as "avg_duration"
FROM "http_req_duration"
WHERE $timeFilter
GROUP BY "name"
ORDER BY "avg_duration" DESC
LIMIT 10
```

**Tipo de Visualização**: Table  
**Colunas**: Endpoint, Latência Média

---

### 14. Duração das Iterações

Tempo total que cada virtual user levou para completar uma iteração.

```sql
SELECT mean("value")
FROM "iteration_duration"
WHERE $timeFilter
GROUP BY time($__interval) fill(null)
```

**Tipo de Visualização**: Time series (Graph)  
**Y-Axis**: Segundos

---

## 🎨 Layout de Dashboard Recomendado

### Linha 1 - KPIs Principais (Stat Panels)
- RPS Médio
- P95 Latência
- Taxa de Erro
- Checks Passados

### Linha 2 - Gráficos de Tempo
- Requisições/Segundo (Time Series)
- Latência P50/P95/P99 (Time Series)

### Linha 3 - Análise Detalhada
- Taxa de Erro % (Time Series)
- VUs Ativos (Time Series)
- Latência por Endpoint (Time Series)

### Linha 4 - Throughput
- Dados Enviados (Time Series)
- Dados Recebidos (Time Series)

---

## 🔧 Configurações Úteis

### Time Range Comum

```
Last 5 minutes   - Para testes curtos
Last 15 minutes  - Para testes de 5-10 min
Last 30 minutes  - Para comparar múltiplos testes
Last 1 hour      - Para ver todos os cenários
```

### Auto-Refresh

Configure para atualizar automaticamente durante o teste:
- **5s** - Para monitoramento em tempo real
- **10s** - Para testes mais longos
- **Off** - Para análise pós-teste

---

## 📈 Exemplo de Panel Completo

### Panel: "Latência - Distribuição de Percentis"

**Query**:
```sql
SELECT 
  percentile("value", 50) as "p50",
  percentile("value", 75) as "p75",
  percentile("value", 90) as "p90",
  percentile("value", 95) as "p95",
  percentile("value", 99) as "p99"
FROM "http_req_duration"
WHERE $timeFilter
GROUP BY time($__interval) fill(null)
```

**Configurações**:
- **Visualization**: Time series
- **Legend**: Show, Values: Last
- **Tooltip**: All series
- **Thresholds**:
  - Verde: < 200ms
  - Amarelo: 200-500ms
  - Vermelho: > 500ms

---

## 🎯 Queries para Comparação de Cenários

Se você executou múltiplos cenários e quer comparar:

### Adicionar Tag ao Executar K6

```powershell
k6 run --tag cenario=A --out influxdb=http://localhost:8086/k6 cenario-a-50-50.js
k6 run --tag cenario=B --out influxdb=http://localhost:8086/k6 cenario-b-75-25.js
k6 run --tag cenario=C --out influxdb=http://localhost:8086/k6 cenario-c-25-75.js
```

### Query Comparativa

```sql
SELECT mean("value")
FROM "http_req_duration"
WHERE $timeFilter
GROUP BY time($__interval), "cenario" fill(null)
```

**Legend**: `Cenário {{cenario}}`

---

## 💡 Dicas de Uso

1. **Use Variáveis**: Crie uma variável `$cenario` para filtrar dashboards
2. **Annotations**: Marque quando cada cenário começou/terminou
3. **Duplicate Panels**: Duplique panels e ajuste queries para comparações
4. **Export/Import**: Salve seu dashboard como JSON para backup

---

## 🔗 Queries Avançadas

### Taxa de Sucesso por Endpoint

```sql
SELECT 
  (sum("value") FILTER (WHERE "status"::int >= 200 AND "status"::int < 300)) / sum("value") * 100 as "success_rate"
FROM "http_reqs"
WHERE $timeFilter
GROUP BY time($__interval), "name"
```

### Latência Mínima, Média e Máxima

```sql
SELECT 
  min("value") as "min",
  mean("value") as "avg",
  max("value") as "max"
FROM "http_req_duration"
WHERE $timeFilter
GROUP BY time($__interval) fill(null)
```

---

## 📊 Template de Dashboard Completo (JSON)

Para importar no Grafana, você pode criar manualmente ou usar o dashboard oficial do K6 (ID: 2587).

Ou criar seus próprios panels seguindo as queries acima!

---

**Dica Final**: Salve seu dashboard customizado e compartilhe com a equipe! 🚀
