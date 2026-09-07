import React, { useState } from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Trash2, 
  FileEdit, 
  AlertCircle,
  Calendar,
  CreditCard,
  User,
  ArrowLeft
} from 'lucide-react';
import { Colaborador, Receita, CategoriaTipo } from '../types';
import { formatarMoeda, getMesReferenciaTexto } from '../utils/formatters';

interface ColabDashboardProps {
  collaborator: Colaborador;
  currentCategory: CategoriaTipo;
  currentDate: Date;
  receipts: Receita[];
  onBackToGlobal: () => void;
  onAddReceipt: (data: { titulo: string; valorTotal: number; observacoes: string }) => Promise<void>;
  onDeleteReceipt: (id: string) => Promise<void>;
  onOpenPaymentModal: (receiptId: string, receiptTitle: string) => void;
  onDeletePayment: (receiptId: string, paymentIndex: number, valor: number) => Promise<void>;
}

export const ColabDashboard: React.FC<ColabDashboardProps> = ({
  collaborator,
  currentCategory,
  currentDate,
  receipts,
  onBackToGlobal,
  onAddReceipt,
  onDeleteReceipt,
  onOpenPaymentModal,
  onDeletePayment,
}) => {
  const [titulo, setTitulo] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mes = currentDate.getMonth();
  const ano = currentDate.getFullYear();

  // Filtragem idêntica:
  // Data no mês e ano, colabId igual ao selecionado, categoria correspondente
  const filtradas = receipts.filter((r) => {
    const d = new Date(r.dataRef || r.dataCriacao || '');
    if (isNaN(d.getTime())) return false;

    const cat = r.categoria || 'Salário';
    const isColab = r.colabId === collaborator.id || r.utilizadorId === collaborator.id;

    return isColab && d.getMonth() === mes && d.getFullYear() === ano && cat === currentCategory;
  });

  // Ordena por data decrescente
  filtradas.sort((a, b) => {
    const dataA = a.dataRef || a.dataCriacao || '';
    const dataB = b.dataRef || b.dataCriacao || '';
    return dataB.localeCompare(dataA);
  });

  let totalPrevisto = 0;
  let totalRecebido = 0;

  filtradas.forEach((r) => {
    const arrayPgs = r.pagamentos || r.historicoPagamentos || [];
    const somaPg = arrayPgs.reduce((acc, p) => acc + (p.valor || 0), 0);
    totalPrevisto += r.valorTotal || 0;
    totalRecebido += somaPg;
  });

  const saldoRestante = totalPrevisto - totalRecebido;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valorTotal.replace(',', '.'));
    if (!titulo.trim() || isNaN(val) || val <= 0) {
      alert("Por favor, preencha o título e um valor válido.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddReceipt({
        titulo: titulo.trim(),
        valorTotal: val,
        observacoes: observacoes.trim(),
      });
      setTitulo('');
      setValorTotal('');
      setObservacoes('');
    } catch (err) {
      console.error(err);
      alert("Erro ao registrar entrada. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="dashboard-content" className="space-y-6">
      {/* Top Header with Back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToGlobal}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            title="Voltar para Visão Global"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="view-title"
                className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight"
              >
                {collaborator.nome}
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                {currentCategory}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{collaborator.setor || 'Colaborador SpeedNet'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onBackToGlobal}
          className="text-xs font-bold text-slate-600 hover:text-orange-600 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <span>Ir para Visão Geral da Empresa</span>
        </button>
      </div>

      {/* Summary Grid (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Previsto */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-500" />
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Previsto
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p id="sum-total" className="text-2xl sm:text-3xl font-black text-orange-600 tracking-tight">
            {formatarMoeda(totalPrevisto)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {filtradas.length} item(ns) neste mês
          </p>
        </div>

        {/* Total Recebido */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Recebido
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p id="sum-rec" className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
            {formatarMoeda(totalRecebido)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Amortizações e baixas parciais
          </p>
        </div>

        {/* Saldo Restante */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-400" />
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Saldo Restante
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p
            id="sum-rest"
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              saldoRestante > 0 ? 'text-red-600' : 'text-slate-800'
            }`}
          >
            {formatarMoeda(saldoRestante)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {saldoRestante <= 0 ? 'Quitado integralmente' : 'Pendente de pagamento'}
          </p>
        </div>
      </div>

      {/* Formulário: Nova Entrada de Valor */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div
            id="titulo-nova-entrada"
            className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-orange-600" />
            <span>
              Nova Entrada de Valor{' '}
              <span className="text-slate-400 font-normal lowercase">
                {getMesReferenciaTexto(currentDate)}
              </span>
            </span>
          </div>
          <span className="text-xs font-semibold text-orange-600 px-2.5 py-0.5 rounded-md bg-orange-50">
            Categoria: {currentCategory}
          </span>
        </div>

        <form id="form-receita" onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Título descritivo
              </label>
              <input
                id="rec-title"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Adiantamento Quinzena, Comissão Instalação..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Valor Total (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  R$
                </span>
                <input
                  id="rec-val"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value)}
                  placeholder="0,00"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Observações adicionais (opcional)
            </label>
            <textarea
              id="rec-obs"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: 5 Ordens de Serviço executadas com êxito..."
              rows={2}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition resize-y"
            />
          </div>

          <button
            type="submit"
            id="btn-submit-lancamento"
            disabled={isSubmitting}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md shadow-orange-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              'Registrando no banco...'
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Registrar {currentCategory} no Mês Atual</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Seção: Relatório Detalhado de Lançamentos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Relatório Detalhado ({filtradas.length})
          </h3>
          <span className="text-xs text-slate-400">
            {currentCategory} • {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div id="list-receitas" className="space-y-4">
          {filtradas.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30 text-orange-600" />
              <p className="text-sm font-semibold">Nenhum lançamento de {currentCategory} neste mês.</p>
              <p className="text-xs mt-1 text-slate-400">
                Utilize o formulário acima para adicionar uma nova entrada de valor.
              </p>
            </div>
          ) : (
            filtradas.map((r) => {
              const arrayPgs = r.pagamentos || r.historicoPagamentos || [];
              const somaPg = arrayPgs.reduce((acc, p) => acc + (p.valor || 0), 0);
              const restante = (r.valorTotal || 0) - somaPg;
              const isQuitado = restante <= 0.01;
              const percentual = Math.min(100, Math.round((somaPg / (r.valorTotal || 1)) * 100));

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 border-l-6 border-l-orange-500 hover:shadow-md transition space-y-4"
                >
                  {/* Item Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg font-black text-slate-900">
                        {r.titulo}
                      </span>
                      {isQuitado && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Totalmente Quitado ✅
                        </span>
                      )}
                    </div>
                    <span className="text-lg sm:text-xl font-black text-orange-600">
                      {formatarMoeda(r.valorTotal)}
                    </span>
                  </div>

                  {/* Summary Bar */}
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Recebido:</span>
                      <strong className="text-emerald-700 font-bold">{formatarMoeda(somaPg)}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Restante:</span>
                      <strong className={restante > 0 ? 'text-red-600 font-bold' : 'text-slate-700'}>
                        {formatarMoeda(restante)}
                      </strong>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">{percentual}%</span>
                  </div>

                  {/* Observations */}
                  {r.observacoes && (
                    <div className="p-3 bg-orange-50/50 border border-orange-100/80 rounded-xl text-xs text-slate-700">
                      <strong className="text-orange-900">Obs:</strong> {r.observacoes}
                    </div>
                  )}

                  {/* Payment History List */}
                  {arrayPgs.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Histórico de Pagamentos e Baixas ({arrayPgs.length}):</span>
                      </div>

                      <div className="space-y-2 divide-y divide-slate-200/80">
                        {arrayPgs.map((p, idx) => (
                          <div
                            key={idx}
                            className="pt-2 first:pt-0 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-3 font-semibold">
                                <span className="text-slate-600 flex items-center gap-1 text-[11px]">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span>{p.data}</span>
                                </span>
                                <span className="text-emerald-600 font-bold">
                                  + {formatarMoeda(p.valor)}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border-l-2 border-orange-500 border border-slate-200">
                                {p.obs || p.observacao || 'Sem nota adicional.'}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => onDeletePayment(r.id, idx, p.valor)}
                              title="Apagar este pagamento individual"
                              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onOpenPaymentModal(r.id, r.titulo)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Baixar Valor</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteReceipt(r.id)}
                      className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Tudo</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
