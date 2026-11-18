import test from 'node:test';
import assert from 'node:assert/strict';
import { errorHandler } from '../src/middlewares/errorHandler.js';
import { idValido, validarEntrada } from '../src/middlewares/validarEntrada.js';
import { validarConfiguracao } from '../src/config/env.js';

const resposta=()=>({statusCode:200,status(c){this.statusCode=c;return this;},json(v){this.body=v;return this;}});
test('IDs rejeitam coerções de arrays, booleanos, decimais e números fora do schema',()=>{
  for(const id of [true,[],[1],{},0,-1,1.5,'1.5','1e2','',2147483648]) assert.equal(idValido(id),false);
  for(const id of [1,'1',2147483647]) assert.equal(idValido(id),true);
});
test('Erros de banco são mapeados sem expor SQL e a resposta é enviada uma única vez',()=>{
  for(const [code,status] of [['ER_DUP_ENTRY',409],['ER_NO_REFERENCED_ROW_2',404],['ER_DATA_TOO_LONG',400]]) {
    const res=resposta();let vezes=0;res.json=function(body){vezes++;this.body=body;return this;};
    errorHandler({code,message:'SQL e segredo'}, {},res,()=>{});
    assert.equal(res.statusCode,status);assert.equal(vezes,1);assert.ok(!res.body.mensagem.includes('segredo'));
  }
  let chamado=false;errorHandler(new Error('X'),{},{headersSent:true},()=>chamado=true);assert.ok(chamado);
});
test('Validação recusa corpos ausentes, tipos inválidos, data impossível e medições malformadas',()=>{
  for(const [modulo,body] of [['pacientes',undefined],['pacientes',[]],['pacientes',{nome_completo:' '}],['pacientes',{data_nascimento:'2025-02-30'}],['triagens',{temperatura:'36.5'}],['triagens',{classificacao_manchester:null}]]) {
    let erro;validarEntrada({baseUrl:'/api/'+modulo,query:{},params:{},method:'POST',body},resposta(),e=>erro=e);assert.equal(erro.status,400);
  }
});
test('Configuração ausente falha com o nome da variável e porta inválida é recusada',()=>{
  const original={...process.env};
  try {
    Object.assign(process.env,{DB_HOST:'localhost',DB_USER:'teste',DB_NAME:'teste',DB_PORT:'3306'});
    validarConfiguracao();process.env.DB_NAME='';assert.throws(validarConfiguracao,/DB_NAME/);
    process.env.DB_NAME='teste';process.env.DB_PORT='abc';assert.throws(validarConfiguracao,/DB_PORT/);
  } finally {for(const key of Object.keys(process.env)) if(!(key in original))delete process.env[key];Object.assign(process.env,original);}
});
