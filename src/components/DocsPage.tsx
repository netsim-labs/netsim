import React from 'react';
import './DocsPage.css';

export const DocsPage: React.FC = () => {
  return (
    <div className="docs-page">
      <header className="docs-hero">
        <div className="docs-container">
          <div className="docs-hero__shell">
            <div className="docs-eyebrow">
              <span className="docs-pill docs-pill--glow">New Labs UX</span>
              <span className="docs-pill docs-pill--ghost">Automatic verification</span>
              <span className="docs-pill docs-pill--ghost">Authentic Huawei / Cisco CLI</span>
            </div>
            <h1>NetSim.dev — Documentation and Labs</h1>
            <p>100% web network simulator with guided paths, gamified labs, and technical guides ready to certify you in HCIA, HCIP, and CCNA.</p>
            <div className="docs-cta-group">
              <a className="docs-cta docs-cta--primary" href="#labs">Explore Labs</a>
              <a className="docs-cta docs-cta--ghost" href="http://localhost:5173/docs/index.html" target="_blank" rel="noopener noreferrer">
                View full documentation (HTML) →
              </a>
            </div>
            <div className="docs-hero__meta">
              <div className="docs-meta-card">
                <div className="docs-meta-label">Difficulties</div>
                <div className="docs-meta-value">Basic · Intermediate · Advanced</div>
              </div>
              <div className="docs-meta-card">
                <div className="docs-meta-label">Vendors</div>
                <div className="docs-meta-value">Huawei VRP · Cisco IOS (real multivendor)</div>
              </div>
              <div className="docs-meta-card">
                <div className="docs-meta-label">Labs Mode</div>
                <div className="docs-meta-value">Automatic verification + stars + hints</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="docs-container">
        <section className="docs-section">
          <div className="docs-section__header">
            <div>
              <h2 className="docs-section__title">Main Paths</h2>
              <p className="docs-section__subtitle">Start fast or dive deep into protocols, CLI, and certifications.</p>
            </div>
            <span className="docs-pill docs-pill--ghost">Updated 2026</span>
          </div>
          <div className="docs-grid">
            <div className="docs-card">
              <div className="docs-chip docs-chip--accent">Getting Started</div>
              <h3 className="docs-card__title">Guided Onboarding</h3>
              <p className="docs-card__desc">Configure your environment, understand the interface, and deploy your first topology in minutes.</p>
              <div className="docs-card__footer">
                <a className="docs-lab-link" href="#getting-started">Start</a>
                <span className="docs-chip docs-chip--success">4 modules</span>
              </div>
            </div>
            <div className="docs-card">
              <div className="docs-chip docs-chip--accent">Technical Guides</div>
              <h3 className="docs-card__title">Protocols and CLI</h3>
              <p className="docs-card__desc">OSPF, STP, VLANs, LACP, VRRP, and Huawei/Cisco CLI reference with proven examples.</p>
              <div className="docs-card__footer">
                <a className="docs-lab-link" href="#technical-guides">View guides</a>
                <span className="docs-chip">CLI · Protocols</span>
              </div>
            </div>
            <div className="docs-card">
              <div className="docs-chip docs-chip--accent">Labs</div>
              <h3 className="docs-card__title">Gamified Labs</h3>
              <p className="docs-card__desc">Scenarios with automatic verification, star scoring, and step-by-step suggested commands.</p>
              <div className="docs-card__footer">
                <a className="docs-lab-link" href="#labs">Explore Labs</a>
                <span className="docs-chip docs-chip--warn">Time: 20-60 min</span>
              </div>
            </div>
            <div className="docs-card">
              <div className="docs-chip docs-chip--accent">Certifications</div>
              <h3 className="docs-card__title">Paths by Exam</h3>
              <p className="docs-card__desc">HCIA, HCIP, CCNA, and Network+ with labs aligned to official topics.</p>
              <div className="docs-card__footer">
                <a className="docs-lab-link" href="#certifications">View paths</a>
                <span className="docs-chip docs-chip--success">6 tracks</span>
              </div>
            </div>
          </div>
        </section>

        <section id="getting-started" className="docs-section">
          <div className="docs-section__header">
            <div>
              <h2 className="docs-section__title">Getting Started</h2>
              <p className="docs-section__subtitle">Learn the interface, create your initial topology, and practice base commands.</p>
            </div>
            <span className="docs-pill docs-pill--ghost">Guided onboarding</span>
          </div>
          <div className="docs-grid">
            <div className="docs-card">
              <div className="docs-chip">01</div>
              <h3 className="docs-card__title">Introduction to NetSim</h3>
              <p className="docs-card__desc">What is NetSim.dev, use cases, and how it compares to Packet Tracer or EVE-NG.</p>
              <a className="docs-lab-link" href="#">Read introduction</a>
            </div>
            <div className="docs-card">
              <div className="docs-chip">02</div>
              <h3 className="docs-card__title">Your first topology</h3>
              <p className="docs-card__desc">Add devices, connect ports, and configure basic IPs with the visual inspector.</p>
              <a className="docs-lab-link" href="#">Build topology</a>
            </div>
            <div className="docs-card">
              <div className="docs-chip">03</div>
              <h3 className="docs-card__title">Basic CLI</h3>
              <p className="docs-card__desc">Navigation, configuration modes, and essential troubleshooting in Huawei and Cisco.</p>
              <a className="docs-lab-link" href="#">Practice CLI</a>
            </div>
            <div className="docs-card">
              <div className="docs-chip">04</div>
              <h3 className="docs-card__title">Troubleshooting</h3>
              <p className="docs-card__desc">Ping, traceroute, show commands, and Packet Inspector to isolate faults quickly.</p>
              <a className="docs-lab-link" href="#">Diagnose</a>
            </div>
          </div>
        </section>

        <section id="labs" className="docs-section">
          <div className="docs-section__header">
            <div>
              <h2 className="docs-section__title">Gamified Labs</h2>
              <p className="docs-section__subtitle">Inspired by skills.google: clean cards, clear tags, and direct CTA to each challenge.</p>
            </div>
            <span className="docs-pill docs-pill--glow">Automatic verification</span>
          </div>
          <div className="docs-labs-grid">
            <div className="docs-lab-card">
              <div className="docs-lab-card__head">
                <h3 className="docs-lab-card__title">Basic Campus LAN</h3>
                <span className="docs-difficulty basic">BASIC</span>
              </div>
              <p className="docs-lab-card__desc">Configure VLANs, trunking, and basic connectivity between switches and PCs.</p>
              <div className="docs-lab-card__meta">
                <span className="docs-chip">HCIA</span>
                <span className="docs-chip docs-chip--success">~30 min</span>
                <span className="docs-chip docs-chip--accent">3 key steps</span>
              </div>
              <div className="docs-lab-card__actions">
                <a className="docs-lab-link" href="#">Start lab</a>
                <span className="docs-chip docs-chip--warn">⭐ ⭐ ⭐</span>
              </div>
            </div>
            <div className="docs-lab-card">
              <div className="docs-lab-card__head">
                <h3 className="docs-lab-card__title">OSPF Single Area</h3>
                <span className="docs-difficulty intermediate">INTERMEDIATE</span>
              </div>
              <p className="docs-lab-card__desc">Build neighbors, configure timers, and verify LSDB in a simple network.</p>
              <div className="docs-lab-card__meta">
                <span className="docs-chip">HCIP</span>
                <span className="docs-chip docs-chip--success">~40 min</span>
                <span className="docs-chip docs-chip--accent">Guided CLI</span>
              </div>
              <div className="docs-lab-card__actions">
                <a className="docs-lab-link" href="#">Start lab</a>
                <span className="docs-chip docs-chip--warn">⭐ ⭐</span>
              </div>
            </div>
            <div className="docs-lab-card">
              <div className="docs-lab-card__head">
                <h3 className="docs-lab-card__title">STP and Redundancy</h3>
                <span className="docs-difficulty intermediate">INTERMEDIATE</span>
              </div>
              <p className="docs-lab-card__desc">Protect your campus with STP and priority settings for the root bridge.</p>
              <div className="docs-lab-card__meta">
                <span className="docs-chip">HCIA</span>
                <span className="docs-chip docs-chip--success">~35 min</span>
                <span className="docs-chip docs-chip--accent">Visual checklist</span>
              </div>
              <div className="docs-lab-card__actions">
                <a className="docs-lab-link" href="#">Start lab</a>
                <span className="docs-chip docs-chip--warn">⭐ ⭐</span>
              </div>
            </div>
            <div className="docs-lab-card">
              <div className="docs-lab-card__head">
                <h3 className="docs-lab-card__title">DHCP and Services</h3>
                <span className="docs-difficulty intermediate">INTERMEDIATE</span>
              </div>
              <p className="docs-lab-card__desc">Pool, helper, NAT, and lease verification for essential services.</p>
              <div className="docs-lab-card__meta">
                <span className="docs-chip">CCNA</span>
                <span className="docs-chip docs-chip--success">~45 min</span>
                <span className="docs-chip docs-chip--accent">Live validation</span>
              </div>
              <div className="docs-lab-card__actions">
                <a className="docs-lab-link" href="#">Start lab</a>
                <span className="docs-chip docs-chip--warn">⭐ ⭐</span>
              </div>
            </div>
          </div>
        </section>

        <section id="certifications" className="docs-section">
          <div className="docs-section__header">
            <div>
              <h2 className="docs-section__title">Certifications and Paths</h2>
              <p className="docs-section__subtitle">Certification tracks with labs aligned to the official blueprint.</p>
            </div>
            <span className="docs-pill docs-pill--ghost">HCIA · HCIP · HCIE · CCNA · Network+</span>
          </div>
          <div className="docs-cert-grid">
            <div className="docs-cert-card">
              <div className="docs-chip docs-chip--accent">Huawei</div>
              <h3 className="docs-cert-card__title">HCIA Datacom</h3>
              <p className="docs-cert-card__desc">Switching, routing, and base services fundamentals.</p>
              <a className="docs-lab-link" href="#">View path</a>
            </div>
            <div className="docs-cert-card">
              <div className="docs-chip docs-chip--accent">Huawei</div>
              <h3 className="docs-cert-card__title">HCIP Datacom</h3>
              <p className="docs-cert-card__desc">Intermediate scenarios with OSPF, LACP, QoS, and security.</p>
              <a className="docs-lab-link" href="#">View path</a>
            </div>
            <div className="docs-cert-card">
              <div className="docs-chip docs-chip--accent">Cisco</div>
              <h3 className="docs-cert-card__title">CCNA</h3>
              <p className="docs-cert-card__desc">Cisco CLI, campus design, and basic security practices.</p>
              <a className="docs-lab-link" href="#">View path</a>
            </div>
          </div>
        </section>

        <section id="technical-guides" className="docs-section">
          <div className="docs-section__header">
            <div>
              <h2 className="docs-section__title">Technical Guides</h2>
              <p className="docs-section__subtitle">Living reference of CLI, protocols, and automation.</p>
            </div>
            <span className="docs-pill docs-pill--ghost">CLI · Protocols · APIs</span>
          </div>
          <div className="docs-grid">
            <div className="docs-card">
              <div className="docs-chip">CLI</div>
              <h3 className="docs-card__title">CLI Command Reference</h3>
              <p className="docs-card__desc">All supported commands in Huawei and Cisco with ready examples.</p>
              <a className="docs-lab-link" href="#">Open reference</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="docs-footer">
        <p>&copy; 2026 NetSim.dev — Web Network Simulator</p>
        <p>Open and collaborative documentation</p>
      </footer>
    </div>
  );
};