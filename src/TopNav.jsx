import { useState } from 'react'
import './TopNav.css'

export default function TopNav({ onAbout, onEmergencyContacts }) {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  return (
    <nav className="topnav">
      {/* Logo */}
      <div className="topnav-logo" style={{
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
}}>
  <img
    src="/SAFAR.png"
    alt="Safar Logo"
    style={{
      width: '36px',
      height: '36px',
      borderRadius: '10px',
      boxShadow: '0 0 12px rgba(74,127,229,0.4)'
    }}
  />

  <span style={{
    fontSize: '20px',
    fontWeight: '600',
    color: '#E6EDF3',
    letterSpacing: '0.5px'
  }}>
    Safar
  </span>
</div>

      {/* Center Nav Links */}
      <div className="topnav-links">
        <button className="nav-link active">Dashboard</button>
        <button className="nav-link" onClick={onAbout}>About</button>
        <button className="nav-link" onClick={onEmergencyContacts}>Emergency Contacts</button>
      </div>

      {/* Right Side */}
      <div className="topnav-right">
        <div className="time-weather">
          <div className="time-chip">
            <span className="moon-icon">🌙</span>
            <span>{timeStr}</span>
          </div>
          <div className="weather-chip">
            <span>☁️</span>
            <span>28°C</span>
          </div>
        </div>

        <button className="icon-btn notif-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span className="notif-dot"></span>
        </button>

        <button className="icon-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
          </svg>
        </button>

        <div className="profile-avatar">
          <div className="avatar-ring">
            <div className="avatar-inner">S</div>
          </div>
        </div>
      </div>
    </nav>
  )
}