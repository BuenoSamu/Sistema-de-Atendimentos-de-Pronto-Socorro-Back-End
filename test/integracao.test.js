import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import 'dotenv/config';

test('Fluxos HTTP com MySQL 8 isolado', { skip: process.env.RUN_DB_TESTS !== '1', timeout: 90000 }, async t => {
  const banco = 'vihva_teste_' + randomBytes(6).toString('hex');
  const container = process.env.TEST_DB_CONTAINER || 'vihva-database';
  const sqlAdmin = sql => execFileSync('docker', ['exec', '-i', container, 'sh', '-c', 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysql -uroot'], { input: sql, stdio: ['pipe','pipe','pipe'] });
  const schema = (await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8')).replace(/^CREATE DATABASE[^\n]+\n/m, '').replace('USE vihva;', 'USE `' + banco + '`;');
  const usuario = process.env.DB_USER.replaceAll("'", "''");
  let pool, server;
  sqlAdmin('CREATE DATABASE `' + banco + '`;');
  try {
    sqlAdmin('GRANT ALL ON `' + banco + '`.* TO ' + "'" + usuario + "'@'%';" + schema);
    process.env.DB_NAME = banco;
    ({ pool } = await import('../src/config/db.js'));
    const { default: app } = await import('../src/app.js');
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    const req = async (method, rota, body, status = 200) => {
      const response = await fetch(base + rota, { method, headers: { ...(body !== undefined ? {'Content-Type':'application/json'} : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
      const data = await response.json();
      assert.equal(response.status, status, method + ' ' + rota + ': ' + JSON.stringify(data));
      return data;
    };
    let paciente, atendimento, triagem, consulta;
    await t.test('Pacientes: cadastro, filtros, CPF duplicado e PATCH parcial', async () => {
      await req('POST','/api/pacientes',{nome_completo:'Teste'},400);
      await req('POST','/api/pacientes',{nome_completo:'Teste',data_nascimento:'2025-02-30'},400);
      const data={nome_completo:'Paciente de teste',cpf:'12345678901',data_nascimento:'2000-01-01'};
      paciente=(await req('POST','/api/pacientes',data,201)).id_paciente;
      await req('POST','/api/pacientes',data,409);
      assert.equal((await req('GET','/api/pacientes?nome=Paciente')).length,1);
      await req('PATCH','/api/pacientes/'+paciente,{cidade:'Valinhos'});
      assert.equal((await req('GET','/api/pacientes'))[0].nome_completo,data.nome_completo);
      await req('PATCH','/api/pacientes/2147483647',{cidade:'X'},404);
      await req('PATCH','/api/pacientes/'+paciente,{desconhecido:1},400);
    });
    await t.test('Atendimentos: filtros, referências e estados de saída', async () => {
      await req('POST','/api/atendimentos',{id_paciente:2147483647},404);
      atendimento=(await req('POST','/api/atendimentos',{id_paciente:paciente},201)).id_atendimento;
      assert.equal((await req('GET','/api/atendimentos?status=TRIAGEM_PENDENTE&id_paciente='+paciente)).length,1);
      await req('GET','/api/atendimentos?status=x',undefined,400);
      await req('PATCH','/api/atendimentos/'+atendimento,{status:'FINALIZADO'});
      assert.ok((await req('GET','/api/atendimentos/'+atendimento)).data_hora_saida);
      await req('PATCH','/api/atendimentos/'+atendimento,{status:'CONSULTA_PENDENTE'});
      assert.equal((await req('GET','/api/atendimentos/'+atendimento)).data_hora_saida,null);
    });
    await t.test('Triagens: UNIQUE, Manchester, filtros e PATCH parcial', async () => {
      await req('POST','/api/triagens',{id_atendimento:2147483647,classificacao_manchester:'VERDE'},404);
      const data={id_atendimento:atendimento,classificacao_manchester:'amarelo',temperatura:36.5};
      triagem=(await req('POST','/api/triagens',data,201)).id_triagem;
      await req('POST','/api/triagens',data,409);
      await req('PATCH','/api/triagens/'+triagem,{classificacao_manchester:null},400);
      await req('PATCH','/api/triagens/'+triagem,{pressao_sistolica:-1},400);
      await req('PATCH','/api/triagens/'+triagem,{queixas:'Teste'});
      assert.equal((await req('GET','/api/triagens/'+triagem)).classificacao_manchester,'AMARELO');
      assert.equal((await req('GET','/api/triagens?classificacao=AMARELO')).length,1);
      await req('GET','/api/triagens?classificacao=INVALIDA',undefined,400);
    });
    await t.test('Consultas: uma por atendimento e observações anuláveis', async () => {
      await req('POST','/api/consultas',{id_atendimento:2147483647},404);
      consulta=(await req('POST','/api/consultas',{id_atendimento:atendimento,observacoes:'Teste'},201)).id_consulta;
      await req('POST','/api/consultas',{id_atendimento:atendimento},409);
      await req('PATCH','/api/consultas/'+consulta,{observacoes:null});
      assert.equal((await req('GET','/api/consultas/'+consulta)).observacoes,null);
      assert.equal((await req('GET','/api/consultas')).length,1);
    });
    await t.test('Entradas malformadas, IDs inválidos e recursos inexistentes', async () => {
      for(const rota of ['atendimentos','triagens','consultas']) {
        await req('GET','/api/'+rota+'/abc',undefined,400);
        await req('GET','/api/'+rota+'/2147483647',undefined,404);
      }
      for(const rota of ['pacientes','atendimentos','triagens','consultas']) {
        await req('POST','/api/'+rota,{},400);
        await req('POST','/api/'+rota,[],400);
      }
      await req('GET','/api/triagens?classificacao=AMARELO&classificacao=AZUL',undefined,400);
      await req('GET','/api/atendimentos?id_paciente=true',undefined,400);
      await req('PATCH','/api/pacientes/true',{cidade:'X'},400);
      const r=await fetch(base+'/api/pacientes',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});assert.equal(r.status,400);
      await req('GET','/rota-inexistente',undefined,404);
    });
    await t.test('Concorrência respeita uma triagem por atendimento', async () => {
      const novo=(await req('POST','/api/atendimentos',{id_paciente:paciente},201)).id_atendimento;
      const responses=await Promise.all([1,2].map(()=>fetch(base+'/api/triagens',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id_atendimento:novo,classificacao_manchester:'VERDE'})})));
      assert.deepEqual(responses.map(r=>r.status).sort(),[201,409]);
    });
    await t.test('Servidor inicia com MySQL e rejeita configuração ausente', async () => {
      const run = env => new Promise((resolve,reject)=>{
        const child=spawn(process.execPath,['src/server.js'],{env:{...process.env,...env},stdio:['ignore','pipe','pipe']});
        let out='';const timer=setTimeout(()=>{child.kill();reject(new Error('Timeout ao iniciar'));},10000);
        child.stdout.on('data',data=>{out+=data;if(out.includes('API rodando')) child.kill();});
        child.stderr.on('data',data=>out+=data);
        child.on('exit',code=>{clearTimeout(timer);resolve({code,out});});
        child.on('error',reject);
      });
      assert.match((await run({PORT:'31987'})).out,/API rodando/);
      const bloqueio=app.listen(0, '127.0.0.1');
      await new Promise(resolve=>bloqueio.once('listening',resolve));
      try {
        const ocupada=await run({PORT:String(bloqueio.address().port)});
        assert.equal(ocupada.code,1);assert.match(ocupada.out,/EADDRINUSE/);assert.doesNotMatch(ocupada.out,/API rodando/);
      } finally { await new Promise(resolve=>bloqueio.close(resolve)); }
      const erro=await run({DB_NAME:''});assert.equal(erro.code,1);assert.match(erro.out,/DB_NAME/);
    });
  } finally {
    if(server) await new Promise(resolve=>server.close(resolve));
    if(pool) await pool.end();
    sqlAdmin('DROP DATABASE `' + banco + '`;');
  }
});
