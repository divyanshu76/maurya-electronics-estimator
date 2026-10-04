import { useApp } from "../../context/AppContext";
import { Card, Col, Row, Statistic } from "antd";
import { ShoppingOutlined, FileTextOutlined, AppstoreOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

export default function AdminOverviewPage() {
  const { estimates, materials, categories } = useApp();
  const navigate = useNavigate();

  const recentEstimates = [...estimates]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div style={{ padding: "0" }}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card style={{ cursor: "pointer", border: "1px solid #E7E2D8" }} onClick={() => navigate("/admin/estimates")}>
            <Statistic title="Total Estimates" value={estimates.length} prefix={<FileTextOutlined style={{ color: "#142B4A" }}/>} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ cursor: "pointer", border: "1px solid #E7E2D8" }} onClick={() => navigate("/admin/materials")}>
            <Statistic title="Total Products" value={materials.filter(m => m.enabled).length} prefix={<ShoppingOutlined style={{ color: "#16805B" }}/>} />
          </Card>
        </Col>
        <Col span={8}>
          <Card style={{ cursor: "pointer", border: "1px solid #E7E2D8" }} onClick={() => navigate("/admin/categories")}>
            <Statistic title="Categories" value={categories.length} prefix={<AppstoreOutlined style={{ color: "#D6B06A" }}/>} />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24, padding: 24, background: "white", borderRadius: 8, border: "1px solid #E7E2D8" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, color: "#142B4A" }}>Recent Estimates</h3>
        {recentEstimates.length === 0 ? (
          <p style={{ color: "#667085" }}>No estimates created yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentEstimates.map(est => (
              <div key={est.id} style={{ display: "flex", justifyContent: "space-between", padding: 12, background: "#F7F5F0", borderRadius: 8 }}>
                <div>
                  <strong style={{ display: "block", color: "#142B4A" }}>{est.estimateNumber}</strong>
                  <span style={{ fontSize: 13, color: "#667085" }}>{est.customer.name}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong style={{ display: "block", color: "#142B4A" }}>₹{est.grandTotal.toLocaleString('en-IN')}</strong>
                  <span style={{ fontSize: 13, color: "#667085" }}>{new Date(est.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
