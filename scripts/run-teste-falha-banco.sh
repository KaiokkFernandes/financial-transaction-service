#!/bin/bash
# Script para executar teste de falha do banco de dados

echo "🧪 Iniciando teste de falha do banco master"
echo "============================================"
echo ""

# Verificar se o sistema está rodando
if ! docker ps | grep -q "financial-db-master"; then
    echo "❌ Banco master não está rodando!"
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
  grafana/k6 run - <k6/teste-falha-banco.js

echo ""
echo "✅ Teste concluído!"
