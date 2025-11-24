import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');
const successRate = new Rate('success');
const latencyTrend = new Trend('latency_ms');
const writeOps = new Counter('write_operations');
const readOps = new Counter('read_operations');

// Configuração para teste de falha do banco master
export const options = {
  scenarios: {
    // Fase 1: Operação normal
    normal: {
      executor: 'constant-vus',
      vus: 30,
      duration: '30s',
      startTime: '0s',
    },
    // Fase 2: Durante falha do master (MANUAL)
    failure: {
      executor: 'constant-vus',
      vus: 30,
      duration: '60s',
      startTime: '30s',
    },
    // Fase 3: Recuperação
    recovery: {
      executor: 'constant-vus',
      vus: 30,
      duration: '30s',
      startTime: '90s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.1'], // Permitir até 10% de falhas durante crash do master
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost';
const clienteIds = Array.from({ length: 100 }, (_, i) => i + 1);

export function setup() {
  console.log('🧪 Teste de Falha do Banco de Dados Master');
  console.log('⚠️  INSTRUÇÕES:');
  console.log('   1. Aguarde 30s (operação normal)');
  console.log('   2. Execute: docker stop financial-db-master');
  console.log('   3. Aguarde 30s (observe as falhas)');
  console.log('   4. Execute: docker start financial-db-master');
  console.log('   5. Aguarde mais 30s (recuperação)');
  return { startTime: new Date() };
}

export default function () {
  const clienteId = clienteIds[Math.floor(Math.random() * clienteIds.length)];
  const rand = Math.random();
  
  let response;
  const startTime = Date.now();
  
  // 70% leituras, 30% escritas
  if (rand < 0.7) {
    // Leitura
    response = http.get(`${BASE_URL}/clientes/${clienteId}`, {
      timeout: '5s',
      tags: { name: 'Read' },
    });
    readOps.add(1);
  } else {
    // Escrita (depósito)
    response = http.post(
      `${BASE_URL}/clientes/${clienteId}/deposito`,
      JSON.stringify({ valor: 100 }),
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: '5s',
        tags: { name: 'Write' },
      }
    );
    writeOps.add(1);
  }
  
  const latency = Date.now() - startTime;
  latencyTrend.add(latency);
  
  const success = check(response, {
    'status is success': (r) => r.status >= 200 && r.status < 300,
  });
  
  successRate.add(success ? 1 : 0);
  errorRate.add(success ? 0 : 1);
  
  if (!success) {
    console.log(`❌ [${new Date().toISOString()}] Erro: ${response.status}`);
  }
  
  sleep(0.2);
}

export function teardown(data) {
  const duration = (new Date() - data.startTime) / 1000;
  console.log(`\n✅ Teste de falha do banco concluído em ${duration.toFixed(2)}s`);
}
