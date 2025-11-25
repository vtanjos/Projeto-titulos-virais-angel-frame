import React from 'react';
import { GeneratedScript } from '../types';
import { X, ChevronLeft, ChevronRight, RefreshCw, Copy, Check, Clapperboard, Download } from 'lucide-react';

interface ScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: GeneratedScript | null;
  isLoading: boolean;
  onRegenerate: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  historyIndex: number;
  historyLength: number;
}

const ScriptModal: React.FC<ScriptModalProps> = ({
  isOpen,
  onClose,
  script,
  isLoading,
  onRegenerate,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  historyIndex,
  historyLength
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const getScriptText = () => {
    if (!script) return "";
    return `
TÍTULO: ${script.title}
==================================================

[INTENSIFICADOR DO MISTÉRIO]
${script.mysteryIntensifier}

[POSICIONAMENTO]
${script.positioning}

[CONTEÚDO NOTÁVEL]
${script.notableContent}

[CHAMADA PARA AÇÃO]
${script.callToAction}
    `.trim();
  };

  const handleCopy = () => {
    const text = getScriptText();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = getScriptText();
    if (!text) return;
    
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `roteiro_viral_${Date.now()}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-[#0b1120] border border-slate-800 rounded-lg shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0f172a]">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-white uppercase tracking-wide text-sm">Roteiro Viral</h3>
          </div>
          <div className="flex items-center gap-2">
             {historyLength > 1 && (
                 <span className="text-xs text-slate-500 mr-2 font-mono">
                     {historyIndex + 1}/{historyLength}
                 </span>
             )}
             <button 
                onClick={onClose}
                className="p-1 hover:bg-slate-800 rounded-sm text-slate-400 hover:text-white transition-colors"
             >
                <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-sky-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                </div>
              </div>
              <p className="text-slate-400 text-sm uppercase tracking-widest animate-pulse">Criando Roteiro...</p>
            </div>
          ) : script ? (
            <div className="space-y-6 text-slate-300">
              
              {/* 1. Título */}
              <div className="bg-[#0f172a] p-4 rounded-sm border-l-2 border-sky-500">
                <span className="text-[10px] font-bold uppercase text-sky-500 block mb-1">1. Título (Gancho)</span>
                <h4 className="text-lg font-bold text-white">{script.title}</h4>
              </div>

              {/* 2. Intensificador */}
              <div className="pl-4 border-l border-slate-800">
                <span className="text-[10px] font-bold uppercase text-indigo-400 block mb-1">2. Intensificador do Mistério</span>
                <p className="text-indigo-100 italic">"{script.mysteryIntensifier}"</p>
              </div>

              {/* 3. Posicionamento */}
              <div className="pl-4 border-l border-slate-800">
                <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">3. Posicionamento Influente</span>
                <p className="text-slate-200">{script.positioning}</p>
              </div>

              {/* 4. Conteúdo */}
              <div className="pl-4 border-l border-slate-800">
                <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">4. Conteúdo Notável</span>
                <p className="text-slate-200 whitespace-pre-line leading-relaxed">{script.notableContent}</p>
              </div>

               {/* 5. CTA */}
               <div className="bg-[#0f172a] p-4 rounded-sm border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">5. Chamado para Ação</span>
                <p className="text-white font-medium">{script.callToAction}</p>
              </div>

            </div>
          ) : (
            <div className="text-center text-slate-500 py-10">Erro ao carregar roteiro.</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-[#0f172a] flex flex-col xl:flex-row items-center justify-between gap-4">
           
           {/* Navigation */}
           <div className="flex items-center gap-2 w-full xl:w-auto justify-center xl:justify-start">
              <button 
                onClick={onPrevious}
                disabled={!hasPrevious || isLoading}
                className="p-2 rounded-sm bg-[#0b1120] border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={onNext}
                disabled={!hasNext || isLoading}
                className="p-2 rounded-sm bg-[#0b1120] border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <ChevronRight className="w-5 h-5" />
              </button>
           </div>

           {/* Actions */}
           <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center">
              <button
                onClick={onRegenerate}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-[#0b1120] border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all text-xs font-bold uppercase tracking-wider min-w-[120px]"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Regenerar
              </button>

              <button
                onClick={handleDownload}
                disabled={isLoading || !script}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-[#0b1120] border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all text-xs font-bold uppercase tracking-wider min-w-[120px]"
              >
                <Download className="w-4 h-4" />
                Baixar .txt
              </button>

              <button
                onClick={handleCopy}
                disabled={isLoading || !script}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/20 transition-all text-xs font-bold uppercase tracking-wider min-w-[140px]"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
              </button>
           </div>

        </div>

      </div>
    </div>
  );
};

export default ScriptModal;