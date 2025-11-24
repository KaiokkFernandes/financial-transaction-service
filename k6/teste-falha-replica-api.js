import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');
const successRate = new Rate('success');
const depositCounter = new Counter('depositos_realizados');
const withdrawCounter = new Counter('saques_realizados');
const readCounter = new Counter('leituras_realizadas');
const latencyTrend = new Trend('latency_ms');

// Configuração do teste de falha
export const options = {
  scenarios: {
    // Fase 1: Carga normal (30s)
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 50 },  // Subida gradual
        { duration: '20s', target: 50 },  // Carga estável
      ],
      gracefulRampDown: '5s',
      startTime: '0s',
    },
    // Fase 2: Durante falha (40s) - SIMULAR FALHA MANUAL AQUI
    during_failure: {
      executor: 'ramping-vus',
      startVUs: 50,
      stages: [
        { duration: '40s', target: 50 },  // Carga constante durante falha
      ],
      gracefulRampDown: '5s',
      startTime: '30s',
    },
    // Fase 3: Recuperação (30s)
    recovery: {
      executor: 'ramping-vus',
      startVUs: 50,
      stages: [
        { duration: '30s', target: 50 },  // Carga constante pós-recuperação
      ],
      gracefulRampDown: '5s',
      startTime: '70s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições < 500ms
    http_req_failed: ['rate<0.05'],   // Taxa de erro < 5%
    errors: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost';

// Lista de IDs de clientes para testar (ajustar conforme seu banco)
const clienteIds = Array.from({ length: 100 }, (_, i) => i + 1);

export function setup() {
  console.log('🧪 Teste de Tolerância a Falhas - Iniciando...');
  console.log('⚠️  INSTRUÇÕES:');
  console.log('   1. Aguarde 30s');
  console.log('   2. Execute: docker stop financial-api-1');
  console.log('   3. Aguarde 20s');
  console.log('   4. Execute: docker start financial-api-1');
  console.log('   5. Observe as métricas');
  return { startTime: new Date() };
}

export default function () {
  const clienteId = clienteIds[Math.floor(Math.random() * clienteIds.length)];
  
  // Cenário: 50% leituras, 30% depósitos, 20% saques
  const rand = Math.random();
  
  let response;
  const startTime = Date.now();
  
  if (rand < 0.5) {
    // LEITURA: Buscar cliente
    response = http.get(`${BASE_URL}/clientes/${clienteId}`, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'GetCliente' },
    });
    readCounter.add(1);
  } else if (rand < 0.8) {
    // ESCRITA: Depósito
    const valor = Math.floor(Math.random() * 1000) + 100;
    response = http.post(
      `${BASE_URL}/clientes/${clienteId}/deposito`,
      JSON.stringify({ valor }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'Deposito' },
      }
    );
    depositCounter.add(1);
  } else {
    // ESCRITA: Saque
    const valor = Math.floor(Math.random() * 500) + 50;
    response = http.post(
      `${BASE_URL}/clientes/${clienteId}/saque`,
      JSON.stringify({ valor }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'Saque' },
      }
    );
    withdrawCounter.add(1);
  }
  
  const latency = Date.now() - startTime;
  latencyTrend.add(latency);
  
  // Verificações
  const success = check(response, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'response time < 1000ms': () => latency < 1000,
  });
  
  if (success) {
    successRate.add(1);
    errorRate.add(0);
  } else {
    successRate.add(0);
    errorRate.add(1);
    console.log(`❌ Erro: ${response.status} - ${response.body}`);
  }
  
  sleep(0.1); // 100ms entre requisições
}

export function teardown(data) {
  const endTime = new Date();
  const duration = (endTime - data.startTime) / 1000;
  console.log(`\n✅ Teste concluído em ${duration.toFixed(2)}s`);
  console.log('📊 Analise as métricas para avaliar o impacto da falha');
}
