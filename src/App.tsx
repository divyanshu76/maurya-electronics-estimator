import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import HomePage from "./pages/HomePage";
import EstimatorPage from "./pages/EstimatorPage";
import SavedEstimatesPage from "./pages/SavedEstimatesPage";
import EstimateDetailPage from "./pages/EstimateDetailPage";
import AdminPage from "./pages/admin/AdminPage";

export default function App() {
  return (
    <Routes>
      {/* Main user routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/estimate" element={<EstimatorPage />} />
        <Route path="/estimate/:id" element={<EstimatorPage />} />
        <Route path="/saved" element={<SavedEstimatesPage />} />
        <Route path="/saved/:id" element={<EstimateDetailPage />} />
      </Route>

      {/* Admin routes (separate layout) */}
      <Route path="/admin/*" element={<AdminPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
