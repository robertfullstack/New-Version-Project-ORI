import { useState } from "react";
import axios from "axios";
import { FaUserEdit, FaDatabase } from "react-icons/fa";

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [view, setView] = useState("menu");

  const [novoNome, setNovoNome] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [categoria, setCategoria] = useState("");
  const [loja, setLoja] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");

  // LOGIN ADMIN
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "ControleAtivos") {
      setIsLogged(true);
      setError("");
    } else {
      setError("Usuário ou senha inválidos");
    }
  };

  // CADASTRAR USUÁRIO NO SQL SERVER VIA API NODE
  const handleAddUsuario = async (e) => {
    e.preventDefault();

    if (!novoNome || !novaSenha || !categoria || !loja || !email) {
      setMensagem("⚠️ Preencha todos os campos!");
      return;
    }

    try {
      await axios.post("http://localhost:3001/addUsuario", {
        nome: novoNome,
        senha: novaSenha,
        categoria,
        loja,
        email, // envia email agora
      });

      setMensagem(`✅ Usuário "${novoNome}" cadastrado com sucesso!`);
      setNovoNome("");
      setNovaSenha("");
      setCategoria("");
      setLoja("");
      setEmail("");
    } catch (err) {
      console.error(err);
      setMensagem("❌ Erro ao salvar no banco de dados!");
    }
  };

  // TELA DE CADASTRAR USUÁRIO
  if (isLogged && view === "usuarios") {
    return (
      <div style={{
        backgroundColor: "#fff",
        color: "#000",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial"
      }}>
        <h1 style={{ fontSize: "26px", marginBottom: "20px" }}>
          Cadastrar Novo Usuário
        </h1>

        <form onSubmit={handleAddUsuario} style={{
          backgroundColor: "#f7f7f7",
          padding: "30px",
          borderRadius: "10px",
          width: "320px",
          boxShadow: "0 0 20px rgba(0,0,0,0.1)",
          border: "1px solid #ddd"
        }}>
          <input
            type="text"
            placeholder="Nome do usuário"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            style={inputStyle}
          />

          <input
            type="email"
            placeholder="E-mail do usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />

          <select
            value={loja}
            onChange={(e) => setLoja(e.target.value)}
            style={inputStyle}
          >
            <option value="">Selecione a loja</option>
            <option value="1001">1001 - Matriz</option>
            <option value="1002">1002 - Centro de Distribuição</option>
            <option value="1003">1003 - Escritório - Suporte</option>
            <option value="1072">1072 - e-commerce</option>
          </select>

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            style={inputStyle}
          >
            <option value="">Selecione a categoria</option>
            <option value="Adm Loja (Inicio do processo de transferência)">
              Adm Loja (Início do processo de transferência)
            </option>
            <option value="Supervisor">Supervisor</option>
            <option value="Operacoes">Operações</option>
            <option value="Contabil">Contábil</option>
            <option value="Fiscal">Fiscal</option>
          </select>

          <button type="submit" style={buttonStyle}>
            Salvar
          </button>

          {mensagem && (
            <p
              style={{
                marginTop: "10px",
                color: mensagem.startsWith("✅") ? "green" : "#d33",
                fontWeight: "bold"
              }}
            >
              {mensagem}
            </p>
          )}
        </form>

        <button
          onClick={() => setView("menu")}
          style={{
            marginTop: "20px",
            background: "none",
            border: "1px solid #000",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          ← Voltar
        </button>
      </div>
    );
  }

  // PAINEL ADMIN
  if (isLogged && view === "menu") {
    const opcoes = [
      { nome: "Alterar Usuários", icone: <FaUserEdit size={40} />, acao: () => setView("usuarios") },
      { nome: "Base", icone: <FaDatabase size={40} />, acao: () => (window.location.href = "/base") }
    ];

    return (
      <div style={containerMenu}>
        <h1 style={{ fontSize: "28px", marginBottom: "40px" }}>
          Painel Administrativo
        </h1>

        <div style={gridMenu}>
          {opcoes.map((botao, index) => (
            <div key={index} onClick={botao.acao} style={cardMenu}>
              <div style={{ marginBottom: "10px" }}>{botao.icone}</div>
              <p style={{ fontWeight: "bold" }}>{botao.nome}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ↪ LOGIN
  return (
    <div style={loginContainer}>
      <form onSubmit={handleSubmit} style={loginBox}>
        <h2 style={{ marginBottom: "25px" }}>Painel Admin</h2>

        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {error && <p style={{ color: "#d33", fontWeight: "bold" }}>{error}</p>}

        <button type="submit" style={buttonStyle}>
          Entrar
        </button>
      </form>
    </div>
  );
}

// ======== ESTILOS REUTILIZADOS ========
const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #aaa"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#000",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer"
};

const loginContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  backgroundColor: "#fff"
};

const loginBox = {
  backgroundColor: "#f7f7f7",
  padding: "40px",
  borderRadius: "12px",
  width: "340px",
  textAlign: "center",
  border: "1px solid #ddd"
};

const containerMenu = {
  backgroundColor: "#fff",
  color: "#000",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center"
};

const gridMenu = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "25px",
  width: "90%",
  maxWidth: "600px"
};

const cardMenu = {
  backgroundColor: "#f7f7f7",
  borderRadius: "12px",
  padding: "25px",
  textAlign: "center",
  cursor: "pointer",
  border: "1px solid #ddd",
  transition: ".3s"
};
