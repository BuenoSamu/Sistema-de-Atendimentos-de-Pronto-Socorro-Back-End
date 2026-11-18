# VIHVA — Backend

API acadêmica em Node.js, Express e MySQL 8 para pacientes, atendimentos, triagens e consultas. As operações são acessíveis sem login e o Swagger não exige credenciais. A API escuta apenas em `127.0.0.1`. Use dados fictícios na demonstração e mantenha este backend sem controle de acesso fora de redes compartilhadas e da internet.

## Executar localmente

Pré-requisitos: Node.js, **MySQL Server** instalado e em execução, e um cliente como o [Beekeeper Studio](https://www.beekeeperstudio.io/community/). O Beekeeper é a interface para administrar o banco.

1. No Beekeeper, crie uma conexão **MySQL** por TCP para `127.0.0.1:3306`. Use o administrador do MySQL local (geralmente `root`) e a senha escolhida na instalação. Deixe o campo de banco vazio no primeiro acesso.
2. Abra `database/schema.sql` no editor SQL e execute o arquivo inteiro. Ele cria o banco `vihva` e as quatro tabelas. Confira com `SHOW TABLES FROM vihva;`.
3. Em uma nova aba SQL, crie um usuário local para a API. Substitua `SUA_SENHA_LOCAL` por uma senha sua antes de executar:

   ```sql
   CREATE USER IF NOT EXISTS 'vihva_user'@'127.0.0.1' IDENTIFIED BY 'SUA_SENHA_LOCAL';
   GRANT SELECT, INSERT, UPDATE ON vihva.* TO 'vihva_user'@'127.0.0.1';
   ```

   Se o usuário já existir, use a senha dele. O primeiro comando não troca senhas de contas existentes.
4. Na pasta do backend, execute `npm.cmd ci`. Se ainda não tiver um `.env`, copie `.env.example` para `.env`. Use `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME=vihva`, `DB_USER=vihva_user` e a senha dessa conta em `DB_PASSWORD`. Se seu MySQL escutar em outra porta, use a porta dessa instalação. Mantenha o `.env` fora do Git.
5. Execute `npm.cmd run dev` e abra [Swagger](http://127.0.0.1:3000/docs/). No Swagger, rode `GET /api/pacientes` para confirmar a leitura de dados.

**Banco anterior:** o script cria tabelas que não existem. Ele não importa registros de outra instalação nem atualiza as tabelas já criadas. Se quiser trazer dados antigos, mantenha a origem intacta até exportar e conferir a importação. Uma base nova é suficiente para testar com dados fictícios.

## Endpoints

| Módulo | Operações |
| --- | --- |
| Pacientes | `GET /api/pacientes` (filtro `nome`), `POST /api/pacientes`, `PATCH /api/pacientes/:id` |
| Atendimentos | `GET` e `POST /api/atendimentos`; `GET` e `PATCH /api/atendimentos/:id`; filtros `status` e `id_paciente` |
| Triagens | `GET` e `POST /api/triagens`; `GET` e `PATCH /api/triagens/:id`; filtro `classificacao` |
| Consultas | `GET` e `POST /api/consultas`; `GET` e `PATCH /api/consultas/:id` |

O banco permite uma triagem e uma consulta por atendimento. Status de atendimento no schema: `TRIAGEM_PENDENTE`, `CONSULTA_PENDENTE`, `FINALIZADO` e `CANCELADO`. O PATCH do atendimento registra a saída nos status finalizado e cancelado, e limpa a saída nos demais. Classificações Manchester: `VERMELHO`, `LARANJA`, `AMARELO`, `VERDE` e `AZUL`.

Erros usam `{ mensagem }`: 400 para entrada inválida, 404 para recurso ou rota inexistente, 409 para duplicidade e 500 para erro inesperado. O Swagger detalha os corpos e filtros de cada operação.

## Testes

- `npm.cmd test`: validação de entradas, rotas HTTP com banco simulado e contrato Swagger.
- Integração opcional com MySQL local: em um terminal PowerShell, defina `$env:RUN_DB_TESTS='1'`, `$env:TEST_DB_USER='root'` (ou outra conta local autorizada a criar e excluir bancos de teste) e `$env:TEST_DB_PASSWORD = Read-Host 'Senha da conta de teste' -MaskInput` no PowerShell 7. Execute `npm.cmd test` e depois feche esse terminal. A integração usa o host e a porta do `.env` e cria e remove um banco aleatório separado. A conta da API continua com acesso apenas ao banco `vihva`.

O `.env` e `node_modules` ficam fora do Git.
