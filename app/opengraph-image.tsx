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
          position: 'relative',
        }}
      >
        {/* Barra gradiente topo */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: 8,
          background: 'linear-gradient(90deg, #EF709D, #710C60, #CA3716)',
        }} />

        {/* Coluna esquerda */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 2, background: '#CA3716' }} />
            <span style={{ color: '#CA3716', letterSpacing: 3, fontSize: 20, fontWeight: 700 }}>QUIZ GRATUITO</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 96, fontWeight: 900, color: '#EF709D', lineHeight: 1 }}>você não</span>
            <span style={{ fontSize: 96, fontWeight: 900, color: '#710C60', lineHeight: 1, fontStyle: 'italic' }}>está louca</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', color: '#2A1F30', fontSize: 28, marginTop: 8 }}>
            <span>Descubra em qual fase hormonal</span>
            <span>você está em 3 minutos</span>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <div style={{ display: 'flex', background: '#FFE4EE', color: '#710C60', padding: '10px 18px', borderRadius: 999, fontSize: 18, fontWeight: 700 }}>11 perguntas</div>
            <div style={{ display: 'flex', background: '#FFE4EE', color: '#710C60', padding: '10px 18px', borderRadius: 999, fontSize: 18, fontWeight: 700 }}>3 minutos</div>
            <div style={{ display: 'flex', background: '#FFE4EE', color: '#710C60', padding: '10px 18px', borderRadius: 999, fontSize: 18, fontWeight: 700 }}>Gratuito</div>
          </div>

          <div style={{ color: '#6B5A6E', fontSize: 18, marginTop: 16 }}>
            Dra. Suelley Macedo Marques · CRM 2982/RR
          </div>
        </div>

        {/* Coluna direita */}
        <div style={{
          display: 'flex',
          width: 420,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, #FFE4EE 0%, #FDF8F4 70%)',
          borderRadius: 24,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', color: '#710C60', fontSize: 32, fontWeight: 900, textAlign: 'center' }}>
            <span>Dra.</span>
            <span>Suelley</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
