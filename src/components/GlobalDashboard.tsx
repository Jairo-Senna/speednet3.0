import React from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { Colaborador, Receita, CategoriaTipo } from '../types';
import { formatarMoeda } from '../utils/formatters';

interface GlobalDashboardProps {
  currentCategory: CategoriaTipo;
  collaborators: Colaborador[];
  receipts: Receita[];
  currentDate: Date;
  onSelectCollaborator: (colabId: string) => void;
}

export const GlobalDashboard: React.FC<GlobalDashboardProps> = ({
  currentCategory,
  collaborators,
  receipts,
  currentDate,
  onSelectCollaborator,
}) => {
  const mes = currentDate.getMonth();
  const ano = currentDate.getFullYear();

  // Filtragem idêntica à lógica do código original:
  // 1. Data dentro do mês e ano
  // 2. Categoria correspondente (ou 'Salário' se ausente)
  // 3. Colaborador ativo (anti-fantasma)
  const activeColabIds = new Set(collaborators.map((c) => c.id));

  const filteredReceipts = receipts.filter((r) => {
    const d = new Date(r.dataRef || r.dataCriacao || '');
    if (isNaN(d.getTime())) return false;

    const isMes = d.getMonth() === mes && d.getFullYear() === ano;
    const cat = r.categoria || 'Salário';
    const isCategoria = cat === currentCategory;

    const colabId = r.colabId || r.utilizadorId || '';
    const isAtivo = activeColabIds.has(colabId);

    return isMes && isCategoria && isAtivo;
  });

  let totalGeral = 0;
  let recebidoGeral = 0;

  filteredReceipts.forEach((r) => {
    const arrayPgs = r.pagamentos || r.historicoPagamentos || [];
    const somaPg = arrayPgs.reduce((acc, p) => acc + (p.valor || 0), 0);
    totalGeral += r.valorTotal || 0;
    recebidoGeral += somaPg;
  });

  const saldoRestante = totalGeral - recebidoGeral;
  const percentualConcluido = totalGeral > 0 ? Math.min(100, Math.round((recebidoGeral / totalGeral) * 100)) : 0;

  // Detalhamento por colaborador para o mês e categoria
  const colabsSummary = collaborators.map((colab) => {
    const colabReceipts = filteredReceipts.filter(
      (r) => (r.colabId === colab.id || r.utilizadorId === colab.id)
    );

    let prev = 0;
    let rec = 0;

    colabReceipts.forEach((r) => {
      const pgs = r.pagamentos || r.historicoPagamentos || [];
      const soma = pgs.reduce((acc, p) => acc + (p.valor || 0), 0);
      prev += r.valorTotal || 0;
      rec += soma;
    });

    const pendente = prev - rec;
    const countLançamentos = colabReceipts.length;

    return {
      colab,
      prev,
      rec,
      pendente,
      countLançamentos,
    };
  }).filter((item) => item.prev > 0 || item.countLançamentos > 0);

  return (
    <div id="global-dashboard" className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h2
            id="titulo-visao-geral"
            className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2"
          >
            <span>Visão Geral</span>
            <span className="text-orange-600">— {currentCategory}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidação de todos os lançamentos e baixas da empresa para este período
          </p>
        </div>

        {totalGeral > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold self-start sm:self-auto">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{percentualConcluido}% pago</span>
          </div>
        )}
      </div>

      {/* Summary Grid (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Previsto */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-orange-200 transition">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-500" />
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Previsto (Empresa)
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p id="global-sum-total" className="text-2xl sm:text-3xl font-black text-orange-600 tracking-tight">
            {formatarMoeda(totalGeral)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {filteredReceipts.length} lançamento(s) registrado(s)
          </p>
        </div>

        {/* Total Recebido */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Pago / Recebido (Empresa)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p id="global-sum-rec" className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
            {formatarMoeda(recebidoGeral)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalGeral > 0 ? `${percentualConcluido}% liquidado` : 'Nenhum valor pendente'}
          </p>
        </div>

        {/* Saldo Restante */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-slate-300 transition">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-400" />
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Saldo Restante (Empresa)
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p
            id="global-sum-rest"
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              saldoRestante > 0 ? 'text-red-600' : 'text-slate-800'
            }`}
          >
            {formatarMoeda(saldoRestante)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {saldoRestante <= 0 ? 'Folha de pagamento 100% quitada' : 'Aguardando liquidação'}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {totalGeral > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
            <span>Progresso da Liquidação ({currentCategory})</span>
            <span className="text-orange-600">{percentualConcluido}% concluído</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${percentualConcluido}%` }}
            />
          </div>
        </div>
      )}

      {/* Collaborator breakdown list / Empty state */}
      {colabsSummary.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Detalhamento por Colaborador neste Mês
            </h3>
            <span className="text-xs text-slate-400">
              Clique em um funcionário para gerenciar
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {colabsSummary.map(({ colab, prev, rec, pendente }) => {
              const quitado = pendente <= 0.01;
              return (
                <div
                  key={colab.id}
                  onClick={() => onSelectCollaborator(colab.id)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-orange-400 hover:shadow-md transition cursor-pointer bg-slate-50/50 hover:bg-white group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 group-hover:text-orange-600 transition">
                        {colab.nome}
                      </h4>
                      <p className="text-xs text-slate-500">{colab.setor || 'Colaborador'}</p>
                    </div>
                    {quitado ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Quitado
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pendente
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Previsto</span>
                      <span className="font-bold text-slate-700">{formatarMoeda(prev)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pago</span>
                      <span className="font-bold text-emerald-600">{formatarMoeda(rec)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Restante</span>
                      <span className={`font-bold ${pendente > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                        {formatarMoeda(pendente)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-end text-[11px] font-bold text-orange-600 group-hover:translate-x-0.5 transition">
                    <span>Acessar lançamentos</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto text-3xl shadow-inner">
            <UserCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Tudo pronto!</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Selecione um colaborador na barra lateral para ver detalhes, adicionar lançamentos de{' '}
            <strong className="text-orange-600">{currentCategory}</strong> ou gerir pagamentos.
          </p>
        </div>
      )}
    </div>
  );
};
