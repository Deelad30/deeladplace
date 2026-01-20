import React, { useState, useEffect } from "react";
import "../styles/landing-page.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserSecret,
  faChartLine,
  faQuestion,
  faBan,
  faTable,
  faUserClock,
  faMoneyCheckDollar,
  faCashRegister,
  faBoxesStacked,
  faChartPie,
  faSearch,
  faArrowRight,
  faPhone,
  faCheckCircle,
  faClock,
  faLaptop,
  faBookOpen,
  faEnvelope,
  faLocationDot
} from "@fortawesome/free-solid-svg-icons";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // Scroll Animation Logic
  useEffect(() => {
    if (loading) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach(section => observer.observe(section));

    return () => sections.forEach(section => observer.unobserve(section));
  }, [loading]);

  useEffect(() => {
    document.title = "DeeSoftwork | Your Business in a Box";
  }, []);

  if (loading) {
    return (
      <div className="preloader">
        <div className="logo-spin"><img src="/logo.png" alt="Logo" style={{ width:"100%" }} /></div>
      </div>
    );
  }

  return (
    <div className="landing">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
            <img src="/logo.png" alt="Logo" style={{ height: "40px" }} />
        </div>

        <nav>
          <a href="#how">How It Works</a>
          <a href="#problem">The Problem</a>
          <a href="#pricing">Pricing</a>
          <a href="#story">Our Story</a>
          <a href="mailto:deeladplacesoftwork@gmail.com" className="nav-cta">Free Profit Audit</a>
        </nav>

        <div className="header-buttons">
          <Link to="/login" style={{ 
            textDecoration: 'none', 
            color: '#333', 
            fontWeight: '600', 
            fontSize: '15px' 
          }}>
            Login
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="hero-wrapper" style={{ 
          backgroundImage: "url('/Hero.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
      }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Why Hard Work When You Can Just Use DeeSoftwork?</h1>
          <p>
            Your all-in-one operating system connecting recipes, sales, stock and profit into 
            one living dashboard. No spreadsheets. No guesswork. Just clarity.
          </p>
          <div className="hero-buttons">
            <a href="mailto:deeladplacesoftwork@gmail.com" className="primary-btn">Book Your Free Profit Audit</a>
            <a href="#pricing" style={{ color: 'white', textDecoration:'underline', fontWeight:'600', marginTop:'14px', display:'inline-block', marginLeft:'20px' }}>Explore Plans</a>
          </div>
        </div>
      </div>

      {/* PROBLEM SECTION */}
      <section className="section bg-pattern-subtle fade-in-section" id="problem">
        <div className="section-header landing-pg">
            <h2>We take the hard work, stress and wahala off your hands</h2>
            <p>This isn’t just hard work. It’s profit leaking every single day.</p>
        </div>
        
        <div className="features-grid">
            {[
                { icon: faUserSecret, text: "I suspect theft but can’t prove it." },
                { icon: faChartLine, text: "Stock never matches sales." },
                { icon: faQuestion, text: "Guessing food costs daily." },
                { icon: faBan, text: "Mid-rush stock-outs are killing us." },
                { icon: faTable, text: "Long nights with messy spreadsheets." },
                { icon: faUserClock, text: "I can't be everywhere but need to know everything." }
            ].map((item, i) => (
                <div key={i} className="fade-in-section" style={{ 
                    padding: '24px', 
                    background: '#f8f9fa', 
                    borderRadius: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    transitionDelay: `${i * 100}ms`
                }}>
                    <FontAwesomeIcon icon={item.icon} style={{ color: '#C81E1E', fontSize: '24px' }} />
                    {item.text}
                </div>
            ))}
        </div>
      </section>

      {/* AUTOMATED PROTECTION SYSTEM */}
      <section className="section" id="how">
        <div className="section-header landing-pg fade-in-section">
            <h2>Your Automated Protection System</h2>
            <p>Everything you need, nothing you don't.</p>
        </div>

        <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
            <div className="premium-card fade-in-section" style={{ transitionDelay: '0ms' }}>
                <FontAwesomeIcon icon={faMoneyCheckDollar} className="icon-yellow" />
                <h3>Perfect Pricing Engine</h3>
                <p>Profit built into every price, automatically. Exact margin targeting with zero guesswork.</p>
            </div>
            <div className="premium-card fade-in-section" style={{ transitionDelay: '100ms' }}>
                <FontAwesomeIcon icon={faSearch} className="icon-yellow" />
                <h3>The 24/7 Loss Detective</h3>
                <p>Compares expected vs. actual usage and flags theft, waste, or error instantly.</p>
            </div>
            <div className="premium-card fade-in-section" style={{ transitionDelay: '200ms' }}>
                <FontAwesomeIcon icon={faCashRegister} className="icon-yellow" />
                <h3>Cash Register Guardian</h3>
                <p>Sales automatically reconciled with cash. Any mismatch becomes visible immediately.</p>
            </div>
            <div className="premium-card fade-in-section" style={{ transitionDelay: '300ms' }}>
                <FontAwesomeIcon icon={faBoxesStacked} className="icon-yellow" />
                <h3>Real-World Stock Control</h3>
                <p>Track stock as you actually work. Manual transfers included. Low-stock alerts built-in.</p>
            </div>
            <div className="premium-card fade-in-section" style={{ transitionDelay: '400ms' }}>
                <FontAwesomeIcon icon={faChartPie} className="icon-yellow" />
                <h3>The Complete Profit Story</h3>
                <p>From product margins to business viability—all synced in one living dashboard.</p>
            </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section bg-pattern-subtle" id="pricing">
        <div className="section-header landing-pg fade-in-section">
            <h2>Choose your path to clarity.</h2>
            <p>Start simple, or scale smart. Every plan includes our "dedicated support week".</p>
        </div>

        <div className="pricing-grid">
            {/* Basic */}
            <div className="premium-card fade-in-section" style={{ paddingTop: '80px', transitionDelay: '0ms' }}>
                <div className="card-header-accent">BASIC</div>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '10px', marginTop: '10px', textAlign: 'center' }}>N10,000<span style={{ fontSize: '1rem', fontWeight: '400' }}>/mo</span></h3>
                <ul style={{ listStyle: 'none', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Smart POS & Sales</li>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Recipe Costing</li>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Basic Reports</li>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Stock Inventory</li>
                </ul>
                <Link to="/login" className="btn-yellow" style={{ marginTop: 'auto' }}>Get Started</Link>
            </div>

            {/* Pro */}
            <div className="premium-card fade-in-section" style={{ paddingTop: '80px', transform: 'scale(1.05)', zIndex: 2, transitionDelay: '150ms' }}>
                <div className="card-header-accent" style={{ background: 'white', color: '#D91F22' }}>PRO (POPULAR)</div>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '10px', marginTop: '10px', textAlign: 'center' }}>N20,000<span style={{ fontSize: '1rem', fontWeight: '400' }}>/mo</span></h3>
                <ul style={{ listStyle: 'none', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Everything in Basic</li>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Multi-store & Vendors</li>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Advanced Reports</li>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Priority Support</li>
                </ul>
                <Link to="/login" className="btn-yellow" style={{ background:'white', color:'#D91F22', marginTop: 'auto' }}>Get Pro Control</Link>
            </div>

            {/* Enterprise */}
            <div className="premium-card fade-in-section" style={{ paddingTop: '80px', transitionDelay: '300ms' }}>
                <div className="card-header-accent">ENTERPRISE</div>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '10px', marginTop: '10px', textAlign: 'center' }}>Custom</h3>
                <ul style={{ listStyle: 'none', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Direct API Access</li>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Custom Features</li>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> 24/7 Priority Support</li>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Dedicated Manager</li>
                </ul>
                <a href="mailto:deeladplacesoftwork@gmail.com" className="btn-yellow" style={{ marginTop: 'auto' }}>Contact Us</a>
            </div>
        </div>
      </section>

      {/* FOUNDER STORY */}
      <section className="section bg-pattern-subtle fade-in-section" id="story">
        <div className="section-header landing-pg">
            <h2>We didn’t imagine the problem, we lived it!</h2>
        </div>

        <div className="story-layout">
            <div className="founder-image-wrapper">
                <img src="/founder.png" alt="Shuaib Oladunni" />
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <h3>Shuaib Oladunni</h3>
                    <p style={{ color: '#666' }}>Founder & Fellow F&B Owner</p>
                </div>
            </div>

            <div style={{ background: '#f8f9fa', padding: '40px', borderRadius: '24px' }}>
                <p style={{ fontSize: '1.25rem', lineHeight: '1.8', fontStyle: 'italic', marginBottom: '24px' }}>
                    "I'm not just the founder; I'm your fellow business owner. I built DeeSoftwork because I needed it for my own food hub, Deelad Place, to solve my own daily frustrations — the 'spreadsheet nights', the unexplained stock shortages, the pricing guesswork."
                </p>
                <p style={{ fontSize: '1.1rem', color: '#444' }}>
                    This is all my Excel sheets integrated into one automated system. This isn't theoretical software. It's the exact system I use to run my own business successfully.
                </p>
            </div>
        </div>
      </section>

      {/* ONBOARDING */}
      <section className="section" id="onboarding">
        <div className="section-header landing-pg fade-in-section">
            <h2>Onboard in week. Master in a day!</h2>
            <p>We hold your hand through launch, dedicated week, simple setup, live tutorial, and your first eye-opening report within days.</p>
        </div>

        <div className="onboarding-grid">
            <div className="premium-card fade-in-section" style={{ background: '#C81E1E', transitionDelay: '0ms' }}>
                 <div className="step-list">
                    <div className="step-item">
                        <div className="step-icon" style={{ background: 'white', color: '#C81E1E' }}><FontAwesomeIcon icon={faClock} /></div>
                        <div>
                            <h4>Your dedicated week</h4>
                            <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>A direct line to our team for setup and data onboarding</p>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-icon" style={{ background: 'white', color: '#C81E1E' }}><FontAwesomeIcon icon={faLaptop} /></div>
                        <div>
                            <h4>Simple setup</h4>
                            <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>We help input your menu and recipes, its as easy as writing them down</p>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-icon" style={{ background: 'white', color: '#C81E1E' }}><FontAwesomeIcon icon={faBookOpen} /></div>
                        <div>
                            <h4>Live tutorial</h4>
                            <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>Clear videos, and walk through for every feature</p>
                        </div>
                    </div>
                 </div>
            </div>

            <div className="testimonial-card fade-in-section" style={{ transitionDelay: '200ms' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                         <img src="/founder.png" alt="User" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #FFD700', objectFit: 'cover' }} />
                         <div>
                            <h4>Oladunni Shuaib</h4>
                            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Owner Deelad Place</span>
                         </div>
                    </div>
                    <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
                        "Since using DeeSoftwork at Deelad Place, we reduce unexplained stock variance by 40% in the first month. Finally, I have clarity instead of guess work."
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* FINAL DUAL CTA */}
      <section className="section bg-pattern-subtle" id="final-cta">
        <div className="section-header landing-pg fade-in-section">
            <h2>Why keep doing the hard work?</h2>
            <p>You built an amazing business. It deserves tools that work as hard as you do.</p>
        </div>

        <div className="dual-cta-grid">
            <div className="premium-card fade-in-section" style={{ transitionDelay: '0ms' }}>
                <h3>Ready to automate?</h3>
                <p style={{ margin: '16px 0 30px', opacity: 0.9 }}>Start with the most popular plan and get your business-in-a-box now.</p>
                <ul style={{ listStyle: 'none', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Most popular plan pre-configured</li>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Dedicated onboarding week</li>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Priority support</li>
                </ul>
                <Link to="/login" className="btn-yellow">Get Started with Pro Plan</Link>
            </div>

            <div className="premium-card fade-in-section" style={{ transitionDelay: '200ms' }}>
                <h3>Want to see your exact solution?</h3>
                <p style={{ margin: '16px 0 30px', opacity: 0.9 }}>Spend 20-Minutes with our founder. Identify your profit leaks, and see the fix.</p>
                <ul style={{ listStyle: 'none', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> 20-Minutes custom audit</li>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> No sales pitch</li>
                    <li><FontAwesomeIcon icon={faCheckCircle} /> Clear roadmap to fix leaks</li>
                </ul>
                <a href="mailto:deeladplacesoftwork@gmail.com" className="btn-yellow">Book Your Audit</a>
            </div>
        </div>
      </section>

      {/* PREMIUM FOOTER */}
      <footer className="premium-footer fade-in-section">
        <div className="footer-content">
            <div className="footer-brand">
                <img src="/logo.png" alt="DeeSoftwork" style={{ height: '40px', marginBottom:'20px', filter:'brightness(0) invert(1)' }} />
                <p>The all-in-one operating system for African F&B businesses. Built by owners, for owners.</p>
            </div>
            <div className="footer-col">
                <h4>Product</h4>
                <ul>
                    <li><a href="#how">How It Works</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="#">Inventory</a></li>
                    <li><a href="#">Reports</a></li>
                </ul>
            </div>
            <div className="footer-col">
                <h4>Company</h4>
                <ul>
                    <li><a href="#story">Our Story</a></li>
                    <li><a href="#">Careers</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms of Service</a></li>
                </ul>
            </div>
            <div className="footer-col">
                <h4>Contact</h4>
                <ul>
                    <li><a href="mailto:deesoftwork@gmail.com"><FontAwesomeIcon icon={faEnvelope} /> deesoftwork@gmail.com</a></li>
                    <li><a href="#"><FontAwesomeIcon icon={faPhone} /> +234 803 892 4869</a></li>
                    <li><a href="#"> Made with ❤️ in Nigeria</a></li>
                </ul>
            </div>
        </div>
        <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} DeeSoftwork. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '20px' }}>
                <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Twitter</a>
                <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>LinkedIn</a>
                <a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Instagram</a>
            </div>
        </div>
      </footer>
    </div>
  );
}


