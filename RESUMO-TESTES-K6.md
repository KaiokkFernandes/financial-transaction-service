# 🎯 Resumo Executivo - Testes de Carga K6 + Grafana

## ✅ O Que Foi Criado

### 📂 Estrutura de Arquivos

```
financial-transaction-service/
├── k6/                              # Scripts de teste de carga
│   ├── cenario-a-50-50.js          # 50% leituras / 50% escritas
│   ├── cenario-b-75-25.js          # 75% leituras / 25% escritas
│   ├── cenario-c-25-75.js          # 25% leituras / 75% escritas
│   ├── run-cenario-a.bat           # Executor Windows - Cenário A
│   ├── run-cenario-b.bat           # Executor Windows - Cenário B
│   ├── run-cenario-c.bat           # Executor Windows - Cenário C
│   ├── clientes-data.json          # Gerado automaticamente (50k clientes)
│   └── README.md                    # Documentação dos scripts
│
├── scripts/
│   └── populate-database.ts        # Script para popular banco (50k ou 20k)
│
├── grafana/
│   ├── datasources/
│   │   └── influxdb.yml            # Configuração do InfluxDB
│   └── dashboards/
│       └── dashboard.yml            # Configuração dos dashboards
│
├── documentacaoAPI/
│   ├── testes-carga-k6.md          # 📖 GUIA COMPLETO (LEIA ISTO!)
│   ├── api-endpoints.md
│   └── testes-unitarios.md
│
├── docker-compose-k6.yml           # InfluxDB + Grafana + App
├── setup-e-executar-testes.bat    # Script automático completo
├── INICIO-RAPIDO.md                # Guia rápido 5 minutos
└── README.md                        # Atualizado com seção de testes
```

---

## 🚀 Como Executar (5 Passos)

### 1️⃣ Instalar Dependências

```powershell
npm install
```

### 2️⃣ Iniciar InfluxDB e Grafana

```powershell
npm run k6:setup
```

✅ **InfluxDB**: http://localhost:8086  
✅ **Grafana**: http://localhost:3001 (admin/admin)

### 3️⃣ Popular Banco de Dados

```powershell
# 50.000 clientes
npm run populate:50k

# OU 20.000 clientes
npm run populate:20k
```

### 4️⃣ Iniciar Aplicação

Em um **novo terminal**:

```powershell
npm run dev
```

### 5️⃣ Executar Testes

```powershell
cd k6

# Cenário A (50/50)
.\run-cenario-a.bat

# Cenário B (75/25)
.\run-cenario-b.bat

# Cenário C (25/75)
.\run-cenario-c.bat
```

---

## 📊 Cenários de Teste

| Cenário | Leituras | Escritas | Total VUs | Duração |
|---------|----------|----------|-----------|---------|
| **A** | 50 VUs (50%) | 50 VUs (50%) | 100 | 5 min |
| **B** | 75 VUs (75%) | 25 VUs (25%) | 100 | 5 min |
| **C** | 25 VUs (25%) | 75 VUs (75%) | 100 | 5 min |

### Operações Testadas

**Leituras (GET)**:
- `GET /clientes/:id` - Buscar cliente por ID
- `GET /clientes` - Listar todos os clientes

**Escritas (POST)**:
- `POST /clientes/:id/deposito` - Realizar depósito
- `POST /clientes/:id/transferencia` - Transferir entre contas

---

## 📈 Visualização no Grafana

### Acesso
- **URL**: http://localhost:3001
- **Usuário**: admin
- **Senha**: admin

### Dashboard Recomendado

1. No Grafana, vá em **Dashboards** → **Import**
2. Digite o ID: **2587** (Dashboard oficial do K6)
3. Selecione **InfluxDB-K6** como datasource
4. Clique em **Import**

### Métricas Principais

| Métrica | Descrição | Meta |
|---------|-----------|------|
| **http_req_duration** | Tempo médio de resposta | < 200ms |
| **http_req_duration (p95)** | 95% das requisições | < 500ms |
| **http_req_failed** | Taxa de falha | < 1% |
| **http_reqs** | Requisições por segundo | Quanto maior, melhor |

---

## 🔬 Comparação de Datasets

### Dataset 50k vs 20k

```powershell
# Testar com 50k
npm run populate:50k
# Execute os 3 cenários

# Limpar banco
del database\dbfinance.sqlite
npm run migration:run

# Testar com 20k
npm run populate:20k
# Execute os 3 cenários novamente
```

### Resultados Esperados

**50.000 Registros**:
- ⚠️ Maior uso de memória
- ⚠️ Leituras podem ser mais lentas (sem índice secundário)
- ✅ Teste mais realista para produção

**20.000 Registros**:
- ✅ Menor uso de memória
- ✅ Leituras mais rápidas
- ✅ Melhor para desenvolvimento

---

## 📝 Estrutura de um Teste K6

```javascript
// Exemplo do cenario-a-50-50.js
export const options = {
  scenarios: {
    leituras: {
      executor: 'constant-vus',  // Usuários constantes
      vus: 50,                    // 50 usuários simultâneos
      duration: '5m',             // Duração de 5 minutos
      exec: 'realizarLeituras',   // Função a executar
    },
    escritas: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
      exec: 'realizarEscritas',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% < 500ms
    http_req_failed: ['rate<0.1'],     // < 10% de falhas
  },
};

// Carrega dados reais dos clientes
const clientes = new SharedArray('clientes', function () {
  return JSON.parse(open('./clientes-data.json'));
});

// Simula leituras
export function realizarLeituras() {
  const cliente = clientes[randomIntBetween(0, clientes.length - 1)];
  const res = http.get(`${BASE_URL}/clientes/${cliente.id}`, { headers });
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(randomIntBetween(1, 3));
}

// Simula escritas
export function realizarEscritas() {
  const cliente = clientes[randomIntBetween(0, 100)];
  const payload = JSON.stringify({ valor: randomIntBetween(10, 500) });
  const res = http.post(`${BASE_URL}/clientes/${cliente.id}/deposito`, payload, { headers });
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(randomIntBetween(1, 3));
}
```

---

## 🎓 Interpretação dos Resultados

### Exemplo de Output K6

```
✓ GET /clientes/:id - status 200......: 99.8%  ✓ 14532  ✗ 28
✓ POST /deposito - status 200..........: 98.5%  ✓ 7245   ✗ 112

checks.........................: 99.3%  ✓ 21777  ✗ 140
data_received..................: 5.2 MB 17 kB/s
data_sent......................: 2.8 MB 9.3 kB/s
http_req_duration..............: avg=142ms min=38ms med=115ms max=2.4s p(95)=320ms
  { expected_response:true }...: avg=138ms min=38ms med=112ms max=1.8s p(95)=298ms
http_req_failed................: 0.64%  ✓ 140    ✗ 21777
http_reqs......................: 21917  73.05/s
iteration_duration.............: avg=4.9s  min=2.3s med=4.7s max=11.2s
vus............................: 100    min=100  max=100
```

### O Que Observar

✅ **Bom Desempenho**:
- P95 < 500ms
- Taxa de erro < 1%
- > 100 req/s
- Checks > 99%

⚠️ **Necessita Otimização**:
- P95 > 1000ms
- Taxa de erro > 5%
- < 50 req/s
- Checks < 95%

---

## 🛠️ Comandos Úteis

### Docker

```powershell
# Iniciar serviços
npm run k6:setup

# Parar serviços
npm run k6:down

# Ver logs
docker-compose -f docker-compose-k6.yml logs -f grafana
docker-compose -f docker-compose-k6.yml logs -f influxdb

# Reiniciar tudo
npm run k6:down
npm run k6:setup
```

### Banco de Dados

```powershell
# Popular
npm run populate:50k
npm run populate:20k
npm run populate -- 35000  # Quantidade customizada

# Resetar banco
del database\dbfinance.sqlite
npm run migration:run
```

### K6

```powershell
# Teste rápido (30 segundos)
k6 run --duration 30s k6/cenario-a-50-50.js

# Sem enviar para InfluxDB
k6 run k6/cenario-a-50-50.js

# Com menos usuários
k6 run --vus 10 k6/cenario-a-50-50.js
```

---

## 📚 Documentação

1. **INICIO-RAPIDO.md** - Guia de 5 minutos ⚡
2. **documentacaoAPI/testes-carga-k6.md** - Guia completo 📖
3. **k6/README.md** - Detalhes dos scripts de teste

---

## ❓ Troubleshooting

| Problema | Solução |
|----------|---------|
| "Cannot find clientes-data.json" | Execute `npm run populate:50k` |
| "Connection refused :3000" | Inicie a app: `npm run dev` |
| "InfluxDB connection error" | Execute `npm run k6:setup` e aguarde 15s |
| "SQLITE_BUSY" | Normal em escritas intensas com SQLite |
| Grafana sem dados | Verifique se usou `--out influxdb=...` |

---

## 🎯 Checklist de Execução

- [ ] K6 instalado (`k6 version`)
- [ ] Docker rodando (`docker ps`)
- [ ] Dependências instaladas (`npm install`)
- [ ] InfluxDB/Grafana iniciados (`npm run k6:setup`)
- [ ] Banco populado (`npm run populate:50k`)
- [ ] App rodando (`npm run dev`)
- [ ] Executar Cenário A
- [ ] Executar Cenário B
- [ ] Executar Cenário C
- [ ] Analisar no Grafana
- [ ] Testar com 20k registros
- [ ] Comparar resultados
- [ ] Documentar conclusões

---

## 📊 Template de Relatório

```markdown
# Relatório de Testes de Desempenho

## Ambiente
- Dataset: 50.000 clientes
- Duração: 5 minutos por cenário
- Total VUs: 100

## Resultados

### Cenário A (50/50)
- RPS: XXX req/s
- P95 Latência: XXX ms
- Taxa de Erro: X.XX%
- Conclusão: ...

### Cenário B (75/25)
- RPS: XXX req/s
- P95 Latência: XXX ms
- Taxa de Erro: X.XX%
- Conclusão: ...

### Cenário C (25/75)
- RPS: XXX req/s
- P95 Latência: XXX ms
- Taxa de Erro: X.XX%
- Conclusão: ...

## Comparação 50k vs 20k
...

## Recomendações
...
```

---

## 🎉 Próximos Passos

1. ✅ Execute os testes com 50k registros
2. ✅ Execute os testes com 20k registros
3. ✅ Compare os resultados no Grafana
4. 📝 Documente suas conclusões
5. 🔧 Identifique gargalos
6. 💡 Proponha otimizações

---

**Boa sorte com os testes! 🚀**

Se precisar de ajuda, consulte a documentação completa em `documentacaoAPI/testes-carga-k6.md`.
