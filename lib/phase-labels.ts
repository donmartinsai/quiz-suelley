export const phaseLabels: Record<string, string> = {
  fase_inicial: "Início Perimenopausa",
  perimenopausa: "Perimenopausa",
  perimenopausa_avancada: "Perimenopausa Avançada",
  menopausa: "Menopausa",
  pos_menopausa: "Pós-Menopausa",
  alerta_hormonal: "Alerta Hormonal",
  acao_urgente: "Ação Urgente",
}

// Mapeamento de sintomas Q2 (multi-select)
export const Q2_SYMPTOMS: Record<string, { icon: string; label: string }> = {
  "[0]": { icon: "🔥", label: "Fogachos e suores noturnos" },
  "[1]": { icon: "😤", label: "Irritabilidade ou choro fácil" },
  "[2]": { icon: "🌙", label: "Insônia (acordar às 3h)" },
  "[3]": { icon: "🧠", label: "Névoa mental e falhas de memória" },
  "[4]": { icon: "🪫", label: "Cansaço constante" },
  "[5]": { icon: "⊘", label: "Nenhum ou poucos sintomas" }
}

export function getPhaseLabel(phase: string | null | undefined): string {
  if (!phase) return "-"
  return phaseLabels[phase] || phase
}
