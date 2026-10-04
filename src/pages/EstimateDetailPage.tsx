import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Popconfirm,
  message,
  Table,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  WhatsAppOutlined,
  PrinterOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useApp } from "../context/AppContext";
import type { EstimateItem, Estimate } from "../types";
import { formatINR, generateEstimateNumber, generateId } from "../utils/calculations";
import { generateEstimatePDF, shareOnWhatsApp } from "../utils/pdfGenerator";
import { getNextEstimateCounter } from "../utils/storage";

export default function EstimateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { estimates, deleteEstimate, saveEstimate, businessConfig } = useApp();
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const estimate = estimates.find((e) => e.id === id);

  if (!estimate) {
    return (
      <div className="page-container" style={{ padding: "64px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 16, color: "#667085", marginBottom: 16 }}>
          Estimate not found.
        </div>
        <Button onClick={() => navigate("/saved")}>Back to Saved Estimates</Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteEstimate(estimate.id);
    message.success("Estimate deleted");
    navigate("/saved");
  };

  const handleDuplicate = () => {
    const counter = getNextEstimateCounter();
    const newEstimate: Estimate = {
      ...estimate,
      id: generateId(),
      estimateNumber: generateEstimateNumber(counter),
      date: dayjs().format("YYYY-MM-DD"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: { ...estimate.customer },
      items: estimate.items.map((item) => ({ ...item, id: generateId() })),
    };
    saveEstimate(newEstimate);
    message.success("Estimate duplicated — opening editor");
    navigate(`/estimate/${newEstimate.id}`);
  };

  const handlePDF = async () => {
    setIsPdfLoading(true);
    try {
      await generateEstimatePDF(estimate, businessConfig);
    } catch {
      message.error("Something went wrong generating the PDF. Please try again.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleWhatsApp = async () => {
    setIsPdfLoading(true);
    try {
      await shareOnWhatsApp(estimate, businessConfig);
    } catch {
      message.error("Could not share on WhatsApp. Please try downloading the PDF instead.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  const columns: ColumnsType<EstimateItem> = [
    {
      title: "#",
      key: "idx",
      width: 40,
      render: (_: unknown, __: EstimateItem, i: number) => <span style={{ color: "#667085", fontSize: 13 }}>{i + 1}</span>,
    },
    {
      title: "Description",
      key: "desc",
      render: (_: unknown, r: EstimateItem) => (
        <span style={{ fontWeight: 500 }}>
          {r.materialNameSnapshot}
          {r.variantNameSnapshot && (
            <span style={{ color: "#B8873B", marginLeft: 6, fontWeight: 400 }}>— {r.variantNameSnapshot}</span>
          )}
        </span>
      ),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "qty",
      width: 70,
      align: "center" as const,
      render: (v: number) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      width: 100,
      align: "right" as const,
      render: (v: number) => <span style={{ fontSize: 13 }}>₹{v.toLocaleString("en-IN")}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right" as const,
      render: (v: number) => (
        <span style={{ fontWeight: 700, color: "#142B4A" }}>{formatINR(v)}</span>
      ),
    },
  ];

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "calc(100dvh - 64px)" }}>
      {/* Page Header */}
      <div className="page-header no-print">
        <div className="page-header-inner">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/saved")}
                style={{ padding: "0 8px" }}
              />
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#172033", margin: 0 }}>
                  {estimate.estimateNumber}
                </h2>
                <p style={{ margin: 0, fontSize: 13, color: "#667085", marginTop: 2 }}>
                  {estimate.customer.name} · {dayjs(estimate.date).format("DD MMM YYYY")}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button icon={<EditOutlined />} onClick={() => navigate(`/estimate/${estimate.id}`)} style={{ height: 38 }}>
                Edit
              </Button>
              <Button icon={<CopyOutlined />} onClick={handleDuplicate} style={{ height: 38 }}>
                Duplicate
              </Button>
              <Button icon={<FilePdfOutlined />} onClick={handlePDF} loading={isPdfLoading} style={{ height: 38, borderColor: "#142B4A", color: "#142B4A" }}>
                PDF
              </Button>
              <Button icon={<WhatsAppOutlined />} onClick={handleWhatsApp} loading={isPdfLoading} style={{ height: 38, background: "#16805B", color: "white", border: "none" }}>
                WhatsApp
              </Button>
              <Button icon={<PrinterOutlined />} onClick={() => window.print()} style={{ height: 38 }}>
                Print
              </Button>
              <Popconfirm
                title="Delete this estimate?"
                description="This action cannot be undone."
                onConfirm={handleDelete}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />} style={{ height: 38 }}>
                  Delete
                </Button>
              </Popconfirm>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ padding: "var(--space-5) var(--page-padding-desktop)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
          {/* Left — Items */}
          <div>
            {/* Customer info */}
            <div className="card card-body" style={{ marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: "#98A2B3", marginBottom: 8 }}>
                    Customer
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: "#172033" }}>{estimate.customer.name}</div>
                  {estimate.customer.phone && <div style={{ fontSize: 13, color: "#667085", marginTop: 2 }}>{estimate.customer.phone}</div>}
                  {estimate.customer.address && <div style={{ fontSize: 13, color: "#667085", marginTop: 2 }}>{estimate.customer.address}</div>}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: "#98A2B3", marginBottom: 8 }}>
                    Estimate Details
                  </div>
                  <div style={{ fontSize: 13, color: "#667085" }}>
                    <div><strong style={{ color: "#172033" }}>No:</strong> {estimate.estimateNumber}</div>
                    <div><strong style={{ color: "#172033" }}>Date:</strong> {dayjs(estimate.date).format("DD MMMM YYYY")}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="card" style={{ overflow: "hidden" }}>
              <Table
                className="items-table"
                dataSource={estimate.items}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </div>
          </div>

          {/* Right — Summary */}
          <div>
            <div className="summary-panel">
              <div className="summary-panel-title">Estimate Summary</div>
              <div className="summary-stat">
                <span className="summary-stat-label">Total Items</span>
                <span className="summary-stat-value">{estimate.totalItems}</span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat-label">Total Quantity</span>
                <span className="summary-stat-value">{estimate.totalQuantity}</span>
              </div>
              <div className="summary-total">
                <span className="summary-total-label">Grand Total</span>
                <span className="summary-total-amount">{formatINR(estimate.grandTotal)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="card card-body" style={{ marginTop: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  onClick={handlePDF}
                  loading={isPdfLoading}
                  style={{ height: 42, fontWeight: 600, width: "100%" }}
                >
                  Generate PDF
                </Button>
                <Button
                  icon={<WhatsAppOutlined />}
                  onClick={handleWhatsApp}
                  loading={isPdfLoading}
                  style={{ height: 42, width: "100%", background: "#16805B", color: "white", border: "none" }}
                >
                  Share on WhatsApp
                </Button>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/estimate/${estimate.id}`)}
                  style={{ height: 42, width: "100%" }}
                >
                  Edit Estimate
                </Button>
                <Button
                  icon={<CopyOutlined />}
                  onClick={handleDuplicate}
                  style={{ height: 42, width: "100%" }}
                >
                  Duplicate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
