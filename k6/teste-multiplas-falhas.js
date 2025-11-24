import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const successRate = new Rate('success');

// Teste de múltiplas falhas simultâneas
export const options = {
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '20s', target: 100 },  // Ramp up
        { duration: '60s', target: 100 },  // Sustain
        { duration: '20s', target: 0 },    // Ramp down
      ],
    },
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost';

export function setup() {
  console.log('🧪 Teste de Múltiplas Falhas Simultâneas');
  console.log('⚠️  CENÁRIO DE CAOS:');
  console.log('   1. Aos 20s: docker stop financial-api-1');
  console.log('   2. Aos 30s: docker stop financial-api-2');
  console.log('   3. Aos 50s: docker start financial-api-1');
  console.log('   4. Aos 60s: docker start financial-api-2');
  console.log('   5. Observe a resiliência do sistema');
}

export default function () {
  const response = http.get(`${BASE_URL}/health`, {
    timeout: '3s',
  });
  
  const success = check(response, {
    'system is responsive': (r) => r.status === 200,
  });
  
  successRate.add(success ? 1 : 0);
  errorRate.add(success ? 0 : 1);
  
  sleep(0.5);
}
