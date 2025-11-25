import React, { useState } from 'react';
import { GeneratedTitle } from '../types';
import { Copy, Check, Sparkles, Share2, Globe, ExternalLink, RefreshCw, ChevronLeft, ChevronRight, PlusCircle, FileText, ClipboardList } from 'lucide-react';

interface TitleResultsProps {
  titles: GeneratedTitle[];
  onReset: () => void;
  onLoadMore: () => Promise<void>;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  currentBatch: number;
  totalBatches: number;
  onCreateScript: (title: string) => void;
}

const TitleResults: React.FC<TitleResultsProps> = ({ 
    titles, 
    onReset, 
    onLoadMore,
    onPrevious,
    onNext,
    hasPrevious,
    hasNext,
    currentBatch,
    totalBatches,
    onCreateScript
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = titles.map(t => t.title).join('\n');
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleGenerateMoreClick = async () => {
      setIsLoadingMore(true);
      await onLoadMore();
      setIsLoadingMore(false);
  };

  // Extract unique sources safely
  const sources = titles?.[0]?.sources || [];
  const uniqueSources = sources.filter((v,i,a)=>a.findIndex(v2=>(v2.uri===v.uri))===i);

  // Safe check for titles array
  if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return (
          <div className="w-full max-w-3xl text-center p-8 bg-[#0f172a] rounded-sm border border-slate-800">
              <p className="text-slate-400">Nenhum título foi gerado. Tente novamente.</p>
              <button onClick={onReset} className="mt-4 text-sky-400 hover:text-sky-300 underline">Voltar</button>
          </div>
      );
  }

  return (
    <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Header with Navigation */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-200 flex items-center gap-2 uppercase tracking-wider">
          <Sparkles className="w-5 h-5 text-sky-400" />
          Resultados
        </h2>
        
        <div className="flex items-center gap-4">
             {/* Simple Reset */}
            <button
                onClick={onReset}
                className="text-xs font-semibold text-slate-500 hover:text-sky-400 uppercase tracking-wider transition-colors"
            >
                Nova Pesquisa
            </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="space-y-4">
        {titles.map((item, index) => (
          <div
            key={index}
            className="group relative bg-[#0f172a] border border-slate-800 hover:border-sky-500/50 rounded-sm p-6 transition-all duration-300 hover:bg-[#111c36] hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10"
          >
            <div className="flex flex-col gap-4">
              {/* Top Row: Content */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-sky-900/20 text-sky-400 border border-sky-900/50">
                      {item?.hookType || "Geral"}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-snug">
                    {item?.title || "Título não gerado"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium border-l-2 border-slate-700 pl-3">
                    {item?.explanation || "Sem explicação disponível."}
                  </p>
                </div>

                <button
                  onClick={() => item?.title && handleCopy(item.title, index)}
                  className="p-2 rounded-sm bg-[#0b1120] hover:bg-sky-600 text-slate-400 hover:text-white transition-colors border border-slate-800 group-hover:border-sky-500/30"
                  title="Copiar título"
                >
                  {copiedIndex === index ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Bottom Row: Action Button */}
              <div className="pt-4 border-t border-slate-800/50 flex justify-end">
                 <button
                    onClick={() => item?.title && onCreateScript(item.title)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-[#0b1120] hover:bg-sky-900/30 border border-slate-800 hover:border-sky-500/30 rounded-sm transition-all"
                 >
                    <FileText className="w-4 h-4" />
                    Criar Roteiro
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions Bar - Copiar Tudo + Navegação */}
      <div className="mt-6 flex justify-between items-center bg-[#0f172a] p-3 rounded-sm border border-slate-800">
         <button
            onClick={handleCopyAll}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-sky-400 hover:text-white hover:bg-sky-900/20 rounded-sm transition-all"
         >
            {copiedAll ? <Check className="w-4 h-4" /> : <ClipboardList className="w-4 h-4" />}
            {copiedAll ? "Copiado!" : "Copiar Lista"}
         </button>

         {/* Batch Navigation */}
         <div className="flex items-center gap-2">
               <button 
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  className={`p-1.5 rounded-full transition-colors ${hasPrevious ? 'text-white hover:bg-slate-700' : 'text-slate-600 cursor-not-allowed'}`}
               >
                   <ChevronLeft className="w-5 h-5" />
               </button>
               
               <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mx-2">
                   {currentBatch}/{totalBatches}
               </span>

               <button 
                  onClick={onNext}
                  disabled={!hasNext}
                  className={`p-1.5 rounded-full transition-colors ${hasNext ? 'text-white hover:bg-slate-700' : 'text-slate-600 cursor-not-allowed'}`}
               >
                   <ChevronRight className="w-5 h-5" />
               </button>
         </div>
      </div>

      {/* Load More Button */}
      <div className="mt-6 flex justify-center">
           <button
             onClick={handleGenerateMoreClick}
             disabled={isLoadingMore}
             className="w-full md:w-auto px-10 py-4 bg-[#0f172a] hover:bg-sky-900/20 border border-sky-500/30 text-sky-400 hover:text-white font-bold rounded-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs shadow-lg hover:-translate-y-1 hover:shadow-sky-500/20"
           >
              {isLoadingMore ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                  <PlusCircle className="w-4 h-4" />
              )}
              {isLoadingMore ? 'Criando...' : 'Gerar +6 Títulos'}
           </button>
      </div>
      
      {/* Sources Display Section */}
      {uniqueSources.length > 0 && (
        <div className="mt-8 bg-[#0f172a] rounded-sm p-4 border border-slate-800 w-full">
          <div className="flex items-center gap-2 mb-3 text-slate-300">
            <Globe className="w-4 h-4 text-sky-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Fontes Consultadas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueSources.slice(0, 4).map((source, idx) => (
              <a 
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#0b1120] text-xs text-slate-400 hover:text-sky-400 hover:border-sky-500/50 border border-slate-800 transition-colors truncate max-w-[200px]"
              >
                <span className="truncate">{source.title}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            ))}
             {uniqueSources.length > 4 && (
                <span className="text-xs text-slate-500 self-center">+{uniqueSources.length - 4} mais</span>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TitleResults;