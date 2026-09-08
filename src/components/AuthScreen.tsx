import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from '../lib/firebase';
import { auth } from '../lib/firebase';
import { ShieldCheck, Mail, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { SpeedNetLogo } from './SpeedNetLogo';

interface AuthScreenProps {
  onSuccess?: () => void;
  onGuestLogin?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onGuestLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMessage('Por favor, preencha o e-mail e a senha.');
      setLoading(false);
      return;
    }

    if (isRegister && password.length < 6) {
      setErrorMessage('A senha precisa ter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: unknown) {
      console.error("Erro na autenticação:", err);
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrorMessage('E-mail ou senha incorretos. Verifique suas credenciais.');
      } else if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Este e-mail já está cadastrado. Faça login ou use outro.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('A senha é fraca. Utilize pelo menos 6 caracteres com números e letras.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Formato de e-mail inválido.');
      } else {
        setErrorMessage('Falha na autenticação. Verifique os dados ou tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="screen-login" className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-orange-100">
        {/* SpeedNet Brand Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="p-3.5 bg-orange-50/80 rounded-2xl border border-orange-100/80 shadow-xs mb-3">
            <SpeedNetLogo 
              variant="full" 
              size="lg" 
              subtitle="Controlador Financeiro" 
            />
          </div>
        </div>

        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800 text-center">
            {isRegister ? 'Criar Nova Conta' : 'Acessar o Painel Financeiro'}
          </h2>
          <p className="text-xs text-slate-500 text-center mt-0.5">
            {isRegister 
              ? 'Cadastre seu e-mail profissional para gerenciar sua equipe' 
              : 'Informe seu e-mail e senha para prosseguir'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              E-mail Profissional
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@speednet.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? "Mínimo 6 caracteres" : "Sua senha"}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Cadastrar e Entrar</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar no Sistema</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          {isRegister ? (
            <p className="text-xs text-slate-500">
              Já possui uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMessage(null);
                }}
                className="text-orange-600 font-bold hover:underline cursor-pointer ml-1"
              >
                Fazer Login
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Novo no sistema?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMessage(null);
                }}
                className="text-orange-600 font-bold hover:underline cursor-pointer ml-1"
              >
                Criar uma conta
              </button>
            </p>
          )}
        </div>

        {onGuestLogin && (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={onGuestLogin}
              className="text-xs font-semibold text-slate-500 hover:text-orange-600 transition cursor-pointer py-1 px-3 rounded-lg hover:bg-orange-50 border border-dashed border-slate-200"
            >
              Explorar como Demonstração / Convidado
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Dados criptografados com Cloud Firestore</span>
        </div>
      </div>
    </div>
  );
};
