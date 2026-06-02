import './Team.css';

const teamMembers = [
  {
    name: 'Abbisek S',
    role: 'Web Developer',
    initials: 'AS',
    color: '#00d4ff',
    socials: {
      linkedin: 'https://www.linkedin.com/in/abbisek-s-499451387',
      github: 'https://github.com/Warfare06',
      x: 'https://x.com/WaR_FaRe_',
    },
  },
];

export default function Team() {
  return (
    <div className="team-page page-container">
      <section className="team-hero">
        <h1 className="section-title">
          Meet the <span className="text-primary">Astra Maven</span> Team
        </h1>
      </section>

      {/* Team Members */}
      <section className="team-members">
        <div className="team-grid">
          {teamMembers.map((member) => (
            <div key={member.name} className="card member-card">
              <div className="member-avatar" style={{ borderColor: member.color }}>
                <span className="member-initials" style={{ color: member.color }}>{member.initials}</span>
              </div>
              <h3 className="member-name">{member.name}</h3>
              <span className="member-role" style={{ color: member.color }}>{member.role}</span>
              <div className="member-socials">
                {member.socials.github && (
                  <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="member-social-link" aria-label="GitHub">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                )}
                {member.socials.linkedin && (
                  <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="member-social-link" aria-label="LinkedIn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                )}
                {member.socials.x && (
                  <a href={member.socials.x} target="_blank" rel="noopener noreferrer" className="member-social-link" aria-label="X (Twitter)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Join the Team CTA */}
      <section className="team-notice">
        <div className="card team-notice-card">
          <div className="notice-icon">🚀</div>
          <h2 className="notice-title">
            We're growing — join the mission!
          </h2>
          <p className="notice-desc">
            We're actively recruiting talented engineers, analysts, and specialists
            to expand our core team. If you're passionate about space tech, we want
            to hear from you.
          </p>
          <div className="notice-divider" />
          <p className="notice-cta">
            Interested in joining?{' '}
            <a href="/contact" className="text-primary">Contact Us</a> →
          </p>
        </div>
      </section>

      {/* Roles We're Looking For */}
      <section className="team-roles">
        <h2 className="section-title text-center">
          Roles We're <span className="text-secondary-accent">Looking For</span>
        </h2>
        <div className="grid-3" style={{ marginTop: 32 }}>
          {[
            { role: 'Flight Software Engineer', desc: 'Embedded C/C++ for ESP32. FreeRTOS, sensor drivers, MQTT.' },
            { role: 'Data Scientist', desc: 'Sensor fusion, Kalman filtering, flight data analysis.' },
            { role: 'Mechanical Engineer', desc: '3D modeling, structural analysis, parachute design.' },
            { role: 'Communications Lead', desc: 'RF design, antenna optimization, link budget analysis.' },
            { role: 'Ground Station Developer', desc: 'React, Node.js, real-time dashboard development.' },
            { role: 'Project Manager', desc: 'Timeline management, sponsor relations, competition logistics.' },
          ].map((r) => (
            <div key={r.role} className="card role-card">
              <h4 className="role-title">{r.role}</h4>
              <p className="role-desc">{r.desc}</p>
              <a href="/contact" className="btn btn-ghost role-apply">
                Apply →
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
