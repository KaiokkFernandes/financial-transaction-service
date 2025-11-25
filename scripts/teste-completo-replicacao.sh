#!/bin/bash
# Script Completo de Teste de Replicação
# Testa automaticamente a tolerância a falhas da API e do banco de dados

set -e  # Para em caso de erro

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funções auxiliares
log_info() {
    echo -e "${BLUE}ℹ ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_section() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Aguardar com contador visual
wait_with_countdown() {
    local seconds=$1
    local message=$2
    echo -ne "${message}"
    for ((i=seconds; i>0; i--)); do
        echo -ne "\r${message} ${i}s   "
        sleep 1
    done
    echo -e "\r${message} Pronto!     "
}

# Testar endpoint HTTP
test_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$http_code" = "$expected_status" ]; then
        return 0
    else
        return 1
    fi
}

# Verificar se container está rodando
check_container() {
    docker ps --format '{{.Names}}' | grep -q "^$1$"
}

# ============================================
# INÍCIO DO SCRIPT
# ============================================

clear
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🧪 TESTE AUTOMATIZADO DE REPLICAÇÃO                     ║
║     Financial Transaction Service                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

log_info "Iniciando testes de tolerância a falhas..."
echo ""

# ============================================
# FASE 1: PREPARAÇÃO DO AMBIENTE
# ============================================

log_section "FASE 1: PREPARAÇÃO DO AMBIENTE"

log_info "Parando containers anteriores..."
docker compose -f docker-compose-replication.yml down -v > /dev/null 2>&1 || true
log_success "Ambiente limpo"

log_info "Construindo imagens Docker..."
docker compose -f docker-compose-replication.yml build --no-cache > /dev/null 2>&1
log_success "Imagens construídas"

log_info "Iniciando containers..."
docker compose -f docker-compose-replication.yml up -d
log_success "Containers iniciados"

wait_with_countdown 30 "Aguardando containers ficarem saudáveis..."

# Verificar se todos os containers estão rodando
containers=("financial-db-master" "financial-db-replica" "financial-api-1" "financial-api-2" "financial-api-3" "financial-nginx-lb")
all_running=true

for container in "${containers[@]}"; do
    if check_container "$container"; then
        log_success "Container $container está rodando"
    else
        log_error "Container $container NÃO está rodando"
        all_running=false
    fi
done

if [ "$all_running" = false ]; then
    log_error "Alguns containers não estão rodando. Abortando testes."
    log_info "Execute: docker compose -f docker-compose-replication.yml logs"
    exit 1
fi

# ============================================
# FASE 2: CONFIGURAÇÃO INICIAL
# ============================================

log_section "FASE 2: CONFIGURAÇÃO INICIAL DO BANCO"

log_info "Executando migrations..."
docker exec financial-api-1 npm run migration:run > /dev/null 2>&1 || log_warning "Migrations já executadas ou erro"

log_info "Populando banco de dados com 1000 clientes..."
docker exec financial-api-1 npm run populate 1000 > /dev/null 2>&1 || log_warning "Banco já populado ou erro"

log_success "Banco de dados configurado"

# ============================================
# FASE 3: TESTE DE BASELINE
# ============================================

log_section "FASE 3: TESTE DE BASELINE (Sistema Normal)"

log_info "Testando conectividade básica..."

if test_endpoint "http://localhost/health"; then
    log_success "Nginx responde corretamente"
else
    log_error "Nginx não está respondendo"
    exit 1
fi

log_info "Testando balanceamento de carga (10 requisições)..."
replicas_found=()
for i in {1..10}; do
    response=$(curl -s http://localhost/health 2>/dev/null)
    replica=$(echo "$response" | grep -o '"replica":"[0-9]"' | grep -o '[0-9]' || echo "?")
    replicas_found+=("$replica")
    echo -ne "\rRequisição $i: Réplica $replica   "
    sleep 0.2
done
echo ""

unique_replicas=$(printf '%s\n' "${replicas_found[@]}" | sort -u | wc -l)
log_info "Réplicas únicas detectadas: $unique_replicas/3"

if [ "$unique_replicas" -ge 2 ]; then
    log_success "Load balancer está distribuindo carga entre múltiplas réplicas"
else
    log_warning "Load balancer pode não estar distribuindo corretamente"
fi

# Teste de throughput baseline
log_info "Medindo throughput baseline (20 requisições)..."
start_time=$(date +%s)
success_count=0
for i in {1..20}; do
    if test_endpoint "http://localhost/clientes/1"; then
        ((success_count++))
    fi
done
end_time=$(date +%s)
duration=$((end_time - start_time))
throughput=$(echo "scale=2; $success_count / $duration" | bc)

log_success "Throughput baseline: $throughput req/s (${success_count}/20 sucessos em ${duration}s)"

# ============================================
# FASE 4: TESTE DE FALHA DE 1 RÉPLICA DA API
# ============================================

log_section "FASE 4: TESTE DE FALHA DE 1 RÉPLICA DA API"

log_info "Parando API Réplica 1..."
docker stop financial-api-1 > /dev/null 2>&1
log_warning "API Réplica 1 PARADA"

wait_with_countdown 10 "Aguardando Nginx detectar falha..."

log_info "Testando disponibilidade com 2 réplicas ativas..."
failed_requests=0
for i in {1..20}; do
    if ! test_endpoint "http://localhost/health"; then
        ((failed_requests++))
    fi
    echo -ne "\rTestando... ${i}/20 requisições   "
done
echo ""

availability=$(echo "scale=2; (20 - $failed_requests) / 20 * 100" | bc)
log_info "Taxa de sucesso: $availability% (${failed_requests} falhas)"

if [ "$failed_requests" -eq 0 ]; then
    log_success "Sistema manteve 100% de disponibilidade com 1 réplica fora"
elif [ "$failed_requests" -lt 3 ]; then
    log_warning "Sistema teve degradação mínima ($availability% disponível)"
else
    log_error "Sistema teve degradação significativa ($availability% disponível)"
fi

log_info "Verificando balanceamento entre 2 réplicas..."
replicas_after_failure=()
for i in {1..10}; do
    response=$(curl -s http://localhost/health 2>/dev/null)
    replica=$(echo "$response" | grep -o '"replica":"[0-9]"' | grep -o '[0-9]' || echo "?")
    replicas_after_failure+=("$replica")
done

unique_after=$(printf '%s\n' "${replicas_after_failure[@]}" | sort -u | wc -l)
log_info "Réplicas ativas detectadas: $unique_after (esperado: 2)"

if [ "$unique_after" -eq 2 ]; then
    log_success "Nginx redistribuiu carga para as 2 réplicas restantes"
else
    log_warning "Distribuição pode não estar ideal"
fi

# Recuperando réplica
log_info "Recuperando API Réplica 1..."
docker start financial-api-1 > /dev/null 2>&1
log_success "API Réplica 1 reiniciada"

wait_with_countdown 15 "Aguardando réplica ficar saudável..."

log_info "Verificando recuperação automática..."
replicas_recovered=()
for i in {1..10}; do
    response=$(curl -s http://localhost/health 2>/dev/null)
    replica=$(echo "$response" | grep -o '"replica":"[0-9]"' | grep -o '[0-9]' || echo "?")
    replicas_recovered+=("$replica")
done

unique_recovered=$(printf '%s\n' "${replicas_recovered[@]}" | sort -u | wc -l)

if [ "$unique_recovered" -eq 3 ]; then
    log_success "Sistema recuperado! Todas as 3 réplicas respondendo"
else
    log_warning "Apenas $unique_recovered réplicas detectadas (esperado: 3)"
fi

# ============================================
# FASE 5: TESTE DE FALHA DE 2 RÉPLICAS DA API
# ============================================

log_section "FASE 5: TESTE DE FALHA DE 2 RÉPLICAS DA API (Estresse)"

log_info "Parando API Réplicas 1 e 2..."
docker stop financial-api-1 financial-api-2 > /dev/null 2>&1
log_warning "APIs Réplicas 1 e 2 PARADAS (apenas réplica 3 ativa)"

wait_with_countdown 10 "Aguardando Nginx detectar falhas..."

log_info "Testando disponibilidade com apenas 1 réplica..."
failed_stress=0
latencies=()
for i in {1..30}; do
    start=$(date +%s%N)
    if test_endpoint "http://localhost/health"; then
        end=$(date +%s%N)
        latency=$(((end - start) / 1000000))  # Converter para ms
        latencies+=("$latency")
    else
        ((failed_stress++))
        latencies+=(9999)
    fi
    echo -ne "\rTestando... ${i}/30 requisições   "
done
echo ""

stress_availability=$(echo "scale=2; (30 - $failed_stress) / 30 * 100" | bc)
avg_latency=$(printf '%s\n' "${latencies[@]}" | awk '{sum+=$1; count++} END {print sum/count}')

log_info "Disponibilidade com 1 réplica: $stress_availability%"
log_info "Latência média: ${avg_latency}ms"

if [ "$failed_stress" -eq 0 ]; then
    log_success "Sistema manteve 100% disponibilidade mesmo com 66% das réplicas fora"
elif [ "$stress_availability" -gt 90 ]; then
    log_warning "Sistema operou com degradação aceitável ($stress_availability%)"
else
    log_error "Sistema teve degradação significativa ($stress_availability%)"
fi

# Recuperando réplicas
log_info "Recuperando todas as réplicas..."
docker start financial-api-1 financial-api-2 > /dev/null 2>&1
log_success "Réplicas reiniciadas"

wait_with_countdown 15 "Aguardando recuperação completa..."

# ============================================
# FASE 6: TESTE DE REPLICAÇÃO DO BANCO
# ============================================

log_section "FASE 6: TESTE DE REPLICAÇÃO DO BANCO DE DADOS"

log_info "Verificando status da replicação PostgreSQL..."

# Verificar replicação no master
replication_status=$(docker exec financial-db-master psql -U finance_user -d financial_db -t -c "SELECT count(*) FROM pg_stat_replication;" 2>/dev/null | tr -d ' ')

if [ "$replication_status" -ge 1 ]; then
    log_success "Replicação PostgreSQL está ativa (${replication_status} replica conectada)"
else
    log_warning "Replicação PostgreSQL pode não estar configurada corretamente"
fi

# Verificar se replica está em recovery mode
is_replica=$(docker exec financial-db-replica psql -U finance_user -d financial_db -t -c "SELECT pg_is_in_recovery();" 2>/dev/null | tr -d ' ')

if [ "$is_replica" = "t" ]; then
    log_success "Replica está em modo recovery (standby ativo)"
else
    log_warning "Replica não está em modo recovery"
fi

log_info "Inserindo dados no master..."
docker exec financial-db-master psql -U finance_user -d financial_db -c "INSERT INTO clientes (nome, saldo, api_key) VALUES ('Teste Replicacao', 1000, 'test-key-$(date +%s)');" > /dev/null 2>&1

wait_with_countdown 5 "Aguardando replicação..."

log_info "Verificando se dados foram replicados..."
count_master=$(docker exec financial-db-master psql -U finance_user -d financial_db -t -c "SELECT count(*) FROM clientes WHERE nome='Teste Replicacao';" 2>/dev/null | tr -d ' ')
count_replica=$(docker exec financial-db-replica psql -U finance_user -d financial_db -t -c "SELECT count(*) FROM clientes WHERE nome='Teste Replicacao';" 2>/dev/null | tr -d ' ')

log_info "Registros no Master: $count_master"
log_info "Registros na Replica: $count_replica"

if [ "$count_master" = "$count_replica" ] && [ "$count_master" -gt 0 ]; then
    log_success "Dados foram replicados corretamente!"
else
    log_warning "Replicação pode estar com lag ou desconfigurada"
fi

# ============================================
# FASE 7: TESTE DE FALHA DO BANCO MASTER
# ============================================

log_section "FASE 7: TESTE DE FALHA DO BANCO MASTER (Crítico)"

log_warning "⚠️  Este teste causará downtime esperado ⚠️"

log_info "Parando PostgreSQL Master..."
docker stop financial-db-master > /dev/null 2>&1
log_error "BANCO MASTER PARADO"

wait_with_countdown 5 "Aguardando propagação da falha..."

log_info "Testando APIs sem banco master..."
failed_db=0
for i in {1..10}; do
    if test_endpoint "http://localhost/clientes/1"; then
        echo -ne "\rRequisição $i: OK   "
    else
        ((failed_db++))
        echo -ne "\rRequisição $i: ERRO   "
    fi
    sleep 0.5
done
echo ""

if [ "$failed_db" -eq 10 ]; then
    log_success "Comportamento esperado: Todas as requisições falharam (sem banco master)"
else
    log_warning "${failed_db}/10 requisições falharam"
fi

log_info "Recuperando PostgreSQL Master..."
docker start financial-db-master > /dev/null 2>&1
log_success "Banco Master reiniciado"

wait_with_countdown 20 "Aguardando reconexão das APIs..."

log_info "Testando recuperação após falha do banco..."
recovered=0
for i in {1..10}; do
    if test_endpoint "http://localhost/clientes/1"; then
        ((recovered++))
    fi
    echo -ne "\rTestando recuperação... ${i}/10   "
    sleep 1
done
echo ""

recovery_rate=$(echo "scale=2; $recovered / 10 * 100" | bc)

if [ "$recovery_rate" -gt 80 ]; then
    log_success "Sistema recuperado com sucesso ($recovery_rate% disponível)"
else
    log_warning "Sistema ainda recuperando ($recovery_rate% disponível)"
fi

# ============================================
# RESUMO FINAL
# ============================================

log_section "RESUMO DOS TESTES"

echo ""
echo -e "${CYAN}┌─────────────────────────────────────────────────────────┐${NC}"
echo -e "${CYAN}│                   RESULTADOS FINAIS                     │${NC}"
echo -e "${CYAN}├─────────────────────────────────────────────────────────┤${NC}"
echo -e "${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  📊 Teste de Baseline:"
echo -e "${CYAN}│${NC}     • Throughput: $throughput req/s"
echo -e "${CYAN}│${NC}     • Balanceamento: $unique_replicas/3 réplicas"
echo -e "${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  🔥 Falha de 1 Réplica API:"
echo -e "${CYAN}│${NC}     • Disponibilidade: $availability%"
echo -e "${CYAN}│${NC}     • Réplicas ativas: $unique_after/2"
echo -e "${CYAN}│${NC}     • Recuperação: $unique_recovered/3 réplicas"
echo -e "${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  ⚡ Falha de 2 Réplicas API:"
echo -e "${CYAN}│${NC}     • Disponibilidade: $stress_availability%"
echo -e "${CYAN}│${NC}     • Latência média: ${avg_latency}ms"
echo -e "${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  🗄️  Replicação do Banco:"
echo -e "${CYAN}│${NC}     • Status: $replication_status replica(s) conectada(s)"
echo -e "${CYAN}│${NC}     • Registros Master: $count_master"
echo -e "${CYAN}│${NC}     • Registros Replica: $count_replica"
echo -e "${CYAN}│${NC}"
echo -e "${CYAN}│${NC}  💥 Falha do Banco Master:"
echo -e "${CYAN}│${NC}     • Falhas durante downtime: ${failed_db}/10"
echo -e "${CYAN}│${NC}     • Recuperação: $recovery_rate%"
echo -e "${CYAN}│${NC}"
echo -e "${CYAN}└─────────────────────────────────────────────────────────┘${NC}"
echo ""

# Avaliação final
total_score=0
max_score=5

[ "$unique_replicas" -ge 2 ] && ((total_score++))
[ "$failed_requests" -le 2 ] && ((total_score++))
[ "$stress_availability" -gt 80 ] && ((total_score++))
[ "$count_master" = "$count_replica" ] && ((total_score++))
[ "$recovery_rate" -gt 80 ] && ((total_score++))

echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
if [ "$total_score" -eq 5 ]; then
    echo -e "${GREEN}║  🎉 EXCELENTE! Todos os testes passaram ($total_score/$max_score)           ║${NC}"
    echo -e "${GREEN}║  Sistema com tolerância a falhas funcionando perfeitamente${NC}"
elif [ "$total_score" -ge 3 ]; then
    echo -e "${YELLOW}║  ✓ BOM! Maioria dos testes passou ($total_score/$max_score)                 ║${NC}"
    echo -e "${YELLOW}║  Sistema tem tolerância a falhas com algumas limitações   ${NC}"
else
    echo -e "${RED}║  ⚠ ATENÇÃO! Poucos testes passaram ($total_score/$max_score)               ║${NC}"
    echo -e "${RED}║  Sistema precisa de ajustes na configuração              ${NC}"
fi
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"

echo ""
log_info "Para ver logs detalhados: docker compose -f docker-compose-replication.yml logs -f"
log_info "Para parar tudo: docker compose -f docker-compose-replication.yml down"
echo ""
