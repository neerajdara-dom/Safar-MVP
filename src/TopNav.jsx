import { useState } from 'react'
import './TopNav.css'

export default function TopNav({ onAbout, onEmergencyContacts }) {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

  return (
    <nav className="topnav">
      {/* Logo */}
      <div className="topnav-logo">
        <div className="logo-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L4 7V20H18V7L11 2Z" stroke="#4a7fe5" strokeWidth="1.5" fill="none"/>
            <path d="M11 2L4 7V20H18V7L11 2Z" fill="rgba(74,127,229,0.1)"/>
            <path d="M9 20V13H13V20" stroke="#4a7fe5" strokeWidth="1.5"/>
            <path d="M11 6L8 9H14L11 6Z" fill="#4a7fe5"/>
            <line x1="7" y1="12" x2="7" y2="12.1" stroke="#4a7fe5" strokeWidth="2" strokeLinecap="round"/>
            <line x1="15" y1="12" x2="15" y2="12.1" stroke="#4a7fe5" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="logo-text">Safar</span>
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