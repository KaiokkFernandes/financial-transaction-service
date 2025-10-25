# Início Rápido - Testes de Carga

Este guia mostra como executar rapidamente os testes de desempenho.

## ⚡ Passos Rápidos

### 1. Iniciar InfluxDB e Grafana

```powershell
npm run k6:setup
```

Aguarde 10-15 segundos para os serviços iniciarem.

### 2. Popular o Banco de Dados

```powershell
npm run populate:50k
```

Aguarde 2-5 minutos. Você verá o progresso no terminal.

### 3. Iniciar a Aplicação

Em um **novo terminal**:

```powershell
npm run dev
```

Aguarde até ver: `Servidor rodando na porta 3000`

### 4. Executar os Testes

Em outro terminal:

```powershell
cd k6

# Cenário A
.\run-cenario-a.bat

# Aguarde terminar, depois:
.\run-cenario-b.bat

# Aguarde terminar, depois:
.\run-cenario-c.bat
```

### 5. Visualizar Resultados

Abra o navegador em: **http://localhost:3001**

- Usuário: `admin`
- Senha: `admin`

## 🎯 Script Automático (Opcional)

Execute tudo de uma vez:

```powershell
.\setup-e-executar-testes.bat
```

**Atenção**: Você ainda precisará iniciar a aplicação manualmente quando solicitado.

## 📊 Primeiro Dashboard no Grafana

1. Acesse http://localhost:3001
2. Clique em "Dashboards" no menu lateral
3. Clique em "New" → "Import"
4. Digite o ID: **2587**
5. Clique em "Load"
6. Selecione "InfluxDB-K6" como datasource
7. Clique em "Import"

Pronto! Você verá as métricas em tempo real.

## 🔄 Comparar com 20k Registros

```powershell
# Backup do banco atual (opcional)
copy database\dbfinance.sqlite database\dbfinance-50k.sqlite

# Deletar banco
del database\dbfinance.sqlite

# Recriar estrutura
npm run migration:run

# Popular com 20k
npm run populate:20k

# Executar testes novamente
cd k6
.\run-cenario-a.bat
.\run-cenario-b.bat
.\run-cenario-c.bat
```

## ❓ Problemas Comuns

### "Cannot find module clientes-data.json"
**Solução**: Execute `npm run populate:50k`

### "Connection refused to localhost:3000"
**Solução**: Inicie a aplicação com `npm run dev`

### "InfluxDB connection error"
**Solução**: Execute `npm run k6:setup` e aguarde 15 segundos

## 📚 Documentação Completa

Para detalhes completos, consulte:
- `documentacaoAPI/testes-carga-k6.md` - Guia completo
- `k6/README.md` - Sobre os scripts de teste
