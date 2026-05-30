import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const floatingItems = [
  { emoji: '🎬', x: '5%', y: '10%', size: 38, delay: 0 },
  { emoji: '🎵', x: '90%', y: '8%', size: 32, delay: 0.5 },
  { emoji: '🎸', x: '80%', y: '70%', size: 36, delay: 1 },
  { emoji: '🎭', x: '10%', y: '75%', size: 34, delay: 1.5 },
  { emoji: '🎤', x: '50%', y: '5%', size: 30, delay: 0.8 },
  { emoji: '📽️', x: '20%', y: '40%', size: 36, delay: 1.2 },
  { emoji: '🎹', x: '75%', y: '35%', size: 32, delay: 0.3 },
  { emoji: '🎻', x: '60%', y: '85%', size: 30, delay: 1.8 },
  { emoji: '🎞️', x: '35%', y: '90%', size: 34, delay: 0.6 },
  { emoji: '🎷', x: '92%', y: '45%', size: 30, delay: 1.4 },
  { emoji: '🍿', x: '3%', y: '50%', size: 32, delay: 0.9 },
  { emoji: '🎼', x: '45%', y: '78%', size: 28, delay: 1.6 },
]

export default function Landing() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    if (email && password) navigate('/dashboard', { replace: true })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top left, #3b0000 0%, #1a0000 30%, #0a0a0a 70%)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>

      {/* Floating background emojis */}
      {floatingItems.map((item, i) => (
        <motion.div key={i} style={{
          position: 'absolute', left: item.x, top: item.y,
          fontSize: item.size, opacity: 0.15,
          userSelect: 'none', pointerEvents: 'none',
        }}
          animate={{ y: [0, -18, 0], rotate: [-5, 5, -5], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 4 + item.delay, repeat: Infinity, ease: 'easeInOut', delay: item.delay }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Glow blobs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,0,0,0.18) 0%, transparent 70%)', top: '-100px', left: '-100px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,0,0,0.12) 0%, transparent 70%)', bottom: '-80px', right: '-80px', pointerEvents: 'none' }} />

      {/* Glass login card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          background: 'rgba(15,5,5,0.80)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(139,0,0,0.35)',
          borderRadius: 24,
          padding: '48px 44px',
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 8px 60px rgba(139,0,0,0.2), 0 2px 20px rgba(0,0,0,0.6)',
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎬</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #ff4444, #cc0000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CineTune
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 6 }}>
            Movies & Series, tuned to your taste
          </p>
        </motion.div>

        {/* Form */}
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'EMAIL', type: 'email', placeholder: 'you@example.com', value: email, onChange: e => setEmail(e.target.value) },
            { label: 'PASSWORD', type: 'password', placeholder: '••••••••', value: password, onChange: e => setPassword(e.target.value) },
          ].map(({ label, ...props }) => (
            <div key={label}>
              <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6, display: 'block' }}>{label}</label>
              <input
                {...props}
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'rgba(200,0,0,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          ))}

          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ marginTop: 8, padding: '13px', background: 'linear-gradient(135deg, #cc0000, #8b0000)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.3px', boxShadow: '0 4px 24px rgba(139,0,0,0.4)' }}>
            Enter
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  )
}
