#!/bin/bash
# Script para executar teste de falha de réplica da API

echo "🧪 Iniciando teste de falha de réplica da API"
echo "=============================================="
echo ""

# Verificar se o sistema está rodando
if ! docker ps | grep -q "financial-api-1"; then
    echo "❌ Sistema não está rodando!"
    echo "Execute: docker-compose -f docker-compose-replication.yml up -d"
    exit 1
fi

echo "✅ Sistema está rodando"
echo ""
echo "📊 Iniciando teste K6..."
echo "⚠️  LEMBRETE: Execute os comandos de falha conforme as instruções!"
echo ""

# Executar K6
docker run --rm -i --network host \
  -e BASE_URL=http://localhost \
  grafana/k6 run - <k6/teste-falha-replica-api.js

echo ""
echo "✅ Teste concluído!"
