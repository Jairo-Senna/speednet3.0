import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatarDataExtenso, getMesReferenciaTexto } from '../utils/formatters';

interface MonthNavigatorProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCurrentMonth?: () => void;
}

export const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onCurrentMonth
}) => {
  const isCurrentRealMonth = () => {
    const today = new Date();
    return (
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-800 capitalize tracking-tight">
              {formatarDataExtenso(currentDate)}
            </h3>
            {isCurrentRealMonth() && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                Mês Vigente
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {getMesReferenciaTexto(currentDate)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {!isCurrentRealMonth() && onCurrentMonth && (
          <button
            onClick={onCurrentMonth}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition cursor-pointer"
          >
            Hoje
          </button>
        )}
        <button
          id="prev-month"
          onClick={onPrevMonth}
          className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>
        <button
          id="next-month"
          onClick={onNextMonth}
          className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>Próximo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
