import React from "react";
import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppProvider } from "./context/AppContext";
import "./index.css";

const antdTheme = {
  token: {
    colorPrimary: "#142B4A",
    colorInfo: "#142B4A",
    colorSuccess: "#16805B",
    colorError: "#C0392B",
    colorWarning: "#B8873B",
    colorBgBase: "#F7F5F0",
    colorBgContainer: "#FFFFFF",
    colorText: "#172033",
    colorTextSecondary: "#667085",
    colorBorder: "#E7E2D8",
    colorBorderSecondary: "#F0EDE6",
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 14,
    lineHeight: 1.6,
    controlHeight: 40,
    controlHeightLG: 44,
    controlHeightSM: 32,
    boxShadow: "0 4px 20px rgba(20, 43, 74, 0.06)",
    boxShadowSecondary: "0 2px 8px rgba(20, 43, 74, 0.08)",
  },
  components: {
    Button: {
      borderRadius: 10,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 10,
    },
    Select: {
      borderRadius: 10,
    },
    Card: {
      borderRadiusLG: 14,
    },
    Table: {
      borderRadius: 14,
      headerBg: "#FCFBF8",
      headerColor: "#667085",
      headerSortHoverBg: "#F0EDE6",
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Menu: {
      itemBorderRadius: 10,
      itemSelectedBg: "#EEF2F8",
      itemSelectedColor: "#142B4A",
    },
    Tag: {
      borderRadius: 20,
    },
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider theme={antdTheme}>
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
