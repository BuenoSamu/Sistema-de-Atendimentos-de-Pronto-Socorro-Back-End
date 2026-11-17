CREATE DATABASE IF NOT EXISTS vihva CHARACTER SET utf8mb4;
USE vihva;

CREATE TABLE IF NOT EXISTS pacientes (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(200) NOT NULL,
    cpf CHAR(11) UNIQUE,
    rg VARCHAR(20),
    data_nascimento DATE NOT NULL,
    nome_pai VARCHAR(200),
    nome_mae VARCHAR(200),
    logradouro VARCHAR(150),
    numero VARCHAR(10),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado CHAR(2),
    cep CHAR(8)
);

CREATE TABLE IF NOT EXISTS atendimentos (
    id_atendimento INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    data_hora_chegada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_hora_saida DATETIME,
    status ENUM(
        'TRIAGEM_PENDENTE',
        'CONSULTA_PENDENTE',
        'FINALIZADO',
        'CANCELADO'
    ) NOT NULL DEFAULT 'TRIAGEM_PENDENTE',

    FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente)
);

CREATE TABLE IF NOT EXISTS triagens (
    id_triagem INT AUTO_INCREMENT PRIMARY KEY,
    id_atendimento INT NOT NULL UNIQUE,
    pressao_sistolica SMALLINT UNSIGNED,
    pressao_diastolica SMALLINT UNSIGNED,
    temperatura DECIMAL(4,1),
    batimentos_cardiacos SMALLINT UNSIGNED,
    queixas TEXT,
    classificacao_manchester ENUM('VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL') NOT NULL,

    FOREIGN KEY (id_atendimento) REFERENCES atendimentos(id_atendimento)
);

CREATE TABLE IF NOT EXISTS consultas (
    id_consulta INT AUTO_INCREMENT PRIMARY KEY,
    id_atendimento INT NOT NULL UNIQUE,
    observacoes TEXT,
    medicamentos VARCHAR(255) DEFAULT NULL,

    FOREIGN KEY (id_atendimento) REFERENCES atendimentos(id_atendimento)
);
