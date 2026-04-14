export const phaseLabels: Record<string, string> = {
  fase_inicial: "Início Perimenopausa",
  perimenopausa: "Perimenopausa",
  perimenopausa_avancada: "Perimenopausa Avançada",
  menopausa: "Menopausa",
  pos_menopausa: "Pós-Menopausa",
  alerta_hormonal: "Alerta Hormonal",
  acao_urgente: "Ação Urgente",
}

export function getPhaseLabel(phase: string | null | undefined): string {
  if (!phase) return "-"
  return phaseLabels[phase] || phase
}
