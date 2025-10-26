import 'reflect-metadata';
import { AppDataSource } from '../src/data-source';
import { Cliente } from '../src/entities/Cliente';
import { v4 as uuidv4 } from 'uuid';

const primeiroNomes = [
  'João', 'Maria', 'José', 'Ana', 'Pedro', 'Paula', 'Carlos', 'Mariana',
  'Lucas', 'Juliana', 'Fernando', 'Beatriz', 'Rafael', 'Camila', 'Gustavo',
  'Amanda', 'Bruno', 'Larissa', 'Diego', 'Fernanda', 'Thiago', 'Gabriela',
  'Rodrigo', 'Isabela', 'Marcelo', 'Carolina', 'Felipe', 'Letícia', 'André',
  'Bruna', 'Leonardo', 'Aline', 'Vinícius', 'Natália', 'Henrique', 'Renata'
];

const sobrenomes = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
  'Rocha', 'Almeida', 'Nascimento', 'Araújo', 'Melo', 'Barbosa', 'Cardoso',
  'Correia', 'Dias', 'Cavalcanti', 'Monteiro', 'Moreira', 'Nunes', 'Freitas'
];

function gerarNomeAleatorio(): string {
  const primeiro = primeiroNomes[Math.floor(Math.random() * primeiroNomes.length)];
  const sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
  return `${primeiro} ${sobrenome}`;
}

function gerarSaldoInicial(): number {
  const random = Math.random();
  if (random < 0.3) return parseFloat((Math.random() * 100).toFixed(2)); 
  if (random < 0.6) return parseFloat((Math.random() * 1000).toFixed(2)); 
  return parseFloat((Math.random() * 10000).toFixed(2)); 
}

async function popularBancoDeDados(quantidade: number) {
  console.log(`🚀 Iniciando população do banco de dados com ${quantidade} registros...`);
  const startTime = Date.now();
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexão com banco de dados estabelecida');

    const clienteRepository = AppDataSource.getRepository(Cliente);

    const clientesExistentes = await clienteRepository.count();
    console.log(`📊 Clientes existentes no banco: ${clientesExistentes}`);

    if (clientesExistentes > 0) {
      console.log('⚠️  O banco já possui clientes. Deseja continuar? (Ctrl+C para cancelar)');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    const tamanhoLote = 1000;
    const totalLotes = Math.ceil(quantidade / tamanhoLote);
    
    console.log(`📦 Processando em ${totalLotes} lotes de ${tamanhoLote} registros`);

    for (let lote = 0; lote < totalLotes; lote++) {
      const clientes: Cliente[] = [];
      const inicio = lote * tamanhoLote;
      const fim = Math.min(inicio + tamanhoLote, quantidade);

      for (let i = inicio; i < fim; i++) {
        const cliente = new Cliente();
        cliente.nome = gerarNomeAleatorio();
        cliente.saldo = gerarSaldoInicial();
        cliente.api_key = uuidv4();
        clientes.push(cliente);
      }

      await clienteRepository.save(clientes);
      
      const progresso = ((lote + 1) / totalLotes * 100).toFixed(1);
      console.log(`⏳ Progresso: ${progresso}% (${fim}/${quantidade} registros)`);
    }

    const endTime = Date.now();
    const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);
    const durationMinutes = (Number(durationSeconds) / 60).toFixed(2);
    console.log(`⏱️ Tempo total para popular ${quantidade} registros: ${durationSeconds} segundos (${durationMinutes} minutos)`);

    console.log('✅ População do banco concluída com sucesso!');
    
    const totalClientes = await clienteRepository.count();
    const somaSaldos = await clienteRepository
      .createQueryBuilder('cliente')
      .select('SUM(cliente.saldo)', 'total')
      .getRawOne();

    console.log('\n📈 Estatísticas:');
    console.log(`   Total de clientes: ${totalClientes}`);
    console.log(`   Soma de todos os saldos: R$ ${parseFloat(somaSaldos.total || 0).toFixed(2)}`);
    console.log(`   Saldo médio: R$ ${(parseFloat(somaSaldos.total || 0) / totalClientes).toFixed(2)}`);

    console.log('\n📝 Exportando API keys para arquivo...');
    await exportarApiKeys(clienteRepository);

  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Conexão com banco de dados encerrada');
  }
}

async function exportarApiKeys(clienteRepository: any) {
  const clientes = await clienteRepository.find({
    select: ['id', 'api_key'],
    order: { id: 'ASC' }
  });

  const fs = require('fs');
  const path = require('path');
  
  const conteudo = clientes.map((c: any) => ({
    id: c.id,
    apiKey: c.api_key
  }));

  const caminhoArquivo = path.join(__dirname, '..', 'k6', 'clientes-data.json');
  fs.writeFileSync(caminhoArquivo, JSON.stringify(conteudo, null, 2));
  
  console.log(`✅ API keys exportadas para: ${caminhoArquivo}`);
}

// Executar script
const args = process.argv.slice(2);
const quantidade = args[0] ? parseInt(args[0]) : 50000;

if (isNaN(quantidade) || quantidade <= 0) {
  console.error('❌ Quantidade inválida. Use: npm run populate <quantidade>');
  process.exit(1);
}

popularBancoDeDados(quantidade)
  .then(() => {
    console.log('\n🎉 Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
