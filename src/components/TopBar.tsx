import React from 'react';
import { Menu, LogOut, UserCircle2, Wifi } from 'lucide-react';
import { User } from '../lib/firebase';

interface TopBarProps {
  user: User | null;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ user, onToggleSidebar, onLogout }) => {
  return (
    <header className="flex items-center justify-between gap-3 mb-6 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle"
          onClick={onToggleSidebar}
          aria-label="Abrir ou fechar menu lateral"
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-200 transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-600/30">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-slate-800 tracking-tight text-base sm:text-lg">
              <span className="text-orange-600">Speed</span>Net
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Controle Financeiro
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 text-xs text-slate-600">
          <UserCircle2 className="w-4 h-4 text-slate-400" />
          <span className="max-w-[180px] truncate font-medium">{user?.email || 'Usuário'}</span>
        </div>

        <button
          id="btn-logout"
          onClick={onLogout}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:text-white border border-red-200 hover:bg-red-600 transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-red-600/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sair da Conta</span>
          <span className="sm:hidden">Sair</span>
        </button>
      </div>
    </header>
  );
};
