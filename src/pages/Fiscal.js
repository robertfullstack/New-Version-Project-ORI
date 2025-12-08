import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Fiscal = () => {
  const navigate = useNavigate();

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroLoja, setFiltroLoja] = useState("");
  const [selecionados, setSelecionados] = useState([]);
  const [arquivoUnico, setArquivoUnico] = useState(null);

  // Função para buscar solicitações do backend
  const buscarSolicitacoes = async () => {
    try {
      const usuario = localStorage.getItem("usuarioNome");
      const categoria = localStorage.getItem("usuarioCategoria");

      const res = await axios.post("http://localhost:3001/consultar", {
        usuario,
        categoria,
      });

      console.log("Solicitações recebidas:", res.data); // <-- aqui você vê todas as solicitações
      setSolicitacoes(res.data);
    } catch (erro) {
      console.error("Erro ao carregar solicitações:", erro);
    } finally {
      setCarregando(false);
    }
  };

  // Verifica se o usuário é Fiscal
  useEffect(() => {
    const categoria = localStorage.getItem("usuarioCategoria");
    if (categoria !== "Fiscal") {
      navigate("/");
    } else {
      buscarSolicitacoes();
    }
  }, [navigate]);

  // Função de toggle para selecionar/deselecionar solicitações
  const toggleSelecionado = (id) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Upload de documento para várias solicitações
  const handleUploadMultiplo = async () => {
    if (!arquivoUnico) {
      alert("⚠️ Selecione um arquivo para anexar!");
      return;
    }
    if (selecionados.length === 0) {
      alert("⚠️ Nenhuma solicitação selecionada!");
      return;
    }

    const nomeUsuario = localStorage.getItem("usuarioNome");
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64String = reader.result;

      try {
        for (const id of selecionados) {
          await axios.post("http://localhost:3001/atualizar-documento-fiscal", {
            id,
            documentoBase64: base64String,
            nomeDocumento: arquivoUnico.name,
            aprovadoPorFiscal: nomeUsuario,
            statusFiscal: "Aprovado",
          });
        }

        alert(`✅ Documento anexado a ${selecionados.length} solicitações!`);
        setSelecionados([]);
        setArquivoUnico(null);
        buscarSolicitacoes();
      } catch (err) {
        console.error(err);
        alert("Erro ao anexar documento");
      }
    };

    reader.readAsDataURL(arquivoUnico);
  };

  // Loader enquanto os dados carregam
  if (carregando) {
    return (
      <div style={styles.overlay}>
        <div style={styles.loaderBox}>
          <div style={styles.spinner}></div>
          <p style={{ fontSize: 18, marginTop: 10 }}>Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  // Filtra solicitações por loja origem/destino
  const solicitacoesFiltradas = solicitacoes.filter((item) =>
    filtroLoja === ""
      ? true
      : item.origem === filtroLoja || item.destino === filtroLoja
  );


  const lojasUnicas = Array.from(
    new Set(
      solicitacoes.flatMap((item) => [item.origem, item.destino].filter(Boolean))
    )
  );

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>---- Painel do Fiscal Geral ----</h2>

      {/* Filtro por loja */}
      <div style={{ marginBottom: "12px" }}>
        <select
          value={filtroLoja}
          onChange={(e) => setFiltroLoja(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "6px",
            width: "250px",
            border: "1px solid #bbb",
            fontSize: "14px",
          }}
        >
          <option value="">🔍 Filtrar por loja (origem/destino)</option>
          {lojasUnicas.map((loja) => (
            <option key={loja} value={loja}>
              {loja}
            </option>
          ))}
        </select>
      </div>

      {/* Upload de Nota Fiscal */}
      <div
        style={{
          background: "#fff",
          padding: 20,
          marginBottom: 25,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h3>Anexar Nota Fiscal Para as Solicitações</h3>

        <input
          type="file"
          onChange={(e) => setArquivoUnico(e.target.files[0])}
          style={{ marginTop: 10 }}
        />

        <button
          onClick={handleUploadMultiplo}
          style={{
            background: "green",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
            marginLeft: 10,
          }}
        >
          Enviar para Selecionadas ({selecionados.length})
        </button>
      </div>

      {/* Lista de solicitações */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "20px",
        }}
      >
        {solicitacoesFiltradas.map((sol) => (
          <div
            key={sol.id}
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: selecionados.includes(sol.id) ? "2px solid green" : "1px solid #ccc",
            }}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={selecionados.includes(sol.id)}
              onChange={() => toggleSelecionado(sol.id)}
              style={{ transform: "scale(1.4)", marginBottom: 10 }}
            />

            <h3 style={{ marginBottom: "10px", color: "#000" }}>
              Registro: <span style={{ color: "#333" }}>{sol.Registro}</span>
            </h3>

            <p><strong>Descrição:</strong> {sol.produto?.["Denominação do imobilizado"] || "—"}</p>
            <p><strong>Código:</strong> {sol.codigoBarras || sol.produto?.codigo || "—"}</p>
            <p><strong>Nº Filial:</strong> {sol.produto?.["Div"] || "—"}</p>
            <p><strong>Usuário Solicitante:</strong> {sol.usuario || "—"}</p>
            <p><strong>Categoria:</strong> {sol.categoria || "—"}</p>
            <p><strong>Loja/Origem:</strong> {sol.origem || "—"}</p>
            <p><strong>Loja/Destino:</strong> {sol.destino || "—"}</p>
            <p><strong>Motivo:</strong> {sol.motivo || "—"}</p>

            {sol.divergenciaRecebimento && (
              <p style={{ marginTop: 10 }}>
                <strong>Observação da Divergência:</strong><br />
                {sol.divergenciaRecebimento}
              </p>
            )}

            {sol.fotoDivergenciaBase64 && (
              <div style={{ marginTop: 10 }}>
                <strong>Foto da Divergência:</strong><br />
                <a href={sol.fotoDivergenciaBase64} target="_blank" rel="noreferrer" style={{ color: "blue", textDecoration: "underline" }}>
                  Abrir foto enviada
                </a>
              </div>
            )}

            <p><strong>Nome:</strong> {sol.nomeMalUso || "—"}</p>
            <p><strong>Cargo:</strong> {sol.cargoMalUso || "—"}</p>
            <p><strong>Defeito:</strong> {sol.defeitoMalUso || "—"}</p>
            <p><strong>Ocorrência:</strong> {sol.ocorrenciaMalUso || "—"}</p>
            <p><strong>Nome do Gerente:</strong> {sol.nomeGerente || "—"}</p>
            <p><strong>Valor:</strong> R$ {sol.valor || "—"}</p>

            {sol.statusFiscal === "Aprovado" && sol.dataAprovacaoFiscal && sol.aprovadoPorFiscal && (
              <p style={{ fontStyle: "italic", color: "#555", marginTop: 4 }}>
                Concluído por: {sol.aprovadoPorFiscal},{" "}
                {new Date(sol.dataAprovacaoFiscal).toLocaleString("pt-BR")}
              </p>
            )}

            <p>
              <strong>Status Geral:</strong>{" "}
              {sol.statusLoja && sol.recebidoPorLoja ? (
                <span style={{ fontWeight: "bold", color: "blue" }}>
                  Recebimento Concluído - Concluído por: {sol.recebidoPorLoja},{" "}
                  {sol.dataRecebimento ? new Date(sol.dataRecebimento).toLocaleString("pt-BR") : ""}
                </span>
              ) : (
                <span style={{ fontWeight: "bold", color: "green" }}>{sol.status}</span>
              )}
            </p>

            <hr style={{ margin: "15px 0" }} />

            {sol.documentoFiscalBase64 ? (
              <p>
                📎 Documento/Nota Fiscal:{" "}
                <a href={sol.documentoFiscalBase64} download={sol.nomeDocumento} target="_blank" rel="noreferrer">
                  {sol.nomeDocumento}
                </a>
              </p>
            ) : (
              <p style={{ opacity: 0.6 }}>Nenhum documento anexado ainda</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Loader styles
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    zIndex: 9999,
  },
  loaderBox: { textAlign: "center" },
  spinner: {
    width: "60px",
    height: "60px",
    border: "6px solid #fff",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
};

export default Fiscal;
