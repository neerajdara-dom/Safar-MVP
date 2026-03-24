import './Modal.css'

export function AboutModal({ onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-card" onClick={e => e.stopPropagation()}>
        <div className="overlay-header">
          <div>
            <div className="overlay-eyebrow">ABOUT</div>
            <div className="overlay-title">Safar</div>
          </div>
          <button className="overlay-close" onClick={onClose}>✕</button>
        </div>

        <div className="overlay-body">
          <div className="about-tagline">Every journey, safely.</div>
          <p className="about-desc">
            Safar is India's first smart night travel safety app that prioritizes your safety over speed.
            Instead of the fastest route, Safar finds the route with the most light, open establishments,
            and least isolation — keeping you safe whether you're walking, on a bike, or driving.
          </p>

          <div className="about-features">
            {[
              { icon: '🛡️', title: 'Safe Routing', desc: 'Routes scored on road type, safe havens, and traffic conditions' },
              { icon: '🏥', title: 'Safe Havens', desc: 'Live open/closed status of hospitals, petrol pumps, mechanics, and pharmacies' },
              { icon: '🤖', title: 'AI Briefing', desc: 'Gemini AI generates a personalized safety summary before every journey' },
              { icon: '🚨', title: 'Emergency SOS', desc: 'One tap sends your live location to your emergency contact via WhatsApp' },
              { icon: '🧭', title: 'Live Navigation', desc: 'Real-time position tracking with nearby safe stops within 10 km' },
            ].map((f, i) => (
              <div key={i} className="feature-row">
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <div className="feature-name">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="about-stack">
            <div className="stack-label">BUILT WITH</div>
            <div className="stack-chips">
              {['Google Maps API', 'Google Places API', 'Gemini AI', 'Firebase', 'React + Vite', 'Vercel'].map(s => (
                <span key={s} className="stack-chip">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EmergencyContactsModal({ onClose }) {
  const contacts = [
    { name: 'Mom', number: '', relation: 'Family' },
    { name: 'Dad', number: '', relation: 'Family' },
    { name: 'Emergency 112', number: '112', relation: 'Police / Ambulance' },
    { name: 'Women Helpline', number: '1091', relation: 'Women Safety' },
  ]

  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-card" onClick={e => e.stopPropagation()}>
        <div className="overlay-header">
          <div>
            <div className="overlay-eyebrow">SAFETY</div>
            <div className="overlay-title">Emergency Contacts</div>
          </div>
          <button className="overlay-close" onClick={onClose}>✕</button>
        </div>

        <div className="overlay-body">
          <p className="about-desc">
            These contacts will receive your live location when you press the SOS button.
            Add personal contacts below — they'll be messaged on WhatsApp instantly.
          </p>

          <div className="contacts-list">
            {contacts.map((c, i) => (
              <div key={i} className="contact-row">
                <div className="contact-avatar">{c.name[0]}</div>
                <div className="contact-info">
                  <div className="contact-name">{c.name}</div>
                  <div className="contact-rel">{c.relation}</div>
                </div>
                {c.number ? (
                  <a
                    href={`tel:${c.number}`}
                    className="contact-call-btn"
                    onClick={e => e.stopPropagation()}
                  >
                    📞 {c.number}
                  </a>
                ) : (
                  <span className="contact-add">Add number</span>
                )}
              </div>
            ))}
          </div>

          <button
            className="sos-test-btn"
            onClick={() => {
              navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords
                const msg = `🚨 EMERGENCY! I need help immediately.%0AMy location: https://maps.google.com/?q=${latitude},${longitude}%0APlease contact me urgently!`
                window.open(`https://wa.me/?text=${msg}`)
              })
            }}
          >
            <span>🚨</span> Test SOS — Send Location Now
          </button>
        </div>
      </div>
    </div>
  )
}