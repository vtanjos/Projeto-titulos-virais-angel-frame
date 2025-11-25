
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Clapperboard, Lock, Mail, ArrowRight, Loader2, AlertCircle, UserPlus, Key } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
  onMasterLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onMasterLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Alternar entre Login e Cadastro
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    // --- LOGIN MESTRE (HARDCODED) ---
    if (email === 'vt123' && password === 'vt123') {
        setIsLoading(false);
        onMasterLogin();
        return;
    }

    try {
      if (isSignUp) {
        // Criar Conta
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Conta criada! Verifique seu email para confirmar.");
        setIsSignUp(false);
      } else {
        // Fazer Login Supabase
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin(); // Sucesso
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-sky-900/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
             <div className="relative">
                <Clapperboard className="w-12 h-12 text-white" strokeWidth={2.5} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-sky-500 rounded-full blur-[8px]"></div>
             </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-widest text-white font-montserrat mb-1">
            ANGEL<span className="text-sky-500">FRAME</span>
          </h1>
          <p className="text-slate-500 text-sm uppercase tracking-widest">Viral Intelligence System</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0f172a]/80 backdrop-blur-md border border-slate-800 rounded-lg p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            {isSignUp ? <UserPlus className="w-5 h-5 text-sky-500" /> : <Lock className="w-5 h-5 text-sky-500" />}
            {isSignUp ? "Criar Nova Conta" : "Acesso Restrito"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Mensagens */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs font-bold p-3 rounded-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
            {message && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-400 text-xs font-bold p-3 rounded-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4" />
                    {message}
                </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email ou Usuário</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-sm py-3 pl-10 pr-4 text-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-500 transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-sm py-3 pl-10 pr-4 text-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-6 rounded-sm transition-all transform hover:translate-y-[-1px] shadow-lg shadow-sky-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {isSignUp ? "Criar Conta" : "Entrar no Sistema"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
             <button 
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="text-xs text-slate-500 hover:text-sky-400 transition-colors"
             >
               {isSignUp ? "Já tem uma conta? Fazer Login" : "Não tem conta? Criar acesso grátis"}
             </button>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-slate-600 mt-8 uppercase tracking-widest">
           &copy; {new Date().getFullYear()} Angel Frame Technology
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
