import React, { useState } from 'react';
import { X, CheckCircle2, DollarSign } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  receiptId: string | null;
  receiptTitle: string;
  onClose: () => void;
  onConfirm: (receiptId: string, valor: number, obs: string) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  receiptId,
  receiptTitle,
  onClose,
  onConfirm,
}) => {
  const [valor, setValor] = useState('');
  const [obs, setObs] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !receiptId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valor.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      alert("Por favor, digite um valor válido para o pagamento.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(receiptId, val, obs.trim());
      setValor('');
      setObs('');
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao registrar pagamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="modal-pg"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 id="modal-title" className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              Adicionar Pagamento / Baixa
            </h3>
            <p className="text-xs text-orange-600 font-semibold mt-0.5 truncate max-w-xs">
              Ref: {receiptTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <input type="hidden" id="modal-id" value={receiptId} />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Valor Recebido / Pago (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                R$
              </span>
              <input
                id="modal-val"
                type="number"
                step="0.01"
                min="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                required
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Observação (Data, PIX, Banco...)
            </label>
            <textarea
              id="modal-obs"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex: Recebido via PIX Nubank em 10/03..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              id="btn-confirm-pg"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Salvando...' : 'Confirmar Baixa'}</span>
            </button>

            <button
              type="button"
              id="btn-close-modal"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer text-xs"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
