import { Colaborador, Receita } from '../types';

export const SAMPLE_COLLABORATORS: Colaborador[] = [
  { id: 'colab-1', nome: 'Carlos Eduardo Silva', setor: 'Técnico de Instalação Fibra' },
  { id: 'colab-2', nome: 'Amanda Oliveira Lima', setor: 'Suporte N2 e Atendimento' },
  { id: 'colab-3', nome: 'Roberto Mendes Souza', setor: 'Vendas Externas e B2B' },
  { id: 'colab-4', nome: 'Juliana Castro', setor: 'Coordenação de Operações' },
  { id: 'colab-5', nome: 'Lucas Ferreira Santos', setor: 'Infraestrutura e Redes' },
];

export function getSampleReceipts(date: Date): Receita[] {
  const y = date.getFullYear();
  const m = date.getMonth();
  const dataRef = new Date(y, m, 10).toISOString();

  return [
    {
      id: 'rec-1',
      colabId: 'colab-1',
      titulo: 'Salário Base Mensal',
      categoria: 'Salário',
      valorTotal: 2850.00,
      observacoes: 'Folha integral de técnico pleno.',
      dataRef,
      pagamentos: [
        { valor: 1425.00, obs: 'Adiantamento quinzenal em conta', data: '15/03/2026' }
      ]
    },
    {
      id: 'rec-2',
      colabId: 'colab-1',
      titulo: 'Plantão de Final de Semana',
      categoria: 'Extras',
      valorTotal: 450.00,
      observacoes: 'Atendimento a rompimento de fibra na rota norte.',
      dataRef,
      pagamentos: []
    },
    {
      id: 'rec-3',
      colabId: 'colab-2',
      titulo: 'Salário Base Mensal',
      categoria: 'Salário',
      valorTotal: 2400.00,
      observacoes: 'Horário comercial, escala 5x2.',
      dataRef,
      pagamentos: [
        { valor: 2400.00, obs: 'Transferência PIX integral', data: '05/03/2026' }
      ]
    },
    {
      id: 'rec-4',
      colabId: 'colab-3',
      titulo: 'Salário Fixo Comercial',
      categoria: 'Salário',
      valorTotal: 2100.00,
      observacoes: 'Contrato CLT comissões adicionais.',
      dataRef,
      pagamentos: [
        { valor: 1050.00, obs: 'Adiantamento 50%', data: '15/03/2026' }
      ]
    },
    {
      id: 'rec-5',
      colabId: 'colab-3',
      titulo: 'Comissões de Vendas Fibra 500MB',
      categoria: 'Comissões',
      valorTotal: 1680.00,
      observacoes: '28 novos contratos residenciais fechados no período.',
      dataRef,
      pagamentos: [
        { valor: 840.00, obs: '1ª parcela comissões', data: '20/03/2026' }
      ]
    },
    {
      id: 'rec-6',
      colabId: 'colab-3',
      titulo: 'Superação de Meta de Vendas',
      categoria: 'Metas',
      valorTotal: 500.00,
      observacoes: 'Bateu 120% da meta mensal.',
      dataRef,
      pagamentos: []
    },
    {
      id: 'rec-7',
      colabId: 'colab-4',
      titulo: 'Salário Coordenação',
      categoria: 'Salário',
      valorTotal: 4200.00,
      observacoes: 'Gestão de equipes e rotas de fibra.',
      dataRef,
      pagamentos: [
        { valor: 2100.00, obs: 'Adiantamento quinzenal', data: '15/03/2026' }
      ]
    },
    {
      id: 'rec-8',
      colabId: 'colab-5',
      titulo: 'Salário Base Redes',
      categoria: 'Salário',
      valorTotal: 3100.00,
      observacoes: 'Analista de redes e fibra óptica.',
      dataRef,
      pagamentos: [
        { valor: 3100.00, obs: 'Quitado em lote pelo Bradesco', data: '05/03/2026' }
      ]
    },
    {
      id: 'rec-9',
      colabId: 'colab-5',
      titulo: 'Bonificação por Migração OLT',
      categoria: 'Bonificação',
      valorTotal: 600.00,
      observacoes: 'Upgrade do anel de redundância da cidade.',
      dataRef,
      pagamentos: []
    }
  ];
}
