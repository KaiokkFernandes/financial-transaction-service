// Cenário C: 25% Leituras e 75% Escritas
import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Configurações do teste
export const options = {
  scenarios: {
    leituras: {
      executor: 'constant-vus',
      vus: 25, // 25 clientes fazendo leituras
      duration: '5m',
      exec: 'realizarLeituras',
    },
    escritas: {
      executor: 'constant-vus',
      vus: 75, // 75 clientes fazendo escritas
      duration: '5m',
      exec: 'realizarEscritas',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Carregar clientes do arquivo JSON gerado pelo script de população
const clientes = new SharedArray('clientes', function () {
  try {
    const data = JSON.parse(open('./clientes-data.json'));
    console.log(`✅ Carregados ${data.length} clientes do arquivo`);
    return data;
  } catch (error) {
    console.error('❌ Erro ao carregar clientes. Execute: npm run populate');
    throw error;
  }
});

export function realizarLeituras() {
  const cliente = clientes[randomIntBetween(0, clientes.length - 1)];
  
  const headers = {
    'Authorization': `Bearer ${cliente.apiKey}`,
    'Content-Type': 'application/json',
  };

  const resGetById = http.get(`${BASE_URL}/clientes/${cliente.id}`, { headers });
  
  check(resGetById, {
    'GET /clientes/:id - status 200': (r) => r.status === 200,
    'GET /clientes/:id - retorna dados': (r) => r.json('id') !== undefined,
  });

  sleep(randomIntBetween(1, 3));
  
  if (Math.random() < 0.1) {
    const resListAll = http.get(`${BASE_URL}/clientes`, { headers });
    check(resListAll, {
      'GET /clientes - status 200': (r) => r.status === 200,
    });
  }

  sleep(randomIntBetween(1, 2));
}

export function realizarEscritas() {
  const cliente = clientes[randomIntBetween(0, Math.min(clientes.length - 1, 100))];
  
  const headers = {
    'Authorization': `Bearer ${cliente.apiKey}`,
    'Content-Type': 'application/json',
  };

  const depositoPayload = JSON.stringify({
    valor: randomIntBetween(10, 500)
  });
  
  const resDeposito = http.post(
    `${BASE_URL}/clientes/${cliente.id}/deposito`,
    depositoPayload,
    { headers }
  );
  
  check(resDeposito, {
    'POST /deposito - status 200': (r) => r.status === 200,
    'POST /deposito - saldo atualizado': (r) => r.json('saldo') !== undefined,
  });

  sleep(randomIntBetween(1, 3));

  if (Math.random() < 0.4) {
    const clienteDestino = clientes[randomIntBetween(0, Math.min(clientes.length - 1, 100))];
    
    if (clienteDestino.id !== cliente.id) {
      const transferenciaPayload = JSON.stringify({
        destino_id: clienteDestino.id,
        valor: randomIntBetween(5, 100)
      });
      
      const resTransferencia = http.post(
        `${BASE_URL}/clientes/${cliente.id}/transferencia`,
        transferenciaPayload,
        { headers }
      );
      
      check(resTransferencia, {
        'POST /transferencia - status ok': (r) => r.status === 200 || r.status === 400,
      });
    }
  }

  sleep(randomIntBetween(1, 2));
}
