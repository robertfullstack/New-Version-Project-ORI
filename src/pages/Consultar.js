import React, { useEffect, useState } from "react";
import axios from "axios";

const Consultar = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const labels = {
    nomeGerente: "Nome do Gerente",
    usuario: "Usuário Solicitante",
    categoria: "Categoria",
    loja: "Loja",
    origem: "Origem",
    destino: "Destino",
    rotaEnvio: "Rota de Envio",
    volume: "Volume",
    valor: "Valor R$",
    motivo: "Motivo",
    registro: "Registro",
    produtoDescricao: "Descrição do Produto",
    produtoCodigo: "Código do Produto",
    dataCriacao: "Data de Criação",
    nomeMalUso: "Nome Funcionário (Mal Uso)",
    cargoMalUso: "Cargo Funcionário (Mal Uso)",
    defeitoMalUso: "Defeito (Mal Uso)",
    ocorrenciaMalUso: "Ocorrência (Mal Uso)",
    codigoBarras: "Código de Barras",
    produtoFinial: "Destino",
    documentoSolicitanteBase64: "Imagem Item",
    documentoFiscalBase64: "Nota Adicionado Pelo Fiscal",
    aprovadoPorFiscal: "Provado Pelo Fiscal",
    statusFiscal: "Status",
    dataAprovacaoFiscal: "Data de Aprovação Fiscal",
  };

  const usuarioLogado = localStorage.getItem("usuarioNome");
  const categoriaLogado = localStorage.getItem("usuarioCategoria");

  const [modalAberta, setModalAberta] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const abrirModal = (sol) => {
    setSolicitacaoSelecionada(sol);
    setModalAberta(true);
  };

  const fecharModal = () => {
    setModalAberta(false);
    setSolicitacaoSelecionada(null);
  };
  const formatarDataHora = (data) => {
    if (!data) return "";

    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };
  const [filtroStatus, setFiltroStatus] = useState("Todos");


  // Update status
  const atualizarStatus = (id, novoStatus) => {
    axios
      .post("http://localhost:3001/atualizar-status", { id, status: novoStatus })
      .then(() => {
        setSolicitacoes((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: novoStatus } : s))
        );
      })
      .catch((err) => {
        console.error("Erro ao atualizar status:", err);
        alert("Erro ao atualizar status");
      });
  };
  const editarItem = (id, descricaoAtual, valorAtual) => {
    const novoNome = prompt("Digite o novo nome do produto:", descricaoAtual);
    if (novoNome === null) return;

    const novoValor = prompt("Digite o novo valor do produto:", valorAtual);
    if (novoValor === null) return;

    axios
      .post("http://localhost:3001/atualizar-item", {
        id,
        produtoDescricao: novoNome,
        valor: parseFloat(novoValor),
      })
      .then(() => {
        setSolicitacoes(prev =>
          prev.map(s => s.id === id ? { ...s, produtoDescricao: novoNome, valor: parseFloat(novoValor) } : s)
        );
        alert("Item atualizado com sucesso!");
      })
      .catch(err => {
        console.error(err);
        alert("Erro ao atualizar item");
      });
  };


  // Search solicitações
  useEffect(() => {
    axios
      .post("http://localhost:3001/consultar", {
        usuario: usuarioLogado,
        categoria: categoriaLogado,
      })
      .then((res) => {
        setSolicitacoes(res.data);
        setCarregando(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar solicitações:", err);
        setCarregando(false);
      });
  }, [usuarioLogado, categoriaLogado]);

  if (carregando) {
    return <h2 style={{ textAlign: "center" }}>⏳ Carregando solicitações...</h2>;
  }
  const solicitacoesFiltradas =
    filtroStatus === "Todos"
      ? solicitacoes
      : solicitacoes.filter((s) => s.status === filtroStatus);
  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>
        📦 Solicitações{" "}
        {categoriaLogado === "Supervisor"
          ? "(Todas)"
          : categoriaLogado === "Operacoes"
            ? "(Pendentes + Aprovadas)"
            : categoriaLogado === "Contábil"
              ? "(Apenas Aprovadas)"
              : `(Usuário: ${usuarioLogado})`}

      </h2>
      <div style={{ marginBottom: "15px" }}>
        <label><strong>Filtrar por status: </strong></label>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          style={{ padding: "6px", marginLeft: "10px", borderRadius: "6px" }}
        >
          <option value="Todos">Todos</option>
          <option value="Aprovado">Aprovados</option>
          <option value="Reprovado">Reprovados</option>
          <option value="Pendente">Pendentes</option>
        </select>
      </div>

      {solicitacoes.length === 0 ? (
        <h3>Nenhuma solicitação encontrada.</h3>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
          <thead>
            <tr style={{ background: "#f3f3f3" }}>
              {/* <th style={st.th}>ID</th> */}
              <th style={st.th}>Produto</th>
              <th style={st.th}>Usuário Solicitante</th>
              <th style={st.th}>Origem</th>
              <th style={st.th}>Destino</th>
              <th style={st.th}>Status</th>
              <th style={st.th}>Data de Criação</th>

              {(categoriaLogado === "Supervisor" || categoriaLogado === "Operacoes" || categoriaLogado === "Contabil") && (
                <th style={st.th}>Ações</th>
              )}
              <th style={st.th}>Detalhes</th>
            </tr>
          </thead>

          <tbody>
            {solicitacoesFiltradas.map((s) => (

              <tr key={s.id}>
                {/* <td style={st.td}>{s.id}</td> */}
                <td style={st.td}>{s.produtoDescricao}</td>
                <td style={st.td}>{s.usuario}</td>
                <td style={st.td}>{s.origem}</td>
                <td style={st.td}>{s.destino}</td>
                <td style={{ ...st.td, fontWeight: "bold" }}>{s.status}</td>
                {/* <td style={st.td}>{new Date(s.data).toLocaleString("pt-BR")}</td> */}
                <td style={st.td}>{formatarDataHora(s.dataCriacao)}</td>


                {(categoriaLogado === "Supervisor" || categoriaLogado === "Operacoes" || categoriaLogado === "Contabil") && (
                  <td style={st.td}>

                    {categoriaLogado === "Supervisor" || categoriaLogado === "Operacoes" ? (
                      <>
                        <button
                          style={btnGreen}
                          onClick={() => atualizarStatus(s.id, "Aprovado")}
                        >
                          Aprovar
                        </button>
                        <button
                          style={btnRed}
                          onClick={() => atualizarStatus(s.id, "Reprovado")}
                        >
                          Reprovar
                        </button>
                      </>
                    ) : null}

                    {categoriaLogado === "Contabil" ? (
                      <button
                        style={btnBlue}
                        onClick={() => editarItem(s.id, s.produtoDescricao, s.valor)}
                      >
                        Editar
                      </button>
                    ) : null}
                  </td>


                )}

                <td style={st.td}>
                  <button style={btnBlue} onClick={() => abrirModal(s)}>
                    ...
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      )}
      {modalAberta && solicitacaoSelecionada && (
        <div style={modalStyle.overlay}>
          <div style={modalStyle.content}>
            <h3>Detalhes da Solicitação #{solicitacaoSelecionada.id}</h3>
            <button style={modalStyle.closeBtn} onClick={fecharModal}>
              ✖
            </button>
            <div style={{ marginTop: 10 }}>
              {Object.entries(solicitacaoSelecionada)
                .filter(([key]) =>
                  key !== "nomeDocumentoSolicitante" &&
                  key !== "nomeDocumento" &&
                  key !== "id" &&
                  key !== "categoria" &&
                  key !== "loja"
                )
                .sort(([a], [b]) => {
                  const ordem = ["usuario", "origem", "destino", "nomeGerente", "codigoBarras"];

                  const posA = ordem.indexOf(a);
                  const posB = ordem.indexOf(b);

                  if (posA !== -1 && posB !== -1) return posA - posB;
                  if (posA !== -1) return -1;
                  if (posB !== -1) return 1;
                  return 0;
                })
                .map(([key, value]) => {
                  let texto = value ?? "—";
                  if (
                    ["nomeMalUso", "cargoMalUso", "defeitoMalUso", "ocorrenciaMalUso"].includes(key)
                  ) {
                    if (solicitacaoSelecionada.motivo !== "Mal Uso") {
                      return null;
                    }
                  }

                  // Formatar datas
                  if (key === "dataAprovacaoFiscal" || key === "dataCriacao") {
                    texto = value ? formatarDataHora(value) : "—";
                  }

                  // Formatar usuário
                  if (key === "usuario") {
                    texto = `${solicitacaoSelecionada.usuario}, ${solicitacaoSelecionada.categoria} - Loja ${solicitacaoSelecionada.loja}`;
                  }

                  texto = texto.toString();

                  const isBase64Image =
                    typeof texto === "string" && texto.startsWith("data:image");

                  return (
                    <div key={key} style={{ marginBottom: 8 }}>
                      <strong>{labels[key] || key}:</strong>

                      {isBase64Image ? (
                        <div>
                          <img
                            src={texto}
                            alt={key}
                            style={{ width: "200px", marginTop: 5, borderRadius: 8 }}
                          />
                        </div>
                      ) : (
                        <span> {texto}</span>
                      )}
                    </div>
                  );
                })}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Styles Here
const st = {
  th: {
    borderBottom: "2px solid #e0e0e0",
    padding: "12px",
    textAlign: "center",
    background: "#f8f9fa",
    fontWeight: "600",
    color: "#333",
  },
  td: {
    borderBottom: "1px solid #eee",
    padding: "12px",
    textAlign: "center",
    color: "#444",
  },
};

const tabelaContainer = {
  width: "100%",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
  marginTop: "15px",
};

const btnGreen = {
  backgroundColor: "#28a745",
  color: "#fff",
  marginRight: "5px",
  padding: "6px 12px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "0.2s",
};

const btnRed = {
  backgroundColor: "#dc3545",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "0.2s",
};

const btnBlue = {
  backgroundColor: "#007bff",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "5px",
  transition: "0.2s",
};

const estilos = {
  linhaHover: {
    cursor: "pointer",
    backgroundColor: "#f5f5f5",
  },
};

const modalStyle = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  content: {
    background: "#fff",
    padding: 25,
    borderRadius: 12,
    width: "60%",
    maxHeight: "80%",
    overflowY: "auto",
    position: "relative",
    boxShadow: "0px 3px 15px rgba(0,0,0,0.3)",
    animation: "fadeIn 0.3s ease",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "5px 10px",
    cursor: "pointer",
  },
};


export default Consultar;
