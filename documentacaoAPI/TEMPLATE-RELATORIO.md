# Relatório de Testes de Desempenho - Financial Transaction Service

**Data**: _____________  
**Responsável**: _____________  
**Versão da Aplicação**: 1.0.0

---

## 📋 Sumário Executivo

Este relatório apresenta os resultados dos testes de carga realizados no Financial Transaction Service, avaliando o desempenho da aplicação em três cenários distintos de uso, com diferentes proporções de operações de leitura e escrita.

---

## 🎯 Objetivos

- Avaliar o desempenho da aplicação com 100 usuários simultâneos
- Comparar o comportamento em cenários com diferentes proporções de leitura/escrita
- Identificar gargalos e limitações de desempenho
- Analisar o impacto do tamanho do dataset no desempenho

---

## 🛠️ Metodologia

### Ambiente de Teste

| Item | Especificação |
|------|---------------|
| **Sistema Operacional** | Windows _____ |
| **Processador** | _____________ |
| **Memória RAM** | _____________ |
| **Banco de Dados** | SQLite 3.x |
| **Node.js** | v____ |
| **Ferramenta de Teste** | K6 v____ |

### Ferramentas Utilizadas

- **K6**: Geração de carga e coleta de métricas
- **InfluxDB**: Armazenamento de séries temporais
- **Grafana**: Visualização e análise de dados

### Datasets Testados

1. **Dataset A**: 50.000 registros de clientes
2. **Dataset B**: 20.000 registros de clientes

### Cenários de Teste

| Cenário | Descrição | VUs Leitura | VUs Escrita | Duração |
|---------|-----------|-------------|-------------|---------|
| **A** | Balanceado | 50 (50%) | 50 (50%) | 5 minutos |
| **B** | Orientado a Leitura | 75 (75%) | 25 (25%) | 5 minutos |
| **C** | Orientado a Escrita | 25 (25%) | 75 (75%) | 5 minutos |

### Operações Testadas

**Leituras**:
- `GET /clientes/:id` - Buscar cliente por ID (90%)
- `GET /clientes` - Listar todos (10%)

**Escritas**:
- `POST /clientes/:id/deposito` - Realizar depósito (70%)
- `POST /clientes/:id/transferencia` - Transferir entre contas (30%)

---

## 📊 Resultados - Dataset 50.000 Registros

### Cenário A: 50% Leituras / 50% Escritas

| Métrica | Valor | Meta | Status |
|---------|-------|------|--------|
| **Requisições/segundo** | _____ req/s | > 100 | ⬜ OK / ⬜ Falhou |
| **Latência Média** | _____ ms | < 200ms | ⬜ OK / ⬜ Falhou |
| **Latência P95** | _____ ms | < 500ms | ⬜ OK / ⬜ Falhou |
| **Latência P99** | _____ ms | < 1000ms | ⬜ OK / ⬜ Falhou |
| **Taxa de Erro** | _____ % | < 1% | ⬜ OK / ⬜ Falhou |
| **Checks Passados** | _____ % | > 99% | ⬜ OK / ⬜ Falhou |
| **Total de Requisições** | _____ | - | - |
| **Dados Enviados** | _____ MB | - | - |
| **Dados Recebidos** | _____ MB | - | - |

**Análise**:
```
[Descreva o comportamento observado no Cenário A]
- Pontos fortes:
- Pontos fracos:
- Observações:
```

---

### Cenário B: 75% Leituras / 25% Escritas

| Métrica | Valor | Meta | Status |
|---------|-------|------|--------|
| **Requisições/segundo** | _____ req/s | > 100 | ⬜ OK / ⬜ Falhou |
| **Latência Média** | _____ ms | < 200ms | ⬜ OK / ⬜ Falhou |
| **Latência P95** | _____ ms | < 500ms | ⬜ OK / ⬜ Falhou |
| **Latência P99** | _____ ms | < 1000ms | ⬜ OK / ⬜ Falhou |
| **Taxa de Erro** | _____ % | < 1% | ⬜ OK / ⬜ Falhou |
| **Checks Passados** | _____ % | > 99% | ⬜ OK / ⬜ Falhou |
| **Total de Requisições** | _____ | - | - |
| **Dados Enviados** | _____ MB | - | - |
| **Dados Recebidos** | _____ MB | - | - |

**Análise**:
```
[Descreva o comportamento observado no Cenário B]
- Pontos fortes:
- Pontos fracos:
- Observações:
```

---

### Cenário C: 25% Leituras / 75% Escritas

| Métrica | Valor | Meta | Status |
|---------|-------|------|--------|
| **Requisições/segundo** | _____ req/s | > 100 | ⬜ OK / ⬜ Falhou |
| **Latência Média** | _____ ms | < 200ms | ⬜ OK / ⬜ Falhou |
| **Latência P95** | _____ ms | < 500ms | ⬜ OK / ⬜ Falhou |
| **Latência P99** | _____ ms | < 1000ms | ⬜ OK / ⬜ Falhou |
| **Taxa de Erro** | _____ % | < 1% | ⬜ OK / ⬜ Falhou |
| **Checks Passados** | _____ % | > 99% | ⬜ OK / ⬜ Falhou |
| **Total de Requisições** | _____ | - | - |
| **Dados Enviados** | _____ MB | - | - |
| **Dados Recebidos** | _____ MB | - | - |

**Análise**:
```
[Descreva o comportamento observado no Cenário C]
- Pontos fortes:
- Pontos fracos:
- Observações:
```

---

## 📊 Resultados - Dataset 20.000 Registros

### Comparação Geral (50k vs 20k)

| Métrica | Cenário A (50k) | Cenário A (20k) | Δ |
|---------|-----------------|-----------------|---|
| **RPS** | _____ | _____ | _____ |
| **Latência P95** | _____ ms | _____ ms | _____ ms |
| **Taxa de Erro** | _____ % | _____ % | _____ % |

| Métrica | Cenário B (50k) | Cenário B (20k) | Δ |
|---------|-----------------|-----------------|---|
| **RPS** | _____ | _____ | _____ |
| **Latência P95** | _____ ms | _____ ms | _____ ms |
| **Taxa de Erro** | _____ % | _____ % | _____ % |

| Métrica | Cenário C (50k) | Cenário C (20k) | Δ |
|---------|-----------------|-----------------|---|
| **RPS** | _____ | _____ | _____ |
| **Latência P95** | _____ ms | _____ ms | _____ ms |
| **Taxa de Erro** | _____ % | _____ % | _____ % |

**Análise Comparativa**:
```
[Descreva o impacto do tamanho do dataset]
- Impacto nas leituras:
- Impacto nas escritas:
- Uso de memória:
- Conclusões:
```

---

## 📈 Gráficos e Capturas de Tela

> **Instrução**: Inclua aqui capturas de tela dos dashboards do Grafana mostrando:
> 1. Gráfico de Latência ao longo do tempo
> 2. Gráfico de Taxa de Requisições
> 3. Gráfico de Taxa de Erro
> 4. Comparação de cenários

```
[Cole aqui as imagens ou links]
```

---

## 🔍 Análise Detalhada

### Desempenho por Endpoint

| Endpoint | Latência Média | Latência P95 | Taxa de Erro |
|----------|----------------|--------------|--------------|
| `GET /clientes/:id` | _____ ms | _____ ms | _____ % |
| `GET /clientes` | _____ ms | _____ ms | _____ % |
| `POST /deposito` | _____ ms | _____ ms | _____ % |
| `POST /transferencia` | _____ ms | _____ ms | _____ % |

### Identificação de Gargalos

**Leituras**:
```
[Identifique gargalos em operações de leitura]
- Consultas mais lentas:
- Possíveis causas:
```

**Escritas**:
```
[Identifique gargalos em operações de escrita]
- Operações mais lentas:
- Contenção de recursos:
- Possíveis causas:
```

---

## 💡 Conclusões

### Principais Descobertas

1. **Performance Geral**:
   - [ ] Aplicação atende aos requisitos de desempenho
   - [ ] Aplicação necessita otimizações
   - Justificativa: _______________

2. **Cenário Mais Eficiente**:
   - Cenário _____ apresentou melhor desempenho
   - Motivos: _______________

3. **Impacto do Dataset**:
   - [ ] Redução de 50k para 20k melhorou significativamente
   - [ ] Diferença mínima entre datasets
   - Análise: _______________

4. **Limitações Identificadas**:
   ```
   [Liste as principais limitações]
   - SQLite com escritas concorrentes
   - Possível falta de índices
   - Outros:
   ```

---

## 🎯 Recomendações

### Curto Prazo

1. **Otimizações Imediatas**:
   ```
   [ ] Adicionar índices no banco de dados
   [ ] Implementar cache para leituras frequentes
   [ ] Otimizar queries SQL
   [ ] Outros: _______________
   ```

2. **Ajustes de Configuração**:
   ```
   [ ] Ajustar pool de conexões
   [ ] Configurar timeout adequado
   [ ] Outros: _______________
   ```

### Médio/Longo Prazo

1. **Infraestrutura**:
   ```
   [ ] Migrar de SQLite para PostgreSQL/MySQL
   [ ] Implementar sistema de cache (Redis)
   [ ] Considerar balanceamento de carga
   [ ] Outros: _______________
   ```

2. **Arquitetura**:
   ```
   [ ] Separar leitura e escrita (CQRS)
   [ ] Implementar filas para operações assíncronas
   [ ] Microserviços para escalabilidade
   [ ] Outros: _______________
   ```

---

## 📝 Observações Adicionais

```
[Adicione qualquer observação relevante que não se encaixe nas seções anteriores]
```

---

## 📎 Anexos

- [ ] Logs completos do K6
- [ ] Dashboard do Grafana exportado (JSON)
- [ ] Capturas de tela
- [ ] Scripts de teste utilizados
- [ ] Dados brutos (CSV/Excel)

---

## ✅ Aprovação

| Papel | Nome | Assinatura | Data |
|-------|------|------------|------|
| **Responsável pelo Teste** | _________ | _________ | ___/___/___ |
| **Revisor Técnico** | _________ | _________ | ___/___/___ |
| **Aprovador** | _________ | _________ | ___/___/___ |

---

**Versão do Relatório**: 1.0  
**Data de Criação**: ___/___/___  
**Última Atualização**: ___/___/___

---

## 📚 Referências

- Documentação K6: https://k6.io/docs/
- Documentação da API: `/documentacaoAPI/api-endpoints.md`
- Guia de Testes de Carga: `/documentacaoAPI/testes-carga-k6.md`
