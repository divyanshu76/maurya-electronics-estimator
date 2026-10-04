import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Button, Drawer } from "antd";
import {
  MenuOutlined,
  CloseOutlined,
  HomeOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useApp } from "../../context/AppContext";

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { businessConfig } = useApp();
  
  const navLinks = [
    { to: "/", label: "Home", icon: <HomeOutlined />, end: true },
    { to: "/estimate", label: "Price Estimator", icon: <FileTextOutlined /> },
    { to: "/saved", label: "Saved Estimates", icon: <FolderOpenOutlined /> },
  ];

  return (
    <div className="app-layout">
      {/* ── Desktop / Mobile Header ─────────────────────────── */}
      <div className="app-header-container no-print">
        <header className="app-header">
          <div className="header-inner">
            {/* Logo */}
            <NavLink to="/" className="header-logo">
              {businessConfig.logo && (
                <img
                  src={businessConfig.logo}
                  alt={`${businessConfig.name} logo`}
                  className="header-logo-img"
                />
              )}
              <div className="header-logo-text">
                <span className="header-logo-name">{businessConfig.name}</span>
                <span className="header-logo-tagline">{businessConfig.tagline}</span>
              </div>
            </NavLink>

            {/* Desktop Nav */}
            <nav className="header-nav desktop-only">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `header-nav-link${isActive ? " active" : ""}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Business info (desktop) */}
            {businessConfig.phone && (
              <div className="header-business-info desktop-only">
                <PhoneOutlined style={{ fontSize: 13 }} />
                <span>{businessConfig.phone}</span>
              </div>
            )}

            {/* Mobile menu button */}
            <div
              className="mobile-only"
              style={{ marginLeft: "auto" }}
            >
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerOpen(true)}
                style={{ fontSize: 18, padding: "0 8px" }}
                aria-label="Open menu"
              />
            </div>
          </div>
        </header>
      </div>

      {/* ── Mobile Drawer ────────────────────────────────────── */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {businessConfig.logo && (
              <img
                src={businessConfig.logo}
                alt="Logo"
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
            )}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#172033" }}>
                {businessConfig.name}
              </div>
              <div style={{ fontSize: 11, color: "#667085" }}>
                {businessConfig.tagline}
              </div>
            </div>
          </div>
        }
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={280}
        closeIcon={<CloseOutlined />}
        styles={{
          header: { borderBottom: "1px solid #E7E2D8", padding: "16px 20px" },
          body: { padding: "12px 12px" },
        }}
      >
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `header-nav-link${isActive ? " active" : ""}`
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                fontSize: 15,
              }}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>

        {businessConfig.phone && (
          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid #E7E2D8",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#667085",
              fontSize: 13,
              padding: "20px 14px 0",
            }}
          >
            <PhoneOutlined />
            <span>{businessConfig.phone}</span>
          </div>
        )}
      </Drawer>

      {/* ── Page Content ─────────────────────────────────────── */}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
