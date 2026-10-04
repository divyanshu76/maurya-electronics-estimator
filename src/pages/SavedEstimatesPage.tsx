import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Table,
  Popconfirm,
  Tag,
  Tooltip,
  message,
  DatePicker,
  Dropdown,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  MoreOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useApp } from "../context/AppContext";
import type { Estimate } from "../types";
import { formatINR, generateEstimateNumber, generateId } from "../utils/calculations";
import { generateEstimatePDF } from "../utils/pdfGenerator";
import { getNextEstimateCounter } from "../utils/storage";

export default function SavedEstimatesPage() {
  const navigate = useNavigate();
  const { estimates, deleteEstimate, saveEstimate, businessConfig } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  // ── Filter estimates ─────────────────────────────────────
  const filteredEstimates = useMemo(() => {
    let result = [...estimates].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.customer.name.toLowerCase().includes(q) ||
          e.estimateNumber.toLowerCase().includes(q) ||
          e.customer.address?.toLowerCase().includes(q)
      );
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      result = result.filter((e) => {
        const d = dayjs(e.date);
        return d.isAfter(dateRange[0]!.subtract(1, "day")) && d.isBefore(dateRange[1]!.add(1, "day"));
      });
    }

    return result;
  }, [estimates, searchQuery, dateRange]);

  // ── Handlers ──────────────────────────────────────────────
  const handleDelete = (id: string) => {
    deleteEstimate(id);
    message.success("Estimate deleted");
  };

  const handleDuplicate = (estimate: Estimate) => {
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

  const handleGeneratePDF = async (estimate: Estimate) => {
    setLoadingPdf(estimate.id);
    try {
      await generateEstimatePDF(estimate, businessConfig);
    } catch {
      message.error("Something went wrong generating the PDF. Please try again.");
    } finally {
      setLoadingPdf(null);
    }
  };

  // ── Desktop columns ────────────────────────────────────────
  const columns: ColumnsType<Estimate> = [
    {
      title: "Estimate No.",
      dataIndex: "estimateNumber",
      key: "estimateNumber",
      width: 150,
      render: (val: string) => (
        <span style={{ fontWeight: 600, color: "#142B4A", fontSize: 13 }}>{val}</span>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_: unknown, record: Estimate) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{record.customer.name}</div>
          {record.customer.address && (
            <div style={{ fontSize: 12, color: "#667085" }}>{record.customer.address}</div>
          )}
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (val: string) => (
        <span style={{ fontSize: 13, color: "#667085" }}>
          {dayjs(val).format("DD MMM YYYY")}
        </span>
      ),
    },
    {
      title: "Items",
      dataIndex: "totalItems",
      key: "totalItems",
      width: 80,
      align: "center" as const,
      render: (val: number) => (
        <Tag style={{ borderRadius: 20, fontSize: 12 }}>{val} {val === 1 ? "item" : "items"}</Tag>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "grandTotal",
      key: "grandTotal",
      width: 130,
      align: "right" as const,
      render: (val: number) => (
        <span style={{ fontWeight: 700, color: "#142B4A", fontSize: 15 }}>
          {formatINR(val)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: unknown, record: Estimate) => (
        <div style={{ display: "flex", gap: 4 }}>
          <Tooltip title="View">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/saved/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/estimate/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Duplicate">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleDuplicate(record)}
            />
          </Tooltip>
          <Tooltip title="Generate PDF">
            <Button
              type="text"
              size="small"
              icon={<FilePdfOutlined />}
              onClick={() => handleGeneratePDF(record)}
              loading={loadingPdf === record.id}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this estimate?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                style={{ color: "#C0392B" }}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "calc(100dvh - 64px)" }}>
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="page-header no-print">
        <div className="page-header-inner">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#172033", margin: 0 }}>
                Saved Estimates
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: "#667085", marginTop: 2 }}>
                View, edit, duplicate or generate PDFs from previous estimates.
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/estimate")}
              style={{ height: 40, fontWeight: 600 }}
            >
              New Estimate
            </Button>
          </div>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="page-container" style={{ padding: "var(--space-5) var(--page-padding-desktop)" }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <Input
            prefix={<SearchOutlined style={{ color: "#98A2B3" }} />}
            placeholder="Search by customer name or estimate number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            style={{ flex: "1 1 260px", maxWidth: 400 }}
          />
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(vals) => setDateRange(vals as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
            format="DD MMM YYYY"
            allowClear
            placeholder={["From date", "To date"]}
            style={{ flex: "0 0 auto" }}
          />
        </div>

        {/* ── Desktop Table ───────────────────────────────── */}
        <div className="card desktop-only" style={{ overflow: "hidden" }}>
          {filteredEstimates.length === 0 ? (
            <div className="empty-state" style={{ padding: "64px 24px" }}>
              <CalendarOutlined style={{ fontSize: 48, color: "#E7E2D8", marginBottom: 16 }} />
              <div className="empty-state-title">
                {estimates.length === 0 ? "No saved estimates yet" : "No estimates match your search"}
              </div>
              <div className="empty-state-desc">
                {estimates.length === 0
                  ? "Create your first estimate to see it here."
                  : "Try adjusting your search or date filter."}
              </div>
              {estimates.length === 0 && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/estimate")}
                  style={{ marginTop: 16, height: 40, fontWeight: 600 }}
                >
                  Create Estimate
                </Button>
              )}
            </div>
          ) : (
            <Table
              className="items-table"
              dataSource={filteredEstimates}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (total) => `${total} estimates` }}
              size="middle"
              onRow={(record) => ({
                onClick: () => navigate(`/saved/${record.id}`),
                style: { cursor: "pointer" },
              })}
            />
          )}
        </div>

        {/* ── Mobile Cards ──────────────────────────────────── */}
        <div className="mobile-only">
          {filteredEstimates.length === 0 ? (
            <div className="empty-state" style={{ background: "var(--color-surface)", borderRadius: 14, border: "1px solid var(--color-border)", padding: "48px 24px" }}>
              <CalendarOutlined style={{ fontSize: 40, color: "#E7E2D8", marginBottom: 12 }} />
              <div className="empty-state-title">
                {estimates.length === 0 ? "No saved estimates yet" : "No matches found"}
              </div>
              <div className="empty-state-desc">
                {estimates.length === 0 ? "Create your first estimate." : "Try adjusting your search."}
              </div>
              {estimates.length === 0 && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/estimate")}
                  style={{ marginTop: 16 }}
                >
                  Create Estimate
                </Button>
              )}
            </div>
          ) : (
            filteredEstimates.map((estimate) => (
              <div
                key={estimate.id}
                className="estimate-mobile-card"
                onClick={() => navigate(`/saved/${estimate.id}`)}
                style={{ cursor: "pointer" }}
              >
                <div className="estimate-mobile-card-header">
                  <div>
                    <div className="estimate-number">{estimate.estimateNumber}</div>
                    <div className="estimate-customer-name">{estimate.customer.name}</div>
                    {estimate.customer.address && (
                      <div className="estimate-meta">{estimate.customer.address}</div>
                    )}
                  </div>
                  <Dropdown
                    menu={{
                      items: [
                        { key: "view", label: "View", icon: <EyeOutlined />, onClick: ({ domEvent }) => { domEvent.stopPropagation(); navigate(`/saved/${estimate.id}`); } },
                        { key: "edit", label: "Edit", icon: <EditOutlined />, onClick: ({ domEvent }) => { domEvent.stopPropagation(); navigate(`/estimate/${estimate.id}`); } },
                        { key: "duplicate", label: "Duplicate", icon: <CopyOutlined />, onClick: ({ domEvent }) => { domEvent.stopPropagation(); handleDuplicate(estimate); } },
                        { key: "pdf", label: "Generate PDF", icon: <FilePdfOutlined />, onClick: ({ domEvent }) => { domEvent.stopPropagation(); handleGeneratePDF(estimate); } },
                        { type: "divider" },
                        {
                          key: "delete",
                          label: "Delete",
                          icon: <DeleteOutlined />,
                          danger: true,
                          onClick: ({ domEvent }) => {
                            domEvent.stopPropagation();
                            handleDelete(estimate.id);
                          },
                        },
                      ],
                    }}
                    trigger={["click"]}
                  >
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      onClick={(e) => e.stopPropagation()}
                      style={{ flexShrink: 0 }}
                    />
                  </Dropdown>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid var(--color-border-light)",
                  }}
                >
                  <div>
                    <Tag style={{ borderRadius: 20, fontSize: 12, marginRight: 6 }}>
                      {estimate.totalItems} {estimate.totalItems === 1 ? "item" : "items"}
                    </Tag>
                    <span style={{ fontSize: 12, color: "#667085" }}>
                      {dayjs(estimate.date).format("DD MMM YYYY")}
                    </span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#142B4A" }}>
                    {formatINR(estimate.grandTotal)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => { e.stopPropagation(); navigate(`/estimate/${estimate.id}`); }}
                    style={{ fontSize: 12, height: 32 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    icon={<FilePdfOutlined />}
                    onClick={(e) => { e.stopPropagation(); handleGeneratePDF(estimate); }}
                    loading={loadingPdf === estimate.id}
                    style={{ fontSize: 12, height: 32, borderColor: "#142B4A", color: "#142B4A" }}
                  >
                    PDF
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
