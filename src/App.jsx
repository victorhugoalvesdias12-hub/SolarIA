import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [consumo, setConsumo] = useState("");
  const [cidade, setCidade] = useState("");
  const [tipoSistema, setTipoSistema] = useState("residencial");
  const [sombreamento, setSombreamento] = useState("baixa");
  const [sujeira, setSujeira] = useState("baixa");
  const [orientacao, setOrientacao] = useState("ideal");
  const [areaTelhado, setAreaTelhado] = useState("");
  const [larguraTelhado, setLarguraTelhado] = useState("");
  const [alturaTelhado, setAlturaTelhado] = useState("");
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");

  const normalizarTexto = (texto) => {
    return texto
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const calcular = () => {
    const hspPorCidade = {
      "rio de janeiro": 5.2,
      "sao paulo": 4.5,
      "belo horizonte": 5.1,
      salvador: 5.5,
      brasilia: 5.6,
      curitiba: 4.4,
      manaus: 5.0,
      recife: 5.4,
      fortaleza: 5.7,
      "porto alegre": 4.3,
      "volta redonda": 5.0,
      pinheiral: 5.0,
      "barra mansa": 5.0,
    };

    const perdasSombra = {
      baixa: 0.02,
      media: 0.05,
      alta: 0.1,
    };

    const perdasSujeira = {
      baixa: 0.01,
      media: 0.03,
      alta: 0.05,
    };

    const perdasOrientacao = {
      ideal: 0.0,
      boa: 0.03,
      ruim: 0.08,
    };

    const cidadeNormalizada = normalizarTexto(cidade);
    const consumoNumero = Number(consumo);
    const areaDisponivel = Number(areaTelhado);
    const largura = Number(larguraTelhado);
    const altura = Number(alturaTelhado);

    if (!consumo || consumoNumero <= 0) {
      setErro("Digite um consumo válido.");
      setResultado(null);
      return;
    }

    if (!cidadeNormalizada) {
      setErro("Digite uma cidade.");
      setResultado(null);
      return;
    }

    if (!areaTelhado || areaDisponivel <= 0) {
      setErro("Digite área válida.");
      setResultado(null);
      return;
    }

    if (!larguraTelhado || largura <= 0 || !alturaTelhado || altura <= 0) {
      setErro("Digite dimensões válidas do telhado.");
      setResultado(null);
      return;
    }

    setErro("");

    const HSP = hspPorCidade[cidadeNormalizada] || 5;
    const potenciaModulo = tipoSistema === "comercial" ? 0.66 : 0.55;
    const tarifa = tipoSistema === "comercial" ? 0.95 : 0.8;

    const perdaSombra = perdasSombra[sombreamento];
    const perdaSujeira = perdasSujeira[sujeira];
    const perdaOrientacao = perdasOrientacao[orientacao];

    const rendimento = 0.85 - perdaSombra - perdaSujeira - perdaOrientacao;

    const potenciaSistema = consumoNumero / (HSP * 30 * rendimento);
    const numeroPlacas = Math.ceil(potenciaSistema / potenciaModulo);
    const area = numeroPlacas * 2.3;

    const economiaMensal = consumoNumero * tarifa;
    const economiaAnual = economiaMensal * 12;

    const custoSistema = potenciaSistema * (tipoSistema === "comercial" ? 4500 : 5000);
    const payback = custoSistema / economiaAnual;

    // 🔥 OTIMIZAÇÃO DE ORIENTAÇÃO

    const placasLinha1 = Math.floor(largura / 1.1);
    const linhas1 = Math.floor(altura / 2.0);
    const total1 = placasLinha1 * linhas1;

    const placasLinha2 = Math.floor(largura / 2.0);
    const linhas2 = Math.floor(altura / 1.1);
    const total2 = placasLinha2 * linhas2;

    let placasPorLinha, linhas, placasPossiveis, orientacaoPlaca;

    if (total2 > total1) {
      placasPorLinha = placasLinha2;
      linhas = linhas2;
      placasPossiveis = total2;
      orientacaoPlaca = "Horizontal";
    } else {
      placasPorLinha = placasLinha1;
      linhas = linhas1;
      placasPossiveis = total1;
      orientacaoPlaca = "Vertical";
    }

    const cabeReal = numeroPlacas <= placasPossiveis;

    const dadosGrafico = Array.from({ length: 10 }, (_, i) => ({
      ano: `Ano ${i + 1}`,
      economia: economiaAnual * (i + 1),
      custo: custoSistema,
    }));

    setResultado({
      numeroPlacas,
      area,
      areaDisponivel,
      largura,
      altura,
      placasPorLinha,
      linhas,
      placasPossiveis,
      cabeReal,
      orientacaoPlaca,
      economiaMensal,
      economiaAnual,
      custoSistema,
      payback: payback.toFixed(1),
      dadosGrafico,
    });
  };

  const renderizarPlacas = () => {
    if (!resultado) return null;

    const max = Math.min(resultado.placasPossiveis, 24);
    return Array.from({ length: max }).map((_, i) => (
      <div key={i} style={{
        width: "40px",
        height: "20px",
        background: "#2563eb",
        borderRadius: "3px"
      }} />
    ));
  };

  return (
    <div style={{ display: "flex", gap: "40px", padding: "40px", color: "white", background: "#0f172a" }}>
      <div style={{ width: "400px" }}>
        <h2>SolarIA</h2>

        <input placeholder="Consumo" onChange={e => setConsumo(e.target.value)} />
        <input placeholder="Cidade" onChange={e => setCidade(e.target.value)} />
        <input placeholder="Área telhado" onChange={e => setAreaTelhado(e.target.value)} />
        <input placeholder="Largura telhado" onChange={e => setLarguraTelhado(e.target.value)} />
        <input placeholder="Altura telhado" onChange={e => setAlturaTelhado(e.target.value)} />

        <button onClick={calcular}>Calcular</button>

        {resultado && (
          <>
            <p>Placas necessárias: {resultado.numeroPlacas}</p>
            <p>Capacidade: {resultado.placasPossiveis}</p>
            <p>Orientação ideal: {resultado.orientacaoPlaca}</p>
            <p>Payback: {resultado.payback} anos</p>
            <p>{resultado.cabeReal ? "✅ Cabe" : "❌ Não cabe"}</p>
          </>
        )}
      </div>

      <div>
        <h3>Simulação</h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 40px)",
          gap: "10px",
          background: "#334155",
          padding: "20px"
        }}>
          {renderizarPlacas()}
        </div>
      </div>
    </div>
  );
}

export default App;