import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Filter, 
  Calendar, 
  ArrowUpDown, 
  Sparkles 
} from 'lucide-react';
import { Colaborador, Receita, CategoriaTipo } from '../types';
import { CATEGORIAS, formatarMoeda } from '../utils/formatters';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: Colaborador[];
  receipts: Receita[];
  currentDate: Date;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  collaborators,
  receipts,
  currentDate,
}) => {
  // Inicializa com todas as categorias marcadas
  const [selectedCategories, setSelectedCategories] = useState<CategoriaTipo[]>([
    'Salário',
    'Comissões',
    'Extras',
    'Bonificação',
    'Metas',
  ]);

  // Formato YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const y = currentDate.getFullYear();
    const m = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  });

  const [sortOrder, setSortOrder] = useState<'decrescente' | 'crescente' | 'alfabetica'>('decrescente');
  const [copied, setCopied] = useState(false);

  // Atualiza o mês quando a data global mudar
  useEffect(() => {
    if (isOpen) {
      const y = currentDate.getFullYear();
      const m = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      setSelectedMonth(`${y}-${m}`);
      setSelectedCategories(['Salário', 'Comissões', 'Extras', 'Bonificação', 'Metas']);
      setCopied(false);
    }
  }, [isOpen, currentDate]);

  const toggleCategory = (cat: CategoriaTipo) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const toggleAllCategories = () => {
    if (selectedCategories.length === CATEGORIAS.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(CATEGORIAS.map((c) => c.id));
    }
  };

  // Gerador dinâmico do texto do relatório conforme a lógica exata do código original
  const reportText = useMemo(() => {
    if (!selectedMonth) return '';
    if (selectedCategories.length === 0) {
      return 'Selecione pelo menos uma categoria acima para gerar o relatório.';
    }

    const [anoStr, mesStr] = selectedMonth.split('-');
    const ano = parseInt(anoStr, 10);
    const mes = parseInt(mesStr, 10) - 1;

    const activeColabIds = new Set(collaborators.map((c) => c.id));

    // Filtra receitas do mês, categoria selecionada e colaborador ativo (anti-fantasmas)
    const recsDoMes = receipts.filter((r) => {
      const d = new Date(r.dataRef || r.dataCriacao || '');
      if (isNaN(d.getTime())) return false;

      const isMes = d.getMonth() === mes && d.getFullYear() === ano;
      const cat = (r.categoria || 'Salário') as CategoriaTipo;
      const isInSelectedCategories = selectedCategories.includes(cat);

      const colabId = r.colabId || r.utilizadorId || '';
      const isAtivo = activeColabIds.has(colabId);

      return isMes && isInSelectedCategories && isAtivo;
    });

    let totalGeral = 0;
    let recebidoGeral = 0;
    const dadosPorColab: Record<
      string,
      { nome: string; setor?: string; pendenteTotal: number; detalheCategoria: Record<string, number> }
    > = {};

    recsDoMes.forEach((r) => {
      const arrayPgs = r.pagamentos || r.historicoPagamentos || [];
      const somaPg = arrayPgs.reduce((acc, p) => acc + (p.valor || 0), 0);

      totalGeral += r.valorTotal || 0;
      recebidoGeral += somaPg;

      const colabId = r.colabId || r.utilizadorId || 'sem-id';
      if (!dadosPorColab[colabId]) {
        const user = collaborators.find((u) => u.id === colabId);
        const nomeDisplay = user ? user.nome.toUpperCase() : `OUTRO (Ref: ${r.titulo || 'Sem título'})`;
        dadosPorColab[colabId] = {
          nome: nomeDisplay,
          setor: user?.setor,
          pendenteTotal: 0,
          detalheCategoria: {},
        };
      }

      const pendenteDaReceita = (r.valorTotal || 0) - somaPg;
      dadosPorColab[colabId].pendenteTotal += pendenteDaReceita;

      const cat = (r.categoria || 'Salário') as string;
      if (!dadosPorColab[colabId].detalheCategoria[cat]) {
        dadosPorColab[colabId].detalheCategoria[cat] = 0;
      }
      dadosPorColab[colabId].detalheCategoria[cat] += pendenteDaReceita;
    });

    let listaOrdenada = Object.values(dadosPorColab);
    if (sortOrder === 'crescente') {
      listaOrdenada.sort((a, b) => a.pendenteTotal - b.pendenteTotal);
    } else if (sortOrder === 'decrescente') {
      listaOrdenada.sort((a, b) => b.pendenteTotal - a.pendenteTotal);
    } else {
      listaOrdenada.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }));
    }

    const dtRef = new Date(ano, mes, 10);
    const nomeMesAno = dtRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

    let texto = `*FECHAMENTO DO MÊS - ${nomeMesAno}*\n`;
    texto += `_Categorias: ${selectedCategories.join(', ')}_\n\n`;
    texto += `📊 *Resumo Consolidado*\n`;
    texto += `Total Previsto: ${formatarMoeda(totalGeral)}\n`;
    texto += `Total Recebido: ${formatarMoeda(recebidoGeral)}\n`;
    texto += `Total Pendente: ${formatarMoeda(totalGeral - recebidoGeral)}\n\n`;
    texto += `👥 *Detalhes por Colaborador:*\n`;

    if (listaOrdenada.length === 0) {
      texto += `Nenhum registo financeiro encontrado para os filtros selecionados.\n`;
    } else {
      listaOrdenada.forEach((d) => {
        if (d.pendenteTotal <= 0.01) {
          texto += `- *${d.nome}*: Pagamento finalizado ✅\n`;
        } else {
          texto += `- *${d.nome}*: Total Pendente (${formatarMoeda(d.pendenteTotal)}) ⏳\n`;

          const linhaDetalhes: string[] = [];
          for (const [cat, val] of Object.entries(d.detalheCategoria)) {
            if (val > 0.01) {
              linhaDetalhes.push(`${cat}: ${formatarMoeda(val)}`);
            }
          }

          if (linhaDetalhes.length > 0) {
            texto += `  ↳ _${linhaDetalhes.join(' | ')}_\n`;
          }
        }
      });
    }

    texto += `\n_Gerado pelo SpeedNet Controlador Financeiro_`;
    return texto;
  }, [selectedMonth, selectedCategories, sortOrder, receipts, collaborators]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      const textarea = document.getElementById('texto-relatorio') as HTMLTextAreaElement;
      if (textarea) {
        textarea.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(reportText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div
      id="modal-relatorio"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Gerar Relatório Inteligente
              </h3>
              <p className="text-xs text-slate-500">
                Fechamento mensal formatado para WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Category Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-orange-600" />
                <span>Categorias incluídas</span>
              </label>
              <button
                type="button"
                onClick={toggleAllCategories}
                className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
              >
                {selectedCategories.length === CATEGORIAS.length ? 'Desmarcar Todas' : 'Marcar Todas'}
              </button>
            </div>

            <div id="container-checkboxes-relatorio" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIAS.map((cat) => {
                const checked = selectedCategories.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                      checked
                        ? 'bg-orange-50/80 border-orange-300 text-orange-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={cat.id}
                      checked={checked}
                      onChange={() => toggleCategory(cat.id)}
                      className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <span>{cat.icone}</span>
                    <span className="truncate">{cat.nome}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Controls: Month & Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Mês de Fechamento</span>
              </label>
              <input
                id="input-mes-relatorio"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Ordenação dos Funcionários</span>
              </label>
              <select
                id="select-ordem-relatorio"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'decrescente' | 'crescente' | 'alfabetica')}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition cursor-pointer"
              >
                <option value="decrescente">Maior Valor Pendente</option>
                <option value="crescente">Menor Valor Pendente</option>
                <option value="alfabetica">Ordem Alfabética</option>
              </select>
            </div>
          </div>

          {/* Generated Report Preview Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Prévia do Texto Formatado
              </label>
              <span className="text-[11px] text-slate-400">Pronto para envio</span>
            </div>
            <textarea
              id="texto-relatorio"
              readOnly
              value={reportText}
              rows={8}
              className="w-full p-3.5 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl border border-slate-800 leading-relaxed focus:outline-none resize-none shadow-inner"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <button
            id="btn-fechar-relatorio"
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              title="Abrir no WhatsApp Web/App"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Abrir WhatsApp</span>
            </button>

            <button
              id="btn-copiar-relatorio"
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2.5 font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar p/ WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
