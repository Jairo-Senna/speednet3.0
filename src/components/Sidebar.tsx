import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Home, 
  ChevronDown, 
  UserPlus, 
  Search, 
  Trash2, 
  Users,
  Briefcase
} from 'lucide-react';
import { Colaborador, CategoriaTipo } from '../types';
import { CATEGORIAS, normalizarTexto } from '../utils/formatters';
import { SpeedNetLogo } from './SpeedNetLogo';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  selectedColabId: string | null;
  onSelectColab: (id: string | null) => void;
  selectedCategory: CategoriaTipo;
  onSelectCategory: (cat: CategoriaTipo) => void;
  collaborators: Colaborador[];
  onAddCollaborator: (nome: string, setor: string) => Promise<void>;
  onDeleteCollaborator: (id: string, nome: string) => Promise<void>;
  onOpenReportModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  selectedColabId,
  onSelectColab,
  selectedCategory,
  onSelectCategory,
  collaborators,
  onAddCollaborator,
  onDeleteCollaborator,
  onOpenReportModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newSetor, setNewSetor] = useState('');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Filtered & sorted collaborators list
  const filteredCollaborators = useMemo(() => {
    const term = normalizarTexto(searchTerm);
    const sorted = [...collaborators].sort((a, b) => {
      const nomeA = normalizarTexto(a.nome);
      const nomeB = normalizarTexto(b.nome);
      return nomeA.localeCompare(nomeB, 'pt-BR');
    });

    if (!term) return sorted;

    return sorted.filter((c) => {
      const nomeMatch = normalizarTexto(c.nome).includes(term);
      const setorMatch = normalizarTexto(c.setor).includes(term);
      return nomeMatch || setorMatch;
    });
  }, [collaborators, searchTerm]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert("Por favor, digite o nome completo.");
      return;
    }
    try {
      setIsSubmittingUser(true);
      await onAddCollaborator(newName.trim(), newSetor.trim());
      setNewName('');
      setNewSetor('');
      setIsRegisterOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar colaborador. Tente novamente.");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  return (
    <>
      {/* Overlay on mobile */}
      <div
        id="sidebar-overlay"
        onClick={onCloseMobile}
        className={`fixed inset-0 bg-slate-950/60 z-40 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar container */}
      <aside
        id="sidebar-menu"
        className={`fixed lg:static top-0 left-0 h-full w-72 min-w-72 bg-slate-900 text-slate-100 flex flex-col z-50 transition-all duration-300 shadow-2xl lg:shadow-none border-r border-slate-800 ${
          isOpen 
            ? 'translate-x-0 ml-0' 
            : '-translate-x-full lg:-ml-72'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <SpeedNetLogo 
            variant="full" 
            size="md" 
            theme="dark" 
            subtitle="Controle Financeiro" 
          />
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-2">
          <button
            id="btn-abrir-relatorio"
            onClick={onOpenReportModal}
            className="w-full py-2.5 px-3.5 bg-slate-100 hover:bg-white text-slate-900 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-orange-600" />
            <span>Relatório do Mês (WhatsApp)</span>
          </button>

          <button
            id="btn-visao-geral"
            onClick={() => {
              onSelectColab(null);
              if (window.innerWidth < 1024) onCloseMobile();
            }}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border ${
              selectedColabId === null
                ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Visão Global</span>
          </button>
        </div>

        {/* Scrollable middle area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 text-xs">
          {/* Accordion: Categorias */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full px-3.5 py-2.5 text-left font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <span>Categorias</span>
                <span className="text-orange-400 font-semibold lowercase">({selectedCategory})</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isCategoryOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>

            {isCategoryOpen && (
              <div className="p-2 space-y-1 border-t border-slate-800/60 bg-slate-900/50">
                {CATEGORIAS.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => onSelectCategory(cat.id)}
                      className={`w-full px-3 py-2 rounded-lg font-semibold text-xs text-left transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-orange-600 text-white shadow-sm font-bold'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{cat.icone}</span>
                        <span>{cat.nome}</span>
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Accordion: + Novo Cadastro */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <button
              onClick={() => setIsRegisterOpen(!isRegisterOpen)}
              className="w-full px-3.5 py-2.5 text-left font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-orange-500" />
                <span>+ Novo Cadastro</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isRegisterOpen ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </button>

            {isRegisterOpen && (
              <form onSubmit={handleRegisterSubmit} className="p-3 border-t border-slate-800/60 space-y-2.5 bg-slate-900/60">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Setor / Cargo
                  </label>
                  <input
                    type="text"
                    value={newSetor}
                    onChange={(e) => setNewSetor(e.target.value)}
                    placeholder="Ex: Técnico de Campo"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingUser ? 'Salvando...' : '+ Cadastrar'}
                </button>
              </form>
            )}
          </div>

          {/* Section: Colaboradores List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-orange-500" />
                <span>Colaboradores ({collaborators.length})</span>
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-colab"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar funcionário..."
                className="w-full pl-8 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              />
            </div>

            {/* Collaborators items */}
            <div id="list-users" className="space-y-1.5 pt-1 max-h-[380px] overflow-y-auto pr-0.5">
              {filteredCollaborators.length === 0 ? (
                <div className="text-center py-6 px-2 text-slate-500 text-xs">
                  {searchTerm ? 'Nenhum funcionário encontrado.' : 'Nenhum colaborador cadastrado ainda.'}
                </div>
              ) : (
                filteredCollaborators.map((colab) => {
                  const isSelected = selectedColabId === colab.id;
                  const initials = colab.nome
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={colab.id}
                      onClick={() => {
                        onSelectColab(colab.id);
                        if (window.innerWidth < 1024) onCloseMobile();
                      }}
                      className={`group relative p-2.5 rounded-xl transition flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30'
                          : 'bg-slate-800/40 hover:bg-slate-800/80 text-slate-200 border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {initials}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-xs truncate leading-snug">{colab.nome}</p>
                          {colab.setor && (
                            <p
                              className={`text-[10px] truncate flex items-center gap-1 ${
                                isSelected ? 'text-white/80' : 'text-slate-400'
                              }`}
                            >
                              <Briefcase className="w-2.5 h-2.5" />
                              <span>{colab.setor}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        title="Remover colaborador"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCollaborator(colab.id, colab.nome);
                        }}
                        className={`opacity-40 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition cursor-pointer ${
                          isSelected ? 'text-white hover:text-red-200' : 'text-slate-400'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
          SpeedNet Fibra • Painel Financeiro
        </div>
      </aside>
    </>
  );
};
