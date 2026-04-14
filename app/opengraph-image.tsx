import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Quiz Dra. Suelley — Você Não Está Louca'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#FDF8F4',
          padding: 60,
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Barra gradiente topo */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: 8,
          background: 'linear-gradient(90deg, #EF709D 0%, #710C60 50%, #CA3716 100%)',
        }} />
        
        {/* Coluna esquerda */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 2, background: '#CA3716' }} />
            <span style={{ color: '#CA3716', letterSpacing: 3, fontSize: 20, fontWeight: 700, textTransform: 'uppercase' }}>
              QUIZ GRATUITO
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 88, fontWeight: 900, color: '#EF709D', lineHeight: 1 }}>você não</span>
            <span style={{ fontSize: 88, fontWeight: 900, color: '#710C60', lineHeight: 1, fontStyle: 'italic' }}>está louca</span>
            <span style={{ fontSize: 32, fontStyle: 'italic', color: '#EF709D', marginTop: 12 }}>
              — é a perimenopausa
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', color: '#2A1F30', fontSize: 26, marginTop: 16 }}>
            <span>Descubra em qual fase hormonal</span>
            <span>você está em 3 minutos</span>
          </div>
          
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {['11 perguntas', '3 minutos', 'Resultado personalizado'].map(t => (
              <div key={t} style={{
                display: 'flex',
                background: '#FFE4EE',
                color: '#710C60',
                padding: '8px 16px',
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 600,
              }}>{t}</div>
            ))}
          </div>
          
          <div style={{ color: '#6B5A6E', fontSize: 16, marginTop: 16 }}>
            Dra. Suelley Macedo Marques · CRM 2982/RR
          </div>
        </div>
        
        {/* Coluna direita — placeholder de foto */}
        <div style={{
          display: 'flex',
          width: 420,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, #FFE4EE 0%, #FDF8F4 70%)',
          borderRadius: 20,
        }}>
          <div style={{ color: '#710C60', fontSize: 24, fontWeight: 600, textAlign: 'center' }}>
            Dra.<br/>Suelley
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
