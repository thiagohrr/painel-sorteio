// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useState } from "react";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import jsQR from "jsqr";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const bancoDeCartelas = {
  "000001": {
    nome: "Márcio Campos Peixoto",
    vendedor: "Regininha Matriz",
    telefone: "(38) 99840-8418",
    endereco: "Rua das Flores, 123, Centro - Pirapora/MG",
  },
};

export default function PainelParticipacoes() {
  const [adminLogado, setAdminLogado] = useState(false);
  const [senha, setSenha] = useState("");
  const [participacoes, setParticipacoes] = useState([
    {
      cartela: "000001",
      nome: "Márcio Campos Peixoto",
      vendedor: "Regininha Matriz",
      telefone: "(38) 99840-8418",
      endereco: "Rua das Flores, 123, Centro - Pirapora/MG",
      imagemOriginal: "/recortes/000001.jpg",
      imagemLGPD: "/recortes/lgpd/000001.jpg",
      status: "validado",
    },
  ]);
  const [statusFiltro, setStatusFiltro] = useState("");
  const [vendedorFiltro, setVendedorFiltro] = useState("");
  const [relatorioCSV, setRelatorioCSV] = useState("");

  const gerarCSV = () => {
    const cabecalho = "Cartela,Nome,Telefone,Vendedor,Status\n";
    const linhas = participacoes.map(p => `${p.cartela},"${p.nome}","${p.telefone}","${p.vendedor}",${p.status}`).join("\n");
    const conteudo = cabecalho + linhas;
    const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    setRelatorioCSV(url);
  };

  const totais = participacoes.reduce((acc, p) => {
    acc.total++;
    acc[p.status] = (acc[p.status] || 0) + 1;
    acc.vendedores[p.vendedor] = (acc.vendedores[p.vendedor] || 0) + 1;
    return acc;
  }, { total: 0, validado: 0, pendente: 0, recusado: 0, vendedores: {} });

  const chartData = {
    labels: ["Validadas", "Pendentes", "Recusadas"],
    datasets: [
      {
        label: "Participações",
        data: [totais.validado, totais.pendente, totais.recusado],
        backgroundColor: ["#4ade80", "#facc15", "#f87171"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Participações por Status" },
    },
  };

  if (!adminLogado) {
    return (
      <div className="max-w-md mx-auto p-6 mt-20 border rounded-xl bg-white shadow">
        <h2 className="text-xl font-semibold mb-4 text-center">Login de Administrador</h2>
        <Input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && senha === "1234") setAdminLogado(true);
          }}
        />
        <p className="text-sm text-gray-500 mt-2 text-center">Digite a senha e pressione Enter</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Painel de Participações</h1>

      <div className="mb-6 p-4 bg-blue-50 rounded-xl">
        <Button onClick={() => window.print()} className="mb-4">Imprimir relatório</Button>
        <h2 className="text-xl font-semibold mb-2">Resumo</h2>
        <p>Total de participações: {totais.total}</p>
        <p>Validadas: {totais.validado || 0}</p>
        <p>Pendentes: {totais.pendente || 0}</p>
        <p>Recusadas: {totais.recusado || 0}</p>

        <div className="mt-2">
          <h3 className="font-semibold">Por vendedor:</h3>
          <ul className="list-disc ml-5">
            {Object.entries(totais.vendedores).map(([nome, qtd]) => (
              <li key={nome}>{nome}: {qtd}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Gráfico de Participações por Status</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>

        <div className="mt-6">
          <Label className="font-semibold">Filtrar por status:</Label>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          >
            <option value="">Todos</option>
            <option value="validado">Validados</option>
            <option value="pendente">Pendentes</option>
            <option value="recusado">Recusados</option>
          </select>
        </div>

        <div className="mt-4">
          <Label className="font-semibold">Filtrar por vendedor:</Label>
          <select
            value={vendedorFiltro}
            onChange={(e) => setVendedorFiltro(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          >
            <option value="">Todos</option>
            {Object.keys(totais.vendedores).map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <Button onClick={gerarCSV} className="mt-4">Gerar CSV</Button>
        {relatorioCSV && (
          <a
            href={relatorioCSV}
            download="relatorio.csv"
            className="block mt-2 text-blue-600 underline"
          >
            Baixar relatório CSV
          </a>
        )}
      </div>
    </div>
  );
}
