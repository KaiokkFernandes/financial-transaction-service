# Scripts de Teste K6

Esta pasta contém os scripts de teste de carga para avaliar o desempenho da aplicação em diferentes cenários.

## 📁 Arquivos

### Scripts de Teste

- **cenario-a-50-50.js** - 50% leituras, 50% escritas (50+50 VUs)
- **cenario-b-75-25.js** - 75% leituras, 25% escritas (75+25 VUs)
- **cenario-c-25-75.js** - 25% leituras, 75% escritas (25+75 VUs)

### Scripts Batch (Windows)

- **run-cenario-a.bat** - Executa cenário A com output para InfluxDB
- **run-cenario-b.bat** - Executa cenário B com output para InfluxDB
- **run-cenario-c.bat** - Executa cenário C com output para InfluxDB

### Dados

- **clientes-data.json** - Arquivo gerado automaticamente pelo script de população contendo IDs e API keys dos clientes

## 🚀 Como Usar

### 1. Popular o Banco de Dados

Primeiro, gere os dados de teste:

```powershell
# Na raiz do projeto
npm run populate:50k
```

Isso criará automaticamente o arquivo `clientes-data.json` nesta pasta.

### 2. Executar Testes

#### Windows (Recomendado)

```powershell
# Executar cenário A
.\run-cenario-a.bat

# Executar cenário B
.\run-cenario-b.bat

# Executar cenário C
.\run-cenario-c.bat
```

#### Manual

```powershell
# Com output para Grafana
k6 run --out influxdb=http://localhost:8086/k6 cenario-a-50-50.js

# Apenas no terminal
k6 run cenario-a-50-50.js
```

## 📊 Estrutura dos Testes

Cada script contém:

1. **Configuração de Cenários**: Define número de VUs e duração
2. **Thresholds**: Metas de desempenho (latência, taxa de erro)
3. **Função de Leituras**: Simula operações GET
4. **Função de Escritas**: Simula operações POST (depósitos e transferências)

## 🎯 Métricas Monitoradas

- **http_req_duration**: Tempo de resposta das requisições
- **http_req_failed**: Taxa de falha
- **http_reqs**: Total de requisições
- **checks**: Validações de sucesso
- **vus**: Usuários virtuais ativos

## 📈 Visualização

Acesse o Grafana em **http://localhost:3001** para visualizar os resultados em tempo real.

**Login**: admin / admin

## ⚙️ Customização

Você pode ajustar os parâmetros nos scripts:

```javascript
export const options = {
  scenarios: {
    leituras: {
      executor: 'constant-vus',
      vus: 50,              // ← Ajuste aqui
      duration: '5m',       // ← Ajuste aqui
      exec: 'realizarLeituras',
    },
    // ...
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // ← Ajuste aqui
    http_req_failed: ['rate<0.1'],    // ← Ajuste aqui
  },
};
```

## 🔗 Documentação Completa

Consulte `documentacaoAPI/testes-carga-k6.md` para o guia completo.
