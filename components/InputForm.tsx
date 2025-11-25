import React, { useState, useEffect } from 'react';
import { ViralFormData, StepStatus } from '../types';
import { OBJECTIVES, TRIGGERS, STRUCTURES, TONES, CONTENT_TYPES } from '../constants';
import { Wand2, Loader2, Info, Target, Brain, MessageSquare, ChevronDown, ChevronUp, Sparkles, Save, FolderOpen, CheckCircle2, X, Trash2, FileText, Zap } from 'lucide-react';
import { generateResearchField } from '../services/geminiService';

interface InputFormProps {
  onSubmit: (data: ViralFormData) => void;
  status: StepStatus;
  loadingMessage?: string;
}

// Helper components defined OUTSIDE the main component to prevent focus loss
const ResearchField = ({ 
  label, 
  name, 
  placeholder, 
  value, 
  onChange, 
  height = "h-24",
  onAutoFill,
  isFilling,
  canFill
}: { 
  label: string, 
  name: keyof ViralFormData, 
  placeholder: string, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, 
  height?: string,
  onAutoFill: (name: keyof ViralFormData, label: string) => void,
  isFilling: boolean,
  canFill: boolean
}) => (
  <div className="col-span-1 group relative">
    <div className="flex justify-between items-end mb-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-sky-400 transition-colors">{label}</label>
        <button
            type="button"
            onClick={() => onAutoFill(name, label)}
            disabled={!canFill || isFilling}
            className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 px-2 py-1 rounded transition-colors border ${canFill ? 'text-sky-400 border-sky-500/30 hover:bg-sky-500/10 hover:border-sky-500 cursor-pointer' : 'text-slate-600 border-slate-800 cursor-not-allowed opacity-50'}`}
            title={canFill ? "Preencher automaticamente com IA" : "Preencha Nicho e Assunto primeiro"}
        >
            {isFilling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            {isFilling ? "Gerando..." : "IA Sugerir"}
        </button>
    </div>
    <textarea
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full bg-[#0b1120] border border-slate-800 rounded-sm px-4 py-3 text-slate-200 text-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none resize-none transition-all ${height} placeholder:text-slate-600`}
    />
  </div>
);

const InputField = ({ 
  label, 
  name, 
  placeholder, 
  value, 
  onChange,
  disabled = false
}: { 
  label: string, 
  name: keyof ViralFormData, 
  placeholder: string, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  disabled?: boolean
}) => (
    <div className="col-span-1 group">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 group-focus-within:text-sky-400 transition-colors">{label}</label>
      <input
          type="text"
          name={name}
          required={!disabled}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full bg-[#0b1120] border border-slate-800 rounded-sm px-4 py-3 text-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-600 ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-900 text-slate-500' : ''}`}
      />
    </div>
);

const InputForm: React.FC<InputFormProps> = ({ onSubmit, status, loadingMessage = "Processando..." }) => {
  const [formData, setFormData] = useState<ViralFormData>({
    niche: '',
    subject: '',
    autoSubject: false,
    contentType: CONTENT_TYPES[0],
    objective: OBJECTIVES[0],
    
    // Pesquisa
    desires: '',
    pains: '',
    fears: '',
    beliefs: '',
    habits: '',
    characteristics: '',
    media: '',
    techniques: '',
    famousPeople: '',
    institutions: '',
    tools: '',
    disruptions: '',

    trigger: TRIGGERS[0],
    structure: STRUCTURES[0],
    tone: TONES[0],
    useTrends: false,
  });

  const [openSection, setOpenSection] = useState<string | null>('recompensa');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'loaded'>('idle');
  
  // States para Modais de Salvar/Carregar
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [savedProfiles, setSavedProfiles] = useState<Record<string, ViralFormData>>({});

  // Auto-Fill State
  const [loadingField, setLoadingField] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleTrends = () => {
    setFormData(prev => ({ ...prev, useTrends: !prev.useTrends }));
  };

  const handleToggleAutoSubject = () => {
    setFormData(prev => ({ ...prev, autoSubject: !prev.autoSubject }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === StepStatus.LOADING) return;
    onSubmit(formData);
  };

  // --- Lógica de Auto Preenchimento ---
  const handleAutoFill = async (name: keyof ViralFormData, label: string) => {
      // Remover "Exemplo: " do label para o prompt
      const cleanLabel = label.replace("Exemplo: ", "");
      
      const niche = formData.niche;
      const subject = formData.autoSubject ? "(IA Definirá Assunto)" : formData.subject;

      setLoadingField(name);
      try {
          const suggestions = await generateResearchField(niche, subject, cleanLabel);
          
          // Append if already exists, otherwise set
          setFormData(prev => ({
              ...prev,
              [name]: prev[name] ? `${prev[name]}\n${suggestions}` : suggestions
          }));
      } catch (error) {
          console.error("Erro ao gerar sugestão", error);
      } finally {
          setLoadingField(null);
      }
  };

  // Verifica se pode usar o auto-fill (Nicho obrigatório, Assunto obrigatório se não for auto)
  const canAutoFill = !!formData.niche && (!!formData.subject || formData.autoSubject);


  // --- Lógica de Salvar ---
  const handleOpenSave = () => {
      setShowSaveModal(true);
      // Sugerir um nome baseado no nicho ou assunto
      if (formData.niche || formData.subject) {
          setProfileName(`${formData.niche} - ${formData.subject}`.trim());
      }
  };

  const handleConfirmSave = () => {
      if (!profileName.trim()) return;
      
      try {
          const currentStore = JSON.parse(localStorage.getItem('angel_frame_profiles') || '{}');
          currentStore[profileName] = formData;
          localStorage.setItem('angel_frame_profiles', JSON.stringify(currentStore));
          
          setSaveStatus('saved');
          setShowSaveModal(false);
          setProfileName("");
          setTimeout(() => setSaveStatus('idle'), 2500);
      } catch (e) {
          console.error("Erro ao salvar", e);
      }
  };

  // --- Lógica de Carregar ---
  const handleOpenLoad = () => {
      try {
          const currentStore = JSON.parse(localStorage.getItem('angel_frame_profiles') || '{}');
          setSavedProfiles(currentStore);
          setShowLoadModal(true);
      } catch (e) {
          console.error("Erro ao ler storage", e);
          setSavedProfiles({});
      }
  };

  const handleSelectProfile = (name: string) => {
      const data = savedProfiles[name] as ViralFormData;
      if (data) {
          setFormData(data);
          setSaveStatus('loaded');
          setShowLoadModal(false);
          setTimeout(() => setSaveStatus('idle'), 2500);
      }
  };

  const handleDeleteProfile = (name: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newStore = { ...savedProfiles };
      delete newStore[name];
      setSavedProfiles(newStore);
      localStorage.setItem('angel_frame_profiles', JSON.stringify(newStore));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SECTION 1: CONTEXTO BÁSICO */}
      <div className="bg-[#0f172a] rounded-lg border border-slate-800/60 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-2">
                <Target className="text-sky-500 w-5 h-5" />
                <h3 className="text-base font-bold text-white uppercase tracking-wide">1. Configuração do Conteúdo</h3>
            </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
            label="Nicho / Mercado" 
            name="niche" 
            placeholder="Ex: Finanças, Beleza, Tecnologia..." 
            value={formData.niche}
            onChange={handleChange}
          />

          <div className="col-span-1 flex flex-col justify-end">
            <div className="flex justify-between items-center mb-2">
                 <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-sky-400 transition-colors">Assunto Principal</label>
                 <button
                    type="button"
                    onClick={handleToggleAutoSubject}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    {formData.autoSubject ? "IA Definirá o Assunto" : "Definir Manualmente"}
                    <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ml-1 ${formData.autoSubject ? 'bg-sky-600' : 'bg-slate-700'}`}>
                        <span className={`${formData.autoSubject ? 'translate-x-4' : 'translate-x-1'} inline-block h-2 w-2 transform rounded-full bg-white transition-transform`} />
                    </div>
                 </button>
            </div>
            
            {formData.autoSubject ? (
                <div className="w-full bg-[#0b1120] border border-sky-500/30 rounded-sm px-4 py-3 text-sky-400 italic text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    A IA escolherá o melhor assunto baseado na sua pesquisa.
                </div>
            ) : (
                <input
                    type="text"
                    name="subject"
                    required
                    placeholder="Ex: Investimentos, Skincare, IA..." 
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-[#0b1120] border border-slate-800 rounded-sm px-4 py-3 text-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-600"
                />
            )}
          </div>
          
           <div className="col-span-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tipo de Conteúdo</label>
            <div className="relative">
              <select
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
                className="w-full bg-[#0b1120] border border-slate-800 rounded-sm px-4 py-3 text-white appearance-none cursor-pointer focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              >
                {CONTENT_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Objetivo</label>
            <div className="relative">
              <select
                name="objective"
                value={formData.objective}
                onChange={handleChange}
                className="w-full bg-[#0b1120] border border-slate-800 rounded-sm px-4 py-3 text-white appearance-none cursor-pointer focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              >
                {OBJECTIVES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PESQUISA DO AVATAR (Expandida) */}
      <div className="bg-[#0f172a] rounded-lg border border-slate-800/60 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
             <Brain className="text-sky-500 w-5 h-5" />
             <h3 className="text-base font-bold text-white uppercase tracking-wide">2. Pesquisa de Avatar</h3>
          </div>
          
          {/* Controles de Persistência */}
          <div className="flex items-center gap-2">
             {saveStatus !== 'idle' && (
                 <div className="flex items-center gap-1 mr-2 text-emerald-400 text-xs font-bold uppercase tracking-wide animate-in fade-in slide-in-from-right-4">
                     <CheckCircle2 className="w-4 h-4" />
                     {saveStatus === 'saved' ? 'Salvo!' : 'Carregado!'}
                 </div>
             )}
             
             <button
                type="button"
                onClick={handleOpenLoad}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white bg-[#0b1120] hover:bg-slate-800 border border-slate-700 rounded-sm transition-all"
                title="Carregar perfil salvo"
             >
                <FolderOpen className="w-3.5 h-3.5" />
                Meus Perfis
             </button>

             <button
                type="button"
                onClick={handleOpenSave}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-400 hover:text-white bg-[#0b1120] hover:bg-sky-600 border border-slate-700 hover:border-sky-500 rounded-sm transition-all"
                title="Salvar perfil atual"
             >
                <Save className="w-3.5 h-3.5" />
                Salvar
             </button>
          </div>
        </div>
        
        <div className="bg-slate-950/30 px-5 py-2 border-b border-slate-800">
             <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-3 h-3" />
                Para ativar a "Sugestão com IA", preencha primeiro o Nicho e o Assunto.
             </span>
        </div>

        {/* Grupo: Recompensa */}
        <div className="border-b border-slate-800">
          <button type="button" onClick={() => toggleSection('recompensa')} className="w-full px-6 py-4 flex justify-between items-center hover:bg-[#131c31] transition-colors group">
            <span className="font-bold text-slate-300 group-hover:text-sky-400 uppercase tracking-wider text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                Gatilho da Recompensa
            </span>
            {openSection === 'recompensa' ? <ChevronUp className="w-4 h-4 text-sky-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
          {openSection === 'recompensa' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0b1120]">
              <ResearchField 
                label="Exemplo: Desejos" 
                name="desires" 
                placeholder="Exemplo:&#10;- ver que existe luz no fim do túnel&#10;- tratar ansiedade sem remedios&#10;- dormir melhor" 
                value={formData.desires}
                onChange={handleChange}
                onAutoFill={handleAutoFill}
                isFilling={loadingField === 'desires'}
                canFill={canAutoFill}
              />
              <ResearchField 
                label="Exemplo: Problemas / Dores" 
                name="pains" 
                placeholder="Exemplo:&#10;- não consegue dormir&#10;- sensação angustiante&#10;- falta de ar" 
                value={formData.pains}
                onChange={handleChange}
                onAutoFill={handleAutoFill}
                isFilling={loadingField === 'pains'}
                canFill={canAutoFill}
              />
            </div>
          )}
        </div>

        {/* Grupo: Crença */}
        <div className="border-b border-slate-800">
          <button type="button" onClick={() => toggleSection('crenca')} className="w-full px-6 py-4 flex justify-between items-center hover:bg-[#131c31] transition-colors group">
            <span className="font-bold text-slate-300 group-hover:text-indigo-400 uppercase tracking-wider text-xs flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                Gatilho da Crença
            </span>
            {openSection === 'crenca' ? <ChevronUp className="w-4 h-4 text-indigo-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
          {openSection === 'crenca' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0b1120]">
              <ResearchField 
                label="Exemplo: Medos" 
                name="fears" 
                placeholder="Exemplo:&#10;- medo de tomar remédio e ficar dependente&#10;- medo de morrer&#10;- perder o controle" 
                value={formData.fears}
                onChange={handleChange}
                onAutoFill={handleAutoFill}
                isFilling={loadingField === 'fears'}
                canFill={canAutoFill}
              />
              <ResearchField 
                label="Exemplo: Crenças da Audiência" 
                name="beliefs" 
                placeholder="Exemplo:&#10;- só posso melhorar com remédio&#10;- eu sou fraco&#10;- isso é para sempre" 
                value={formData.beliefs}
                onChange={handleChange}
                onAutoFill={handleAutoFill}
                isFilling={loadingField === 'beliefs'}
                canFill={canAutoFill}
              />
            </div>
          )}
        </div>

        {/* Grupo: Reconhecimento */}
        <div className="border-b border-slate-800">
          <button type="button" onClick={() => toggleSection('reconhecimento')} className="w-full px-6 py-4 flex justify-between items-center hover:bg-[#131c31] transition-colors group">
            <span className="font-bold text-slate-300 group-hover:text-teal-400 uppercase tracking-wider text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                Gatilho do Reconhecimento
            </span>
            {openSection === 'reconhecimento' ? <ChevronUp className="w-4 h-4 text-teal-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
          {openSection === 'reconhecimento' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0b1120]">
              <ResearchField 
                label="Exemplo: Situações / Hábitos Comuns" 
                name="habits" 
                placeholder="Exemplo:&#10;- abandona atividades&#10;- usa calmante&#10;- tem crises em momentos tranquilos" 
                value={formData.habits}
                onChange={handleChange}
                onAutoFill={handleAutoFill}
                isFilling={loadingField === 'habits'}
                canFill={canAutoFill}
              />
              <ResearchField 
                label="Exemplo: Características do Avatar" 
                name="characteristics" 
                placeholder="Exemplo:&#10;- Pessoas com alta sensibilidade&#10;- Profissões de alta pressão" 
                value={formData.characteristics}
                onChange={handleChange}
                onAutoFill={handleAutoFill}
                isFilling={loadingField === 'characteristics'}
                canFill={canAutoFill}
              />
            </div>
          )}
        </div>

         {/* Grupo: Popularidade */}
         <div className="border-b border-slate-800">
          <button type="button" onClick={() => toggleSection('popularidade')} className="w-full px-6 py-4 flex justify-between items-center hover:bg-[#131c31] transition-colors group">
            <span className="font-bold text-slate-300 group-hover:text-blue-400 uppercase tracking-wider text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Gatilho da Popularidade
            </span>
            {openSection === 'popularidade' ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
          {openSection === 'popularidade' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0b1120]">
              <ResearchField 
                label="Exemplo: Filmes, Séries e Músicas" 
                name="media" 
                placeholder="Exemplo:&#10;- Divertida Mente&#10;- O Coringa" 
                value={formData.media}
                onChange={handleChange}
                onAutoFill={handleAutoFill}
                isFilling={loadingField === 'media'}
                canFill={canAutoFill}
              />
              <ResearchField 
                label="Exemplo: Técnicas / Procedimentos" 
                name="techniques" 
                placeholder="Exemplo:&#10;- Mindfulness&#10;- TCC&#10;- Exposição gradual" 
                value={formData.techniques}
                onChange={handleChange}
                onAutoFill={handleAutoFill}
                isFilling={loadingField === 'techniques'}
                canFill={canAutoFill}
              />
              <ResearchField 
                label="Exemplo: Pessoas / Personagens" 
                name="famousPeople" 
                placeholder="Exemplo:&#10;- Freud&#10;- Personagem ansioso de série" 
                value={formData.famousPeople}
                onChange={handleChange}
                onAutoFill={handleAutoFill}
                isFilling={loadingField === 'famousPeople'}
                canFill={canAutoFill}
              />
              <ResearchField 
                label="Exemplo: Instituições" 
                name="institutions" 
                placeholder="Exemplo:&#10;- Indústria Farmacêutica" 
                value={formData.institutions}
                onChange={handleChange}
                onAutoFill={handleAutoFill}
                isFilling={loadingField === 'institutions'}
                canFill={canAutoFill}
              />
              <div className="md:col-span-2">
                <ResearchField 
                  label="Exemplo: Itens / Objetos / Ferramentas" 
                  name="tools" 
                  placeholder="Exemplo:&#10;- Fluoxetina&#10;- Rivotril&#10;- Chá de camomila&#10;- App de meditação" 
                  value={formData.tools}
                  onChange={handleChange}
                  onAutoFill={handleAutoFill}
                  isFilling={loadingField === 'tools'}
                  canFill={canAutoFill}
                />
              </div>
            </div>
          )}
        </div>

        {/* Grupo: Disrupção */}
        <div>
          <button type="button" onClick={() => toggleSection('disrupcao')} className="w-full px-6 py-4 flex justify-between items-center hover:bg-[#131c31] transition-colors group">
            <span className="font-bold text-slate-300 group-hover:text-red-400 uppercase tracking-wider text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                Gatilho da Disrupção
            </span>
            {openSection === 'disrupcao' ? <ChevronUp className="w-4 h-4 text-red-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
          {openSection === 'disrupcao' && (
            <div className="p-6 bg-[#0b1120]">
              <ResearchField 
                label="Exemplo: O que viola as expectativas?" 
                name="disruptions" 
                placeholder="Exemplo:&#10;- melhorar sem remédio&#10;- estar em situações sociais sem medo&#10;- viver sem medo do futuro"
                height="h-32"
                value={formData.disruptions}
                onChange={handleChange}
                onAutoFill={handleAutoFill}
                isFilling={loadingField === 'disruptions'}
                canFill={canAutoFill}
              />
            </div>
          )}
        </div>

      </div>

      {/* SECTION 3: ESTRATÉGIA */}
      <div className="bg-[#0f172a] rounded-lg border border-slate-800/60 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-900/50">
           <div className="flex items-center gap-2">
             <MessageSquare className="text-sky-500 w-5 h-5" />
             <h3 className="text-base font-bold text-white uppercase tracking-wide">3. Ajuste Fino</h3>
           </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Gatilho Principal</label>
            <div className="relative">
              <select
                name="trigger"
                value={formData.trigger}
                onChange={handleChange}
                className="w-full bg-[#0b1120] border border-slate-800 rounded-sm px-4 py-3 text-white appearance-none cursor-pointer focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              >
                {TRIGGERS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Estrutura</label>
            <div className="relative">
              <select
                name="structure"
                value={formData.structure}
                onChange={handleChange}
                className="w-full bg-[#0b1120] border border-slate-800 rounded-sm px-4 py-3 text-white appearance-none cursor-pointer focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              >
                {STRUCTURES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
          </div>
          
           <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tom de Voz</label>
            <div className="relative">
              <select
                name="tone"
                value={formData.tone}
                onChange={handleChange}
                className="w-full bg-[#0b1120] border border-slate-800 rounded-sm px-4 py-3 text-white appearance-none cursor-pointer focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              >
                {TONES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
            </div>
          </div>

           <div className="col-span-1 flex items-end">
            <div className="w-full flex items-center justify-between bg-[#0b1120] p-3 rounded-sm border border-slate-800 h-[48px]">
              <div className="flex items-center gap-2 text-slate-300 relative group cursor-help">
                <Info className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-bold uppercase tracking-wide">Usar tendências / memes?</span>
                
                {/* Tooltip Content */}
                <div className="absolute bottom-full left-0 mb-3 w-64 p-3 bg-[#0f172a] border border-slate-700 rounded shadow-xl text-xs text-slate-300 normal-case tracking-normal leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Ao ativar, a IA pesquisa no Google em tempo real por notícias e memes recentes para criar títulos baseados no momento (News Jacking).
                    <div className="absolute -bottom-1 left-4 w-2 h-2 bg-[#0f172a] border-b border-r border-slate-700 rotate-45"></div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleToggleTrends}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                  formData.useTrends ? 'bg-sky-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`${
                    formData.useTrends ? 'translate-x-5' : 'translate-x-1'
                  } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === StepStatus.LOADING}
        className="w-full mt-6 bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-600 hover:to-sky-500 text-white font-bold py-4 px-6 rounded-sm transition-all transform hover:translate-y-[-1px] shadow-lg hover:shadow-sky-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg uppercase tracking-widest"
      >
        {status === StepStatus.LOADING ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">{loadingMessage}</span>
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            <span className="text-sm">Gerar Títulos</span>
          </>
        )}
      </button>

      {/* --- MODAL DE SALVAR --- */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowSaveModal(false)}></div>
            <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-700 rounded-lg shadow-2xl p-6 animate-in fade-in zoom-in-95">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Save className="w-5 h-5 text-sky-500" />
                    Salvar Perfil de Avatar
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                    Dê um nome para este perfil para carregá-lo facilmente depois. 
                    <br/><span className="text-xs text-slate-500">(Ex: "Emagrecimento Mulheres 30+")</span>
                </p>
                <input 
                    autoFocus
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Nome do Perfil"
                    className="w-full bg-[#0b1120] border border-slate-700 rounded-sm px-4 py-3 text-white mb-6 focus:ring-1 focus:ring-sky-500 outline-none"
                />
                <div className="flex justify-end gap-3">
                    <button 
                        type="button"
                        onClick={() => setShowSaveModal(false)}
                        className="px-4 py-2 text-slate-400 hover:text-white text-sm font-bold"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button"
                        onClick={handleConfirmSave}
                        className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-sm text-sm font-bold shadow-lg shadow-sky-900/20"
                    >
                        Confirmar Salvar
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL DE CARREGAR --- */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowLoadModal(false)}></div>
            <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-lg shadow-2xl p-6 animate-in fade-in zoom-in-95 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-sky-500" />
                        Carregar Perfil
                    </h3>
                    <button onClick={() => setShowLoadModal(false)} className="text-slate-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                    {Object.keys(savedProfiles).length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <p>Nenhum perfil salvo encontrado.</p>
                        </div>
                    ) : (
                        Object.entries(savedProfiles).map(([name, data]) => {
                            const profileData = data as ViralFormData;
                            return (
                                <div key={name} className="flex items-center justify-between p-3 bg-[#0b1120] border border-slate-800 rounded-sm hover:border-sky-500/40 hover:bg-[#131c31] group transition-all cursor-pointer">
                                    <button 
                                        onClick={() => handleSelectProfile(name)}
                                        className="flex-1 text-left"
                                    >
                                        <h4 className="font-bold text-slate-200 group-hover:text-sky-400 transition-colors text-sm">{name}</h4>
                                        <span className="text-xs text-slate-500 flex gap-2">
                                            <span>{profileData.niche || "Sem nicho"}</span>
                                            <span>•</span>
                                            <span>{profileData.subject || "Sem assunto"}</span>
                                        </span>
                                    </button>
                                    <button 
                                        onClick={(e) => handleDeleteProfile(name, e)}
                                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-950/30 rounded transition-colors"
                                        title="Excluir perfil"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
      )}

    </form>
  );
};

export default InputForm;