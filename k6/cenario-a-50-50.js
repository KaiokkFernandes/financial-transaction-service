// Cenário A: 50% Leituras e 50% Escritas
import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Configurações do teste
export const options = {
  scenarios: {
    leituras: {
      executor: 'constant-vus',
      vus: 50, // 50 clientes fazendo leituras
      duration: '5m',
      exec: 'realizarLeituras',
    },
    escritas: {
      executor: 'constant-vus',
      vus: 50, // 50 clientes fazendo escritas
      duration: '5m',
      exec: 'realizarEscritas',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições devem responder em menos de 500ms
    http_req_failed: ['rate<0.1'],    // Taxa de falha menor que 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Carregar clientes do arquivo JSON gerado pelo script de população
const clientes = new SharedArray('clientes', function () {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const filePath = path.join(__dirname, 'clientes-data.json');
    const data = JSON.parse(open(filePath));
    console.log(`✅ Carregados ${data.length} clientes do arquivo`);
    return data;
  } catch (error) {
    console.error('❌ Erro ao carregar clientes. Execute: npm run populate');
    throw error;
  }
});

// Função para realizar leituras (GET)
export function realizarLeituras() {
  const cliente = clientes[randomIntBetween(0, clientes.length - 1)];
  
  const headers = {
    'Authorization': `Bearer ${cliente.apiKey}`,
    'Content-Type': 'application/json',
  };

  // GET /clientes/:id - Buscar cliente específico
  const resGetById = http.get(`${BASE_URL}/clientes/${cliente.id}`, { headers });
  
  check(resGetById, {
    'GET /clientes/:id - status 200': (r) => r.status === 200,
    'GET /clientes/:id - retorna dados': (r) => r.json('id') !== undefined,
  });

  sleep(randomIntBetween(1, 3)); // Simular tempo de usuário pensando
  
  // GET /clientes - Listar todos (ocasionalmente)
  if (Math.random() < 0.1) { // 10% de chance
    const resListAll = http.get(`${BASE_URL}/clientes`, { headers });
    check(resListAll, {
      'GET /clientes - status 200': (r) => r.status === 200,
    });
  }

  sleep(randomIntBetween(1, 2));
}

// Função para realizar escritas (POST)
export function realizarEscritas() {
  const cliente = clientes[randomIntBetween(0, Math.min(clientes.length - 1, 10))];
  
  const headers = {
    'Authorization': `Bearer ${cliente.apiKey}`,
    'Content-Type': 'application/json',
  };

  // POST /clientes/:id/deposito - Realizar depósito
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

  // POST /clientes/:id/transferencia - Realizar transferência
  if (Math.random() < 0.3) { // 30% de chance de fazer transferência
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
