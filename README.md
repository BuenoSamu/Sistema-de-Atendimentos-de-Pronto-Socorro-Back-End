# VIHVA — Backend

API acadêmica em Node.js, Express e MySQL 8 para pacientes, atendimentos, triagens e consultas. As operações são acessíveis sem login e o Swagger não exige credenciais. A API e a porta publicada do MySQL escutam apenas em `127.0.0.1`. Use dados fictícios na demonstração e mantenha este backend sem controle de acesso fora de redes compartilhadas e da internet.

## Executar localmente

1. Abra o Docker Desktop e execute `npm.cmd ci` na pasta do backend.
2. Copie `.env.example` para `.env` e informe `DB_PASSWORD` e `DB_ROOT_PASSWORD`. Mantenha as senhas fora do Git.
3. Execute `docker compose up -d` e aguarde o banco ficar saudável.
4. Execute `npm.cmd run dev` (ou `npm.cmd start`).
5. Abra [Swagger](http://127.0.0.1:3000/docs/). Se configurar outra `PORT`, use a mesma porta na URL.

O MySQL usa o banco `vihva`, porta externa 3307 e porta interna 3306. O backend verifica a conexão antes de iniciar.

**Volume existente:** o Docker só aplica `database/schema.sql` ao inicializar um volume novo. O Compose fixa o nome do projeto para reutilizar o volume mesmo se a pasta do backend mudar de nome.

A coluna opcional `consultas.medicamentos` do schema novo guarda texto livre e não depende do catálogo antigo. Se o volume ainda usa os status `ABERTO` e `EM_ANDAMENTO` ou não tem essa coluna de texto, o alinhamento dessas tabelas é uma migração separada. Não apague o volume para atualizar a aplicação.

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
- PowerShell: `$env:RUN_DB_TESTS='1'; npm.cmd test`: inclui integração com MySQL 8, usando o container `vihva-database` (ou `TEST_DB_CONTAINER`). A suíte cria e remove um banco de teste aleatório, sem alterar o banco `vihva`.

O `.env` e `node_modules` ficam fora do Git.
