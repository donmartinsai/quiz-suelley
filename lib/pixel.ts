// Meta Pixel helper functions
// Fire and forget - não bloqueia UX

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

function isFbqAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.fbq !== "undefined"
}

// 1. Quando clica em "Quero descobrir minha fase"
export function trackInitiateCheckout() {
  if (isFbqAvailable()) {
    window.fbq!("track", "InitiateCheckout")
  }
}

// 2. Quando responde cada pergunta
export function trackQuizAnswer(questionId: string, questionOrder: number) {
  if (isFbqAvailable()) {
    window.fbq!("trackCustom", "QuizAnswer", { question: questionId, order: questionOrder })
  }
}

// 3. Quando preenche email/nome (captura de lead)
export function trackLead() {
  if (isFbqAvailable()) {
    window.fbq!("track", "Lead")
  }
}

// 4. Quando chega na tela de resultado final
export function trackCompleteRegistration(resultPhase: string) {
  if (isFbqAvailable()) {
    window.fbq!("track", "CompleteRegistration", { content_name: resultPhase })
  }
}

// 5. Quando clica no botão de checkout
export function trackPurchase() {
  if (isFbqAvailable()) {
    window.fbq!("track", "Purchase", { value: 0, currency: "BRL" })
  }
}
