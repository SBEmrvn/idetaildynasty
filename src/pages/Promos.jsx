import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Promos() {
  const [promos, setPromos] = useState([])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('promos').select('*').eq('active', true).order('created_at')
      setPromos(data || [])
    }
    fetch()

    const channel = supabase.channel('promos-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promos' }, fetch)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <section className="promos">
      <div className="promos-header">
        <p className="section-label">Deals & Offers</p>
        <h2 className="section-title">Current Promotions</h2>
        <p className="section-sub" style={{ margin: '0 auto' }}>
          Exclusive deals for our valued customers. Show the code at booking to redeem.
        </p>
      </div>

      <div className="promos-grid">
        {promos.length === 0 ? (
          <p style={{ color: 'var(--gray)', textAlign: 'center', gridColumn: '1/-1' }}>No active promos at the moment.</p>
        ) : promos.map((p) => (
          <div className="promo-card" key={p.id}>
            <span className="promo-tag">{p.tag}</span>
            <h3 className="promo-title">{p.title}</h3>
            <p className="promo-desc">{p.description}</p>
            <div style={{
              background: 'rgba(201,168,76,0.08)',
              border: '1px dashed rgba(201,168,76,0.4)',
              padding: '0.6rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '0.9rem', fontWeight: '500' }}>
                {p.code}
              </span>
              <span style={{ color: 'var(--gray)', fontSize: '0.75rem' }}>promo code</span>
            </div>
            <p className="promo-expiry">⏳ {p.expiry}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
