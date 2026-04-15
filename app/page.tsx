"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { 
  trackInitiateCheckout as pixelInitiateCheckout, 
  trackQuizAnswer as pixelQuizAnswer, 
  trackLead as pixelLead, 
  trackCompleteRegistration as pixelCompleteRegistration, 
  trackPurchase as pixelPurchase 
} from "@/lib/pixel"

// ═══════════════════════════════════════════════
// STEPS DATA
// ═══════════════════════════════════════════════
interface Option {
  icon: string
  text: string
  score: number
  tag: string | null
}

interface Step {
  id: string
  type: "single" | "multi" | "insight_single" | "chart_single"
  scoreWeight: number
  badge: string
  text: string
  sub: string | null
  insight?: string
  options: Option[]
}

const steps: Step[] = [
  {
    id: "e1",
    type: "single",
    scoreWeight: 0,
    badge: "Etapa 1 de 11 · Como você chegou até aqui",
    text: "Essa fase começou de forma inesperada para você?",
    sub: "Escolha a opção que mais se encaixa na sua história.",
    options: [
      { icon: "😳", text: "Sim… comecei a sentir mudanças e não entendi direito", score: 1, tag: null },
      { icon: "📈", text: "Não, já vinha percebendo sinais, mas agora ficou muito mais intenso", score: 2, tag: null },
    ],
  },
  {
    id: "e2",
    type: "multi",
    scoreWeight: 1,
    badge: "Etapa 2 de 11 · Seus sintomas",
    text: "Quais desses sintomas você tem sentido?",
    sub: "Pode marcar mais de uma opção.",
    exclusiveOption: 5,
    options: [
      { icon: "🔥", text: "Fogachos e suores noturnos", score: 3, tag: "Fogachos" },
      { icon: "😤", text: "Irritabilidade ou choro fácil", score: 3, tag: "Irritabilidade" },
      { icon: "🌙", text: "Acordar de madrugada, especialmente às 3h", score: 3, tag: "Insônia às 3h" },
      { icon: "🧠", text: "Névoa mental e falhas de memória", score: 3, tag: "Névoa mental" },
      { icon: "🪫", text: "Cansaço constante mesmo descansando", score: 3, tag: "Fadiga" },
      { icon: "⊘", text: "Nenhum ou poucos sintomas", score: 0, tag: null },
    ],
  },
  {
    id: "e3",
    type: "single",
    scoreWeight: 0,
    badge: "Etapa 3 de 11 · Há quanto tempo",
    text: "Há quanto tempo você convive com esses sintomas?",
    sub: "Escolha a opção que mais se encaixa.",
    options: [
      { icon: "🕐", text: "Comecei a sentir nos últimos meses", score: 1, tag: null },
      { icon: "📅", text: "Há mais de 1 ano", score: 2, tag: null },
      { icon: "⏳", text: "Já são vários anos convivendo com isso", score: 3, tag: null },
      { icon: "❓", text: "Não sei dizer exatamente", score: 1, tag: null },
    ],
  },
  {
    id: "e4",
    type: "insight_single",
    scoreWeight: 0,
    badge: "Etapa 4 de 11 · Você sabia disso?",
    text: "Você sabia que a Menopausa pode começar até 10 anos antes dos 45?",
    sub: null,
    insight:
      "Isso significa que você pode ter 37, 40 ou 43 anos, menstruação ainda regular ou já irregular, e estar nessa fase.\n\nEla tem um nome: PERIMENOPAUSA.\n\nA maioria das mulheres acha que só entra na menopausa quando para de menstruar de vez. Mas existe uma fase antes disso, que pode durar anos, e é onde tudo começa a mudar no seu corpo.",
    options: [
      { icon: "😳", text: "Não fazia ideia disso!", score: 2, tag: null },
      { icon: "🤔", text: "Já ouvi falar, mas não entendo bem", score: 1, tag: null },
      { icon: "✅", text: "Sim, já sabia", score: 0, tag: null },
    ],
  },
  {
    id: "e5",
    type: "single",
    scoreWeight: 0,
    badge: "Etapa 5 de 11 · Onde você está",
    text: "Hoje, você sabe em qual fase hormonal está?",
    sub: null,
    options: [
      { icon: "🔄", text: "Acho que estou na perimenopausa", score: 1, tag: null },
      { icon: "🌙", text: "Acho que já entrei na menopausa", score: 2, tag: null },
      { icon: "😕", text: "Ainda não faço ideia, é exatamente o que quero descobrir", score: 2, tag: null },
    ],
  },
  {
    id: "e6",
    type: "single",
    scoreWeight: 0,
    badge: "Etapa 6 de 11 · O que você quer",
    text: "Se você pudesse escolher, como gostaria de viver essa fase?",
    sub: "Escolha a opção que mais se encaixa com você.",
    options: [
      { icon: "🌿", text: "Com equilíbrio, clareza e bem-estar", score: 0, tag: "Equilíbrio" },
      { icon: "🔥", text: "Sem os calores e desconfortos físicos", score: 0, tag: "Alívio físico" },
      { icon: "🧠", text: "Com mais controle emocional e foco", score: 0, tag: "Clareza mental" },
      { icon: "✨", text: "Só quero voltar a me sentir eu mesma", score: 0, tag: "Reconexão" },
    ],
  },
  {
    id: "e7",
    type: "multi",
    scoreWeight: 1,
    badge: "Etapa 7 de 11 · Sua maior preocupação",
    text: "Qual é hoje sua maior preocupação com essa fase?",
    sub: "Pode marcar mais de uma opção.",
    options: [
      { icon: "📈", text: "Que os sintomas piorem com o tempo", score: 2, tag: "Progressão dos sintomas" },
      { icon: "💔", text: "Perder qualidade de vida", score: 3, tag: "Qualidade de vida" },
      { icon: "🪞", text: "Não me reconhecer mais, física e emocionalmente", score: 3, tag: "Autoconhecimento" },
      { icon: "❓", text: "Não saber como controlar o que está acontecendo no meu corpo", score: 3, tag: "Falta de clareza" },
      { icon: "⚠️", text: "Aumento dos riscos de saúde", score: 3, tag: "Riscos de saúde" },
    ],
  },
  {
    id: "e8",
    type: "multi",
    scoreWeight: 1,
    badge: "Etapa 8 de 11 · Seu sono",
    text: "Como estão suas noites?",
    sub: "Pode marcar mais de uma opção.",
    exclusiveOption: 4,
    options: [
      { icon: "😐", text: "Oscila bastante, às vezes bem, às vezes péssimo", score: 1, tag: "Sono irregular" },
      { icon: "🧠", text: "Acordo de madrugada e não consigo parar de pensar", score: 2, tag: "Insônia com ansiedade" },
      { icon: "😩", text: "Perco o sono com frequência, acordo exausta", score: 3, tag: "Privação de sono" },
      { icon: "🛏️", text: "Tenho dificuldade de pegar no sono", score: 2, tag: "Dificuldade para dormir" },
      { icon: "😌", text: "Consigo dormir bem, acordo descansada", score: 0, tag: null },
    ],
  },
  {
    id: "e9",
    type: "chart_single",
    scoreWeight: 0,
    badge: "Etapa 9 de 11 · O que acontece no seu corpo",
    text: "Veja o que acontece com seus hormônios ao longo da vida",
    sub: "É a queda e oscilação do estradiol que explica tudo que você sente.",
    options: [
      { icon: "😮", text: "Agora faz sentido! Entendo melhor o que está acontecendo", score: 0, tag: null },
      { icon: "🤔", text: "Já suspeitava de algo assim, mas quero entender mais", score: 0, tag: null },
    ],
  },
  {
    id: "e10",
    type: "multi",
    scoreWeight: 0,
    badge: "Etapa 10 de 11 · O que você mais quer",
    text: "Se essa fase estivesse equilibrada, o que você mais gostaria de sentir?",
    sub: "Pode marcar mais de uma opção.",
    options: [
      { icon: "💤", text: "Dormir a noite inteira e acordar com energia", score: 0, tag: "Sono restaurador" },
      { icon: "🌿", text: "Ter disposição e clareza mental durante o dia", score: 0, tag: "Energia e foco" },
      { icon: "😊", text: "Me sentir bem e reconhecer a mulher que sou", score: 0, tag: "Autoestima" },
      { icon: "🔥", text: "Não sofrer mais com calores e desconfortos físicos", score: 0, tag: "Alívio físico" },
      { icon: "💕", text: "Ter de volta a minha libido", score: 0, tag: "Libido" },
    ],
  },
  {
    id: "e11",
    type: "single",
    scoreWeight: 0,
    badge: "Etapa 11 de 11 · Reflexão final",
    text: "O que te impediu de buscar ajuda antes sobre isso?",
    sub: null,
    options: [
      { icon: "✨", text: "Achei que era normal da idade", score: 2, tag: null },
      { icon: "😶", text: "Ninguém levava meus sintomas a sério", score: 1, tag: null },
      { icon: "🤷‍♀️", text: "Não sabia que tinha nome ou tratamento", score: 1, tag: null },
    ],
  },
]

const testimonials = [
  { text: "Antes tinha crises de calor tão fortes que acordava encharcada de suor 3 vezes por noite. Achei que era só eu. Hoje durmo tranquila e acordo inteira.", author: "Seguidora · 47 anos · Via Instagram" },
  { text: "Passei 2 anos acordando às 3h da manhã sem voltar a dormir. Achei que era ansiedade. Era a perimenopausa. Hoje durmo 7 horas seguidas pela primeira vez em anos.", author: "Seguidora · 51 anos · Via Instagram" },
  { text: "Comecei a esquecer nomes, perder documentos, me perder no meio de uma frase. Achei que era princípio de Alzheimer. Era minha cabeça pedindo ajuda pra entender a perimenopausa.", author: "Seguidora · 44 anos · Via Instagram" },
]

// ═══════════════════════════════════════════════
// HELPER: PRIMEIRO NOME
// ═══════════════════════════════════════════════
function primeiroNome(nomeCompleto: string | null | undefined): string {
    if (!nomeCompleto) return "Você"
    const primeiro = nomeCompleto.trim().split(" ")[0]
    if (!primeiro) return "Você"
    return primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase()
  }

  // ═══════════════════════════════════════════════
  // HELPER: MAPEAMENTO CENTRALIZADO DE SINTOMAS
  // ═══════════════════════════════════════════════
  const MAPA_SINTOMAS_E2: Record<number, string | null> = {
    0: "fogachos",
    1: "irritabilidade", 
    2: "insônia",
    3: "névoa mental",
    4: "cansaço",
    5: null // "Nenhum ou poucos sintomas"
  }

  const MAPA_SINTOMAS_E8: Record<number, string | null> = {
    0: "sono irregular",
    1: "insônia",
    2: "exaustão",
    3: "dificuldade para dormir",
    4: null // "Consigo dormir bem"
  }

  function getSintomasCurto(respostas: Record<string, number[]>): {
    badges: string[]
    texto: string
    topDois: string
    temSintomas: boolean
  } {
    const sintomasE2 = (respostas["e2"] || [])
      .map(idx => MAPA_SINTOMAS_E2[idx])
      .filter((s): s is string => s !== null)

    const sintomasE8 = (respostas["e8"] || [])
      .map(idx => MAPA_SINTOMAS_E8[idx])
      .filter((s): s is string => s !== null)

    // Remove duplicatas (insônia pode vir de ambos)
    const todos = [...new Set([...sintomasE2, ...sintomasE8])]
    
    // Prioridade: fogachos > insônia > névoa mental > cansaço > outros
    const prioridade = ["fogachos", "insônia", "névoa mental", "cansaço", "irritabilidade", "exaustão", "sono irregular", "dificuldade para dormir"]
    const ordenados = todos.sort((a, b) => {
      const ia = prioridade.indexOf(a)
      const ib = prioridade.indexOf(b)
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
    })

    // Gera texto
    let texto = ""
    if (ordenados.length === 1) {
      texto = ordenados[0]
    } else if (ordenados.length === 2) {
      texto = `${ordenados[0]} e ${ordenados[1]}`
    } else if (ordenados.length >= 3) {
      texto = `${ordenados[0]}, ${ordenados[1]} e ${ordenados[2]}`
    }

    // Top 2 para frases curtas
    const topDois = ordenados.length >= 2 
      ? `${ordenados[0]} e ${ordenados[1]}` 
      : ordenados[0] || "os sinais que seu corpo esta mostrando"

    return {
      badges: ordenados,
      texto,
      topDois,
      temSintomas: ordenados.length > 0
    }
  }

  // Determina fase hormonal baseada em idade + respostas do quiz
  type FaseHormonal = "pre-menopausa" | "perimenopausa" | "menopausa" | "pos-menopausa"
  
  function determinarFase(ageRange: string | null, respostas: Record<string, number[]>): FaseHormonal {
    const q4Answer = respostas["e4"]?.[0] // Fase declarada
    const q6Answer = respostas["e6"]?.[0] // Cronologia/tempo
    
    // Prioridade 1: declaracao direta de menopausa na Q4
    // Q4 opcao 2 = "Acho que ja entrei na menopausa"
    if (q4Answer === 2) {
      if (ageRange === "56+") return "pos-menopausa"
      return "menopausa"
    }
    
    // Prioridade 2: usar idade como ancora principal
    if (ageRange === "ate-35") {
      // Q4 opcao 1 = "Acho que estou na perimenopausa"
      if (q4Answer === 1) return "perimenopausa"
      return "pre-menopausa"
    }
    
    if (ageRange === "56+") {
      return "pos-menopausa"
    }
    
    // Faixas 36-45 e 46-55 = perimenopausa
    return "perimenopausa"
  }

  const FASES_INFO: Record<FaseHormonal, { emoji: string; nome: string; idade: string; titulo: string; descricao: string }> = {
    "pre-menopausa": {
      emoji: "🌿",
      nome: "Pré",
      idade: "até 35",
      titulo: "Pré-menopausa",
      descricao: "Seus sinais sugerem que você ainda pode estar vivendo o período da PRÉ-MENOPAUSA, com hormônios em equilíbrio. Mas seu corpo pode estar mostrando os primeiros sinais de mudança. Entender isso agora te coloca anos à frente da maioria das mulheres."
    },
    "perimenopausa": {
      emoji: "🔥",
      nome: "Peri",
      idade: "36 a 55",
      titulo: "Perimenopausa",
      descricao: "Baseado nas suas respostas, seus sinais são compatíveis com a fase da PERIMENOPAUSA. É o período em que os hormônios começam a oscilar, mas a maioria das mulheres não sabe que é isso. Sem entendimento, essa fase pode durar de 4 a 10 anos com sintomas se intensificando."
    },
    "menopausa": {
      emoji: "🌙",
      nome: "Meno",
      idade: "~51",
      titulo: "Menopausa",
      descricao: "Seus sinais são compatíveis com a fase da MENOPAUSA, período em que os hormônios estão em um novo equilíbrio. Com o suporte certo, é possível viver essa fase com qualidade, energia e bem-estar."
    },
    "pos-menopausa": {
      emoji: "⚪",
      nome: "Pós",
      idade: "56+",
      titulo: "Pós-menopausa",
      descricao: "Seus sinais são compatíveis com a fase da PÓS-MENOPAUSA. Agora o foco é manutenção da saúde, prevenção e qualidade de vida nos próximos anos."
    }
  }

  // Calcula intensidade dos sinais com formula melhorada
  function calcularIntensidade(respostas: Record<string, number[]>): number {
    const sintomasE2 = (respostas["e2"] || []).filter(idx => idx !== 5) // exclui "Nenhum ou poucos"
    const sintomasE8 = (respostas["e8"] || []).filter(idx => idx !== 4) // exclui "Consigo dormir bem"
    
    const totalSintomas = sintomasE2.length + sintomasE8.length
    
    // Cronologia (e3)
    const cronologia = respostas["e3"]?.[0] ?? 0
    let multiplicador = 1.0
    if (cronologia === 2) multiplicador = 1.4 // "Varios anos"
    else if (cronologia === 1) multiplicador = 1.2 // "Mais de 1 ano"
    // cronologia === 0 ou 3 = "Ultimos meses" ou "Nao sei" = 1.0
    
    // Base: cada sintoma vale ~12 pontos, max 8 sintomas possiveis
    const pontuacaoBase = Math.min(totalSintomas * 12, 96)
    const pontuacaoFinal = Math.round(pontuacaoBase * multiplicador)
    
    // Normaliza para 0-100, minimo 15% se tem algum sintoma
    if (totalSintomas === 0) return 15
    return Math.min(100, Math.max(25, pontuacaoFinal))
  }

// ═══════════════════════════════════════════════
// COUNTDOWN COMPONENT
// ═══════════════════════════════════════════════
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false })

  useEffect(() => {
    const targetDate = new Date("2026-04-25T09:00:00-03:00").getTime()

    const updateCountdown = () => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isLive: false,
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  if (timeLeft.isLive) {
    return (
      <p className="text-2xl font-bold text-white">AO VIVO AGORA</p>
    )
  }

  return (
    <p className="text-2xl font-bold text-white">
      {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
    </p>
  )
}

// ═══════════════════════════════════════════════
// MENOPAUSE STAGES CHART COMPONENT
// ═══════════════════════════════════════════════
function MenopauseStagesChart() {
  return (
    <div className="my-4">
      <div className="my-6">
        <svg
          viewBox="0 0 1020 640"
          xmlns="http://www.w3.org/2000/svg"
          style={{width: "100%", height: "auto", display: "block"}}
          role="img"
          aria-label="Estágios da Menopausa: Pré-menopausa, Perimenopausa, Menopausa e Pós-menopausa"
        >
          <defs>
            <linearGradient id="preGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDF2F6" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#FDF2F6" stopOpacity="0.4"/>
            </linearGradient>
            <linearGradient id="periGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EF709D" stopOpacity="0.35"/>
              <stop offset="100%" stopColor="#EF709D" stopOpacity="0.7"/>
            </linearGradient>
            <linearGradient id="menoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDF2F6" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="#FDF2F6" stopOpacity="0.3"/>
            </linearGradient>
            <linearGradient id="posGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F9E5EE" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="#F9E5EE" stopOpacity="0.25"/>
            </linearGradient>
            <linearGradient id="curvaFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EF709D" stopOpacity="0.75"/>
              <stop offset="60%" stopColor="#C2185B" stopOpacity="0.85"/>
              <stop offset="100%" stopColor="#710C60" stopOpacity="0.6"/>
            </linearGradient>
            <linearGradient id="curvaLinha" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF709D"/>
              <stop offset="40%" stopColor="#C2185B"/>
              <stop offset="100%" stopColor="#710C60"/>
            </linearGradient>
            <marker id="arrowRight" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
              <polygon points="0 0, 12 6, 0 12" fill="#710C60"/>
            </marker>
            <marker id="arrowLeft" markerWidth="10" markerHeight="10" refX="2" refY="5" orient="auto">
              <polygon points="10 0, 0 5, 10 10" fill="#4A0840"/>
            </marker>
            <marker id="arrowRightSmall" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <polygon points="0 0, 10 5, 0 10" fill="#4A0840"/>
            </marker>
          </defs>

          {/* Título */}
          <text x="80" y="42" fontFamily="sans-serif" fontSize="26" fontWeight="800" fill="#710C60" letterSpacing="0.5">
            ESTÁGIOS DA MENOPAUSA
          </text>

          {/* Fundos das zonas */}
          <rect x="80" y="170" width="260" height="330" fill="url(#preGradient)"/>
          <rect x="340" y="170" width="300" height="330" fill="url(#periGradient)"/>
          <rect x="640" y="170" width="120" height="330" fill="url(#menoGradient)"/>
          <rect x="760" y="170" width="200" height="330" fill="url(#posGradient)"/>

          {/* Arrows superiores */}
          <line x1="90" y1="110" x2="330" y2="110" stroke="#4A0840" strokeWidth="1.5" markerStart="url(#arrowLeft)" markerEnd="url(#arrowRightSmall)"/>
          <text x="90" y="98" fontFamily="sans-serif" fontSize="17" fill="#1F2937" fontWeight="500">
            Vida Produtiva Normal
          </text>
          <line x1="650" y1="110" x2="950" y2="110" stroke="#4A0840" strokeWidth="1.5" markerStart="url(#arrowLeft)" markerEnd="url(#arrowRightSmall)"/>
          <text x="650" y="98" fontFamily="sans-serif" fontSize="17" fill="#1F2937" fontWeight="500">
            Fim Permanente da Menstruação
          </text>

          {/* Pills das fases */}
          <rect x="130" y="145" width="160" height="30" rx="15" fill="#F9C6D9" fillOpacity="0.6"/>
          <text x="210" y="165" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill="#710C60" textAnchor="middle" letterSpacing="1">
            PRÉ-MENOPAUSA
          </text>
          <rect x="390" y="143" width="200" height="34" rx="17" fill="#DC2626" fillOpacity="0.2"/>
          <text x="490" y="167" fontFamily="sans-serif" fontSize="18" fontWeight="800" fill="#DC2626" textAnchor="middle" letterSpacing="1">
            PERIMENOPAUSA
          </text>
          <rect x="645" y="145" width="110" height="30" rx="15" fill="#F9C6D9" fillOpacity="0.5"/>
          <text x="700" y="165" fontFamily="sans-serif" fontSize="13" fontWeight="700" fill="#710C60" textAnchor="middle" letterSpacing="1">
            MENOPAUSA
          </text>
          <rect x="780" y="145" width="160" height="30" rx="15" fill="#F9E5EE" fillOpacity="0.8"/>
          <text x="860" y="165" fontFamily="sans-serif" fontSize="13" fontWeight="700" fill="#710C60" textAnchor="middle" letterSpacing="1">
            PÓS MENOPAUSA
          </text>

          {/* Marcadores de transição */}
          <g transform="translate(340, 210)">
            <path d="M -65 0 L 65 0 L 65 30 L 10 30 L 0 42 L -10 30 L -65 30 Z" fill="#F9C6D9" fillOpacity="0.85" stroke="#C2185B" strokeWidth="0.5"/>
            <text x="0" y="14" fontFamily="sans-serif" fontSize="11" fill="#4A0840" textAnchor="middle" fontWeight="600">
              Última Menstruação
            </text>
            <text x="0" y="27" fontFamily="sans-serif" fontSize="11" fill="#4A0840" textAnchor="middle" fontWeight="600">
              Regular
            </text>
          </g>
          <g transform="translate(640, 210)">
            <path d="M -55 0 L 55 0 L 55 30 L 10 30 L 0 42 L -10 30 L -55 30 Z" fill="#F9C6D9" fillOpacity="0.85" stroke="#C2185B" strokeWidth="0.5"/>
            <text x="0" y="14" fontFamily="sans-serif" fontSize="11" fill="#4A0840" textAnchor="middle" fontWeight="600">
              Última
            </text>
            <text x="0" y="27" fontFamily="sans-serif" fontSize="11" fill="#4A0840" textAnchor="middle" fontWeight="600">
              Menstruação
            </text>
          </g>

          {/* Linhas verticais tracejadas */}
          <line x1="340" y1="252" x2="340" y2="560" stroke="#C2185B" strokeWidth="1.2" strokeDasharray="5,4" strokeOpacity="0.6"/>
          <line x1="640" y1="252" x2="640" y2="560" stroke="#C2185B" strokeWidth="1.2" strokeDasharray="5,4" strokeOpacity="0.6"/>
          <line x1="760" y1="170" x2="760" y2="560" stroke="#C2185B" strokeWidth="1.2" strokeDasharray="5,4" strokeOpacity="0.4"/>

          {/* Curva dos hormônios: área */}
          <path d="M 80 220 L 150 220 L 210 225 L 270 235 L 310 248 L 340 270 L 350 290 L 365 275 L 380 300 L 395 285 L 410 315 L 425 298 L 440 330 L 455 312 L 470 350 L 485 330 L 500 365 L 515 345 L 530 380 L 545 365 L 560 395 L 575 380 L 590 410 L 605 400 L 620 420 L 640 430 L 760 445 L 780 455 L 960 460 L 960 500 L 80 500 Z" fill="url(#curvaFill)"/>

          {/* Curva dos hormônios: linha */}
          <path d="M 80 220 L 150 220 L 210 225 L 270 235 L 310 248 L 340 270 L 350 290 L 365 275 L 380 300 L 395 285 L 410 315 L 425 298 L 440 330 L 455 312 L 470 350 L 485 330 L 500 365 L 515 345 L 530 380 L 545 365 L 560 395 L 575 380 L 590 410 L 605 400 L 620 420 L 640 430 L 760 445 L 780 455 L 960 460" fill="none" stroke="url(#curvaLinha)" strokeWidth="2.5" strokeLinejoin="round"/>

          {/* Eixo Y */}
          <line x1="80" y1="170" x2="80" y2="520" stroke="#4A0840" strokeWidth="2.5"/>
          <text transform="translate(45, 500) rotate(-90)" fontFamily="sans-serif" fontSize="16" fontWeight="800" fill="#4A0840" letterSpacing="1">
            NÍVEIS ESTROGÊNIO
          </text>

          {/* Eixo X */}
          <line x1="78" y1="520" x2="980" y2="520" stroke="#4A0840" strokeWidth="2.5" markerEnd="url(#arrowRight)"/>
          <text x="965" y="555" fontFamily="sans-serif" fontSize="17" fontWeight="800" fill="#710C60" textAnchor="end">
            Idade
          </text>

          {/* Marcadores do eixo X */}
          <text x="80" y="560" fontFamily="sans-serif" fontSize="24" fontWeight="800" fill="#710C60" textAnchor="middle">0</text>
          <text x="340" y="560" fontFamily="sans-serif" fontSize="28" fontWeight="900" fill="#DC2626" textAnchor="middle">35-45</text>
          <text x="640" y="560" fontFamily="sans-serif" fontSize="28" fontWeight="900" fill="#DC2626" textAnchor="middle">~51</text>

          {/* Legenda inferior */}
          <text x="510" y="605" fontFamily="sans-serif" fontSize="14" fill="#6B7280" textAnchor="middle" fontStyle="italic">
            Representação ilustrativa · Níveis de estrogênio ao longo da vida
          </text>
        </svg>

        {/* Separador sutil */}
        <div className="border-t border-[#e8dde6] my-5"></div>

        {/* Secao Dado OMS */}
        <div className="px-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📊</span>
            <p className="text-[11px] text-[#6b5570] uppercase tracking-wide font-bold">Dado epidemiológico · OMS</p>
          </div>
          <p className="text-[15px] text-[#2A1F30] leading-relaxed mb-2">
            "<span className="text-[17px] font-bold text-[#DC2626]">85%</span> das mulheres entre 40 e 60 anos têm pelo menos 1 sintoma relacionado à transição menopausal."
          </p>
          <p className="text-[13px] text-[#710C60] font-medium">
            who.int/news-room/fact-sheets/detail/menopause
          </p>
        </div>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-4">
        <p className="text-sm font-bold text-red-800 mb-1 flex items-center gap-2">
          <span className="text-red-600">&#x2B55;</span>
          Falta de equilíbrio hormonal
        </p>
        <p className="text-sm text-gray-800 leading-relaxed">
          Sem entender o que está acontecendo, os sintomas podem se intensificar e durar anos. Afetam seu sono, sua energia, seu humor e sua saúde íntima.
        </p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════
function QuizPageContent() {
  const [screen, setScreen] = useState<"intro" | "quiz" | "science" | "loading" | "gate" | "result">("intro")
  const [cur, setCur] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [ageRange, setAgeRange] = useState<string | null>(null)
  const [loadingSteps, setLoadingSteps] = useState<number[]>([])
  const [totalScore, setTotalScore] = useState(0)
  const [symTags, setSymTags] = useState<string[]>([])
  const [scoreAnimated, setScoreAnimated] = useState(false)
  const [showInsight, setShowInsight] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  
  const searchParams = useSearchParams()

  // ═══════════════════════════════════════════════
  // TRACKING FUNCTIONS (fire and forget)
  // ═══════════════════════════════��═���═════��������═════
  const trackSessionStart = useCallback(async () => {
    try {
      const device = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop"
      const res = await fetch("/api/track/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utm_source: searchParams.get("utm_source"),
          utm_medium: searchParams.get("utm_medium"),
          utm_campaign: searchParams.get("utm_campaign"),
          utm_content: searchParams.get("utm_content"),
          device,
          user_agent: navigator.userAgent,
        }),
      })
      const data = await res.json()
      if (data.sessionId) {
        setSessionId(data.sessionId)
        localStorage.setItem("quiz_session_id", data.sessionId)
      }
      return data.sessionId
    } catch (e) {
      console.error("[tracking] session start error:", e)
      return null
    }
  }, [searchParams])

  const trackAnswer = useCallback(async (questionId: string, questionOrder: number, answer: number[]) => {
    const sid = sessionId || localStorage.getItem("quiz_session_id")
    if (!sid) return
    try {
      await fetch("/api/track/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, questionId, questionOrder, answer }),
      })
    } catch (e) {
      console.error("[tracking] answer error:", e)
    }
  }, [sessionId])

const trackLead = useCallback(async (leadEmail: string, leadName: string, leadAgeRange: string | null) => {
  const sid = sessionId || localStorage.getItem("quiz_session_id")
  if (!sid) return
  try {
  await fetch("/api/track/lead", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sessionId: sid, email: leadEmail, firstName: leadName, whatsapp: null, ageRange: leadAgeRange }),
  })
  } catch (e) {
      console.error("[tracking] lead error:", e)
    }
  }, [sessionId])

  const trackComplete = useCallback(async (resultPhase: string) => {
    const sid = sessionId || localStorage.getItem("quiz_session_id")
    if (!sid) return
    try {
      await fetch("/api/track/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, resultPhase }),
      })
    } catch (e) {
      console.error("[tracking] complete error:", e)
    }
  }, [sessionId])

  const trackCheckout = useCallback(async () => {
    const sid = sessionId || localStorage.getItem("quiz_session_id")
    if (!sid) return
    try {
      await fetch("/api/track/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      })
    } catch (e) {
      console.error("[tracking] checkout error:", e)
    }
  }, [sessionId])

  const trackProgress = useCallback(async (questionOrder: number) => {
    const sid = sessionId || localStorage.getItem("quiz_session_id")
    if (!sid) return
    try {
      await fetch("/api/track/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, questionOrder }),
      })
    } catch (e) {
      console.error("[tracking] progress error:", e)
    }
  }, [sessionId])

  // Track progress when question changes (fire and forget)
  useEffect(() => {
    if (screen === "quiz" && cur >= 0) {
      trackProgress(cur + 1)
    }
  }, [screen, cur, trackProgress])

  const step = steps[cur]
  const sel = answers[step?.id] || []
  const isMulti = step?.type === "multi"
  const pct = (cur / steps.length) * 100

async function startQuiz() {
    // Track session start
    await trackSessionStart()
    // Meta Pixel: InitiateCheckout
    pixelInitiateCheckout()
    setScreen("quiz")
    setCur(0)
    setShowInsight(false)
  }

  function selectOpt(idx: number) {
    const stepId = step.id
    const currentSel = answers[stepId] || []

    if (isMulti) {
      const pos = currentSel.indexOf(idx)
      let newSel: number[]

      // Verifica se a opcao clicada e a exclusiva (definida em exclusiveOption)
      const exclusiveIdx = step.exclusiveOption
      const isExclusiveOption = exclusiveIdx !== undefined && idx === exclusiveIdx

      if (pos === -1) {
        if (isExclusiveOption) {
          // Se clicou na opcao exclusiva, desmarca todas as outras
          newSel = [idx]
        } else {
          // Remove a opcao exclusiva se estava selecionada
          newSel = exclusiveIdx !== undefined 
            ? currentSel.filter((i) => i !== exclusiveIdx)
            : [...currentSel]
          newSel.push(idx)
        }
      } else {
        newSel = currentSel.filter((i) => i !== idx)
      }

      setAnswers({ ...answers, [stepId]: newSel })
      // Track answer (fire and forget)
      trackAnswer(stepId, cur + 1, newSel)
      // Meta Pixel: QuizAnswer
      pixelQuizAnswer(stepId, cur + 1)
    } else {
setAnswers({ ...answers, [stepId]: [idx] })
      // Track answer (fire and forget)
      trackAnswer(stepId, cur + 1, [idx])
      // Meta Pixel: QuizAnswer
      pixelQuizAnswer(stepId, cur + 1)
      // Para insight_single, mostra o insight apos selecao
      if (step.type === "insight_single") {
        setShowInsight(true)
      }
      // Single e chart_single agora exigem clicar em Continuar (sem auto-advance)
    }
  }

function nextStep() {
    if (sel.length === 0) return
    
    // Apos Etapa 4 (cur === 3, insight educativo), vai para tela de ciencia
    if (cur === 3) {
      setScreen("science")
      setShowInsight(false)
      return
    }
    
    if (cur < steps.length - 1) {
      setCur(cur + 1)
      setShowInsight(false)
    } else {
      showLoading()
    }
  }
  
  // Avanca da tela de ciencia para Etapa 5 (onde voce esta)
  function continueFromScience() {
    setScreen("quiz")
    setCur(4) // Etapa 5 - onde voce esta
  }
  
  // Volta da tela de ciencia para Etapa 4 (insight)
  function backToStep3() {
    setScreen("quiz")
    setCur(3) // Etapa 4 - insight
    setShowInsight(true) // Mostra insight novamente
  }
  
  function prevStep() {
    if (cur > 0) {
      setCur(cur - 1)
      setShowInsight(false)
    }
  }

  function showLoading() {
    setScreen("loading")
    setLoadingSteps([])

    const ids = [0, 1, 2, 3]
    ids.forEach((id, i) => {
      setTimeout(() => {
        setLoadingSteps((prev) => [...prev, id])
      }, 600 + i * 700)
    })

    setTimeout(() => {
      calcScore()
      setScreen("gate")
    }, 600 + 4 * 700 + 400)
  }

  function calcScore() {
    let score = 0
    const tags: string[] = []

    steps.forEach((s) => {
      const selected = answers[s.id] || []
      selected.forEach((idx) => {
const opt = s.options[idx]
        if (s.scoreWeight !== 0) score += opt.score * s.scoreWeight
        // Coleta tags de sintomas de e2 (sintomas gerais) e e8 (sono)
        if (opt.tag && (s.id === "e2" || s.id === "e8")) {
          tags.push(opt.tag)
        }
      })
    })

    setTotalScore(score)
    setSymTags(tags)
  }

function unlockResult() {
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!name.trim()) {
  alert("Por favor, informe seu nome")
  return
  }
  if (!email.trim() || !emailRe.test(email)) {
  alert("Por favor, informe um e-mail válido.")
  return
  }
  if (!ageRange) {
  alert("Por favor, selecione sua faixa de idade")
  return
  }
  
  // Track lead capture (fire and forget)
  trackLead(email, name, ageRange)
    // Meta Pixel: Lead
    pixelLead()

    // Determine result phase for tracking
    const phase = totalScore <= 8 ? "fase_inicial" : totalScore <= 20 ? "alerta_hormonal" : "acao_urgente"
    trackComplete(phase)
    // Meta Pixel: CompleteRegistration
    pixelCompleteRegistration(phase)

    setScreen("result")
    setScoreAnimated(false)
    setTimeout(() => setScoreAnimated(true), 150)
  }

  function restartQuiz() {
    setCur(0)
    setAnswers({})
    setTotalScore(0)
setSymTags([])
setName("")
  setEmail("")
  setAgeRange(null)
  setLoadingSteps([])
    setScoreAnimated(false)
    setShowInsight(false)
    setFaqOpen(null)
    setScreen("intro")
  }

  // Usa funcao helper centralizada para sintomas
  const sintomasInfo = getSintomasCurto(answers)
  const symptomText = sintomasInfo.texto
  const symptomTopDois = sintomasInfo.topDois
  const symptomBadges = sintomasInfo.badges
  const temSintomas = sintomasInfo.temSintomas

  // Calcula intensidade com formula melhorada
  const scorePct = calcularIntensidade(answers)

  let profile: {
    emoji: string
    badgeClass: string
    badgeText: string
    title: string
    sub: string
    fillClass: string
    ctaTitle: string
    ctaText: string
    ctaBtn: string
    testis: number[]
  }

  if (totalScore <= 8) {
    profile = {
      emoji: "🟡",
      badgeClass: "bg-[#fff8e6] text-[#a06800] border-2 border-[#f5cc4a]",
      badgeText: "🟡 Fase Inicial · Fique de Olho",
      title: `${primeiroNome(name)}, seus sintomas merecem atenção`,
      sub: "Você relatou poucos sinais no momento, mas isso não significa que está fora da zona de transição hormonal. A perimenopausa pode ser silenciosa no início e quanto mais cedo você entender o que está acontecendo, mais fácil é agir.",
      fillClass: "from-[#f5cc4a] to-[#f0a010]",
      ctaTitle: "Entenda agora antes que os sintomas se intensifiquem",
      ctaText: "Na aula ao vivo, a Dra. Su vai te mostrar como identificar a fase que você está vivendo, mesmo que seus exames estejam \"normais\" e seus sintomas ainda sejam leves.",
      ctaBtn: "Quero entender meu corpo agora",
      testis: [0, 1, 2],
    }
  } else if (totalScore <= 20) {
    profile = {
      emoji: "🟠",
      badgeClass: "bg-[#fff1eb] text-[#b04010] border-2 border-[#f5a070]",
      badgeText: "🟠 Alerta Hormonal · Padrão Identificado",
      title: `${primeiroNome(name)}, seu corpo está pedindo atenção`,
      sub: "Seus sintomas formam um padrão consistente com a transição hormonal da perimenopausa. O que você sente tem explicação científica e tem solução. Continuar ignorando prolonga desnecessariamente o sofrimento.",
      fillClass: "from-[#EF709D] to-[#e07030]",
      ctaTitle: "Seus sintomas têm nome, causa e solução",
      ctaText: "A Dra. Su vai te explicar de forma clara e direta o que está acontecendo no seu corpo e o que fazer a partir de agora, sem achismo, sem julgamento.",
      ctaBtn: "Garantir minha vaga agora",
      testis: [0, 1, 2],
    }
  } else {
    profile = {
      emoji: "🔴",
      badgeClass: "bg-[#fdf0f0] text-[#a01818] border-2 border-[#f59090]",
      badgeText: "🔴 Ação Urgente · Não Ignore Mais",
      title: `${primeiroNome(name)}, chegou a hora de agir`,
      sub: "Você relatou um conjunto expressivo de sintomas que impactam diretamente sua qualidade de vida. O que você sente não é frescura, não é fraqueza e definitivamente não é \"normal da idade\". Existe explicação. Existe tratamento. E você merece se sentir bem.",
      fillClass: "from-[#EF709D] to-[#CA3716]",
      ctaTitle: "Você não pode continuar sem entender o que está acontecendo",
      ctaText: "Essa aula foi feita para mulheres exatamente como você, que estão sentindo tudo isso e não receberam resposta. A Dra. Su vai mudar isso.",
      ctaBtn: "Garantir minha vaga · R$29,90",
      testis: [0, 1, 2],
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4a0840] via-[#710C60] to-[#8B1A6B] flex flex-col items-center px-4 py-4 pb-10 font-sans">
      <div className="bg-white rounded-3xl max-w-[600px] w-full mt-3 shadow-[0_24px_70px_rgba(0,0,0,0.28)] overflow-hidden relative">
        <div className="h-[5px] bg-gradient-to-r from-[#EF709D] via-[#A73979] to-[#CA3716]" />

        <div className="p-7 pb-9 max-sm:p-5 max-sm:pb-7">
          {/* ══════ INTRO ══════ */}
          {screen === "intro" && (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-[#EF709D] shadow-lg">
                <Image
                  src="/images/dra-su.webp"
                  alt="Dra. Su"
                  width={96}
                  height={96}
                  priority
                  quality={75}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <h1 className="font-serif text-2xl max-sm:text-[22px] text-[#710C60] leading-tight mb-3">
                Seu corpo mudou por causa da menopausa.
                <br />
                <span className="text-[#A73979]">E ninguém te preparou pra isso.</span>
              </h1>
              <p className="text-[15px] text-[#6b5570] leading-relaxed mb-4">
                Responda algumas perguntas e descubra em qual fase hormonal você está.
                <br />
                E o que fazer agora.
              </p>

              {/* Contexto de tempo e progresso */}
              <div className="flex justify-center gap-2 flex-wrap mb-5">
                <span className="inline-flex items-center gap-1.5 bg-[#fdf2f6] border border-[#f8c4d8] text-[#A73979] py-1.5 px-3 rounded-full text-[12px] font-medium">3 minutos</span>
                <span className="inline-flex items-center gap-1.5 bg-[#fdf2f6] border border-[#f8c4d8] text-[#A73979] py-1.5 px-3 rounded-full text-[12px] font-medium">Resultado personalizado</span>
              </div>

              <div className="flex justify-center gap-4 flex-wrap mb-5">
                <span className="text-[13px] text-[#6b5570] flex items-center gap-1.5">🔒 100% privado</span>
                <span className="text-[13px] text-[#6b5570] flex items-center gap-1.5">📊 Baseado em ciência</span>
              </div>
              <button
                onClick={startQuiz}
                className="w-full py-4 rounded-full text-base font-bold text-white bg-gradient-to-br from-[#EF709D] to-[#A73979] shadow-[0_6px_20px_rgba(239,112,157,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(239,112,157,0.45)]"
              >
                Quero descobrir minha fase →
              </button>
              <div className="bg-[#FAF3ED] rounded-xl p-3 px-4 text-[12px] text-[#6b5570] leading-normal mt-5 text-left">
                ⚕️ <strong>Importante:</strong> Este quiz é informativo e educacional. Não substitui consulta médica nem constitui diagnóstico. Os resultados indicam áreas que merecem atenção profissional.
              </div>
            </div>
          )}

          {/* ══════ QUIZ ══════ */}
          {screen === "quiz" && step && (
            <div>
              <div className="mb-5">
                <div className="bg-[#fdf2f6] rounded-lg h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#EF709D] to-[#A73979] rounded-lg transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="font-serif text-[22px] max-sm:text-[19px] text-[#710C60] leading-snug mb-2">{step.text}</div>
              {step.sub && <div className="text-[14px] text-[#6b5570] mb-5 leading-relaxed italic">{step.sub}</div>}

              {/* Grafico dinamico de equilibrio hormonal para etapa 9 */}
              {step.type === "chart_single" && (
                <MenopauseStagesChart />
              )}

              <div className="flex flex-col gap-3">
                {step.options.map((o, i) => {
                  const isSel = sel.includes(i)
                  // Para etapa 8, ultima opcao (exclusiva) tem separador
                  const isLastNoneOption = step.id === "e8" && i === step.options.length - 1

                  return (
                    <div key={i}>
                      {isLastNoneOption && <div className="border-t border-[#e8dde6] my-2" />}
                      <button
                        onClick={() => selectOpt(i)}
                        className={`flex items-center gap-3 p-4 max-sm:p-3.5 border-2 rounded-xl text-[15px] max-sm:text-[14px] text-left transition-all w-full font-sans leading-snug active:scale-[0.98] ${
                          isSel
                            ? "border-[#A73979] bg-gradient-to-br from-[#fdf2f6] to-[#f0e6f5] font-semibold text-[#710C60]"
                            : "border-[#e8dde6] bg-white text-[#3d2b3a]"
                        }`}
                      >
                        <span className="text-[22px] shrink-0 w-9 text-center">{o.icon}</span>
                        <span>{o.text}</span>
                        <span
                          className={`ml-auto w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center text-[11px] transition-all ${
                            isSel ? "bg-[#A73979] border-[#A73979] text-white" : "border-[#e8dde6] text-transparent"
                          }`}
                        >
                          ✓
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Insight aparece ABAIXO das opcoes apos selecao */}
              {step.type === "insight_single" && step.insight && showInsight && (
                <div className="bg-gradient-to-br from-[#710C60] to-[#4a0840] rounded-2xl p-5 text-white text-[15px] leading-relaxed mt-5 animate-fade-in">
                  {step.insight.split('\n\n').map((paragraph, i) => (
                    <p key={i} className={i > 0 ? "mt-4" : ""}>
                      {paragraph.includes('PERIMENOPAUSA') ? (
                        <>
                          {paragraph.split('PERIMENOPAUSA')[0]}
                          <strong className="text-[#EF709D]">PERIMENOPAUSA</strong>
                          {paragraph.split('PERIMENOPAUSA')[1]}
                        </>
                      ) : paragraph}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-6 gap-2.5">
                <button
                  onClick={prevStep}
                  className={`bg-transparent border-2 border-[#e8dde6] text-[#6b5570] py-3.5 px-5 rounded-full text-[14px] font-semibold transition-all hover:border-[#EF709D] hover:text-[#710C60] shrink-0 ${
                    cur === 0 ? "invisible" : ""
                  }`}
                >
                  ← Voltar
                </button>
                <div className="flex-1">
                  <button
                    onClick={nextStep}
                    disabled={sel.length === 0}
                    className="w-full py-4 rounded-full text-base font-bold text-white bg-gradient-to-br from-[#EF709D] to-[#A73979] shadow-[0_6px_20px_rgba(239,112,157,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(239,112,157,0.45)] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {cur === steps.length - 1 ? "Ver resultado →" : "Continuar →"}
                  </button>
                </div>
              </div>
            </div>
)}

              {/* ══════ SCIENCE (tela informativa apos Etapa 3) ══════ */}
              {screen === "science" && (
                <div>
                  <h2 className="font-serif text-[22px] text-[#710C60] leading-tight mb-2 text-center">
                    O que as fontes científicas confirmam
                  </h2>
                  <p className="text-[14px] text-[#6b5570] mb-6 text-center">
                    A perimenopausa não é opinião. É realidade médica reconhecida.
                  </p>

                  <div className="space-y-4">
                    {/* Card MSD Manuals */}
                    <div className="bg-[#fdf8f4] border border-[#f0e0eb] rounded-xl p-4">
                      <div className="mb-2">
                        <p className="text-[11px] text-[#6b5570]">Fonte científica</p>
                        <p className="text-[14px] font-bold text-[#710C60]">MSD Manuals</p>
                      </div>
                      <p className="text-[14px] text-[#2A1F30] leading-relaxed italic mb-2">
                        "A perimenopausa é a fase de transição para a menopausa e costuma durar vários anos; em geral, inclui cerca de 4 a 8 anos até o período menstrual final."
                      </p>
                      <p className="text-[12px] text-[#EF709D]">
                        msdmanuals.com/pt/profissional/ginecologia-e-obstetricia/menopausa
                      </p>
                    </div>

                    {/* Card Mayo Clinic */}
                    <div className="bg-[#fdf8f4] border border-[#f0e0eb] rounded-xl p-4">
                      <div className="mb-2">
                        <p className="text-[11px] text-[#6b5570]">Fonte científica</p>
                        <p className="text-[14px] font-bold text-[#710C60]">Mayo Clinic</p>
                      </div>
                      <p className="text-[14px] text-[#2A1F30] leading-relaxed italic mb-2">
                        "A perimenopausa está relacionada com o período da vida em que as pessoas começam a ter ciclos menstruais irregulares e outros sintomas."
                      </p>
                      <p className="text-[12px] text-[#EF709D]">
                        newsnetwork.mayoclinic.org/pt/2023/12/14
                      </p>
                    </div>

                    {/* Balao Dra. Su */}
                    <div className="bg-gradient-to-br from-[#710C60] to-[#4a0840] rounded-xl p-4 flex gap-3">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#EF709D] shrink-0">
                        <Image
                          src="/images/dra-su.webp"
                          alt="Dra. Suelley"
                          width={80}
                          height={80}
                          priority
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] font-bold text-white">Dra. Suelley Macedo Marques</p>
                        <p className="text-[11px] text-[#EF709D] mb-2">Médica. CRM 2982/RR</p>
                        <p className="text-[14px] text-white/90 leading-relaxed">
                          "A perimenopausa pode durar entre 2 e 10 anos e começa, em média, aos 35-37 anos, podendo iniciar antes."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botoes */}
                  <div className="flex items-center justify-between mt-6 gap-2.5">
                    <button
                      onClick={backToStep3}
                      className="bg-transparent border-2 border-[#e8dde6] text-[#6b5570] py-3.5 px-5 rounded-full text-[14px] font-semibold transition-all hover:border-[#EF709D] hover:text-[#710C60] shrink-0"
                    >
                      ← Voltar
                    </button>
                    <button
                      onClick={continueFromScience}
                      className="flex-1 bg-gradient-to-br from-[#EF709D] to-[#A73979] text-white py-3.5 px-6 rounded-full text-[15px] font-bold shadow-[0_6px_20px_rgba(239,112,157,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(239,112,157,0.45)]"
                    >
                      Continuar →
                    </button>
                  </div>
                </div>
              )}

              {/* ══════ LOADING ══════ */}
              {screen === "loading" && (
            <div className="text-center py-2.5 pb-5">
              <div className="w-[70px] h-[70px] rounded-full border-[5px] border-[#fdf2f6] border-t-[#EF709D] border-r-[#A73979] animate-spin mx-auto mb-6" />
              <h3 className="font-serif text-[22px] text-[#710C60] mb-2">Analisando suas respostas…</h3>
              <p className="text-[14px] text-[#6b5570] mb-7 leading-relaxed">
                Estamos identificando sua fase hormonal e preparando suas informações.
              </p>
              <div className="text-left mx-auto max-w-[300px]">
                {[
                  { icon: "🔍", text: "Identificando padrão de sintomas" },
                  { icon: "📊", text: "Calculando fase hormonal" },
                  { icon: "🧠", text: "Avaliando impacto neurológico" },
                  { icon: "✅", text: "Preparando seu resultado" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 py-2 text-[14px] transition-all duration-400 ${
                      loadingSteps.includes(i) ? "opacity-100 translate-x-0 text-[#710C60] font-medium" : "opacity-0 -translate-x-2.5 text-[#6b5570]"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] shrink-0 transition-all ${
                        loadingSteps.includes(i) ? "bg-[#EF709D] text-white" : "bg-[#fdf2f6]"
                      }`}
                    >
                      {item.icon}
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════ GATE ══════ */}
          {screen === "gate" && (
            <div>
              <div className="text-center mb-5">
                <div className="text-[44px] mb-2.5">🔒</div>
                <h3 className="font-serif text-[21px] text-[#710C60]">Sua análise está pronta</h3>
              </div>

              <div className="relative bg-gradient-to-br from-[#f0e6f5] to-[#fdf2f6] rounded-xl p-4 mb-5 overflow-hidden">
                <div className="blur-[5px] select-none pointer-events-none">
                  <p className="text-[14px] text-[#3d2b3a] mb-1.5">
                    🔴 Fase identificada: <strong>████████████</strong>
                  </p>
                  <p className="text-[14px] text-[#3d2b3a] mb-1.5">
                    Sintomas principais: <strong>██████, ██████, ████</strong>
                  </p>
                  <p className="text-[14px] text-[#3d2b3a]">
                    Recomendação da Dra. Su: <strong>████████████████████████</strong>
                  </p>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#710C60] text-white py-2 px-5 rounded-full text-[13px] font-bold whitespace-nowrap shadow-lg">
                  🔓 Desbloquear resultado
                </div>
              </div>

<div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#EF709D] shadow-md">
<Image
                          src="/images/dra-su.webp"
                          alt="Dra. Su"
                          width={64}
                          height={64}
                          quality={75}
                          priority
                          className="w-full h-full object-cover object-top"
                        />
                    </div>
                  </div>

                  {/* Balao de promessa */}
                  <div className="bg-[#FDF2F6] rounded-2xl p-5 mb-5">
                    <p className="text-[15px] text-[#4A0840] leading-relaxed mb-4">
                      Você acabou de dar um passo que muitas mulheres adiam por anos.
                    </p>
                    <p className="text-[15px] text-[#4A0840] leading-relaxed">
                      A Dra. Su vai te revelar sua fase hormonal, o que está acontecendo no seu corpo e o caminho pra mudar isso na <span className="font-bold text-[#710C60] bg-[#EF709D]/15 px-1 rounded">aula ao vivo</span>.
                    </p>
                  </div>

                  <div className="mt-1">
                    <div className="mb-3.5">
                      <label className="block text-[12px] font-bold text-[#710C60] mb-1.5 uppercase tracking-wide">Seu primeiro nome</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Ana"
                        className="w-full py-3.5 px-4 border-2 border-[#e8dde6] rounded-xl text-[15px] font-sans text-[#3d2b3a] transition-colors outline-none focus:border-[#EF709D]"
                      />
                    </div>
                <div className="mb-3.5">
                  <label className="block text-[12px] font-bold text-[#710C60] mb-1.5 uppercase tracking-wide">Seu melhor e-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full py-3.5 px-4 border-2 border-[#e8dde6] rounded-xl text-[15px] font-sans text-[#3d2b3a] transition-colors outline-none focus:border-[#EF709D]"
                  />
                </div>

                {/* Campo de Faixa de Idade - Pills 2x2 */}
                <div className="mb-4">
                  <label className="block text-[12px] font-bold text-[#710C60] mb-2 uppercase tracking-wide">Sua faixa de idade</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "ate-35", label: "Até 35", emoji: "🌿" },
                      { value: "36-45", label: "36 a 45", emoji: "🔥" },
                      { value: "46-55", label: "46 a 55", emoji: "🌙" },
                      { value: "56+", label: "56 ou mais", emoji: "⚪" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAgeRange(opt.value)}
                        className={`flex items-center gap-2 py-3 px-3.5 rounded-xl border-2 text-left text-[14px] font-medium transition-all cursor-pointer min-h-[48px] ${
                          ageRange === opt.value
                            ? "bg-[#FDF2F6] border-[#EF709D] text-[#710C60] shadow-[0_2px_8px_rgba(239,112,157,0.2)]"
                            : "bg-white border-[#e8dde6] text-[#3d2b3a] hover:bg-[#fdf8fa] hover:border-[#EF709D]/50"
                        }`}
                      >
                        <span className="text-lg">{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={unlockResult}
                  className="w-full py-4 mt-1.5 rounded-full text-base font-bold text-white bg-gradient-to-br from-[#CA3716] to-[#e04520] shadow-[0_6px_20px_rgba(202,55,22,0.32)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(202,55,22,0.45)]"
                >
                  🔓 Ver meu resultado agora
                </button>
                <p className="text-[11px] text-[#bbb] text-center mt-2.5">🔒 Seus dados estão seguros. Não fazemos spam.</p>
              </div>
            </div>
          )}

          {/* ══════ RESULT ══════ */}
          {screen === "result" && (
            <div>
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">{profile.emoji}</div>
                <div className={`inline-flex items-center gap-1.5 py-1.5 px-4 rounded-full text-[12px] font-bold mb-4 ${profile.badgeClass}`}>
                  {profile.badgeText}
                </div>
                <h2 className="font-serif text-2xl max-sm:text-[21px] text-[#710C60] mb-2.5 leading-tight">{profile.title}</h2>
                
                {/* Subtítulo dinâmico com sintomas */}
                <p className="text-[15px] text-[#6b5570] leading-relaxed mb-4">
                  {temSintomas ? (
                    <>Os sintomas que você sente, como <strong className="text-[#710C60]">{symptomTopDois}</strong>, formam um padrão consistente com a transição hormonal da perimenopausa.</>
                  ) : (
                    <>Os sinais que você sente formam um padrão consistente com o início da transição hormonal.</>
                  )}
                </p>
<p className="text-[15px] text-[#710C60] font-medium mb-5">
                  O que você sente tem explicação científica e tem solução.
                </p>

                {/* TIMELINE DA JORNADA HORMONAL */}
                {(() => {
                  const faseAtual = determinarFase(ageRange, answers)
                  const fases: FaseHormonal[] = ["pre-menopausa", "perimenopausa", "menopausa", "pos-menopausa"]
                  
                  return (
                    <div className="bg-gradient-to-br from-white to-[#FDF2F6] rounded-3xl p-6 md:p-7 my-6 shadow-[0_10px_40px_rgba(113,12,96,0.08)] border border-[#EF709D]/20">
                      <h3 className="font-serif text-xl md:text-[22px] font-bold text-[#710C60] text-center mb-6">
                        Sua Jornada Hormonal
                      </h3>
                      
                      {/* Timeline visual */}
                      <div className="relative px-2 md:px-4">
                        {/* Linha conectora gradient */}
                        <div 
                          className="absolute top-[18px] left-[10%] right-[10%] h-1 rounded-full"
                          style={{
                            background: "linear-gradient(to right, #16A34A 0%, #EF709D 33%, #CA3716 66%, #6B7280 100%)"
                          }}
                        />
                        
                        {/* Dots das fases */}
                        <div className="relative flex justify-between">
                          {fases.map((fase) => {
                            const info = FASES_INFO[fase]
                            const isAtivo = fase === faseAtual
                            
                            return (
                              <div key={fase} className="flex flex-col items-center relative" style={{ width: "22%" }}>
                                {/* Dot */}
                                <div 
                                  className={`w-9 h-9 rounded-full flex items-center justify-center text-lg relative z-10 transition-all ${
                                    isAtivo 
                                      ? "bg-gradient-to-br from-[#CA3716] to-[#E04520] border-[3px] border-[#EF709D] shadow-[0_0_0_8px_rgba(202,55,22,0.15),0_0_0_16px_rgba(202,55,22,0.08)] animate-pulse"
                                      : "bg-white border-[3px] border-gray-300"
                                  }`}
                                >
                                  {info.emoji}
                                </div>
                                
                                {/* Labels */}
                                <span className={`mt-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wide ${
                                  isAtivo ? "text-[#CA3716]" : "text-gray-500"
                                }`}>
                                  {info.nome}
                                </span>
                                <span className={`text-[9px] md:text-[10px] ${
                                  isAtivo ? "text-[#CA3716]" : "text-gray-400"
                                }`}>
                                  {info.idade}
                                </span>
                                
                                {/* Tag "Voce esta aqui" */}
                                {isAtivo && (
                                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    <div className="relative">
                                      {/* Triangulo */}
                                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#CA3716]" />
                                      {/* Pill */}
                                      <span className="inline-block bg-gradient-to-r from-[#CA3716] to-[#E04520] text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full animate-bounce">
                                        Você está aqui<sup className="text-[7px] ml-0.5">*</sup>
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      
                      {/* Box explicativo com titulo e disclaimer */}
                      <div className="mt-12 bg-gradient-to-r from-[#FFF5F7] to-white border-l-4 border-[#CA3716] rounded-2xl p-5">
                        {/* Titulo da fase */}
                        <h4 className="font-serif text-lg font-bold text-[#CA3716] mb-3">
                          {FASES_INFO[faseAtual].titulo}
                        </h4>
                        
                        {/* Texto principal com linguagem sugestiva */}
                        <p className="text-[14px] text-gray-800 leading-relaxed">
                          {FASES_INFO[faseAtual].descricao.split(faseAtual === "pre-menopausa" ? "PRÉ-MENOPAUSA" : faseAtual === "perimenopausa" ? "PERIMENOPAUSA" : faseAtual === "menopausa" ? "MENOPAUSA" : "PÓS-MENOPAUSA").map((part, i) => (
                            i === 0 ? (
                              <span key={i}>{part}<strong className="text-[#CA3716] font-bold">{faseAtual === "pre-menopausa" ? "PRÉ-MENOPAUSA" : faseAtual === "perimenopausa" ? "PERIMENOPAUSA" : faseAtual === "menopausa" ? "MENOPAUSA" : "PÓS-MENOPAUSA"}</strong></span>
                            ) : <span key={i}>{part}</span>
                          ))}
                        </p>
                        
                        {/* Disclaimer etico */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-[12px] text-gray-500 italic leading-relaxed">
                            <span className="not-italic">*</span> Informação educacional baseada nas suas respostas. Não substitui consulta médica nem constitui diagnóstico. Para avaliação precisa, procure um profissional de saúde.
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })()}
                
                {/* Barra de expectativa - Aula ao vivo */}
                <div className="bg-gradient-to-r from-[#CA3716] to-[#E04520] text-white py-3 px-5 rounded-lg mb-4 text-center">
                  <span className="text-[15px] font-bold">Aula AO VIVO · 25 de Abril · 9h · Zoom</span>
                </div>
              </div>

              {/* Card Intensidade dos Sinais */}
              <div className="bg-white border-2 border-[#EF709D] rounded-2xl p-5 my-4">
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-3">Intensidade dos seus sinais</p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 bg-[#fdf2f6] rounded-lg h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-lg transition-all duration-1000 ${
                        scorePct <= 30 ? 'bg-gradient-to-r from-[#f5cc4a] to-[#f0a010]' :
                        scorePct <= 60 ? 'bg-gradient-to-r from-[#EF709D] to-[#e07030]' :
                        'bg-gradient-to-r from-[#EF709D] to-[#CA3716]'
                      }`}
                      style={{ width: scoreAnimated ? `${scorePct}%` : "0%" }}
                    />
                  </div>
                  <span className="text-[18px] font-bold text-[#710C60]">{scorePct}%</span>
                </div>
                <p className="text-[13px] text-[#6b5570]">Fase: {profile.badgeText.split('·')[1]?.trim() || 'Fique de olho'}</p>
              </div>

<div className="bg-white rounded-2xl p-6 my-4 shadow-md border-2 border-[#EF709D]">
                {temSintomas ? (
                  <>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Sintomas identificados no seu relato</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {symptomBadges.map((t, i) => (
                        <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-semibold border border-red-200">
                          ✓ {t}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-black">Baseado nas suas respostas. Não constitui diagnóstico médico.</p>
                  </>
                ) : (
                  <>
                    <h4 className="text-[13px] font-bold text-[#710C60] mb-3 font-sans uppercase tracking-wide">Poucos sintomas no momento</h4>
                    <p className="text-[13px] text-[#6b5570]">Mas entender essa fase agora é a melhor forma de se preparar. Não espere os sintomas piorarem para agir.</p>
                  </>
                )}
              </div>

              {!temSintomas && (
                <div className="flex items-center gap-4 bg-[#FAF3ED] rounded-xl p-4 my-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#EF709D] shrink-0">
                    <Image
                      src="/images/dra-su.webp"
                      alt="Dra. Su"
                      width={64}
                      height={64}
                      quality={75}
                      priority
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <p className="text-[13px] text-[#6b5570] leading-relaxed">
                    <strong className="text-[#710C60]">Dra. Su:</strong> O melhor momento para entender seu corpo é agora. Não espere os sintomas chegarem para começar a se cuidar.
                  </p>
                </div>
              )}

{/* NOVA SECAO: O que está acontecendo com você */}
              {temSintomas && (
                <div className="bg-white rounded-2xl p-6 my-6 shadow-md">
                  <h3 className="text-xl font-serif text-[#710C60] mb-4">O que está acontecendo com você</h3>
                  <p className="text-base text-gray-800 leading-relaxed mb-3">
                    Os sintomas que você relatou, como <strong>{symptomTopDois}</strong>, têm relação direta com a <strong>oscilação do estradiol</strong> no seu corpo.
                  </p>
                  <p className="text-base text-gray-800 leading-relaxed mb-3">
                    Isso não é psicológico. É hormonal.
                  </p>
                  <p className="text-base text-gray-800 leading-relaxed">
                    E a boa notícia: existe <strong>explicação</strong> e existe <strong>caminho</strong>.
                  </p>
                </div>
              )}

              {/* NOVA SECAO: Na aula você vai descobrir */}
              <div className="bg-white rounded-2xl p-6 my-6 shadow-md">
                <h3 className="text-xl font-serif text-[#710C60] mb-4">Na aula, você vai descobrir</h3>
                <ul className="space-y-3">
                  {temSintomas && (
                    <li className="flex gap-3">
                      <span className="text-[#EF709D] flex-shrink-0 text-xl leading-tight">✓</span>
                      <span className="text-base text-gray-800">
                        Por que seu corpo está com <strong>{symptomTopDois}</strong>
                      </span>
                    </li>
                  )}
                  <li className="flex gap-3">
                    <span className="text-[#EF709D] flex-shrink-0 text-xl leading-tight">✓</span>
                    <span className="text-base text-gray-800">
                      O que fazer hoje mesmo para <strong>recuperar o sono</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#EF709D] flex-shrink-0 text-xl leading-tight">✓</span>
                    <span className="text-base text-gray-800">
                      Como saber se você precisa de <strong>tratamento hormonal</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#EF709D] flex-shrink-0 text-xl leading-tight">✓</span>
                    <span className="text-base text-gray-800">
                      Como falar com seu médico <strong>sem ser desacreditada</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#EF709D] flex-shrink-0 text-xl leading-tight">✓</span>
                    <span className="text-base text-gray-800">
                      O que fazer quando os exames dizem <strong>&quot;está tudo normal&quot;</strong>
                    </span>
                  </li>
                </ul>
              </div>

              {/* BLOCO DEPOIMENTOS - Prints reais do Instagram */}
              <div className="my-5">
                <h4 className="text-[13px] font-bold text-[#710C60] mb-1.5 font-sans uppercase tracking-wide">Outras mulheres que sentiram o mesmo</h4>
                <p className="text-[12px] text-[#6b5570] mb-4">Comentários reais do Instagram da Dra. Su</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  {/* Print 1 - @elmasilva_9 */}
                  <div className="bg-white rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                    <Image
                      src="/depoimentos/print-comentario-1.jpg"
                      alt="Comentário da seguidora @elmasilva_9 sobre sintomas da perimenopausa aos 38 anos"
                      width={600}
                      height={200}
                      loading="eager"
                      className="w-full h-auto rounded-lg"
                    />
                    <p className="text-[11px] text-[#6b5570] text-center mt-2">Via Instagram @drasumenopausa</p>
                  </div>

                  {/* Print 2 - @rosana_perini2024 */}
                  <div className="bg-white rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                    <Image
                      src="/depoimentos/print-comentario-2.jpg"
                      alt="Comentário da seguidora @rosana_perini2024 sobre menopausa aos 38 anos"
                      width={600}
                      height={200}
                      loading="eager"
                      className="w-full h-auto rounded-lg"
                    />
                    <p className="text-[11px] text-[#6b5570] text-center mt-2">Via Instagram @drasumenopausa</p>
                  </div>

                  {/* Print 3 - @neidyporfirio12 */}
                  <div className="bg-white rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                    <Image
                      src="/depoimentos/print-comentario-3.jpg"
                      alt="Comentário da seguidora @neidyporfirio12 sobre sintomas da perimenopausa aos 38 anos"
                      width={600}
                      height={200}
                      loading="eager"
                      className="w-full h-auto rounded-lg"
                    />
                    <p className="text-[11px] text-[#6b5570] text-center mt-2">Via Instagram @drasumenopausa</p>
                  </div>
                </div>
              </div>

              {/* NOVO BLOCO: Por que AO VIVO? */}
              <div className="bg-white border border-[#f0e0eb] rounded-2xl p-5 my-5">
                <h4 className="font-serif text-lg text-[#710C60] mb-4">Por que AO VIVO e não gravado?</h4>
                <ul className="space-y-3">
                  <li className="flex gap-3 items-start">
                    <span className="text-lg">🩺</span>
                    <span className="text-[14px] text-[#3d2b3a]">Suas dúvidas respondidas na hora, direto com a Dra. Su</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-lg">💬</span>
                    <span className="text-[14px] text-[#3d2b3a]">Conversa real, não conteúdo enlatado</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-lg">👩‍⚕️</span>
                    <span className="text-[14px] text-[#3d2b3a]">Atendimento que costuma custar R$400 em consulta</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <span className="text-lg">🎥</span>
                    <span className="text-[14px] text-[#3d2b3a]">Gravação disponível após a aula*</span>
                  </li>
                </ul>
                <p className="text-[11px] text-[#6b5570] mt-3 italic">*orientações de acesso enviadas após inscrição</p>
              </div>

              {/* HERO - Você Não Está Louca */}
              <div className="bg-gradient-to-br from-[#710C60] via-[#4A0840] to-[#2D0526] text-white py-10 px-6 rounded-2xl my-5 text-center">
                <h2 className="font-serif text-[clamp(1.75rem,5vw,2.5rem)] font-bold leading-tight mb-4">
                  Você <span className="text-[#EF709D]">Não Está Louca</span>
                </h2>
                <p className="text-[15px] text-white/85 leading-relaxed max-w-[460px] mx-auto">
                  O que ninguém te contou sobre como a{" "}<strong className="text-[#EF709D] font-bold">perimenopausa</strong>{" "}e a{" "}<strong className="text-[#EF709D] font-bold">menopausa</strong>{" "}estão afetando seu corpo, sua energia e sua mente, mesmo quando seus exames dizem que está tudo &quot;normal&quot;.
                </p>
              </div>

              {/* NOVO BLOCO: BÔNUS */}
              <div className="bg-gradient-to-br from-[#FDF2F6] to-[#FAE5EC] rounded-2xl p-5 my-5">
                <h4 className="text-[13px] font-bold text-[#710C60] mb-4 font-sans uppercase tracking-wide">🎁 COMPRANDO HOJE VOCÊ RECEBE:</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[14px] text-[#3d2b3a] font-medium flex items-start gap-2">
                      <span className="text-green-600">✅</span>
                      E-book &quot;Os 10 sinais da perimenopausa que você ignora&quot;
                    </p>
                    <p className="text-[12px] text-[#6b5570] ml-6">Acesso imediato após a compra</p>
                  </div>
                  <div>
                    <p className="text-[14px] text-[#3d2b3a] font-medium flex items-start gap-2">
                      <span className="text-green-600">✅</span>
                      Lembrete WhatsApp 1h antes da aula
                    </p>
                    <p className="text-[12px] text-[#6b5570] ml-6">Para você não esquecer do seu horário - link na área de membros</p>
                  </div>
                </div>
              </div>

{/* CTA UNIFICADO - Layout foto lateral alinhada */}
              <section className="bg-gradient-to-br from-[#710C60] via-[#4A0840] to-[#2D0526] text-white rounded-2xl p-6 md:p-8 my-8">
                
                {/* HERO ROW: foto + título alinhados verticalmente */}
                <div className="flex items-center gap-4 mb-5">
                  <Image
                    src="/images/dra-su.webp"
                    alt="Dra. Suelley Macedo Marques"
                    width={80}
                    height={80}
                    priority
                    className="w-20 h-20 rounded-full border-[3px] border-[#EF709D]/50 object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="font-serif text-xl font-bold leading-tight mb-2">
                      {primeiroNome(name)}, entenda agora antes que piore
                    </h3>
                    <p className="text-sm text-white/85 leading-snug">
                      Essa aula foi feita pra mulheres exatamente como você.
                    </p>
                  </div>
                </div>

                {/* PARÁGRAFO PRINCIPAL */}
                <p className="text-base text-white/90 leading-relaxed mb-6">
                  A Dra. Su vai te explicar ao vivo por que você sente{" "}
                  <strong className="text-[#EF709D]">{symptomTopDois || "esses sintomas"}</strong>, o protocolo exato pra sair disso e tirar suas dúvidas em tempo real.
                </p>

                {/* COUNTDOWN */}
                <div className="bg-white/10 border border-white/15 rounded-2xl p-4 mb-5 text-center">
                  <p className="text-[10px] uppercase tracking-[2px] text-[#EF709D] font-bold mb-1.5">
                    Sua transformação começa em
                  </p>
                  <CountdownTimer />
                </div>

                {/* FRASE PERSONALIZADA ANTES DO CTA */}
                {temSintomas && (
                  <p className="text-sm text-center text-white/90 mb-4 leading-relaxed">
                    Na aula, a Dra. Su te mostra como resolver{" "}
                    <strong className="text-[#EF709D]">{symptomTopDois}</strong>.
                  </p>
                )}

                {/* CTA */}
                <a
                  href="https://sun.eduzz.com/797ZK1BA0E"
                  onClick={() => { trackCheckout(); pixelPurchase(); }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-4 rounded-full text-center text-white font-bold uppercase tracking-wide text-sm md:text-base bg-gradient-to-br from-[#CA3716] to-[#E04520] shadow-[0_8px_24px_rgba(202,55,22,0.4)] hover:-translate-y-0.5 transition-all"
                >
                  Garantir minha vaga por R$29,90
                </a>

                {/* GARANTIA (linha pequena) */}
                <p className="text-center text-xs text-white/70 mt-3">
                  Garantia de 7 dias · Acesso imediato
                </p>
              </section>

              {/* BLOCO GARANTIA - Nova posição */}
              <div className="bg-[#FAF3ED] rounded-xl p-5 my-5 text-center">
                <div className="text-3xl mb-2">🛡️</div>
                <h4 className="font-serif text-lg text-[#710C60] mb-2">Garantia de 7 dias</h4>
                <p className="text-[14px] text-[#6b5570] leading-relaxed">
                  Se por qualquer motivo você sentir que a aula não era para você, basta enviar um e-mail em até 7 dias e devolvemos 100% do seu investimento. Sem perguntas, sem burocracia.
                </p>
              </div>

              {/* FAQ Accordion */}
              <div className="my-6">
                <h4 className="text-[13px] font-bold text-[#710C60] mb-4 font-sans uppercase tracking-wide">Perguntas frequentes</h4>
                
                {/* FAQ Item 1 */}
                <div className="bg-white border border-[#e8dde6] rounded-xl mb-2.5 overflow-hidden">
                  <button 
                    onClick={() => setFaqOpen(faqOpen === 0 ? null : 0)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <h5 className="font-semibold text-[14px] text-[#710C60]">Como vou receber o acesso?</h5>
                    <span className={`text-[#710C60] transition-transform ${faqOpen === 0 ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {faqOpen === 0 && (
                    <div className="px-4 pb-4 bg-[#faf7f9]">
                      <p className="text-[13px] text-[#6b5570]">Assim que você garante sua vaga, recebe todas as orientações de acesso direto no e-mail cadastrado. A aula acontece ao vivo no Zoom, direto da sua casa.</p>
                    </div>
                  )}
                </div>

                {/* FAQ Item 2 */}
                <div className="bg-white border border-[#e8dde6] rounded-xl mb-2.5 overflow-hidden">
                  <button 
                    onClick={() => setFaqOpen(faqOpen === 1 ? null : 1)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <h5 className="font-semibold text-[14px] text-[#710C60]">Preciso ter exame feito?</h5>
                    <span className={`text-[#710C60] transition-transform ${faqOpen === 1 ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {faqOpen === 1 && (
                    <div className="px-4 pb-4 bg-[#faf7f9]">
                      <p className="text-[13px] text-[#6b5570]">Não. A aula é educacional e vai te ajudar a entender seus sintomas, independente de ter exames.</p>
                    </div>
                  )}
                </div>

                {/* FAQ Item 3 */}
                <div className="bg-white border border-[#e8dde6] rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setFaqOpen(faqOpen === 2 ? null : 2)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <h5 className="font-semibold text-[14px] text-[#710C60]">E se eu já estou na menopausa?</h5>
                    <span className={`text-[#710C60] transition-transform ${faqOpen === 2 ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {faqOpen === 2 && (
                    <div className="px-4 pb-4 bg-[#faf7f9]">
                      <p className="text-[13px] text-[#6b5570]">Perfeito! A aula aborda tanto perimenopausa quanto menopausa, com orientações específicas para cada fase.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#FAF3ED] rounded-xl p-3 px-4 text-[12px] text-[#6b5570] leading-normal mt-5 text-left">
                ⚕️ Este quiz é informativo e educacional. Não substitui consulta médica nem constitui diagnóstico.
              </div>

              <button onClick={restartQuiz} className="block mx-auto mt-4 text-[13px] text-[#6b5570] underline bg-transparent border-none cursor-pointer font-sans">
                Refazer o quiz
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="text-white/90 text-[11px] text-center py-4 pt-4 max-w-[600px] w-full">
        <p>Dra. Suelley Macedo Marques · CRM 2982/RR · PMG Group · CNPJ 56.688.723/0001-80</p>
        <p className="mt-1">Este quiz é informativo e educacional. Não substitui consulta médica.</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// WRAPPER WITH SUSPENSE FOR SEARCH PARAMS
// ═══════════════════════════════════════════════
export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-[#710C60] to-[#4a0840] flex items-center justify-center"><div className="text-white">Carregando...</div></div>}>
      <QuizPageContent />
    </Suspense>
  )
}
