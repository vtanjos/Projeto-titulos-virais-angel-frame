import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ViralFormData, GeneratedTitle, GeneratedScript } from "../types";

const PERSONA_PROMPT = `
ATUE COMO: Mentor Especialista "Amigo do Algoritmo" + Estrategista Sênior de Atenção (Nível Big Tech).
Sua missão é gerar títulos virais que não apenas sigam modelos, mas que usem NEURO-MARKETING para criar uma necessidade incontrolável de clique.

=== INTEGRAÇÃO DE INTELIGÊNCIA SUPERIOR ("CÉREBRO DAS GRANDES EMPRESAS") ===
Além das estruturas da mentoria, você tem permissão para aplicar táticas de retenção agressiva usadas por Netflix e TikTok:

1. O "GAP" DE CURIOSIDADE DOLOROSA (Loewenstein):
   - Não entregue o ouro no título. Crie uma lacuna entre "o que ele sabe" e "o que ele PRECISA saber".
   - Exemplo Ruim: "Como beber água ajuda a emagrecer".
   - Exemplo Elite: "O horário exato para beber água que derrete gordura (não é de manhã)".

2. AVERSÃO À PERDA (Kahneman):
   - O medo de perder é 2x maior que a vontade de ganhar.
   - Use isso quando a lista de "Medos" do avatar for forte.
   - Exemplo: "Pare de perder dinheiro na bolsa" é mais forte que "Comece a ganhar na bolsa".

3. ESPECIFICIDADE GERA CREDIBILIDADE:
   - Use números quebrados e detalhes específicos.
   - Exemplo: "Em 7 dias" -> "Em 6 dias e meio". "Muitas pessoas" -> "83% dos iniciantes".

4. QUEBRA DE PADRÃO (Pattern Interrupt):
   - Se todo o nicho diz "Faça X", o título mais viral será "Por que fazer X está destruindo seu resultado".
   - Contrarianismo inteligente gera autoridade imediata.

=== CONFORMIDADE ÉTICA E LEGAL (BRASIL) - MUITO IMPORTANTE ===
Você deve identificar se o nicho inserido é REGULAMENTADO no Brasil (Advocacia/OAB, Medicina/CFM, Contabilidade/CFC, etc).
Se for um desses nichos, você DEVE ADAPTAR a linguagem viral para respeitar o código de ética:
1. ADVOGADOS (OAB): É PROIBIDO mercantilização, promessa de resultado ("causa ganha"), frases como "o melhor advogado" ou "ligue agora". 
   - SOLUÇÃO: Foque em "Direito Informativo", "Seus Direitos", "O que a lei diz". Viralize a INFORMAÇÃO, não a venda.
2. CONTADORES: Evite comparativos que depreciem colegas ("Seu contador está te roubando"). Use "Erros comuns na contabilidade".
3. SAÚDE: Nunca prometa cura garantida ("Cure o câncer em 2 dias"). Use "Tratamentos", "Sinais", "Prevenção".

MANTENHA A VIRALIDADE, mas dentro da legalidade informativa.

=== LÓGICA DE PREENCHIMENTO (CRUCIAL) ===
Você receberá dados de pesquisa "brutos" do usuário.
1. OLHAR PARA A ESTRUTURA SELECIONADA.
2. SELECIONAR OS DADOS MAIS FORTES (Aqueles que causam emoção visceral).
3. COMBINAR para criar um título forte e coeso.
4. SE ACHAR NECESSÁRIO, ignore a estrutura padrão e crie uma VARIAÇÃO MAIS INTELIGENTE baseada na psicologia descrita acima.

=== BIBLIOTECA DE ESTRUTURAS OBRIGATÓRIAS (BASE) ===

[GATILHO: RECOMPENSA]
- Como [Desejo da lista]
- Como [Desejo da lista] sem [Problema/Objeção da lista]
- Como [Desejo da lista] em [Tempo Curto/Específico]
- O Método "Big Tech" para [Desejo]
- O Guia Completo para [Desejo]

[GATILHO: MISTÉRIO / CURIOSIDADE]
- A Última Coisa Que Falta Acontecer para [Desejo/Medo]
- [X] Coisas que são Piores do que [Crença/Item Ruim]
- O Que Ninguém Te Conta Sobre [Assunto/Ferramenta]
- A [Ferramenta/Técnica] Secreta que [Avatar/Pessoa] usa
- [X] Sinais Sutis Que [Problema da lista] Está Acontecendo

[GATILHO: DISRUPÇÃO / QUEBRA DE PADRÃO]
- Por que você deve PARAR de [Hábito Comum] agora
- [Item da lista] na verdade é puro veneno
- Eu estava errado sobre [Crença Comum]
- O Fim do [Técnica Comum]: O que vem agora?

[GATILHO: RECONHECIMENTO / IDENTIFICAÇÃO]
- Só quem é [Característica do Avatar] vai entender essa dor
- Se você faz [Hábito Comum], cuidado...
- O erro nº 1 de todo [Avatar] iniciante

[GATILHO: POPULARIDADE / AUTORIDADE]
- A rotina de [Pessoa Famosa] para [Desejo]
- O conselho de [Pessoa Famosa] que mudou tudo
- Vivi como [Pessoa Famosa] por 24 horas

=== INSTRUÇÃO DE GERAÇÃO ===
1. Analise o "Trigger" (Gatilho) solicitado. Se for "IA Decide", use sua INTELIGÊNCIA ESTRATÉGICA para escolher o que vai "mexer" mais com a pessoa.
2. Gere títulos que façam a pessoa sentir que PRECISA clicar para aliviar uma tensão mental ou resolver uma dor imediata.
3. Mantenha a linguagem SIMPLES e POPULAR.
`;

// Schema apenas para quando NÃO usar ferramentas (ResponseMimeType JSON)
const RESPONSE_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "O título viral gerado.",
      },
      explanation: {
        type: Type.STRING,
        description: "Explicação curta (qual estratégia psicológica, gatilho e dados de pesquisa foram usados).",
      },
      hookType: {
        type: Type.STRING,
        description: "O gatilho principal utilizado.",
      }
    },
    required: ["title", "explanation", "hookType"],
  },
};

const SCRIPT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "O título do roteiro." },
    mysteryIntensifier: { type: Type.STRING, description: "A frase que aumenta o mistério ou o perigo logo após o título." },
    positioning: { type: Type.STRING, description: "Apresentação do autor (Nome + O que faz baseado no benefício do avatar)." },
    notableContent: { type: Type.STRING, description: "O conteúdo principal: novo, faz sentido, gera resultado, simples de entender." },
    callToAction: { type: Type.STRING, description: "O fechamento pedindo like, seguir ou compartilhar." }
  },
  required: ["title", "mysteryIntensifier", "positioning", "notableContent", "callToAction"]
};

// Helper function to clean JSON string from Markdown or other text
const cleanJsonString = (input: string): string => {
  try {
    // 1. Tentar encontrar o primeiro '[' e o último ']'
    const firstBracket = input.indexOf('[');
    const lastBracket = input.lastIndexOf(']');

    if (firstBracket !== -1 && lastBracket !== -1) {
      return input.substring(firstBracket, lastBracket + 1);
    }
    
    // 2. Se não encontrar, tentar remover blocos de código markdown comuns
    return input.replace(/```json\s*|```\s*/g, "").trim();
  } catch (e) {
    return input;
  }
};

export const generateViralTitles = async (data: ViralFormData): Promise<GeneratedTitle[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing provided in process.env.API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Configuração Condicional baseada em Tendências
  const isTrending = data.useTrends;
  
  // Se usar tendências, não podemos usar responseSchema nem mimeType json
  const tools = isTrending ? [{ googleSearch: {} }] : undefined;
  const responseMimeType = isTrending ? undefined : "application/json";
  const responseSchema = isTrending ? undefined : RESPONSE_SCHEMA;

  // Lógica do Assunto Automático
  let subjectInstruction = "";
  if (data.autoSubject) {
     subjectInstruction = `
     ATENÇÃO: O campo "Assunto Principal" foi deixado para VOCÊ (IA) escolher.
     - Analise as listas de DORES e DESEJOS abaixo.
     - Identifique qual é o tópico com MAIOR POTENCIAL VIRAL (O que dói mais? O que eles desejam mais?).
     - Use a lógica da "Dor Latente": O que mantém esse avatar acordado à noite?
     - Escolha esse tópico como o "Assunto Principal".
     - Se as listas de pesquisa estiverem vazias, escolha um "Assunto Quente" (Trending Topic) geral dentro do Nicho "${data.niche}".
     `;
  } else {
     subjectInstruction = `Assunto Principal Definido pelo Usuário: ${data.subject}`;
  }

  let prompt = `
    DADOS DE PESQUISA DO USUÁRIO (USE ISTO PARA PREENCHER AS ESTRUTURAS E APLICAR A ESTRATÉGIA):
    
    1. CONTEXTO:
       - Nicho: ${data.niche}
       - ${subjectInstruction}
    
    2. DADOS PSICOLÓGICOS (AVATAR):
       - DESEJOS: ${data.desires || "Não informado"}
       - DORES/PROBLEMAS: ${data.pains || "Não informado"}
       - MEDOS: ${data.fears || "Não informado"}
       - CRENÇAS: ${data.beliefs || "Não informado"}
       - HÁBITOS: ${data.habits || "Não informado"}
       - CARACTERÍSTICAS: ${data.characteristics || "Não informado"}
       
    3. ELEMENTOS DE AUTORIDADE/POPULARIDADE:
       - MÍDIA/REFERÊNCIAS: ${data.media || "Não informado"}
       - TÉCNICAS: ${data.techniques || "Não informado"}
       - PESSOAS: ${data.famousPeople || "Não informado"}
       - INSTITUIÇÕES: ${data.institutions || "Não informado"}
       - FERRAMENTAS: ${data.tools || "Não informado"}
    
    4. DISRUPÇÃO:
       - O QUE VIOLA EXPECTATIVAS: ${data.disruptions || "Não informado"}

    5. CONFIGURAÇÃO DO PEDIDO:
       - Objetivo: ${data.objective}
       - Gatilho: ${data.trigger}
       - Estrutura: ${data.structure}
       - Tom: ${data.tone}
       - Formato: ${data.contentType}

    *** MODO INTELIGÊNCIA ESTRATÉGICA ATIVADO ***
    Se algum campo acima for "IA Decide", você tem carta branca para ignorar estruturas básicas e usar TÍTULOS DE ALTA CONVERSÃO baseados em psicologia avançada (Curiosidade, Medo, Ganância, Vaidade).
    O objetivo final é o CLIQUE. O título deve ser impossível de ignorar.
  `;

  if (isTrending) {
    prompt += `
    ATENÇÃO: MODO TENDÊNCIAS (NEWS JACKING) ATIVADO.
    1. USE O GOOGLE SEARCH para encontrar o que está acontecendo AGORA no nicho "${data.niche}".
    2. INTELIGÊNCIA DE MOMENTO: Não pegue apenas a notícia. Pegue a EMOÇÃO da notícia. Se é algo assustador, crie um título de ALERTA. Se é uma novidade boa, crie um título de OPORTUNIDADE.
    3. Conecte a notícia ao desejo/dor do usuário.
    
    IMPORTANTE:
    - Responda APENAS com o JSON. 
    - NÃO escreva introdução ou explicações fora do JSON.
    - NÃO use blocos de código markdown (apenas o texto JSON cru).
    - O formato DEVE ser uma lista de objetos: [{"title": "...", "explanation": "...", "hookType": "..."}]
    
    GERE 6 (SEIS) TÍTULOS.
    `;
  } else {
    prompt += `
    TAREFA: Gere 6 (SEIS) títulos virais estrategicamente desenhados.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: isTrending ? "gemini-3-pro-preview" : "gemini-2.5-flash", 
      contents: prompt,
      config: {
        systemInstruction: PERSONA_PROMPT,
        responseMimeType: responseMimeType,
        responseSchema: responseSchema,
        tools: tools,
        temperature: 0.95, // Aumentei um pouco para mais criatividade estratégica
      },
    });

    // Extract Text and Parse
    let outputText = response.text;
    if (!outputText) {
      throw new Error("No content generated");
    }

    let titles: GeneratedTitle[] = [];

    if (isTrending) {
        // Limpar string antes de tentar o parse
        const cleanText = cleanJsonString(outputText);
        try {
            titles = JSON.parse(cleanText);
        } catch (e) {
            console.error("Falha no primeiro parse de JSON. Tentando fallback...", cleanText);
            // Fallback: se falhar, tentar encontrar padrão JSON dentro de texto mais complexo
            const match = outputText.match(/\[\s*\{.*\}\s*\]/s);
            if (match) {
                titles = JSON.parse(match[0]);
            } else {
                throw new Error("Não foi possível processar a resposta da IA. Tente novamente.");
            }
        }

        // Extrair Grounding Metadata (Fontes)
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .map(chunk => chunk.web ? { title: chunk.web.title || "Fonte Web", uri: chunk.web.uri || "" } : null)
            .filter((s): s is { title: string; uri: string } => s !== null && !!s.uri);
        
        if (sources.length > 0) {
            titles = titles.map(t => ({...t, sources}));
        }

    } else {
        titles = JSON.parse(outputText);
    }

    // Garantia de retorno de array
    if (!Array.isArray(titles)) {
        console.warn("API retornou objeto não-array, convertendo...", titles);
        return [titles]; // Se retornou um único objeto, envelopar em array
    }

    return titles;

  } catch (error) {
    console.error("Gemini API Error:", error);
    if (isTrending) {
         console.warn("Erro no modo Tendências. A IA pode ter falhado ao formatar o JSON.");
         throw new Error("A IA pesquisou as tendências, mas houve um erro ao formatar a resposta. Tente novamente.");
    }
    throw error;
  }
};

export const generateViralScript = async (title: string, data: ViralFormData): Promise<GeneratedScript> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
     throw new Error("API Key missing");
  }
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
  ATUE COMO: Roteirista de Elite para Vídeos Curtos (Retention Specialist).
  CRIE UM ROTEIRO VIRAL PARA O TÍTULO: "${title}"
  
  USE OS DADOS ABAIXO PARA PERSONALIZAR E DAR PROFUNDIDADE:
  Nicho: ${data.niche}
  Desejos: ${data.desires}
  Dores: ${data.pains}
  Medos: ${data.fears}
  
  === INTEGRAÇÃO ESTRATÉGICA (O QUE FAZ A PESSOA FICAR ATÉ O FINAL) ===
  O roteiro não pode ser apenas "dicas". Ele deve ser uma JORNADA EMOCIONAL.
  Use a técnica do "Loop Aberto" e da "Revelação Progressiva".
  
  === REGRAS DE OURO PARA O ROTEIRO ===
  1. INTENSIFICADOR DO MISTÉRIO (HOOK DE RETENÇÃO): 
     - Use a Lógica do Custo de Ignorar.
     - Diga EXATAMENTE o que a pessoa vai PERDER ou SOFRER se pular o vídeo. Conecte com um medo real da lista.
     - Exemplo: "Se você ignorar a terceira dica, [DOR ESPECÍFICA] vai piorar em 2 semanas."

  2. CONTEÚDO NOTÁVEL (MIOLO DE VALOR):
     - Não entregue o óbvio (senso comum).
     - Se for ensinar algo, ensine um "Hack", um "Segredo de Bastidor" ou uma "Verdade Contra-Intuitiva".
     - O conteúdo deve gerar o efeito "AHA!" (Epifania).
     - Seja denso em valor, mas simples na linguagem.

  3. CONFORMIDADE ÉTICA (BRASIL):
     Se o nicho for ADVOCACIA, CONTABILIDADE ou SAÚDE:
     - Foque em EDUCAÇÃO.
     - NÃO prometa resultados milagrosos ou garantias de causa ganha.

  ESTRUTURA OBRIGATÓRIA (JSON):
  1. Title: (Título fornecido).
  2. MysteryIntensifier: Frase de alto impacto logo após o título para travar a atenção.
  3. Positioning: Nome + Autoridade baseada na transformação que gera (ex: "Te ajudo a X para você Y").
  4. NotableContent: O corpo do roteiro. Use analogias, exemplos práticos e lógica impecável.
  5. CallToAction: Chamada para ação contextualizada.

  TOM: ${data.tone}
  LINGUAGEM: Conversacional, direta, magnética.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: SCRIPT_SCHEMA,
      temperature: 0.85 // Leve aumento para roteiros menos robóticos
    }
  });
  
  return JSON.parse(response.text || "{}");
};

export const generateResearchField = async (niche: string, subject: string, fieldLabel: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });

    let specificInstruction = "";
    const lowerLabel = fieldLabel.toLowerCase();

    // Lógica Específica para Características do Avatar
    if (lowerLabel.includes('característica')) {
        specificInstruction = `
        FOCO ESPECÍFICO PARA "CARACTERÍSTICAS DO AVATAR":
        Não liste apenas sintomas ou dados demográficos. Liste perfis COMPORTAMENTAIS, EMOCIONAIS e SITUACIONAIS.
        Imagine a vida dessa pessoa.
        
        Exemplos do que gerar:
        - "Pessoas com alta sensibilidade emocional"
        - "Profissões ou situações de alta pressão"
        - "Histórico de traumas ou eventos estressantes"
        - "Pessoas que têm dificuldade em relaxar"
        - "Pessoas que se isolam socialmente"
        
        Gere itens que descrevam QUEM É a pessoa por dentro e o contexto dela.
        `;
    } 
    // Lógica Específica para Disrupção (Paradoxos)
    else if (lowerLabel.includes('viola') || lowerLabel.includes('disrupção') || lowerLabel.includes('expectativa')) {
        specificInstruction = `
        FOCO ESPECÍFICO PARA "DISRUPÇÃO" (O QUE VIOLA EXPECTATIVAS):
        Você deve listar situações que QUEBRAM o senso comum ou a lógica de "causa e efeito" desse nicho.
        Crie paradoxos.
        
        Use a estrutura lógica: 
        1. "Conseguir [Resultado Bom] fazendo [Algo que parece Ruim/Proibido]" 
        OU 
        2. "Conseguir [Resultado] sem [O que todos dizem ser obrigatório]".
        
        Exemplos de lógica para aplicar no nicho atual:
        - "Emagrecer comendo chocolate" (Nicho Dieta).
        - "Melhorar a ansiedade sem tomar remédio" (Nicho Saúde Mental).
        - "Ficar rico trabalhando menos" (Nicho Produtividade).
        - "Estar em situações sociais sem sentir medo" (Nicho Fobia Social).
        `;
    } 
    // Lógica Geral para outros campos
    else {
        specificInstruction = `
        Se for "Dores": Foque no que tira o sono da pessoa, no sofrimento agudo.
        Se for "Desejos": Foque no resultado final transformador e na sensação de vitória.
        Se for "Medos": Foque nas consequências terríveis se nada mudar.
        Se for "Crenças": Foque no que eles repetem para si mesmos que os impede de crescer (crenças limitantes).
        Se for "Hábitos": O que eles fazem todo dia que piora o problema?
        `;
    }

    const prompt = `
    ATUE COMO: Pesquisador de Mercado e Psicólogo Comportamental Sênior.
    TAREFA: Gere uma lista de 5 a 7 itens estratégicos para o campo de pesquisa: "${fieldLabel}".
    
    CONTEXTO:
    Nicho: ${niche}
    Assunto: ${subject}
    
    ${specificInstruction}
    
    FORMATO DE RESPOSTA:
    Apenas a lista em texto simples, um item por linha. Sem numeração, sem marcadores (bullets), sem introdução.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            temperature: 0.85, // Criatividade calibrada
        }
    });

    return response.text?.trim() || "";
};