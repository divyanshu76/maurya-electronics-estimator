import { useState } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { Button, Input, Form, message } from "antd";
import {
  LockOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
  ShopOutlined,
  FileTextOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useApp } from "../../context/AppContext";
import AdminCategoriesPage from "./AdminCategoriesPage";
import AdminMaterialsPage from "./AdminMaterialsPage";
import AdminSettingsPage from "./AdminSettingsPage";
import AdminEstimatesPage from "./AdminEstimatesPage";
import AdminOverviewPage from "./AdminOverviewPage";

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const { loginAdmin } = useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const values = form.getFieldsValue();
    if (!values.email || !values.password) return;
    
    setLoading(true);
    const ok = await loginAdmin(values.email, values.password);
    if (ok) {
      onSuccess();
    } else {
      message.error("Incorrect credentials or unauthorized.");
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#F7F5F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "white",
          border: "1px solid #E7E2D8",
          borderRadius: 16,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 8px 32px rgba(20,43,74,0.10)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: "#142B4A",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <LockOutlined style={{ fontSize: 22, color: "#D6B06A" }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#172033", margin: 0 }}>
            Admin Panel
          </h2>
          <p style={{ fontSize: 13, color: "#667085", marginTop: 6, marginBottom: 0 }}>
            Enter your admin email and password.
          </p>
        </div>

        <Form form={form} onFinish={handleLogin} layout="vertical" requiredMark={false}>
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Email is required" }]}
          >
            <Input
              placeholder="Admin Email"
              size="large"
              autoFocus
              autoComplete="email"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#98A2B3" }} />}
              placeholder="Admin password"
              size="large"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            style={{ width: "100%", height: 44, fontWeight: 600, marginTop: 4 }}
          >
            Sign In
          </Button>
        </Form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/")}
            style={{ color: "#667085", fontSize: 13 }}
          >
            Back to main app
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminLayout() {
  const { logoutAdmin, businessConfig } = useApp();
  const navigate = useNavigate();

  const menuItems = [
    { to: "/admin", label: "Overview", icon: <AppstoreOutlined />, end: true },
    { to: "/admin/estimates", label: "Estimates", icon: <FileTextOutlined /> },
    { to: "/admin/materials", label: "Products", icon: <ShoppingOutlined /> },
    { to: "/admin/settings", label: "Business Settings", icon: <ShopOutlined /> },
  ];

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#F7F5F0",
      }}
    >
      {/* Admin Header */}
      <header
        style={{
          background: "#0F2239",
          height: 60,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 16,
          flexShrink: 0,
        }}
      >
        {businessConfig.logo && (
          <img
            src={businessConfig.logo}
            alt="Admin Logo"
            style={{ width: 32, height: 32, objectFit: "contain", flexShrink: 0 }}
          />
        )}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>
            {businessConfig.name} — Admin
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            Administration Panel
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/")}
            style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}
          >
            Main App
          </Button>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={() => { logoutAdmin(); }}
            style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}
          >
            Sign Out
          </Button>
        </div>
      </header>

      {/* Admin Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 220,
            background: "white",
            borderRight: "1px solid #E7E2D8",
            padding: "16px 12px",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, color: "#98A2B3", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, paddingLeft: 10 }}>
            Management
          </div>
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `header-nav-link${isActive ? " active" : ""}`
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 10px",
                marginBottom: 2,
                fontSize: 14,
                borderRadius: 8,
              }}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <Routes>
            <Route path="/" element={<AdminOverviewPage />} />
            <Route path="/estimates" element={<AdminEstimatesPage />} />
            <Route path="/materials" element={<AdminMaterialsPage />} />
            <Route path="/settings" element={<AdminSettingsPage />} />
            <Route path="/categories" element={<AdminCategoriesPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAdminAuthenticated } = useApp();
  const [authed, setAuthed] = useState(isAdminAuthenticated);

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return <AdminLayout />;
}
