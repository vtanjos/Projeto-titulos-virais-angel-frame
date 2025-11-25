
export interface ViralFormData {
  // Básico
  niche: string;
  subject: string;
  autoSubject: boolean; // Novo campo: IA decide o assunto
  contentType: string;
  objective: string;
  
  // PESQUISA DE AVATAR (Listas de texto)
  
  // Gatilho da Recompensa
  desires: string;        // Desejos
  pains: string;          // Problemas/Dores

  // Gatilho da Crença
  fears: string;          // Medos
  beliefs: string;        // Crenças da Audiência

  // Gatilho do Reconhecimento
  habits: string;         // Situações/Hábitos Comuns
  characteristics: string;// Características do Avatar

  // Gatilho da Popularidade/Reputação
  media: string;          // Filmes, Séries, Músicas
  techniques: string;     // Técnicas/Procedimentos
  famousPeople: string;   // Pessoas/Personagens
  institutions: string;   // Instituições
  tools: string;          // Itens/Objetos/Ferramentas

  // Gatilho da Disrupção
  disruptions: string;    // Violação de Expectativas

  // Configurações Finais
  trigger: string;
  structure: string;
  tone: string;
  useTrends: boolean;
}

export interface GeneratedTitle {
  title: string;
  explanation: string;
  hookType: string;
  structureUsed?: string;
  sources?: { title: string; uri: string }[]; // New field for search grounding
}

export interface GeneratedScript {
  title: string;
  mysteryIntensifier: string;
  positioning: string;
  notableContent: string;
  callToAction: string;
}

export enum StepStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
