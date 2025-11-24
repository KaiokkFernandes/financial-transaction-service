#!/bin/bash
# Script para executar teste de múltiplas falhas

echo "🧪 Iniciando teste de múltiplas falhas simultâneas"
echo "==================================================="
echo ""

# Executar K6
docker run --rm -i --network host \
  -e BASE_URL=http://localhost \
  grafana/k6 run - <k6/teste-multiplas-falhas.js

echo ""
echo "✅ Teste concluído!"
