@echo off
echo ==========================================
echo   SETUP COMPLETO - Testes de Carga K6
echo ==========================================
echo.
echo Este script ira:
echo 1. Iniciar InfluxDB e Grafana
echo 2. Popular o banco com 50.000 clientes
echo 3. Executar os 3 cenarios de teste
echo.
echo Pressione qualquer tecla para continuar...
pause > nul

echo.
echo [1/4] Iniciando InfluxDB e Grafana...
echo ==========================================
call npm run k6:setup
timeout /t 10 /nobreak > nul
echo ✅ Servicos iniciados!

echo.
echo [2/4] Populando banco de dados com 50.000 clientes...
echo ==========================================
call npm run populate:50k
echo ✅ Banco populado!

echo.
echo [3/4] Aguardando voce iniciar a aplicacao...
echo ==========================================
echo.
echo Abra um NOVO terminal e execute: npm run dev
echo.
echo Quando a aplicacao estiver rodando, pressione qualquer tecla aqui...
pause > nul

echo.
echo [4/4] Executando testes de carga...
echo ==========================================

echo.
echo Executando Cenario A (50%% Leituras / 50%% Escritas)...
cd k6
call run-cenario-a.bat
cd ..

echo.
echo Aguarde 30 segundos antes do proximo teste...
timeout /t 30 /nobreak

echo.
echo Executando Cenario B (75%% Leituras / 25%% Escritas)...
cd k6
call run-cenario-b.bat
cd ..

echo.
echo Aguarde 30 segundos antes do proximo teste...
timeout /t 30 /nobreak

echo.
echo Executando Cenario C (25%% Leituras / 75%% Escritas)...
cd k6
call run-cenario-c.bat
cd ..

echo.
echo ==========================================
echo   TODOS OS TESTES CONCLUIDOS!
echo ==========================================
echo.
echo Acesse o Grafana para visualizar os resultados:
echo http://localhost:3001
echo.
echo Usuario: admin
echo Senha: admin
echo.
echo Pressione qualquer tecla para finalizar...
pause > nul
