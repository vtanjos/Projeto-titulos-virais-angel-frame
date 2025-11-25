
import React, { useState, useEffect } from 'react';
import { ViralFormData, GeneratedTitle, GeneratedScript, StepStatus } from './types';
import { generateViralTitles, generateViralScript } from './services/geminiService';
import InputForm from './components/InputForm';
import TitleResults from './components/TitleResults';
import ScriptModal from './components/ScriptModal';
import LoginPage from './components/LoginPage';
import { AlertCircle, Clapperboard, LogOut } from 'lucide-react';
import { supabase } from './services/supabase';

// Simple Logo Component matching the Angel Frame aesthetic
const AngelFrameLogo = () => (
  <div className="flex items-center gap-3 mb-2 select-none">
    <div className="relative">
       <Clapperboard className="w-10 h-10 text-white" strokeWidth={2.5} />
       <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-sky-500 rounded-full blur-[8px]"></div>
    </div>
    <div className="flex flex-col items-start leading-none">
      <span className="text-2xl font-extrabold tracking-widest text-white brand-font">ANGEL</span>
      <span className="text-2xl font-extrabold tracking-widest text-sky-500 brand-font">FRAME</span>
    </div>
  </div>
);

const App: React.FC = () => {
  // Auth State
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [bypassAuth, setBypassAuth] = useState(false); // Estado para o Login Mestre

  const [status, setStatus] = useState<StepStatus>(StepStatus.IDLE);
  const [loadingMessage, setLoadingMessage] = useState("Processando...");
  
  // State to manage history of batches (Array of Arrays)
  const [titleBatches, setTitleBatches] = useState<GeneratedTitle[][]>([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  
  // Store form data to re-use when "Load More" is clicked
  const [lastFormData, setLastFormData] = useState<ViralFormData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Script Modal State
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [scriptHistory, setScriptHistory] = useState<GeneratedScript[]>([]);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [selectedTitleForScript, setSelectedTitleForScript] = useState<string>("");

  useEffect(() => {
    // 1. Verificar sessão atual ao carregar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingAuth(false);
    });

    // 2. Escutar mudanças (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    // A mudança de estado é automática pelo onAuthStateChange para Supabase
  };

  const handleMasterLogin = () => {
    setBypassAuth(true); // Ativa o acesso via Login Mestre
  };

  const handleLogout = async () => {
    setBypassAuth(false); // Remove acesso mestre
    await supabase.auth.signOut(); // Remove sessão Supabase
    handleReset();
  };

  const handleGenerate = async (formData: ViralFormData) => {
    setStatus(StepStatus.LOADING);
    setLoadingMessage("Iniciando...");
    setErrorMsg(null);
    setLastFormData(formData);
    
    // Simulate steps for better UX
    setLoadingMessage("Analisando Perfil do Avatar...");
    await new Promise(r => setTimeout(r, 1200));

    setLoadingMessage("Definindo Estratégia de Retenção...");
    await new Promise(r => setTimeout(r, 1200));

    setLoadingMessage("Escrevendo Títulos Virais...");
    
    try {
      const results = await generateViralTitles(formData);
      // Reset history on new search
      setTitleBatches([results]);
      setCurrentBatchIndex(0);
      setStatus(StepStatus.SUCCESS);
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Erro ao gerar títulos. Verifique sua API Key ou tente novamente mais tarde.");
      setStatus(StepStatus.ERROR);
    }
  };

  const handleLoadMore = async () => {
    if (!lastFormData) return;
    
    try {
        const newResults = await generateViralTitles(lastFormData);
        setTitleBatches(prev => [...prev, newResults]);
        setCurrentBatchIndex(prev => prev + 1); // Auto move to new batch
    } catch (e: any) {
        console.error(e);
        setErrorMsg("Erro ao gerar mais títulos. Tente novamente.");
    }
  };

  const handlePreviousBatch = () => {
    if (currentBatchIndex > 0) {
        setCurrentBatchIndex(prev => prev - 1);
    }
  };

  const handleNextBatch = () => {
    if (currentBatchIndex < titleBatches.length - 1) {
        setCurrentBatchIndex(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setStatus(StepStatus.IDLE);
    setTitleBatches([]);
    setCurrentBatchIndex(0);
    setErrorMsg(null);
    setLastFormData(null);
    setScriptHistory([]);
  };

  // Script Generation Logic
  const handleCreateScript = async (title: string) => {
     setSelectedTitleForScript(title);
     setScriptHistory([]); // Reset script history for new title
     setCurrentScriptIndex(0);
     setIsScriptModalOpen(true);
     setScriptLoading(true);

     if (!lastFormData) return;

     try {
         const script = await generateViralScript(title, lastFormData);
         setScriptHistory([script]);
         setScriptLoading(false);
     } catch (e) {
         console.error(e);
         setScriptLoading(false);
         // Keep modal open but show error inside (handled by script null check)
     }
  };

  const handleRegenerateScript = async () => {
      if (!selectedTitleForScript || !lastFormData) return;
      setScriptLoading(true);
      try {
          const newScript = await generateViralScript(selectedTitleForScript, lastFormData);
          setScriptHistory(prev => [...prev, newScript]);
          setCurrentScriptIndex(prev => prev + 1);
          setScriptLoading(false);
      } catch (e) {
          console.error(e);
          setScriptLoading(false);
      }
  };

  const handleScriptPrev = () => {
      if (currentScriptIndex > 0) setCurrentScriptIndex(prev => prev - 1);
  };

  const handleScriptNext = () => {
      if (currentScriptIndex < scriptHistory.length - 1) setCurrentScriptIndex(prev => prev + 1);
  };

  if (checkingAuth) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-500">Carregando Sistema...</div>;

  // Mostra o App se tiver sessão Supabase OU se tiver ativado o bypass (Master Login)
  if (!session && !bypassAuth) {
    return <LoginPage onLogin={handleLogin} onMasterLogin={handleMasterLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center font-sans selection:bg-sky-500/30">
      {/* Background Decor - Deep Blues for Angel Frame */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-sky-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl px-4 py-12 flex flex-col items-center">
        
        {/* Header with Logo and Logout */}
        <header className="w-full flex flex-col items-center mb-12 relative">
          <div className="absolute right-0 top-0">
             <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-400 uppercase tracking-wider transition-colors"
             >
                <LogOut className="w-4 h-4" />
                Sair
             </button>
          </div>

          <div className="text-center flex flex-col items-center space-y-4">
            <AngelFrameLogo />
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50"></div>
            <h1 className="text-xl md:text-2xl font-light tracking-wide text-slate-300 uppercase">
              Gerador de Títulos Virais
            </h1>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Tecnologia de IA calibrada para retenção e alcance.
            </p>
          </div>
        </header>

        {/* Error Banner */}
        {status === StepStatus.ERROR && (
          <div className="w-full max-w-2xl bg-red-950/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Content Switcher */}
        {status === StepStatus.SUCCESS && titleBatches.length > 0 ? (
          <TitleResults 
            titles={titleBatches[currentBatchIndex]} 
            onReset={handleReset}
            onLoadMore={handleLoadMore}
            onPrevious={handlePreviousBatch}
            onNext={handleNextBatch}
            hasPrevious={currentBatchIndex > 0}
            hasNext={currentBatchIndex < titleBatches.length - 1}
            currentBatch={currentBatchIndex + 1}
            totalBatches={titleBatches.length}
            onCreateScript={handleCreateScript}
          />
        ) : (
          <InputForm onSubmit={handleGenerate} status={status} loadingMessage={loadingMessage} />
        )}

      </div>
      
      <footer className="relative z-10 py-8 text-center text-slate-600 text-xs uppercase tracking-widest">
         <p>&copy; {new Date().getFullYear()} Angel Frame. Todos os direitos reservados.</p>
      </footer>

      {/* Script Modal */}
      <ScriptModal 
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        script={scriptHistory[currentScriptIndex]}
        isLoading={scriptLoading}
        onRegenerate={handleRegenerateScript}
        onPrevious={handleScriptPrev}
        onNext={handleScriptNext}
        hasPrevious={currentScriptIndex > 0}
        hasNext={currentScriptIndex < scriptHistory.length - 1}
        historyIndex={currentScriptIndex}
        historyLength={scriptHistory.length}
      />

    </div>
  );
};

export default App;
