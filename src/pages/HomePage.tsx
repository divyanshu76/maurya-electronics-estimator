import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import {
  FileTextOutlined,
  FolderOpenOutlined,
  ThunderboltOutlined,
  CalculatorOutlined,
  FilePdfOutlined,
  SaveOutlined,
  WhatsAppOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useApp } from "../context/AppContext";
import { MaterialIcon } from "../components/icons/MaterialIcons";

export default function HomePage() {
  const navigate = useNavigate();
  const { businessConfig } = useApp();

  const features = [
    {
      icon: <ThunderboltOutlined />,
      title: "Fast Estimation",
      desc: "Create complete material estimates in minutes, not hours.",
    },
    {
      icon: <EditOutlined />,
      title: "Manual Rate Entry",
      desc: "Enter current market rates manually for every estimate.",
    },
    {
      icon: <CalculatorOutlined />,
      title: "Auto Calculation",
      desc: "Quantity × Rate calculated instantly. Grand total always ready.",
    },
    {
      icon: <SaveOutlined />,
      title: "Saved Estimates",
      desc: "All estimates saved locally. View, edit or duplicate anytime.",
    },
    {
      icon: <FilePdfOutlined />,
      title: "PDF Generation",
      desc: "Professional PDF with your branding, logo and watermark.",
    },
    {
      icon: <WhatsAppOutlined />,
      title: "WhatsApp Sharing",
      desc: "Share the PDF estimate directly with customers on WhatsApp.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Select Materials",
      desc: "Browse categories and pick from the pre-built electrical material catalog.",
    },
    {
      num: "02",
      title: "Add Quantity & Rate",
      desc: "Enter quantity and today's market rate. Amount is calculated for you.",
    },
    {
      num: "03",
      title: "Generate & Share PDF",
      desc: "Save the estimate, generate a professional PDF and share it instantly.",
    },
  ];

  return (
    <div style={{ background: "var(--color-bg)" }}>
      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="hero">
        {/* Dynamic Background Layer (Whole Section) */}
        <div 
          className="hero-permanent-bg" 
          style={{ backgroundImage: `url('${businessConfig.heroBackground || businessConfig.heroImage || businessConfig.logo}')` }} 
          aria-hidden="true"
        />
        <div className="hero-bg-overlay" aria-hidden="true" />
        <div className="hero-bottom-fade" aria-hidden="true" />
        
        <div className="page-container hero-content">
          <div className="hero-text-column">
            <div className="hero-eyebrow">
              <ThunderboltOutlined style={{ color: "var(--color-gold)", marginRight: 6 }} />
              Reliable Electrical Materials & Services
            </div>
            
            <h1 className="hero-title">{businessConfig.name}</h1>

            <p className="hero-description">
              Your trusted partner for quality electrical materials.<br/>
              Create accurate estimates in minutes, with professional PDF and instant WhatsApp sharing.
            </p>

            <div className="hero-actions">
              <Button
                type="primary"
                size="large"
                icon={<FileTextOutlined />}
                onClick={() => navigate("/estimate")}
                className="btn-glass-primary"
              >
                Create Price Estimate
              </Button>
              <Button
                size="large"
                icon={<FolderOpenOutlined />}
                onClick={() => navigate("/saved")}
                className="btn-glass-secondary"
              >
                View Saved Estimates
              </Button>
            </div>
            
            {/* Stats/Badges row */}
            <div className="hero-badges">
              <div className="hero-badge">
                <div className="hero-badge-icon"><MaterialIcon iconKey="accessories" size={20} color="#B8873B"/></div>
                <span>Quality<br/>Products</span>
              </div>
              <div className="hero-badge">
                <div className="hero-badge-icon"><CalculatorOutlined style={{ fontSize: 20, color: "#B8873B" }}/></div>
                <span>Best<br/>Estimates</span>
              </div>
              <div className="hero-badge">
                <div className="hero-badge-icon"><FolderOpenOutlined style={{ fontSize: 20, color: "#B8873B" }}/></div>
                <span>Wide<br/>Range</span>
              </div>
              <div className="hero-badge">
                <div className="hero-badge-icon"><MaterialIcon iconKey="switch" size={20} color="#B8873B"/></div>
                <span>Trusted<br/>Support</span>
              </div>
            </div>
          </div>
          
          <div className="hero-image-column">

            {/* Decorative Background Text */}
            <div className="hero-image-decoration">
              Powering<br/>Your Spaces
            </div>

            {/* Foreground Main Image Frame */}
            <div className="hero-image-frame">
              {businessConfig.heroImage ? (
                <img src={businessConfig.heroImage} alt="Electrical Materials" className="hero-main-image" />
              ) : (
                <img 
                  src={businessConfig.logo} 
                  alt="Maurya Electronics" 
                  className="hero-main-image" 
                  style={{ objectFit: 'contain', padding: '40px', background: 'white' }} 
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--color-surface)" }}>
        <div className="page-container">
          <div className="section-header" style={{ textAlign: "center" }}>
            <div className="section-label">Process</div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-desc">
              Three simple steps from opening the app to sharing the estimate.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <div key={step.num} className="step-card fade-in">
                <div className="step-number">{step.num}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Quick action */}
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Button
              type="primary"
              size="large"
              icon={<FileTextOutlined />}
              onClick={() => navigate("/estimate")}
              style={{ height: 46, paddingInline: 32, fontSize: 15, fontWeight: 600 }}
            >
              Create Price Estimate
            </Button>
          </div>
        </div>
      </section>

      {/* ── Material Categories Preview ───────────────────────── */}
      <section className="section">
        <div className="page-container">
          <div className="section-header">
            <div className="section-label">Catalog</div>
            <h2 className="section-title">Complete Material Catalog</h2>
            <p className="section-desc">
              All electrical materials organized into clear categories for fast selection.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 12,
            }}
          >
            {[
              { icon: "switch", label: "Switch & Socket" },
              { icon: "plate", label: "Sheet / Plate" },
              { icon: "accessories", label: "Accessories" },
              { icon: "board", label: "Board" },
              { icon: "light", label: "Fancy Light & Fans" },
              { icon: "mcb", label: "MCB / Protection" },
              { icon: "wire", label: "Wire" },
              { icon: "pipe", label: "Pipe & Box" },
            ].map((cat) => (
              <div
                key={cat.icon}
                className="card"
                style={{
                  padding: "20px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 200ms ease",
                }}
                onClick={() => navigate("/estimate")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate("/estimate")}
              >
                <MaterialIcon
                  iconKey={cat.icon}
                  size={32}
                  color="#142B4A"
                />
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#172033",
                    marginTop: 10,
                    lineHeight: 1.3,
                  }}
                >
                  {cat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--color-surface)" }}>
        <div className="page-container">
          <div className="section-header" style={{ textAlign: "center" }}>
            <div className="section-label">Features</div>
            <h2 className="section-title">Built for Your Business</h2>
          </div>
          <div className="feature-grid">
            {features.map((feat) => (
              <div key={feat.title} className="feature-card fade-in">
                <div className="feature-icon">{feat.icon}</div>
                <div className="feature-title">{feat.title}</div>
                <div className="feature-desc">{feat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer
        style={{
          background: "#142B4A",
          color: "rgba(255,255,255,0.5)",
          padding: "32px 0",
          textAlign: "center",
          fontSize: 13,
        }}
      >
        <div className="page-container">
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "rgba(255,255,255,0.85)",
              marginBottom: 6,
            }}
          >
            {businessConfig.name}
          </div>
          <div style={{ marginBottom: 4 }}>{businessConfig.address}</div>
          {businessConfig.phone && (
            <div style={{ marginBottom: 16 }}>{businessConfig.phone}</div>
          )}
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            &copy; {new Date().getFullYear()} {businessConfig.name}. Internal business tool.
          </div>
        </div>
      </footer>
    </div>
  );
}
