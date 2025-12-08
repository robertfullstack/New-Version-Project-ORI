import React, { useEffect, useState } from "react";
import axios from "axios";
import confetti from "canvas-confetti";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ConsultarRecebimentos = () => {
    const [recebimentos, setRecebimentos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [textoDivergencia, setTextoDivergencia] = useState("");
    const [fotoDivergenciaBase64, setFotoDivergenciaBase64] = useState(null);
    const [idSelecionado, setIdSelecionado] = useState(null);

    useEffect(() => {
        buscarRecebimentos();
    }, []);

    const buscarRecebimentos = async () => {
        const loja = localStorage.getItem("usuarioLoja");
        if (!loja) return;

        try {
            const res = await axios.get(`http://localhost:3001/recebimentos/${loja}`);
            setRecebimentos(res.data);
        } catch {
            toast.error("Erro ao buscar recebimentos!");
        }
        setCarregando(false);
    };

    const converterArquivoParaBase64 = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    };

    const registrarRecebimento = async (id) => {
        const usuario = localStorage.getItem("usuarioNome");

        try {
            await axios.put(`http://localhost:3001/recebimento/ok/${id}`, { usuario });

            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            toast.success(`Recebimento concluído por ${usuario}!`);
            buscarRecebimentos();
        } catch {
            toast.error("Erro ao registrar recebimento!");
        }
    };

    const abrirModalDivergencia = (id) => {
        setIdSelecionado(id);
        setMostrarModal(true);
    };

    const salvarDivergencia = async () => {
        if (!textoDivergencia.trim()) {
            toast.error("Digite a divergência!");
            return;
        }

        const usuario = localStorage.getItem("usuarioNome");

        try {
            await axios.put(`http://localhost:3001/recebimento/divergencia/${idSelecionado}`, {
                usuario,
                texto: textoDivergencia,
                foto: fotoDivergenciaBase64,
            });

            toast.warn("⚠️ Recebimento registrado com divergência!");
            setMostrarModal(false);
            setTextoDivergencia("");
            setFotoDivergenciaBase64(null);
            buscarRecebimentos();
        } catch {
            toast.error("Erro ao registrar divergência!");
        }
    };

    if (carregando) return <p>Carregando recebimentos...</p>;

    return (
        <div style={{ padding: 20 }}>
            <h1>Consultar Recebimentos</h1>

            {mostrarModal && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 8, padding: 20, width: 420 }}>
                        <h2>Registrar Divergência</h2>
                        <textarea
                            value={textoDivergencia}
                            onChange={(e) => setTextoDivergencia(e.target.value)}
                            placeholder="Descreva o problema..."
                            style={{ width: "100%", height: 120 }}
                        />

                        <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setFotoDivergenciaBase64(await converterArquivoParaBase64(file));
                            }}
                        />

                        {fotoDivergenciaBase64 && (
                            <img src={fotoDivergenciaBase64} alt="preview" style={{ width: "100%", marginTop: 10 }} />
                        )}

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 15 }}>
                            <button onClick={() => setMostrarModal(false)}>Cancelar</button>
                            <button style={{ background: "red", color: "#fff" }} onClick={salvarDivergencia}>
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {recebimentos.length === 0 ? (
                <p>Nenhum recebimento para sua loja.</p>
            ) : (
                recebimentos.map((item) => (
                    <div key={item.id} style={{ padding: 15, background: "#f4f4f4", borderRadius: 8, border: "1px solid #ccc", marginBottom: 15 }}>
                        <h3>Registro: {item.registro}</h3>
                        <p><strong>Origem:</strong> {item.origem}</p>
                        <p><strong>Destino:</strong> {item.destino}</p>
                        <p><strong>Status:</strong> {item.status}</p>
                        <p><strong>Produto:</strong> {item.produtoDescricao}</p>

                        {item.status !== "Recebimento Concluído" && item.status !== "Recebimento com Divergência" && (
                            <div style={{ marginTop: 10, display: "flex", gap: 20 }}>
                                <button style={{ background: "green", color: "#fff" }} onClick={() => registrarRecebimento(item.id)}>
                                    ✔️ OK
                                </button>
                                <span style={{ cursor: "pointer", textDecoration: "underline", fontWeight: "bold" }} onClick={() => abrirModalDivergencia(item.id)}>
                                    Registrar Divergência
                                </span>
                            </div>
                        )}
                    </div>
                ))
            )}

            <ToastContainer />
        </div>
    );
};

export default ConsultarRecebimentos;
