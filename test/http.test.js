import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import parser from '@apidevtools/swagger-parser';
import app from '../src/app.js';
import { pool } from '../src/config/db.js';
import { swaggerSpec } from '../src/config/swagger.js';

const rotas = {
  '/api/pacientes': ['get', 'post'],
  '/api/pacientes/{id}': ['patch'],
  '/api/atendimentos': ['get', 'post'],
  '/api/atendimentos/{id}': ['get', 'patch'],
  '/api/triagens': ['get', 'post'],
  '/api/triagens/{id}': ['get', 'patch'],
  '/api/consultas': ['get', 'post'],
  '/api/consultas/{id}': ['get', 'patch'],
};

test('Swagger documenta as 15 operações sem esquema de segurança', async () => {
  await parser.validate(structuredClone(swaggerSpec));
  assert.deepEqual(Object.keys(swaggerSpec.paths).sort(), Object.keys(rotas).sort());
  assert.equal(swaggerSpec.security, undefined);
  assert.equal(swaggerSpec.components?.securitySchemes, undefined);
  for (const [rota, metodos] of Object.entries(rotas)) {
    const operacoes = swaggerSpec.paths[rota];
    assert.deepEqual(Object.keys(operacoes).sort(), metodos);
    for (const operacao of Object.values(operacoes)) {
      assert.equal(operacao.security, undefined);
      assert.equal(operacao.responses['401'], undefined);
    }
  }
});

test('Rotas de negócio respondem sem credenciais e as rotas antigas retornam 404', async t => {
  const consulta = t.mock.method(pool, 'query', async () => [[]]);
  const servidor = app.listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve, reject) => servidor.close(error => error ? reject(error) : resolve())));
  await once(servidor, 'listening');
  const url = 'http://127.0.0.1:' + servidor.address().port;

  for (const rota of ['/api/pacientes', '/api/atendimentos', '/api/triagens', '/api/consultas']) {
    const response = await fetch(url + rota);
    assert.equal(response.status, 200, rota);
    assert.deepEqual(await response.json(), []);
  }
  assert.equal(consulta.mock.callCount(), 4);

  for (const [method, rota] of [
    ['POST', '/api/auth/login'],
    ['GET', '/api/auth/confirmar-cadastro'],
    ['POST', '/api/usuarios'],
    ['GET', '/api/usuarios'],
  ]) {
    const response = await fetch(url + rota, { method });
    assert.equal(response.status, 404, method + ' ' + rota);
    await response.json();
  }
  const docs = await fetch(url + '/docs/');
  assert.equal(docs.status, 200);
  await docs.text();
});
