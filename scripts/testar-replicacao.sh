#!/bin/bash
# Guia Prático de Testes - Replicação e Tolerância a Falhas

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧪 GUIA PRÁTICO DE TESTES - TOLERÂNCIA A FALHAS            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para executar comandos com feedback
run_command() {
    echo -e "${BLUE}▶ $1${NC}"
    eval $2
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Sucesso!${NC}\n"
    else
        echo -e "${RED}✗ Erro!${NC}\n"
        return 1
    fi
}

echo -e "${YELLOW}PASSO 1: Subir toda a arquitetura${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_command "Iniciando containers..." "docker compose -f docker-compose-replication.yml up --build -d"

sleep 10

echo -e "${YELLOW}PASSO 2: Verificar status dos containers${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose -f docker-compose-replication.yml ps
echo ""

echo -e "${YELLOW}PASSO 3: Aguardar containers ficarem saudáveis (30s)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
for i in {30..1}; do
    echo -ne "\rAguardando... $i segundos   "
    sleep 1
done
echo -e "\n${GREEN}✓ Pronto!${NC}\n"

echo -e "${YELLOW}PASSO 4: Testar health checks${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Testando Nginx (Load Balancer)..."
curl -s http://localhost/health | jq . || curl -s http://localhost/health
echo -e "\n"

echo "🔍 Verificar qual réplica responde (deve alternar entre 1, 2, 3):"
for i in {1..6}; do
    echo -n "Requisição $i: "
    curl -s http://localhost/health | grep -o '"replica":"[0-9]"' || echo "erro"
done
echo ""

echo -e "${YELLOW}PASSO 5: Executar migrations e popular banco${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_command "Executando migrations..." "docker exec financial-api-1 npm run migration:run"
run_command "Populando banco com 5000 clientes..." "docker exec financial-api-1 npm run populate:20k"

echo -e "${YELLOW}PASSO 6: Verificar replicação do PostgreSQL${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Status de replicação no Master:"
docker exec financial-db-master psql -U finance_user -d financial_db -c "SELECT * FROM pg_stat_replication;"
echo ""

echo "🔍 Status da Replica (deve estar em recovery mode):"
docker exec financial-db-replica psql -U finance_user -d financial_db -c "SELECT pg_is_in_recovery();"
echo ""

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✓ SISTEMA PRONTO PARA TESTES!                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📊 PRÓXIMOS TESTES DISPONÍVEIS:${NC}"
echo ""
echo "1️⃣  Teste de Baseline (sem falhas):"
echo "   curl http://localhost/clientes | jq ."
echo ""
echo "2️⃣  Teste de Falha de 1 Réplica da API:"
echo "   Terminal 1: docker compose -f docker-compose-replication.yml logs -f"
echo "   Terminal 2: docker stop financial-api-1"
echo "   Terminal 3: while true; do curl -s http://localhost/health | jq .replica; sleep 1; done"
echo "   Observe que apenas api2 e api3 respondem!"
echo ""
echo "3️⃣  Recuperar réplica:"
echo "   docker start financial-api-1"
echo "   (Nginx detecta automaticamente e volta a distribuir carga)"
echo ""
echo "4️⃣  Teste de Falha do Banco Master:"
echo "   Terminal 1: while true; do curl -s http://localhost/clientes/1; sleep 1; done"
echo "   Terminal 2: docker stop financial-db-master"
echo "   Observe os erros! Depois: docker start financial-db-master"
echo ""
echo "5️⃣  Ver logs em tempo real:"
echo "   docker compose -f docker-compose-replication.yml logs -f"
echo ""
echo "6️⃣  Parar tudo:"
echo "   docker compose -f docker-compose-replication.yml down"
echo ""
