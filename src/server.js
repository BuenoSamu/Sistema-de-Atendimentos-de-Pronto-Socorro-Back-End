import { validarConfiguracao } from './config/env.js';
import app from './app.js';
import { pool } from './config/db.js';

try {
  validarConfiguracao();
  await pool.query('SELECT 1');
  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, '127.0.0.1', error => {
    if (error) return;
    console.log('API rodando em http://127.0.0.1:' + port);
    console.log('Swagger em http://127.0.0.1:' + port + '/docs');
  });
  server.on('error', async error => { console.error('Falha ao iniciar servidor:', error.code); await pool.end(); process.exitCode = 1; });
  for (const sinal of ['SIGINT', 'SIGTERM']) process.once(sinal, () => server.close(async () => { await pool.end(); }));
} catch (error) {
  console.error('Falha na inicialização:', error.code || error.message);
  await pool.end();
  process.exitCode = 1;
}
