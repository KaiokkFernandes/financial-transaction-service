# 📚 Documentação da API - Financial Transaction Service

Bem-vindo à documentação completa do Financial Transaction Service!

---

## 📂 Documentos Disponíveis

### 📘 Documentação da API REST

#### [api-endpoints.md](./api-endpoints.md)
Documentação completa de todos os endpoints da API, incluindo:
- Autenticação via API Key
- Gerenciamento de clientes
- Operações financeiras (depósito, transferência)
- Exemplos de requisições e respostas
- Códigos de status HTTP

**Quando usar**: Desenvolver integrações com a API, entender os endpoints disponíveis.

---

### 🧪 Documentação de Testes

#### [testes-unitarios.md](./testes-unitarios.md)
Documentação dos testes automatizados com Jest:
- Estrutura dos testes unitários
- Cobertura de código
- Como executar os testes
- Padrões de teste implementados

**Quando usar**: Desenvolver novos testes, entender a cobertura existente.

---

### 🚀 Documentação de Testes de Carga

#### [testes-carga-k6.md](./testes-carga-k6.md) ⭐ **PRINCIPAL**
Guia completo para testes de desempenho com K6 e Grafana:
- Configuração do ambiente
- População do banco de dados
- Execução dos 3 cenários (50/50, 75/25, 25/75)
- Visualização no Grafana
- Análise de resultados
- Comparação de datasets (50k vs 20k)
- Troubleshooting detalhado

**Quando usar**: Executar testes de carga, avaliar desempenho da aplicação.

#### [TEMPLATE-RELATORIO.md](./TEMPLATE-RELATORIO.md)
Template profissional para documentar resultados dos testes:
- Estrutura de relatório completa
- Tabelas para métricas
- Seções de análise
- Recomendações
- Aprovação formal

**Quando usar**: Documentar oficialmente os resultados dos testes de desempenho.

#### [INDICE-DOCUMENTACAO.md](./INDICE-DOCUMENTACAO.md)
Índice completo de toda a documentação de testes de carga:
- Navegação rápida entre documentos
- Fluxo de trabalho recomendado
- Busca por tópico
- Níveis de conhecimento

**Quando usar**: Encontrar rapidamente o documento que você precisa.

---

## 🎯 Início Rápido

### Para Testes de Carga (Primeira Vez)

1. **Leia primeiro**: [INICIO-RAPIDO.md](../INICIO-RAPIDO.md) (5 minutos)
2. **Guia detalhado**: [testes-carga-k6.md](./testes-carga-k6.md) (30 minutos)
3. **Dúvidas?**: [FAQ-TESTES-K6.md](../FAQ-TESTES-K6.md)

### Para Desenvolvimento

1. **API**: [api-endpoints.md](./api-endpoints.md)
2. **Testes Unitários**: [testes-unitarios.md](./testes-unitarios.md)

---

## 🗺️ Mapa da Documentação

```
documentacaoAPI/
│
├── api-endpoints.md ............... Documentação da API REST
├── testes-unitarios.md ............ Testes automatizados (Jest)
│
├── testes-carga-k6.md ............. 📖 GUIA COMPLETO K6
├── TEMPLATE-RELATORIO.md .......... Template de relatório oficial
├── INDICE-DOCUMENTACAO.md ......... Índice geral
└── README.md ...................... Este arquivo
```

---

## 📊 Testes de Desempenho - Resumo

### 3 Cenários Testados

| Cenário | Leituras | Escritas | Total VUs |
|---------|----------|----------|-----------|
| A | 50% (50 VUs) | 50% (50 VUs) | 100 |
| B | 75% (75 VUs) | 25% (25 VUs) | 100 |
| C | 25% (25 VUs) | 75% (75 VUs) | 100 |

### Ferramentas

- **K6**: Geração de carga
- **InfluxDB**: Armazenamento de métricas
- **Grafana**: Visualização de resultados

### Datasets

- **50.000 registros**: Cenário completo
- **20.000 registros**: Cenário reduzido (comparação)

---

## 🔗 Links Rápidos

### Guias Principais
- [Início Rápido (5 min)](../INICIO-RAPIDO.md)
- [Resumo Executivo](../RESUMO-TESTES-K6.md)
- [Guia Completo](./testes-carga-k6.md)

### Suporte
- [FAQ - Perguntas Frequentes](../FAQ-TESTES-K6.md)
- [Queries do Grafana](../grafana/QUERIES-GRAFANA.md)
- [Scripts K6](../k6/README.md)

### Documentação Geral
- [README do Projeto](../README.md)
- [Estrutura do Código](../README.md#estrutura-do-projeto)

---

## 📝 Como Usar Esta Documentação

### 1. Primeira Vez com Testes de Carga

```
Fluxo Recomendado:
1. Leia ../INICIO-RAPIDO.md
2. Execute os testes seguindo o guia
3. Consulte testes-carga-k6.md para detalhes
4. Use ../FAQ-TESTES-K6.md se tiver problemas
```

### 2. Desenvolvendo com a API

```
Fluxo Recomendado:
1. Leia api-endpoints.md
2. Teste endpoints com Insomnia/Postman
3. Implemente testes em testes-unitarios.md
```

### 3. Documentando Resultados

```
Fluxo Recomendado:
1. Execute os testes de carga
2. Colete métricas no Grafana
3. Preencha TEMPLATE-RELATORIO.md
4. Compartilhe com a equipe
```

---

## ✅ Checklist

### Antes de Testar
- [ ] K6 instalado
- [ ] Docker rodando
- [ ] Leu INICIO-RAPIDO.md

### Durante os Testes
- [ ] InfluxDB e Grafana ativos
- [ ] Banco populado (50k ou 20k)
- [ ] Aplicação rodando
- [ ] Executou os 3 cenários

### Após os Testes
- [ ] Visualizou resultados no Grafana
- [ ] Preencheu TEMPLATE-RELATORIO.md
- [ ] Documentou conclusões
- [ ] Compartilhou com a equipe

---

## 🆘 Precisa de Ajuda?

1. **Problema técnico**: [FAQ-TESTES-K6.md](../FAQ-TESTES-K6.md)
2. **Dúvida sobre configuração**: [testes-carga-k6.md](./testes-carga-k6.md)
3. **Como criar dashboard**: [QUERIES-GRAFANA.md](../grafana/QUERIES-GRAFANA.md)
4. **Erro nos scripts**: [k6/README.md](../k6/README.md)

---

## 📅 Última Atualização

**Data**: ___/___/___  
**Versão**: 1.0.0

---

## 🎯 Próximos Passos

Após ler esta documentação:

1. ✅ Executar testes de carga
2. ✅ Analisar resultados no Grafana
3. ✅ Identificar gargalos
4. ✅ Propor otimizações
5. ✅ Documentar conclusões

---

**Boa sorte com os testes! 🚀**

Para qualquer dúvida, comece pelo [INDICE-DOCUMENTACAO.md](./INDICE-DOCUMENTACAO.md).
