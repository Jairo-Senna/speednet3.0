export type CategoriaTipo = 'Salário' | 'Comissões' | 'Extras' | 'Bonificação' | 'Metas';

export interface Pagamento {
  valor: number;
  obs?: string;
  observacao?: string;
  data: string;
}

export interface Receita {
  id: string;
  colabId?: string;
  utilizadorId?: string; // Compatibilidade com dados antigos
  titulo: string;
  categoria?: CategoriaTipo | string;
  valorTotal: number;
  observacoes?: string;
  dataRef?: string;
  dataCriacao?: string;
  pagamentos?: Pagamento[];
  historicoPagamentos?: Pagamento[]; // Compatibilidade
}

export interface Colaborador {
  id: string;
  nome: string;
  setor?: string;
  createdAt?: string;
}

export interface CategoriaConfig {
  id: CategoriaTipo;
  nome: string;
  icone: string;
  badgeCor: string;
  descricao: string;
}
