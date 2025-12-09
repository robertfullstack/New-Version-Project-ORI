const express = require("express");
const cors = require("cors");
const sql = require("mssql");

const app = express();
app.use(cors());
app.use(express.json());

// CREDENCIAS DO BANCO DE DADOS - local
const config = {
    user: "sa",
    password: "12345",
    server: "COMPRAS-56204\\SQLEXPRESS",
    database: "OK",
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    port: 64896
};

// CONSULTAR
app.post("/consultar", async (req, res) => {
    const { usuario, categoria } = req.body;

    try {
        let pool = await sql.connect(config);
        let query = "";

        if (categoria === "Fiscal") {
            query = `SELECT * FROM dbo.Solicitacoes WHERE status = 'Aprovado' ORDER BY id DESC`;
        } else if (categoria === "Supervisor") {
            query = `SELECT * FROM dbo.Solicitacoes ORDER BY id DESC`;
        } else if (categoria === "Operacoes") {
            query = `SELECT * FROM dbo.Solicitacoes 
             WHERE status IN ('Pendente', 'Aprovado') 
             ORDER BY id DESC`;
        } else if (categoria === "Contabil") {
            query = `SELECT * FROM dbo.Solicitacoes
             WHERE status = 'Aprovado'
             ORDER BY id DESC`;
        } else {
            query = `SELECT * FROM dbo.Solicitacoes
             WHERE usuario = @usuario 
             ORDER BY id DESC`;
        }


        const request = pool.request();
        if (!["Supervisor", "Operacoes", "Contábil"].includes(categoria)) {
            request.input("usuario", sql.VarChar, usuario);
        }

        const result = await request.query(query);
        res.json(result.recordset);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao consultar solicitações", details: err.message });
    }
});


// ADD USUARIO
app.post("/addUsuario", async (req, res) => {
    const { nome, senha, categoria, loja, email } = req.body;

    try {
        let pool = await sql.connect(config);

        await pool.request()
            .input("nome", sql.VarChar, nome)
            .input("senha", sql.VarChar, senha)
            .input("categoria", sql.VarChar, categoria)
            .input("loja", sql.VarChar, loja)
            .input("email", sql.VarChar, email)
            .query(`
                INSERT INTO dbo.Usuarios (nome, senha, perfil, loja, email)
                VALUES (@nome, @senha, @categoria, @loja, @email)
            `);

        res.json({ message: "Usuário cadastrado com sucesso!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao cadastrar usuário", details: err.message });
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    const { nome, senha } = req.body;

    try {
        let pool = await sql.connect(config);

        const result = await pool.request()
            .input("nome", sql.VarChar, nome)
            .input("senha", sql.VarChar, senha)
            .query(`
                SELECT nome, perfil AS categoria, loja, email
                FROM dbo.Usuarios
                WHERE nome = @nome AND senha = @senha
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: "Usuário ou senha inválidos" });
        }

        res.json(result.recordset[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro no login", details: err.message });
    }
});

// SOLICITAR
app.post("/solicitar", async (req, res) => {
    try {
        let pool = await sql.connect(config);

        const r = pool.request();
        for (const [key, value] of Object.entries(req.body)) {
            r.input(key, sql.VarChar, value ?? "");
        }

        await r.query(`
            INSERT INTO dbo.Solicitacoes (
                usuario, categoria, loja, nomeGerente, origem, destino, rotaEnvio, volume, valor,
                motivo, nomeMalUso, cargoMalUso, defeitoMalUso, ocorrenciaMalUso,
                codigoBarras, produtoCodigo, produtoDescricao, produtoFinial,
                documentoSolicitanteBase64, nomeDocumentoSolicitante, registro
            ) VALUES (
                @usuario, @categoria, @loja, @nomeGerente, @origem, @destino, @rotaEnvio, @volume, @valor,
                @motivo, @nomeMalUso, @cargoMalUso, @defeitoMalUso, @ocorrenciaMalUso,
                @codigoBarras, @produtoCodigo, @produtoDescricao, @produtoFinial,
                @documentoSolicitanteBase64, @nomeDocumentoSolicitante, @registro
            )
        `);

        res.json({ message: "Solicitação enviada!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao salvar a solicitação", details: err.message });
    }
});

// ATUALIZAR STATUS
app.post("/atualizar-status", async (req, res) => {
    const { id, status } = req.body;

    try {
        let pool = await sql.connect(config);

        await pool.request()
            .input("id", sql.Int, id)
            .input("status", sql.VarChar, status)
            .query(`
                UPDATE dbo.Solicitacoes
                SET status = @status
                WHERE id = @id
            `);

        res.json({ message: "Status atualizado com sucesso!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao atualizar status", details: err.message });
    }
});

// ATUALIZAR NOME E VALOR DO ITEM
app.post("/atualizar-item", async (req, res) => {
    const { id, produtoDescricao, valor } = req.body;

    try {
        let pool = await sql.connect(config);

        await pool.request()
            .input("id", sql.Int, id)
            .input("produtoDescricao", sql.VarChar, produtoDescricao)
            .input("valor", sql.Decimal(18, 2), valor)
            .query(`
                UPDATE dbo.Solicitacoes
                SET produtoDescricao = @produtoDescricao,
                    valor = @valor
                WHERE id = @id
            `);

        res.json({ message: "Item atualizado com sucesso!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao atualizar item", details: err.message });
    }
});
app.post("/atualizar-documento-fiscal", async (req, res) => {
    const { id, documentoBase64, nomeDocumento, aprovadoPorFiscal, statusFiscal } = req.body;

    try {
        let pool = await sql.connect(config);

        await pool.request()
            .input("id", sql.Int, id)
            .input("documentoBase64", sql.VarChar, documentoBase64)
            .input("nomeDocumento", sql.VarChar, nomeDocumento)
            .input("aprovadoPorFiscal", sql.VarChar, aprovadoPorFiscal)
            .input("statusFiscal", sql.VarChar, statusFiscal)
            .query(`
        UPDATE dbo.Solicitacoes
        SET documentoFiscalBase64 = @documentoBase64,
            nomeDocumento = @nomeDocumento,
            aprovadoPorFiscal = @aprovadoPorFiscal,
            statusFiscal = @statusFiscal,
            dataAprovacaoFiscal = GETDATE()
        WHERE id = @id
      `);

        res.json({ message: "Documento atualizado com sucesso!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao atualizar documento fiscal", details: err.message });
    }
});

// CONSULTAR RECEBIMENTOS POR LOJA
app.get("/recebimentos/:loja", async (req, res) => {
    const { loja } = req.params;

    try {
        let pool = await sql.connect(config);

        const result = await pool.request()
            .input("loja", sql.VarChar, loja)
            .query(`
                SELECT *
                FROM dbo.Solicitacoes
                WHERE destino = @loja
                  AND status = 'Aprovado'
                  AND documentoFiscalBase64 IS NOT NULL
                  AND documentoFiscalBase64 <> ''
                ORDER BY id DESC
            `);

        res.json(result.recordset);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar recebimentos", details: err.message });
    }
});



// START/OUVIR A APLICAÇÃO
app.listen(3001, () => {
    console.log("🚀 API rodando na porta 3001");
});
