# ❓ FAQ - Testes de Carga com K6 e Grafana

## Perguntas Frequentes sobre os Testes de Desempenho

---

## 📦 Instalação e Configuração

### Q1: Como instalar o K6 no Windows?

**R:** Baixe o instalador oficial:
1. Acesse: https://k6.io/docs/get-started/installation/
2. Baixe o instalador Windows (`.msi`)
3. Execute e siga o assistente
4. Verifique: `k6 version`

Alternativamente, use Chocolatey:
```powershell
choco install k6
```

---

### Q2: Docker Desktop não inicia os containers

**R:** Verifique:
1. Docker Desktop está rodando: procure o ícone na bandeja
2. WSL2 está instalado e atualizado
3. Virtualização está habilitada na BIOS
4. Execute: `docker-compose -f docker-compose-k6.yml up -d`
5. Veja os logs: `docker-compose -f docker-compose-k6.yml logs`

---

### Q3: Como verificar se InfluxDB e Grafana estão rodando?

**R:** Execute:
```powershell
docker ps
```

Você deve ver:
- `influxdb` - porta 8086
- `grafana` - porta 3001

Ou teste manualmente:
- InfluxDB: http://localhost:8086/ping
- Grafana: http://localhost:3001

---

## 🗄️ População do Banco de Dados

### Q4: Quanto tempo leva para popular 50k registros?

**R:** Aproximadamente **2-5 minutos**, dependendo do hardware. O script processa em lotes de 1.000 para otimizar.

---

### Q5: Posso popular com quantidade diferente?

**R:** Sim! Use:
```powershell
npm run populate -- 35000
```

Ou adicione um script customizado no `package.json`:
```json
"populate:35k": "ts-node scripts/populate-database.ts 35000"
```

---

### Q6: O arquivo `clientes-data.json` não foi criado

**R:** Verifique:
1. O script de população foi executado com sucesso?
2. Não houve erros no terminal?
3. O arquivo deve estar em: `k6/clientes-data.json`
4. Execute novamente: `npm run populate:50k`

---

### Q7: Como resetar o banco de dados?

**R:** 
```powershell
# Deletar banco
del database\dbfinance.sqlite

# Recriar estrutura
npm run migration:run

# Popular novamente
npm run populate:50k
```

---

## 🚀 Execução dos Testes

### Q8: Erro "Cannot find module clientes-data.json"

**R:** Execute primeiro:
```powershell
npm run populate:50k
```

Isso criará o arquivo `k6/clientes-data.json` necessário.

---

### Q9: Erro "Connection refused to localhost:3000"

**R:** A aplicação não está rodando. Em um terminal separado:
```powershell
npm run dev
```

Aguarde até ver: `Servidor rodando na porta 3000`

---

### Q10: K6 não envia dados para InfluxDB

**R:** Verifique:
1. InfluxDB está rodando: `docker ps | findstr influxdb`
2. Você está usando a flag `--out`: 
   ```powershell
   k6 run --out influxdb=http://localhost:8086/k6 k6/cenario-a-50-50.js
   ```
3. Use os scripts `.bat` que já incluem essa configuração

---

### Q11: Posso executar os cenários em sequência automaticamente?

**R:** Sim! Use o script fornecido:
```powershell
.\setup-e-executar-testes.bat
```

Ou manualmente com intervalo:
```powershell
cd k6
.\run-cenario-a.bat
timeout /t 30
.\run-cenario-b.bat
timeout /t 30
.\run-cenario-c.bat
```

---

### Q12: Como reduzir a duração dos testes?

**R:** Edite os scripts K6 e altere a duração:
```javascript
export const options = {
  scenarios: {
    leituras: {
      executor: 'constant-vus',
      vus: 50,
      duration: '1m',  // ← Altere aqui (era 5m)
      exec: 'realizarLeituras',
    },
    // ...
  },
};
```

Ou use a linha de comando:
```powershell
k6 run --duration 30s k6/cenario-a-50-50.js
```

---

## 📊 Grafana e Visualização

### Q13: Grafana não mostra dados

**R:** Checklist:
1. ✅ InfluxDB está rodando?
2. ✅ K6 foi executado com `--out influxdb=...`?
3. ✅ Time range no Grafana está correto? (Last 15 minutes)
4. ✅ Datasource "InfluxDB-K6" está configurado?
5. ✅ Database está definida como "k6"?

Teste a conexão:
1. No Grafana: Configuration → Data Sources
2. Clique em "InfluxDB-K6"
3. Clique em "Save & Test"

---

### Q14: Como importar o dashboard oficial do K6?

**R:** 
1. No Grafana: Dashboards → Import
2. Digite o ID: **2587**
3. Clique em "Load"
4. Selecione "InfluxDB-K6" como datasource
5. Clique em "Import"

---

### Q15: Posso criar meu próprio dashboard?

**R:** Sim! Consulte `grafana/QUERIES-GRAFANA.md` para queries prontas.

Passos básicos:
1. Dashboards → New Dashboard
2. Add visualization
3. Selecione "InfluxDB-K6"
4. Adicione uma query (veja exemplos no arquivo)
5. Configure visualização
6. Salve o dashboard

---

### Q16: Como exportar o dashboard?

**R:** 
1. Abra o dashboard
2. Clique no ícone de compartilhamento (📤)
3. Export → Save to file
4. Salve o arquivo JSON

Para importar depois:
1. Dashboards → Import
2. Upload JSON file
3. Selecione o arquivo

---

## 🐛 Problemas Comuns

### Q17: "SQLITE_BUSY: database is locked"

**R:** **Isto é esperado com SQLite!** 

SQLite tem limitações com escritas concorrentes. Soluções:

**Temporária**:
- Reduza o número de VUs de escrita
- Use `--vus 50` em vez de 75

**Definitiva**:
- Migre para PostgreSQL ou MySQL em produção
- Implemente um sistema de filas para escritas

---

### Q18: Latência muito alta (> 2 segundos)

**R:** Possíveis causas:
1. **Hardware**: Máquina sobrecarregada
2. **SQLite**: Contenção em escritas concorrentes
3. **Ausência de índices**: Adicione índices no campo `id`
4. **Muitos VUs**: Reduza para 50 total

Debug:
```powershell
# Monitore recursos
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Select-Object CPU, Memory
```

---

### Q19: Taxa de erro muito alta (> 10%)

**R:** Investigue:
1. Veja os logs da aplicação (`npm run dev`)
2. Identifique quais endpoints estão falhando
3. Verifique erros no K6:
   ```
   checks.........................: 85.3% ✓ 12456 ✗ 2145
   ```

Causas comuns:
- Saldo insuficiente em transferências (esperado)
- Timeout da aplicação
- Erro 500 (bug no código)

---

### Q20: Aplicação trava durante o teste

**R:** 
1. **Reinicie a aplicação**: Ctrl+C e `npm run dev`
2. **Reduza carga**: Use menos VUs
3. **Adicione timeout** no K6:
   ```javascript
   export const options = {
     httpDebug: 'full',
     timeout: '60s',
   };
   ```

---

## 📈 Análise de Resultados

### Q21: O que é um bom valor de RPS?

**R:** Depende do contexto:
- **< 50 req/s**: Baixo (necessita otimização)
- **50-150 req/s**: Razoável para SQLite
- **> 150 req/s**: Bom desempenho
- **> 500 req/s**: Excelente (improvável com SQLite)

---

### Q22: Qual deve ser a latência P95 ideal?

**R:** 
- **Excelente**: < 200ms
- **Bom**: 200-500ms
- **Aceitável**: 500-1000ms
- **Ruim**: > 1000ms

Para aplicações financeiras, alvo: **< 300ms**.

---

### Q23: Taxa de erro aceitável?

**R:** 
- **Ótimo**: < 0.5%
- **Bom**: 0.5-1%
- **Aceitável**: 1-5%
- **Problemático**: > 5%

**Nota**: Alguns erros de "saldo insuficiente" são esperados em transferências.

---

### Q24: Como comparar os três cenários?

**R:** Crie uma tabela:

| Métrica | Cenário A | Cenário B | Cenário C | Melhor |
|---------|-----------|-----------|-----------|---------|
| RPS | 120 | 150 | 90 | B |
| P95 | 320ms | 280ms | 450ms | B |
| Erro % | 0.8% | 0.5% | 1.5% | B |

**Interpretação**:
- **B (75/25)**: Melhor performance (leituras são mais rápidas)
- **C (25/75)**: Pior performance (escritas são mais lentas)

---

## 🔄 Comparação de Datasets

### Q25: Por que 20k é mais rápido que 50k?

**R:** Vários fatores:
1. **Menor arquivo de banco**: Carrega mais rápido na memória
2. **Cache hit rate**: Maior probabilidade de dados estarem em cache
3. **Menos I/O**: Menos operações de disco

**Mas**: A diferença pode ser pequena para operações indexadas (busca por ID).

---

### Q26: Como documentar a comparação?

**R:** Use o template fornecido:
`documentacaoAPI/TEMPLATE-RELATORIO.md`

Preencha as tabelas comparativas:
```
| Métrica | 50k | 20k | Δ (Melhoria) |
|---------|-----|-----|--------------|
| RPS     | 120 | 135 | +12.5%       |
| P95     | 320 | 280 | -12.5%       |
```

---

## 🛠️ Customização

### Q27: Como testar com mais usuários (200 VUs)?

**R:** Edite os scripts K6:
```javascript
export const options = {
  scenarios: {
    leituras: {
      vus: 100,  // Era 50
      // ...
    },
    escritas: {
      vus: 100,  // Era 50
      // ...
    },
  },
};
```

**Atenção**: SQLite pode não suportar essa carga!

---

### Q28: Como adicionar novos endpoints nos testes?

**R:** Edite os scripts e adicione chamadas:
```javascript
export function realizarLeituras() {
  // Endpoint existente
  const res = http.get(`${BASE_URL}/clientes/${cliente.id}`, { headers });
  
  // Novo endpoint
  const resExtrato = http.get(`${BASE_URL}/clientes/${cliente.id}/extrato`, { headers });
  check(resExtrato, {
    'GET /extrato - status 200': (r) => r.status === 200,
  });
}
```

---

### Q29: Como salvar resultados em arquivo?

**R:** 
```powershell
# Salvar resumo
k6 run k6/cenario-a-50-50.js > resultados-cenario-a.txt

# Salvar JSON completo
k6 run --out json=resultados-a.json k6/cenario-a-50-50.js
```

---

## 🎓 Aprendizado

### Q30: Onde aprender mais sobre K6?

**R:** 
- **Documentação oficial**: https://k6.io/docs/
- **Exemplos**: https://k6.io/docs/examples/
- **Tutoriais**: https://k6.io/learn/
- **YouTube**: Procure "K6 load testing"

---

### Q31: Onde aprender mais sobre Grafana?

**R:** 
- **Documentação**: https://grafana.com/docs/
- **Tutoriais**: https://grafana.com/tutorials/
- **Queries InfluxDB**: https://docs.influxdata.com/influxdb/v1.8/query_language/

---

## 💡 Dicas Avançadas

### Q32: Como testar em diferentes horários?

**R:** Use agendador do Windows (Task Scheduler):
1. Crie um script `.bat` que executa o teste
2. Agende para rodar à noite, manhã, tarde
3. Compare resultados por horário

---

### Q33: Como simular usuários de diferentes regiões?

**R:** K6 Cloud oferece isso nativamente, mas para local:
1. Use `--http2` para simular diferentes conexões
2. Adicione delays variáveis:
   ```javascript
   sleep(randomIntBetween(1, 5)); // Simula latência de rede
   ```

---

### Q34: Como integrar com CI/CD?

**R:** Exemplo de GitHub Actions:
```yaml
- name: Run K6 Load Test
  run: |
    k6 run --out json=results.json k6/cenario-a-50-50.js
    
- name: Upload Results
  uses: actions/upload-artifact@v2
  with:
    name: k6-results
    path: results.json
```

---

## 🆘 Suporte

### Q35: Onde reportar bugs?

**R:** 
- **K6**: https://github.com/grafana/k6/issues
- **Grafana**: https://github.com/grafana/grafana/issues
- **Projeto**: GitHub Issues do seu repositório

---

### Q36: Preciso de ajuda, o que fazer?

**R:** 
1. Leia a documentação completa: `documentacaoAPI/testes-carga-k6.md`
2. Consulte este FAQ
3. Verifique os logs: `docker-compose logs`
4. Procure no Stack Overflow: tag `k6` ou `grafana`
5. Entre na comunidade K6: https://community.k6.io/

---

**Última atualização**: ___/___/___  
**Contribua**: Encontrou algo que deveria estar aqui? Adicione! 😊
