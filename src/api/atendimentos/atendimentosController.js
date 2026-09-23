// Importa a conexão com o banco de dados.
import { pool } from "../../config/db.js";

// Cria uma função chamada listarAtendimentos.
export async function listarAtendimentos(req, res, next) {
  try {

    // Pega os parâmetros enviados na URL.
    // Exemplos:
    // /api/atendimentos?status=ABERTO
    // /api/atendimentos?id_paciente=3
    const { status, id_paciente } = req.query;

    // Começa a montar a consulta SQL.
    let sql = "SELECT * FROM atendimentos";

    // Guarda as condições que serão adicionadas ao WHERE.
    const condicoes = [];

    // Guarda os valores que serão enviados para os "?" da consulta.
    const valores = [];

    // Se um status foi informado...
    if (status) {

      // Converte o status para letras maiúsculas.
      const statusFormatado = status.toUpperCase();

      // Define os status permitidos pelo sistema.
      const statusPermitidos = [
        "ABERTO",
        "EM_ANDAMENTO",
        "FINALIZADO",
        "CANCELADO"
      ];

      // Verifica se o status informado é válido.
      if (!statusPermitidos.includes(statusFormatado)) {
        return res.status(400).json({
          mensagem: "Status do atendimento inválido."
        });
      }

      // Adiciona a condição de status à consulta.
      condicoes.push("status = ?");

      // Adiciona o valor que substituirá o "?".
      valores.push(statusFormatado);
    }

    // Se um ID de paciente foi informado...
    if (id_paciente) {

      // Converte o ID recebido para número.
      const idPaciente = Number(id_paciente);

      // Verifica se o ID é válido.
      if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
        return res.status(400).json({
          mensagem: "ID do paciente inválido."
        });
      }

      // Adiciona a condição de paciente à consulta.
      condicoes.push("id_paciente = ?");

      // Adiciona o ID que substituirá o "?".
      valores.push(idPaciente);
    }

    // Se alguma condição foi adicionada,
    // monta a cláusula WHERE da consulta.
    if (condicoes.length > 0) {
      sql += ` WHERE ${condicoes.join(" AND ")}`;
    }

    // Ordena os resultados pelo ID do atendimento.
    sql += " ORDER BY id_atendimento ASC";

    // Executa a consulta no banco.
    const [atendimentos] = await pool.query(sql, valores);

    // Retorna os atendimentos encontrados.
    return res.status(200).json(atendimentos);

  } catch (error) {

    // Envia possíveis erros para o middleware de tratamento.
    next(error);
  }
}






// Cria uma função chamada buscarAtendimentoPorId.
export async function buscarAtendimentoPorId(req, res, next) {
  try {
    // Pega o ID informado na URL.
    // Exemplo: /api/atendimentos/3
    const id = Number(req.params.id);

    // Verifica se o ID informado é válido.
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID do atendimento inválido."
      });
    }

    // Busca no banco o atendimento que possui o ID informado.
    const [atendimentos] = await pool.query(
      "SELECT * FROM atendimentos WHERE id_atendimento = ?",
      [id]
    );

    // Se nenhum atendimento for encontrado, retorna erro 404.
    if (atendimentos.length === 0) {
      return res.status(404).json({
        mensagem: "Atendimento não encontrado."
      });
    }

    // Retorna o atendimento encontrado com status 200 (OK).
    return res.status(200).json(atendimentos[0]);

  } catch (error) {
    // Caso ocorra algum erro durante a consulta,
    // envia o erro para o middleware de tratamento de erros.
    next(error);
  }
}







// Cria uma função chamada cadastrarAtendimento.
export async function cadastrarAtendimento(req, res, next) {
  try {

    // Pega o ID do paciente enviado no corpo da requisição.
    const { id_paciente } = req.body;

    // Verifica se o ID do paciente foi informado.
    if (!id_paciente) {
      return res.status(400).json({
        mensagem: "O ID do paciente é obrigatório."
      });
    }

    // Converte o ID recebido para número.
    const idPaciente = Number(id_paciente);

    // Verifica se o ID informado é válido.
    if (!Number.isInteger(idPaciente) || idPaciente <= 0) {
      return res.status(400).json({
        mensagem: "ID do paciente inválido."
      });
    }

    // Verifica se o paciente existe antes de criar o atendimento.
    const [pacientes] = await pool.query(
      "SELECT id_paciente FROM pacientes WHERE id_paciente = ?",
      [idPaciente]
    );

    // Se nenhum paciente for encontrado, retorna erro 404.
    if (pacientes.length === 0) {
      return res.status(404).json({
        mensagem: "Paciente não encontrado."
      });
    }

    // Cria um novo atendimento para o paciente.
    // A data/hora de chegada e o status são definidos automaticamente
    // pelo banco de dados.
    const [resultado] = await pool.query(
      "INSERT INTO atendimentos (id_paciente) VALUES (?)",
      [idPaciente]
    );

    // Retorna o ID do atendimento criado com status 201 (Created).
    return res.status(201).json({
      mensagem: "Atendimento criado com sucesso.",
      id_atendimento: resultado.insertId
    });

  } catch (error) {

    // Caso ocorra algum erro durante a operação,
    // envia o erro para o middleware de tratamento de erros.
    next(error);
  }
}






// Cria uma função chamada atualizarAtendimento.
export async function atualizarAtendimento(req, res, next) {
  try {

    // Pega o ID do atendimento informado na URL.
    // Exemplo: /api/atendimentos/1
    const id = Number(req.params.id);

    // Verifica se o ID informado é válido.
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensagem: "ID do atendimento inválido."
      });
    }

    // Pega o novo status enviado no corpo da requisição.
    const { status } = req.body;

    // Verifica se o status foi informado.
    if (!status) {
      return res.status(400).json({
        mensagem: "O status do atendimento é obrigatório."
      });
    }

    // Define quais status são permitidos pelo sistema.
    const statusPermitidos = [
      "ABERTO",
      "EM_ANDAMENTO",
      "FINALIZADO",
      "CANCELADO"
    ];

    // Converte o status para letras maiúsculas.
    const novoStatus = status.toUpperCase();

    // Verifica se o status enviado é válido.
    if (!statusPermitidos.includes(novoStatus)) {
      return res.status(400).json({
        mensagem: "Status do atendimento inválido."
      });
    }

    // Verifica se o atendimento existe no banco.
    const [atendimentos] = await pool.query(
      "SELECT id_atendimento FROM atendimentos WHERE id_atendimento = ?",
      [id]
    );

    // Se nenhum atendimento for encontrado, retorna erro 404.
    if (atendimentos.length === 0) {
      return res.status(404).json({
        mensagem: "Atendimento não encontrado."
      });
    }

    // Se o atendimento for finalizado ou cancelado,
    // registra automaticamente a data e hora de saída.
    if (novoStatus === "FINALIZADO" || novoStatus === "CANCELADO") {
      await pool.query(
        `
        UPDATE atendimentos
        SET status = ?, data_hora_saida = CURRENT_TIMESTAMP
        WHERE id_atendimento = ?
        `,
        [novoStatus, id]
      );

    } else {

      // Para atendimentos ainda ativos, mantém a data de saída como NULL.
      await pool.query(
        `
        UPDATE atendimentos
        SET status = ?, data_hora_saida = NULL
        WHERE id_atendimento = ?
        `,
        [novoStatus, id]
      );
    }

    // Retorna uma mensagem de sucesso.
    return res.status(200).json({
      mensagem: "Atendimento atualizado com sucesso."
    });

  } catch (error) {

    // Caso ocorra algum erro durante a operação,
    // envia o erro para o middleware de tratamento de erros.
    next(error);
  }
}