CREATE DATABASE IF NOT EXISTS vihva_db;
USE vihva_db;

CREATE TABLE pacientes (
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

CREATE TABLE atendimentos (
    id_atendimento INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,

    data_hora_chegada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_hora_saida DATETIME,

    status ENUM(
        'ABERTO',
        'EM_ANDAMENTO',
        'FINALIZADO',
        'CANCELADO'
    ) NOT NULL DEFAULT 'ABERTO',

    FOREIGN KEY (id_paciente)
        REFERENCES pacientes(id_paciente)
);

CREATE TABLE triagens (
    id_triagem INT AUTO_INCREMENT PRIMARY KEY,
    id_atendimento INT NOT NULL UNIQUE,

    pressao_sistolica SMALLINT UNSIGNED,
    pressao_diastolica SMALLINT UNSIGNED,
    temperatura DECIMAL(4,1),
    batimentos_cardiacos SMALLINT UNSIGNED,

    queixas TEXT,

    classificacao_manchester ENUM(
        'VERMELHO',
        'LARANJA',
        'AMARELO',
        'VERDE',
        'AZUL'
    ) NOT NULL,

    FOREIGN KEY (id_atendimento)
        REFERENCES atendimentos(id_atendimento)
);

CREATE TABLE consultas (
    id_consulta INT AUTO_INCREMENT PRIMARY KEY,
    id_atendimento INT NOT NULL UNIQUE,

    observacoes TEXT,

    FOREIGN KEY (id_atendimento)
        REFERENCES atendimentos(id_atendimento)
);

CREATE TABLE medicamentos (
    id_medicamento INT AUTO_INCREMENT PRIMARY KEY,
    nome_medicamento VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE consultas_medicamentos (
    id_consulta INT NOT NULL,
    id_medicamento INT NOT NULL,

    posologia VARCHAR(200),

    PRIMARY KEY (id_consulta, id_medicamento),

    FOREIGN KEY (id_consulta)
        REFERENCES consultas(id_consulta),

    FOREIGN KEY (id_medicamento)
        REFERENCES medicamentos(id_medicamento)
);

CREATE TABLE USUARIOS (
    id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
);

CREATE TABLE USUARIOS (
    id_usuario    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    login         VARCHAR(100) NOT NULL UNIQUE,
    senha_hash    VARCHAR(300) NOT NULL
);

