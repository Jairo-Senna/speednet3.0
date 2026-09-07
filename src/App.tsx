import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signOut, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  User 
} from './lib/firebase';
import { Colaborador, Receita, CategoriaTipo } from './types';
import { formatarMoeda } from './utils/formatters';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MonthNavigator } from './components/MonthNavigator';
import { GlobalDashboard } from './components/GlobalDashboard';
import { ColabDashboard } from './components/ColabDashboard';
import { PaymentModal } from './components/PaymentModal';
import { ReportModal } from './components/ReportModal';
import { SAMPLE_COLLABORATORS, getSampleReceipts } from './data/sampleData';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  // App UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<CategoriaTipo>('Salário');
  const [selectedColabId, setSelectedColabId] = useState<string | null>(null);

  // Data Collections
  const [collaborators, setCollaborators] = useState<Colaborador[]>([]);
  const [receipts, setReceipts] = useState<Receita[]>([]);

  // Modals
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    receiptId: string | null;
    receiptTitle: string;
  }>({
    isOpen: false,
    receiptId: null,
    receiptTitle: '',
  });

  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Ajusta sidebar responsiva no carregamento inicial
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  // Monitora estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        setIsGuestMode(false);
      } else if (!isGuestMode) {
        setCollaborators([]);
        setReceipts([]);
        setSelectedColabId(null);
      }
    });

    return () => unsubscribe();
  }, [isGuestMode]);

  // Inicia listeners do Firestore em tempo real quando o usuário estiver autenticado
  useEffect(() => {
    if (!user) return;

    // Escuta colaboradores: /gestao-financeira/{uid}/colaboradores
    const unsubColabs = onSnapshot(
      collection(db, `/gestao-financeira/${user.uid}/colaboradores`),
      (snapshot) => {
        const colabsData: Colaborador[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Colaborador, 'id'>),
        }));
        setCollaborators(colabsData);
      },
      (error) => {
        console.error("Erro ao carregar colaboradores do Firestore:", error);
      }
    );

    // Escuta receitas: /gestao-financeira/{uid}/receitas
    const unsubReceipts = onSnapshot(
      collection(db, `/gestao-financeira/${user.uid}/receitas`),
      (snapshot) => {
        const recsData: Receita[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Receita, 'id'>),
        }));
        setReceipts(recsData);
      },
      (error) => {
        console.error("Erro ao carregar receitas do Firestore:", error);
      }
    );

    return () => {
      unsubColabs();
      unsubReceipts();
    };
  }, [user]);

  // Ativa modo convidado / demonstração
  const handleStartGuestMode = () => {
    setIsGuestMode(true);
    setCollaborators(SAMPLE_COLLABORATORS);
    setReceipts(getSampleReceipts(currentDate));
    setSelectedColabId(null);
  };

  // Funções de Gestão de Colaboradores
  const handleAddCollaborator = async (nome: string, setor: string) => {
    if (user) {
      await addDoc(collection(db, `/gestao-financeira/${user.uid}/colaboradores`), {
        nome,
        setor: setor || '',
        createdAt: new Date().toISOString(),
      });
    } else if (isGuestMode) {
      const newColab: Colaborador = {
        id: `colab-${Date.now()}`,
        nome,
        setor: setor || '',
        createdAt: new Date().toISOString(),
      };
      setCollaborators((prev) => [...prev, newColab]);
    }
  };

  const handleDeleteCollaborator = async (id: string, nome: string) => {
    const confirmMsg = `Tem certeza que deseja remover ${nome} da lista lateral?\n\nOs pagamentos continuarão salvos no histórico caso decida readicioná-lo, mas não farão mais parte da contabilidade deste mês.`;
    if (!window.confirm(confirmMsg)) return;

    if (user) {
      await deleteDoc(doc(db, `/gestao-financeira/${user.uid}/colaboradores`, id));
    } else if (isGuestMode) {
      setCollaborators((prev) => prev.filter((c) => c.id !== id));
    }

    if (selectedColabId === id) {
      setSelectedColabId(null);
    }
  };

  // Funções de Gestão de Receitas / Lançamentos
  const handleAddReceipt = async (data: { titulo: string; valorTotal: number; observacoes: string }) => {
    if (!selectedColabId) return;

    const dataCriacao = new Date(currentDate.getFullYear(), currentDate.getMonth(), 10).toISOString();

    if (user) {
      await addDoc(collection(db, `/gestao-financeira/${user.uid}/receitas`), {
        colabId: selectedColabId,
        titulo: data.titulo,
        categoria: selectedCategory,
        valorTotal: data.valorTotal,
        observacoes: data.observacoes || '',
        dataRef: dataCriacao,
        pagamentos: [],
      });
    } else if (isGuestMode) {
      const newRec: Receita = {
        id: `rec-${Date.now()}`,
        colabId: selectedColabId,
        titulo: data.titulo,
        categoria: selectedCategory,
        valorTotal: data.valorTotal,
        observacoes: data.observacoes || '',
        dataRef: dataCriacao,
        pagamentos: [],
      };
      setReceipts((prev) => [...prev, newRec]);
    }
  };

  const handleDeleteReceipt = async (receiptId: string) => {
    if (!window.confirm("Apagar toda a receita permanentemente?")) return;

    if (user) {
      await deleteDoc(doc(db, `/gestao-financeira/${user.uid}/receitas`, receiptId));
    } else if (isGuestMode) {
      setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
    }
  };

  // Funções de Amortização / Pagamentos
  const handleConfirmPayment = async (receiptId: string, valor: number, obs: string) => {
    const targetRec = receipts.find((r) => r.id === receiptId);
    if (!targetRec) return;

    const arrayPagamentos = targetRec.pagamentos || targetRec.historicoPagamentos || [];
    const novoPagamento = {
      valor,
      obs: obs || '',
      observacao: obs || '',
      data: new Date().toLocaleDateString('pt-BR'),
    };

    const novosPgs = [...arrayPagamentos, novoPagamento];

    if (user) {
      await updateDoc(doc(db, `/gestao-financeira/${user.uid}/receitas`, receiptId), {
        pagamentos: novosPgs,
        historicoPagamentos: novosPgs,
      });
    } else if (isGuestMode) {
      setReceipts((prev) =>
        prev.map((r) =>
          r.id === receiptId
            ? { ...r, pagamentos: novosPgs, historicoPagamentos: novosPgs }
            : r
        )
      );
    }
  };

  const handleDeletePayment = async (receiptId: string, paymentIndex: number, valor: number) => {
    const confirmMsg = `Tem certeza que deseja apagar o pagamento individual de ${formatarMoeda(valor)}?\nO seu saldo pendente será recalculado e a cobrança voltará a aparecer.`;
    if (!window.confirm(confirmMsg)) return;

    const targetRec = receipts.find((r) => r.id === receiptId);
    if (!targetRec) return;

    const arrayPagamentos = [...(targetRec.pagamentos || targetRec.historicoPagamentos || [])];
    arrayPagamentos.splice(paymentIndex, 1);

    if (user) {
      await updateDoc(doc(db, `/gestao-financeira/${user.uid}/receitas`, receiptId), {
        pagamentos: arrayPagamentos,
        historicoPagamentos: arrayPagamentos,
      });
    } else if (isGuestMode) {
      setReceipts((prev) =>
        prev.map((r) =>
          r.id === receiptId
            ? { ...r, pagamentos: arrayPagamentos, historicoPagamentos: arrayPagamentos }
            : r
        )
      );
    }
  };

  // Navegação de Meses
  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Logout
  const handleLogout = async () => {
    if (isGuestMode) {
      setIsGuestMode(false);
      setCollaborators([]);
      setReceipts([]);
      setSelectedColabId(null);
    } else {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Erro ao sair da conta:", err);
      }
    }
  };

  // Loading inicial da autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-300">Carregando SpeedNet Financeiro...</p>
        </div>
      </div>
    );
  }

  // Se não estiver logado nem no modo convidado, exibe a tela de login/cadastro
  if (!user && !isGuestMode) {
    return <AuthScreen onGuestLogin={handleStartGuestMode} />;
  }

  // Objeto virtual de usuário para modo convidado
  const displayUser = user || {
    email: 'demonstracao@speednet.com',
  } as User;

  const selectedCollaborator = collaborators.find((c) => c.id === selectedColabId) || null;

  return (
    <div id="screen-app" className="flex w-full min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* Sidebar Lateral */}
      <Sidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        selectedColabId={selectedColabId}
        onSelectColab={(id) => setSelectedColabId(id)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        collaborators={collaborators}
        onAddCollaborator={handleAddCollaborator}
        onDeleteCollaborator={handleDeleteCollaborator}
        onOpenReportModal={() => setReportModalOpen(true)}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 min-w-0 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Top Bar */}
          <TopBar
            user={displayUser}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onLogout={handleLogout}
          />

          {/* Navegador de Mês */}
          <MonthNavigator
            currentDate={currentDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onCurrentMonth={handleCurrentMonth}
          />

          {/* Alternância de Visão: Global vs. Colaborador Selecionado */}
          {selectedCollaborator ? (
            <ColabDashboard
              collaborator={selectedCollaborator}
              currentCategory={selectedCategory}
              currentDate={currentDate}
              receipts={receipts}
              onBackToGlobal={() => setSelectedColabId(null)}
              onAddReceipt={handleAddReceipt}
              onDeleteReceipt={handleDeleteReceipt}
              onOpenPaymentModal={(id, title) =>
                setPaymentModal({ isOpen: true, receiptId: id, receiptTitle: title })
              }
              onDeletePayment={handleDeletePayment}
            />
          ) : (
            <GlobalDashboard
              currentCategory={selectedCategory}
              collaborators={collaborators}
              receipts={receipts}
              currentDate={currentDate}
              onSelectCollaborator={(id) => setSelectedColabId(id)}
            />
          )}
        </div>
      </main>

      {/* Modal de Baixa de Pagamento */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        receiptId={paymentModal.receiptId}
        receiptTitle={paymentModal.receiptTitle}
        onClose={() =>
          setPaymentModal({ isOpen: false, receiptId: null, receiptTitle: '' })
        }
        onConfirm={handleConfirmPayment}
      />

      {/* Modal de Relatório do Mês Formatado */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        collaborators={collaborators}
        receipts={receipts}
        currentDate={currentDate}
      />
    </div>
  );
}
