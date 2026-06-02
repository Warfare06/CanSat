import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would POST to /api/contact
    console.log('Contact form submitted:', form);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="contact-page page-container">
      <section className="contact-hero">
        <h1 className="section-title text-center">
          Get in <span className="text-primary">Touch</span>
        </h1>
        <p className="section-desc" style={{ textAlign: 'center', margin: '0 auto' }}>
          Have questions about our CanSat mission, want to sponsor us, or interested
          in joining the team? We'd love to hear from you.
        </p>
      </section>

      <div className="contact-grid">
        {/* Contact Form */}
        <div className="card contact-form-card">
          <h3 className="card-subtitle" style={{ marginBottom: 24 }}>Send us a message</h3>
          {submitted ? (
            <div className="contact-success">
              <div className="success-icon">✓</div>
              <p className="success-text">Message sent successfully!</p>
              <p className="success-sub">We'll get back to you within 48 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form" id="contact-form">
              <div className="form-group">
                <label htmlFor="contact-name" className="form-label">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email" className="form-label">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-message" className="form-label">Message</label>
                <textarea
                  id="contact-message"
                  className="form-input form-textarea"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your inquiry..."
                  rows={5}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary contact-submit">
                Send Message →
              </button>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div className="contact-info">
          <div className="card info-card">
            <h4 className="info-title">📍 Location</h4>
            <p className="info-text">Department of Aerospace Engineering<br />Chennai, Tamil Nadu, India</p>
          </div>
          <div className="card info-card">
            <h4 className="info-title">📧 Email</h4>
            <p className="info-text">
              <a href="mailto:team@cansatorbital.com">team@cansatorbital.com</a>
            </p>
          </div>
          <div className="card info-card">
            <h4 className="info-title">🌐 Social</h4>
            <div className="info-social">
              <a href="#" className="btn btn-ghost">GitHub</a>
              <a href="#" className="btn btn-ghost">LinkedIn</a>
              <a href="#" className="btn btn-ghost">X</a>
            </div>
          </div>
          <div className="card info-card">
            <h4 className="info-title">⏰ Response Time</h4>
            <p className="info-text">We typically respond within 24–48 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}
