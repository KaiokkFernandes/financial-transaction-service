@echo off
echo ==========================================
echo   K6 Load Test - Cenario A (50/50)
echo ==========================================
echo.
echo Executando teste com:
echo - 50 usuarios fazendo LEITURAS
echo - 50 usuarios fazendo ESCRITAS
echo - Duracao: 5 minutos
echo.

k6 run --out influxdb=http://localhost:8086/k6 cenario-a-50-50.js

echo.
echo ==========================================
echo   Teste concluido!
echo   Acesse o Grafana: http://localhost:3001
echo   Usuario: admin / Senha: admin
echo ==========================================
pause
