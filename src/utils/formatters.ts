import { CategoriaConfig, CategoriaTipo } from '../types';

export const CATEGORIAS: CategoriaConfig[] = [
  { id: 'Salário', nome: 'Salário', icone: '💰', badgeCor: 'bg-amber-100 text-amber-800 border-amber-300', descricao: 'Salários e adiantamentos mensais' },
  { id: 'Comissões', nome: 'Comissões', icone: '📈', badgeCor: 'bg-blue-100 text-blue-800 border-blue-300', descricao: 'Comissões de vendas e instalações' },
  { id: 'Extras', nome: 'Extras', icone: '⏱️', badgeCor: 'bg-purple-100 text-purple-800 border-purple-300', descricao: 'Horas adicionais e plantões' },
  { id: 'Bonificação', nome: 'Bonificação', icone: '🎁', badgeCor: 'bg-emerald-100 text-emerald-800 border-emerald-300', descricao: 'Prêmios e reconhecimentos especiais' },
  { id: 'Metas', nome: 'Metas', icone: '🎯', badgeCor: 'bg-rose-100 text-rose-800 border-rose-300', descricao: 'Bonificação por cumprimento de metas' },
];

export function formatarMoeda(val: number | undefined | null): string {
  return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarDataExtenso(date: Date): string {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function getMesReferenciaTexto(date: Date): string {
  const dataRef = new Date(date);
  dataRef.setMonth(dataRef.getMonth() - 1);
  const mesAnterior = dataRef.toLocaleDateString('pt-BR', { month: 'long' });
  return `(Referente a ${mesAnterior})`;
}

export function normalizarTexto(texto: string | undefined | null): string {
  if (!texto) return '';
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}
