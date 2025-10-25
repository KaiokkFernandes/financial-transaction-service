@echo off
echo ==========================================
echo   K6 Load Test - Cenario B (75/25)
echo ==========================================
echo.
echo Executando teste com:
echo - 75 usuarios fazendo LEITURAS
echo - 25 usuarios fazendo ESCRITAS
echo - Duracao: 5 minutos
echo.

k6 run --out influxdb=http://localhost:8086/k6 cenario-b-75-25.js

echo.
echo ==========================================
echo   Teste concluido!
echo   Acesse o Grafana: http://localhost:3001
echo   Usuario: admin / Senha: admin
echo ==========================================
pause
