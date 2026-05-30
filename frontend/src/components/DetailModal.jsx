import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:5001'

export default function DetailModal({ item, onClose }) {
    const [detail, setDetail] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!item) return

        setDetail(null)
        setError(false)
        setLoading(true)

        let cancelled = false

        axios.get(`${API}/api/detail/${item.type}/${item.id}`)
            .then(res => {
                if (!cancelled) setDetail(res.data)
            })
            .catch(() => {
                if (!cancelled) setError(true)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => { cancelled = true }
    }, [item?.id, item?.type])

    return (
        <AnimatePresence>
            {item && (
                <>
                    {/* backdrop overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(6px)',
                            zIndex: 200,
                        }}
                    />

                    {/* modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            margin: 'auto',
                            width: '90%',
                            maxWidth: 800,
                            height: 'fit-content',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                            background: '#0f0505',
                            border: '1px solid rgba(139,0,0,0.3)',
                            borderRadius: 20,
                            zIndex: 201,
                        }}
                    >
                        {/* loading */}
                        {loading && (
                            <div style={{
                                height: 400, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                flexDirection: 'column', gap: 16,
                                color: 'rgba(255,255,255,0.3)', fontSize: 16
                            }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    style={{
                                        width: 36, height: 36,
                                        border: '3px solid rgba(139,0,0,0.3)',
                                        borderTop: '3px solid #cc0000',
                                        borderRadius: '50%'
                                    }}
                                />
                                Loading...
                            </div>
                        )}

                        {/* error */}
                        {!loading && error && (
                            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
                                <p style={{ marginBottom: 16 }}>Could not load details.</p>
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                    <button
                                        onClick={() => {
                                            setError(false)
                                            setLoading(true)
                                            axios.get(`${API}/api/detail/${item.type}/${item.id}`)
                                                .then(res => setDetail(res.data))
                                                .catch(() => setError(true))
                                                .finally(() => setLoading(false))
                                        }}
                                        style={{
                                            padding: '8px 20px',
                                            background: 'rgba(139,0,0,0.4)',
                                            border: '1px solid rgba(139,0,0,0.6)',
                                            borderRadius: 8, color: '#fff',
                                            cursor: 'pointer', fontSize: 13
                                        }}
                                    >
                                        Retry
                                    </button>
                                    <button
                                        onClick={onClose}
                                        style={{
                                            padding: '8px 20px',
                                            background: 'rgba(255,255,255,0.07)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: 8, color: '#fff',
                                            cursor: 'pointer', fontSize: 13
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* content */}
                        {!loading && detail && (
                            <>
                                {/* backdrop image */}
                                <div style={{
                                    position: 'relative',
                                    height: 280,
                                    overflow: 'hidden',
                                    borderRadius: '20px 20px 0 0',
                                    background: '#1a0000'
                                }}>
                                    {detail.backdrop_url && (
                                        <img
                                            src={detail.backdrop_url}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
                                        />
                                    )}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(to bottom, transparent 40%, #0f0505 100%)'
                                    }} />

                                    {/* close button */}
                                    <button
                                        onClick={onClose}
                                        style={{
                                            position: 'absolute', top: 16, right: 16,
                                            background: 'rgba(0,0,0,0.6)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '50%', width: 36, height: 36,
                                            color: '#fff', fontSize: 20, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            lineHeight: 1,
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* main content */}
                                <div style={{ padding: '0 28px 32px', marginTop: -60 }}>

                                    {/* poster + title row */}
                                    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
                                        {detail.poster_url && (
                                            <img
                                                src={detail.poster_url}
                                                style={{
                                                    width: 110, borderRadius: 12,
                                                    border: '2px solid rgba(139,0,0,0.4)',
                                                    flexShrink: 0,
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
                                                }}
                                            />
                                        )}

                                        <div style={{ flex: 1, paddingBottom: 4 }}>
                                            <h2 style={{
                                                fontSize: 24, fontWeight: 700,
                                                marginBottom: 10, lineHeight: 1.3
                                            }}>
                                                {detail.title}
                                            </h2>
                                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                                <span style={{
                                                    background: 'rgba(139,0,0,0.3)',
                                                    border: '1px solid rgba(139,0,0,0.5)',
                                                    borderRadius: 6, padding: '3px 10px',
                                                    fontSize: 13, color: '#ff4444', fontWeight: 600
                                                }}>
                                                    ⭐ {detail.rating}
                                                </span>
                                                {detail.release_date && (
                                                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                                                        📅 {detail.release_date?.slice(0, 4)}
                                                    </span>
                                                )}
                                                {detail.runtime && (
                                                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                                                        ⏱ {detail.runtime} min
                                                    </span>
                                                )}
                                                <span style={{
                                                    fontSize: 12, padding: '3px 10px',
                                                    background: 'rgba(255,255,255,0.07)',
                                                    borderRadius: 6, color: 'rgba(255,255,255,0.5)',
                                                }}>
                                                    {detail.type === 'series' ? '📺 Series' : '🎬 Movie'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* genres */}
                                    {detail.genres?.length > 0 && (
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
                                            {detail.genres.map((g, i) => (
                                                <span key={i} style={{
                                                    padding: '5px 14px',
                                                    background: 'rgba(139,0,0,0.15)',
                                                    border: '1px solid rgba(139,0,0,0.3)',
                                                    borderRadius: 999, fontSize: 12,
                                                    color: 'rgba(255,255,255,0.7)'
                                                }}>
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* overview */}
                                    {detail.overview && (
                                        <p style={{
                                            marginTop: 20, fontSize: 14,
                                            color: 'rgba(255,255,255,0.65)',
                                            lineHeight: 1.8
                                        }}>
                                            {detail.overview}
                                        </p>
                                    )}

                                    {/* cast */}
                                    {detail.cast?.length > 0 && (
                                        <>
                                            <h3 style={{
                                                marginTop: 28, marginBottom: 16,
                                                fontSize: 15, fontWeight: 600,
                                                color: 'rgba(255,255,255,0.8)'
                                            }}>
                                                Cast
                                            </h3>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))',
                                                gap: 14
                                            }}>
                                                {detail.cast.map((c, i) => (
                                                    <div key={i} style={{ textAlign: 'center' }}>
                                                        <div style={{
                                                            width: 64, height: 64,
                                                            borderRadius: '50%',
                                                            overflow: 'hidden',
                                                            margin: '0 auto 8px',
                                                            background: '#1a0000',
                                                            border: '2px solid rgba(139,0,0,0.3)'
                                                        }}>
                                                            {c.profile_path ? (
                                                                <img
                                                                    src={c.profile_path}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                <div style={{
                                                                    width: '100%', height: '100%',
                                                                    display: 'flex', alignItems: 'center',
                                                                    justifyContent: 'center', fontSize: 22
                                                                }}>
                                                                    👤
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p style={{
                                                            fontSize: 11, fontWeight: 600,
                                                            color: '#fff', marginBottom: 2
                                                        }}>
                                                            {c.name}
                                                        </p>
                                                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                                                            {c.character}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}