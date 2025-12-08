// src/components/RecuperarDados.js
import React, { useState } from "react";

const RecuperarDados = () => {
    const [arquivo, setArquivo] = useState(null);
    const [dados, setDados] = useState([]);
    const [erro, setErro] = useState("");

    const handleFileChange = (e) => {
        setArquivo(e.target.files[0]);
        setDados([]);
        setErro("");
    };

    const handleRecuperar = () => {
        if (!arquivo) {
            setErro("⚠️ Selecione um arquivo JSON primeiro!");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                if (!Array.isArray(json)) {
                    throw new Error("Formato inválido: o arquivo deve ser um array de objetos");
                }
                setDados(json);
                setErro("");
            } catch (err) {
                setErro("❌ Erro ao ler o arquivo JSON: " + err.message);
            }
        };
        reader.readAsText(arquivo);
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h2>📂 Recuperar Dados do Backup</h2>

            <input type="file" accept=".json" onChange={handleFileChange} />
            <button
                onClick={handleRecuperar}
                style={{
                    marginLeft: 10,
                    padding: "6px 12px",
                    backgroundColor: "green",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                }}
            >
                Recuperar
            </button>

            {erro && <p style={{ color: "red", marginTop: 10 }}>{erro}</p>}

            {dados.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <h3>✅ Dados Recuperados ({dados.length})</h3>
                    <div
                        style={{
                            maxHeight: "400px",
                            overflowY: "auto",
                            border: "1px solid #ccc",
                            padding: 10,
                            borderRadius: 6,
                            background: "#f9f9f9",
                        }}
                    >
                        {dados.map((item, index) => (
                            <pre
                                key={index}
                                style={{
                                    background: "#fff",
                                    padding: 10,
                                    borderRadius: 6,
                                    marginBottom: 10,
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                                }}
                            >
                                {JSON.stringify(item, null, 2)}
                            </pre>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecuperarDados;
