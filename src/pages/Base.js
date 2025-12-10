import React, { useState } from "react";
import base from "./BASE-ATUALIZADA-DEZ-25.json";

const Base = () => {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");

  const [arquivo, setArquivo] = useState(null);
  const [arquivoBase64, setArquivoBase64] = useState(null);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [arquivoTemp, setArquivoTemp] = useState(null);

  const converterParaBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(leitor.result);
      leitor.onerror = (erro) => reject(erro);
      leitor.readAsDataURL(file);
    });
  };

  const handleArquivo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setArquivoTemp(file);
    setMostrarModal(true);
  };

  const confirmarUpload = async () => {
    if (!arquivoTemp) return;

    const base64 = await converterParaBase64(arquivoTemp);

    setArquivo(arquivoTemp);
    setArquivoBase64(base64);

    setMostrarModal(false);
  };

  const cancelarUpload = () => {
    setArquivoTemp(null);
    setMostrarModal(false);
  };

  const buscarItem = () => {
    if (!codigo.trim()) {
      setErro("Digite um número de inventário");
      setResultado(null);
      return;
    }

    const item = base.find((i) => i["Nº inventário"] === codigo.trim());
    setResultado(item || null);
    setErro(item ? "" : "Nenhum item encontrado.");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Consulta de Inventário + Upload</h2>

      <input
        type="text"
        placeholder="Digite o Nº inventário"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        style={{ padding: "8px", width: "250px", marginRight: "10px" }}
      />

      <button onClick={buscarItem} style={{ padding: "8px 16px" }}>
        Consultar
      </button>

      {erro && (
        <p style={{ color: "red", marginTop: "20px" }}>{erro}</p>
      )}

      {resultado && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        >
          <p><b>Nº inventário:</b> {resultado["Nº inventário"]}</p>
          <p><b>Descrição:</b> {resultado["Denominação do imobilizado"]}</p>
          <p><b>Empresa:</b> {resultado["Empr"]}</p>
          <p><b>Nº Filial:</b> {resultado["Div"]}</p>
        </div>
      )}

      <div style={{ marginTop: 15 }}>
        <label><b>Anexar arquivo:</b></label><br />
        <input type="file" onChange={handleArquivo} />

        {arquivo && (
          <p style={{ marginTop: 8 }}>
            Arquivo selecionado: <b>{arquivo.name}</b>
          </p>
        )}
      </div>

      {mostrarModal && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100%", height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "10px",
              width: "350px",
              textAlign: "center",
              boxShadow: "0 0 12px #000"
            }}
          >
            <h3 style={{ color: "red", marginBottom: 10 }}>
              ⚠️ Tem certeza que deseja continuar?
            </h3>

            <p style={{ marginBottom: 20, fontSize: 15 }}>
              Você está prestes a anexar um arquivo que poderá <b>alterar a base do sistema</b>.
            </p>

            <button
              onClick={confirmarUpload}
              style={{
                background: "green",
                color: "#fff",
                padding: "10px 18px",
                border: "none",
                borderRadius: 6,
                marginRight: 8,
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Confirmar
            </button>

            <button
              onClick={cancelarUpload}
              style={{
                background: "red",
                color: "#fff",
                padding: "10px 18px",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Base;
