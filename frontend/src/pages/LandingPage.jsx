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
  faSatelliteDish,
  faCashRegister,
  faBoxesStacked,
  faChartPie,
  faBookOpen,
  faListCheck,
  faCircleDot,
  faShieldHalved,
  faSearch,
  faArrowRight,
  faUser,
  faLaptop,
  faCheckCircle,
  faClock,
  faHandshake,
  faCalendarCheck,
  faPhone,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";

export default function LandingPage() {
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = "DeeSoftwork | Your Business in a Box";
    const meta = document.createElement("meta");
    meta.name = "description";
    meta.content = "Your all-in-one system for automated restaurant clarity, control and profit protection.";
    document.head.appendChild(meta);
  }, []);
  const itemStyle = {
  background: "#f9f9f9",
  padding: "22px 20px",
  borderRadius: "14px",
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#222",
  textAlign: "left",
  display: "flex",
  alignItems: "flex-start",
  gap: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const iconStyle = {
  fontSize: "20px",
  color: "#555",
  marginTop: "2px"
};

const moduleCard = {
  padding: "34px 28px",
  borderRadius: "18px",
  background: "rgb(250, 250, 250)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  textAlign: "left",
  transition: "all 0.3s ease",
  cursor: "default",
};

const moduleIcon = {
  fontSize: "34px",
  color: "#111",
  marginBottom: "20px",
};

const moduleTitle = {
  fontSize: "22px",
  fontWeight: "600",
  marginBottom: "10px",
  color: "#111",
};

const moduleText = {
  fontSize: "16px",
  lineHeight: "1.55",
  color: "#444",
};

const sectionStyle = {
  padding: "50px 20px",
  maxWidth: "1150px",
  margin: "0 auto",
};

const headlineStyle = {
  fontSize: "46px",
  fontWeight: "700",
  color: "#222",
  textAlign: "center",
  marginBottom: "60px",
  letterSpacing: "-0.7px",
  lineHeight: "1.15",
  fontFamily: "'Inter', sans-serif",
};

const subStyle = {
  fontSize: "20px",
  textAlign: "center",
  color: "#555",
  maxWidth: "700px",
  margin: "0 auto 50px",
  lineHeight: "1.55",
};

const card = {
  background: "#fff",
  padding: "32px 28px",
  borderRadius: "22px",
  boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
  border: "1px solid rgba(0,0,0,0.05)",
};

const icon = {
  fontSize: "32px",
  color: "#ff385c", // Airbnb signature red
  marginBottom: "18px",
};

const accent = "#ff385c"; // warm accent (Airbnb-ish)
const muted = "#6b7280";

/* button styles */
const primaryBtn = {
  display: "inline-block",
  padding: "12px 20px",
  borderRadius: "12px",
  background: accent,
  color: "#fff",
  fontWeight: 600,
  textDecoration: "none",
  boxShadow: "0 6px 18px rgba(255,56,92,0.14)",
};

const secondaryBtn = {
  display: "inline-block",
  padding: "12px 20px",
  borderRadius: "12px",
  background: "transparent",
  color: "#111",
  fontWeight: 600,
  textDecoration: "none",
  border: "1px solid rgba(0,0,0,0.06)",
};

/* small util */
const sectionDivider = { height: "20px" };



  if (loading) {
    return (
      <div className="preloader">
        <div className="logo-spin"><img src="/logo.png" alt="Logo" style={{ width:"250px" }} /></div>
      </div>
    );
  }

  return (
    <div className={`landing ${dark ? "dark" : ""}`}>
      <header className="header">
        <div className="logo"><img src="/logo.png" alt="Logo" style={{ width:"250px" }} /></div>

        <nav>
          <a href="#how">How It Works</a>
          <a href="#problem">The Problem</a>
          <a href="#pricing">Pricing</a>
          <a href="#story">Our Story</a>
          <a style={{marginTop:"-9px", backgroundColor:"#d91f22", color:"#fff", fontWeight:"700", border:"1px solid #d91f22"}} href="#audit" className="nav-cta">Free Profit Audit</a>
        </nav>

        <div   style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
  }} className="header-buttons">
          <Link to="/login"  style={{
      padding: "13px 26px",
      backgroundColor: "#d91f22",
      color: "#fff",
      borderRadius: "6px",
      textDecoration: "none",
      fontWeight: "600",
      fontSize: "14px"
    }} className="login-btn">Login</Link>
        </div>
      </header>

      {/* HERO */}
      <div style={{
        background:"url('/logo.png') center center/cover",
        height:"80vh"
      }}>
      <section className="hero" id="hero">
        <h1>Why hard work when you can just DeeSoftwork?</h1>
        <p>
          Your all-in-one operating system connecting recipes, sales, stock and profit into 
          one living dashboard. No spreadsheets. No guesswork. Just clarity.
        </p>

        <div className="hero-buttons">
          <a href="#audit" className="primary-btn">Book Your Free Profit Audit</a>
          <a href="#pricing" className="secondary-btn">Explore Plans</a>
        </div>
      </section>
      </div>

      {/* PROBLEM */}
<section
  className="problem"
  id="problem"
  style={{
    padding: "40px 20px",
    maxWidth: "900px",
    margin: "0 auto",
    textAlign: "center",
  }}
>
  <h2
    style={{
      fontSize: "42px",
      fontWeight: "600",
      marginBottom: "60px",
      lineHeight: "1.2",
      color: "#111",
      letterSpacing: "-0.5px",
    }}
  >
    We take the hard work, stress and wahala off your hands
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "28px",
      marginBottom: "50px",
    }}
  >
    <div style={itemStyle}>
      <FontAwesomeIcon icon={faUserSecret} style={iconStyle} />
      I suspect theft but can’t prove it.
    </div>

    <div style={itemStyle}>
      <FontAwesomeIcon icon={faChartLine} style={iconStyle} />
      Stock never matches sales.
    </div>

    <div style={itemStyle}>
      <FontAwesomeIcon icon={faQuestion} style={iconStyle} />
      Guessing food costs daily.
    </div>

    <div style={itemStyle}>
      <FontAwesomeIcon icon={faBan} style={iconStyle} />
      Mid-rush stock-outs are killing us.
    </div>

    <div style={itemStyle}>
      <FontAwesomeIcon icon={faTable} style={iconStyle} />
      Long nights with messy spreadsheets.
    </div>

    <div style={itemStyle}>
      <FontAwesomeIcon icon={faUserClock} style={iconStyle} />
      I can't be everywhere but need to know everything.
    </div>
  </div>

  <p
    style={{
      fontSize: "20px",
      color: "#333",
      maxWidth: "650px",
      margin: "0 auto",
      lineHeight: "1.6",
      fontWeight: "500",
    }}
  >
    This isn’t just hard work. It’s profit leaking every single day.
  </p>
</section>



{/*  One Dashboard */}

<section style={sectionStyle}>

  <h2 style={headlineStyle}>One Dashboard. One Truth. Zero Spreadsheets.</h2>

  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "34px",
    marginBottom: "60px",
  }}>

    <div style={card}>
      <FontAwesomeIcon icon={faBookOpen} style={icon} />
      <h3 style={{ fontSize: "20px", fontWeight: "600" }}>Your Recipes + Costs</h3>
      <p style={{ color: "#555", lineHeight: "1.55" }}>Input once</p>
    </div>

    <div style={card}>
      <FontAwesomeIcon icon={faBoxesStacked} style={icon} />
      <h3 style={{ fontSize: "20px", fontWeight: "600" }}>Live Sales + Stock Movements</h3>
      <p style={{ color: "#555", lineHeight: "1.55" }}>Automatically tracked</p>
    </div>

    <div style={card}>
      <FontAwesomeIcon icon={faChartLine} style={icon} />
      <h3 style={{ fontSize: "20px", fontWeight: "600" }}>Intelligent Dashboard</h3>
      <p style={{ color: "#555", lineHeight: "1.55" }}>Profit • Alerts • Insights</p>
    </div>

  </div>

  <p style={subStyle}>
    We replace your manual calculations with automatic intelligence. Once you set up your recipes
    and costs, DeeSoftwork becomes your 24/7 financial detective, comparing what should happen
    with what actually happens, and flagging discrepancies in real-time.
  </p>
</section>

{/*Automated Profits sections  */}

<section style={sectionStyle}>

  <h2 style={headlineStyle}>Your Automated Profit Protection System</h2>

  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "34px",
  }}>

    <div style={card}>
      <FontAwesomeIcon icon={faMoneyCheckDollar} style={icon} />
      <h3>Perfect Pricing Engine</h3>
      <p>Profit built into every price, automatically. Exact margin targeting with zero guesswork.</p>
    </div>

    <div style={card}>
      <FontAwesomeIcon icon={faSearch} style={icon} />
      <h3>The 24/7 Loss Detective</h3>
      <p>Compares expected vs. actual usage and flags theft, waste, or error instantly.</p>
    </div>

    <div style={card}>
      <FontAwesomeIcon icon={faCashRegister} style={icon} />
      <h3>Cash Register Guardian</h3>
      <p>Sales automatically reconciled with cash. Any mismatch becomes visible immediately.</p>
    </div>

    <div style={card}>
      <FontAwesomeIcon icon={faBoxesStacked} style={icon} />
      <h3>Real-World Stock Control</h3>
      <p>Track stock as you actually work. Manual transfers included. Low-stock alerts built-in.</p>
    </div>

    <div style={card}>
      <FontAwesomeIcon icon={faChartPie} style={icon} />
      <h3>The Complete Profit Story</h3>
      <p>From product margins to business viability—all synced in one living dashboard.</p>
    </div>

  </div>
</section>

{/*Dashboard Preview */}

<section style={sectionStyle}>

  <h2 style={headlineStyle}>Everything You Need, Nothing You Don’t</h2>

  <div style={{
    background: "#fff",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 8px 28px rgba(0,0,0,0.06)",
  }}>
    <img 
      src="/dashboard-preview.png"
      alt="Dashboard"
      style={{ width: "100%", borderRadius: "16px", marginBottom: "30px" }}
    />

    <ul style={{
      listStyle: "none",
      padding: 0,
      margin: 0,
      lineHeight: "1.7",
      color: "#555"
    }}>
      <li><strong>Today’s Profit at a Glance:</strong> Instant clarity</li>
      <li><strong>Active Alerts:</strong> Variances needing attention</li>
      <li><strong>Stock Health:</strong> Low-stock items highlighted</li>
    </ul>
  </div>

  <p style={subStyle}>What you see each morning clear, intelligent, ready.</p>
</section>


<>
    {/* ---------------- SECTION 6 — PRICING + DECISION BRIDGE ---------------- */}
    <section style={sectionStyle} id="pricing">
      <h2 style={headlineStyle}>Choose Your Path to Clarity.</h2>
      <p style={subStyle}>
        Start simple or scale smart. Every plan includes our <strong>“Dedicated Support Week”</strong> onboarding.
      </p>

      {/* Pricing grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "24px",
          alignItems: "stretch",
          marginBottom: "28px",
        }}
      >
        {/* Basic */}
        <div style={{ ...card, padding: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <div style={{ fontSize: "13px", color: muted, fontWeight: 600 }}>Basic</div>
              <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "8px" }}>N10,000<span style={{ fontSize: 14, color: muted, fontWeight: 600 }}> / month</span></div>
            </div>
            <div style={{ textAlign: "right", color: muted, fontSize: "13px" }}>Best For<br/><span style={{ fontWeight: 600 }}>Single-location spots</span></div>
          </div>

          <hr style={{ border: "none", height: "1px", background: "rgba(0,0,0,0.04)", margin: "14px 0 18px" }} />

          <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#444", lineHeight: "1.9" }}>
            <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 10 }} /> Smart POS & Sales Tracking</li>
            <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 10 }} /> Recipe-based costing module</li>
            <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 10 }} /> Basic reports & expense tracker</li>
            <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 10 }} /> Add 1 vendor/store</li>
          </ul>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <a href="#audit" style={secondaryBtn}>Start with Basics</a>
          </div>
        </div>

        {/* Pro — highlighted */}
        <div style={{ ...card, padding: "34px", transform: "translateY(-8px)", border: `1px solid rgba(255,56,92,0.16)`, boxShadow: "0 12px 34px rgba(255,56,92,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <div style={{ fontSize: "13px", color: muted, fontWeight: 600 }}>Pro — Most Popular</div>
              <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "8px" }}>N20,000<span style={{ fontSize: 14, color: muted, fontWeight: 600 }}> / month</span></div>
            </div>
            <div style={{ textAlign: "right", color: muted, fontSize: "13px" }}>Best For<br/><span style={{ fontWeight: 600 }}>Growing businesses</span></div>
          </div>

          <hr style={{ border: "none", height: "1px", background: "rgba(255,56,92,0.06)", margin: "14px 0 18px" }} />

          <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#444", lineHeight: "1.95" }}>
            <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 10 }} /> Everything in Basic</li>
            <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 10 }} /> Multi-store & vendor management</li>
            <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 10 }} /> Advanced custom reports</li>
            <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 10 }} /> Priority support & staff training</li>
          </ul>

          <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center" }}>
            <a href="#get-pro" style={primaryBtn}>Get Pro Control</a>
            <a href="#audit" style={{ ...secondaryBtn, padding: "12px 18px" }}>Book Audit</a>
          </div>

          <div style={{ marginTop: "18px", textAlign: "center", color: muted, fontSize: "13px" }}>
            Try risk-free. Cancel anytime.
          </div>
        </div>

        {/* Enterprise */}
        <div style={{ ...card, padding: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <div style={{ fontSize: "13px", color: muted, fontWeight: 600 }}>Enterprise</div>
              <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "8px" }}>Custom<span style={{ fontSize: 14, color: muted, fontWeight: 600 }}> / month</span></div>
            </div>
            <div style={{ textAlign: "right", color: muted, fontSize: "13px" }}>Best For<br/><span style={{ fontWeight: 600 }}>Large chains & franchises</span></div>
          </div>

          <hr style={{ border: "none", height: "1px", background: "rgba(0,0,0,0.04)", margin: "14px 0 18px" }} />

          <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#444", lineHeight: "1.9" }}>
            <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 10 }} /> Everything in Pro</li>
            <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 10 }} /> Direct API access</li>
            <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 10 }} /> Custom feature development</li>
            <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 10 }} /> 24/7 priority support</li>
          </ul>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <a href="#contact" style={secondaryBtn}>Contact for Scale</a>
          </div>
        </div>
      </div>

      {/* Decision Bridge */}
      <div style={{ ...card, marginTop: "18px", display: "flex", gap: "20px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 520px" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>Not sure where to start?</div>
          <div style={{ color: muted, fontSize: "15px" }}>
            Book a <strong>20-minute Free Profit Audit</strong> with founder Shuaib. We'll analyze your #1 challenge and map out your solution. No sales pitch — just a clear path forward.
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <a href="#audit" style={primaryBtn}><FontAwesomeIcon icon={faCalendarCheck} style={{ marginRight: 10 }} /> Book Your Free Profit Audit</a>
        </div>
      </div>
    </section>

    <div style={sectionDivider}></div>

    {/* ---------------- SECTION 7 — FOUNDER STORY ---------------- */}
    <section style={sectionStyle} id="founder">
      <h2 style={headlineStyle}>We didn't imagine the problem. We lived it.</h2>
      <div style={{ display: "flex", gap: "28px", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
        {/* Photo */}
        <div style={{ flex: "0 0 220px", textAlign: "center" }}>
          <img
            src="/shuaib-photo.jpg"
            alt="Shuaib Oladunni — Founder"
            style={{ width: "220px", height: "220px", objectFit: "cover", borderRadius: "16px", boxShadow: "0 12px 30px rgba(12,20,30,0.08)", border: "4px solid #fff" }}
          />
          <div style={{ marginTop: "12px", fontWeight: 700 }}>Shuaib Oladunni</div>
          <div style={{ color: muted, fontSize: "14px" }}>Founder & Fellow F&amp;B Owner</div>
        </div>

        {/* Story */}
        <div style={{ flex: "1 1 560px", ...card }}>
          <p style={{ fontSize: "18px", lineHeight: 1.7, color: "#222" }}>
            <em>
              "I'm not just the founder; I'm your fellow business owner. I built DeeSoftwork because I needed it for my own food hub, Deelad Place, to solve my own daily frustrations — the 'spreadsheet nights', the unexplained stock shortages, the pricing guesswork. This is all my Excel sheets integrated into one automated system. This isn't theoretical software. It's the exact system I use to run my own business successfully."
            </em>
          </p>

          <div style={{ display: "flex", gap: "24px", marginTop: "18px", flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>Owner of:</div>
              <div style={{ color: muted }}>Deelad Place (5+ years)</div>
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>Lives the ops:</div>
              <div style={{ color: muted }}>Daily F&amp;B operations & inventory</div>
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>Mission:</div>
              <div style={{ color: muted }}>Automate complexity for business owners</div>
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
            <a href="#audit" style={primaryBtn}><FontAwesomeIcon icon={faUser} style={{ marginRight: 10 }} /> Talk to Shuaib</a>
            <a href="#contact" style={secondaryBtn}><FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 8 }} /> Contact</a>
          </div>
        </div>
      </div>
    </section>

    <div style={sectionDivider}></div>

    {/* ---------------- SECTION 8 — ONBOARDING PROMISE ---------------- */}
    <section style={sectionStyle} id="onboarding">
      <h2 style={headlineStyle}>Onboard in a Week, Master in a Day.</h2>
      <p style={subStyle}>We hold your hand through launch — dedicated week, simple setup, live tutorials, and your first eye-opening report within days.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px", alignItems: "start" }}>
        {/* Left: Steps */}
        <div style={{ ...card }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ fontSize: "28px", color: accent }}><FontAwesomeIcon icon={faClock} /></div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Your Dedicated Week</div>
              <div style={{ color: muted }}>A direct line to our team for setup and data onboarding.</div>
            </div>
          </div>

          <div style={{ height: 14 }} />

          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ fontSize: "28px", color: accent }}><FontAwesomeIcon icon={faLaptop} /></div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Simple Setup</div>
              <div style={{ color: muted }}>We help input your menu and recipes — it’s as easy as writing them down.</div>
            </div>
          </div>

          <div style={{ height: 14 }} />

          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ fontSize: "28px", color: accent }}><FontAwesomeIcon icon={faBookOpen} /></div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Live Tutorials</div>
              <div style={{ color: muted }}>Clear videos and walkthroughs for every feature.</div>
            </div>
          </div>

          <div style={{ height: 14 }} />

          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ fontSize: "28px", color: accent }}><FontAwesomeIcon icon={faCheckCircle} /></div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Your First Clear Report</div>
              <div style={{ color: muted }}>An actionable profit insight delivered within days.</div>
            </div>
          </div>
        </div>

        {/* Right: Testimonial */}
        <div style={{ ...card, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "16px", color: muted, marginBottom: 12 }}>Testimonial</div>
            <blockquote style={{ margin: 0, fontStyle: "italic", color: "#222", fontSize: "18px", lineHeight: 1.7 }}>
              "Since using DeeSoftwork at Deelad Place, we reduced unexplained stock variance by 40% in the first month. Finally, I have clarity instead of guesswork."
            </blockquote>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: 16 }}>
              <img src="/shuaib-photo-small.jpg" alt="Shuaib" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10 }} />
              <div>
                <div style={{ fontWeight: 700 }}>Shuaib Oladunni</div>
                <div style={{ color: muted, fontSize: 13 }}>Owner, Deelad Place & Founder, DeeSoftwork</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <a href="#audit" style={primaryBtn}><FontAwesomeIcon icon={faCalendarCheck} style={{ marginRight: 10 }} /> Book Your Audit</a>
            <a href="#pricing" style={{ ...secondaryBtn, marginLeft: 12 }}>See Plans</a>
          </div>
        </div>
      </div>
    </section>

    <div style={sectionDivider}></div>

    {/* ---------------- SECTION 9 — FINAL DUAL CTA ---------------- */}
    <section style={{ ...sectionStyle, paddingBottom: "80px" }} id="final-cta">
      <h2 style={headlineStyle}>Why keep doing the hard work?</h2>
      <p style={subStyle}>You built an amazing business. It deserves tools that work as hard as you do. Stop managing blind.</p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "22px",
        alignItems: "stretch",
        maxWidth: 980,
        margin: "0 auto"
      }}>

        {/* Left — Confident */}
        <div style={{ ...card, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: 8 }}>Ready to automate?</div>
            <div style={{ color: muted, marginBottom: 18 }}>
              Start with the most popular plan and get your business-in-a-box now.
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#444", lineHeight: "1.8" }}>
              <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 8 }} /> Most popular plan pre-configured</li>
              <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 8 }} /> Dedicated onboarding week</li>
              <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 8 }} /> Priority support</li>
            </ul>
          </div>

          <div style={{ marginTop: 18 }}>
            <a href="#get-pro" style={primaryBtn}><FontAwesomeIcon icon={faArrowRight} style={{ marginRight: 10 }} /> Get Started with Pro Plan</a>
          </div>
        </div>

        {/* Right — Seeker */}
        <div style={{ ...card, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: 8 }}>Want to see your exact solution?</div>
            <div style={{ color: muted, marginBottom: 18 }}>
              Spend 20 minutes with our founder. Identify your profit leaks and see the fix.
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#444", lineHeight: "1.8" }}>
              <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 8 }} /> 20-minute custom audit</li>
              <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 8 }} /> No sales pitch</li>
              <li><FontAwesomeIcon icon={faCheckCircle} style={{ color: accent, marginRight: 8 }} /> Clear roadmap to fix leaks</li>
            </ul>
          </div>

          <div style={{ marginTop: 18 }}>
            <a href="#audit" style={primaryBtn}><FontAwesomeIcon icon={faPhone} style={{ marginRight: 10 }} /> Book My Free Profit Audit</a>
            <a href="#contact" style={{ ...secondaryBtn, marginLeft: 12 }}>Talk to Sales</a>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", color: muted, marginTop: 18, fontSize: 13 }}>
        No long contracts. Cancel anytime. Dedicated support included.
      </div>
    </section>

    {/* ---------------- FOOTER (simple) ---------------- */}
    <footer style={{ background: "#0b1220", color: "#9aa6b2", padding: "40px 20px", textAlign: "center" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ marginBottom: 10, fontWeight: 700, color: "#fff" }}>DeeSoftwork</div>
        <div style={{ marginBottom: 8 }}>Born from Deelad Place, Nigeria • Built for African F&amp;B Businesses</div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "center", marginTop: 12 }}>
          <a href="mailto:deesoftwork@gmail.com" style={{ color: "#9aa6b2", textDecoration: "none" }}>deesoftwork@gmail.com</a>
          <span style={{ opacity: 0.5 }}>•</span>
          <a href="#" style={{ color: "#9aa6b2", textDecoration: "none" }}>Twitter</a>
          <a href="#" style={{ color: "#9aa6b2", textDecoration: "none" }}>LinkedIn</a>
        </div>
      </div>
    </footer>
  </>
    </div>
  );
}
