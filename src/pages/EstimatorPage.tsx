import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  InputNumber,
  Select,
  Modal,
  message,
  Popconfirm,
  Table,
  Tooltip,
  Spin,
  Tag,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  FilePdfOutlined,
  WhatsAppOutlined,
  PrinterOutlined,
  CheckOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useApp } from "../context/AppContext";
import type { EstimateItem, Estimate, Material } from "../types";
import {
  calculateItemAmount,
  calculateGrandTotal,
  calculateTotalQuantity,
  calculateItemCount,
  formatINR,
  generateEstimateNumber,
  generateId,
  sanitizeQuantity,
  sanitizeRate,
} from "../utils/calculations";
import { MaterialIcon } from "../components/icons/MaterialIcons";
import { generateEstimatePDF, shareOnWhatsApp } from "../utils/pdfGenerator";

interface CustomerForm {
  name: string;
  phone?: string;
  address?: string;
}

interface EstimateForm {
  estimateNumber: string;
  date: dayjs.Dayjs;
}

export default function EstimatorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { estimates, categories, materials, businessConfig, saveEstimate, getNextCounter } = useApp();

  // ── Form state ─────────────────────────────────────────────
  const [customerForm] = Form.useForm<CustomerForm>();
  const [estimateForm] = Form.useForm<EstimateForm>();
  const [items, setItems] = useState<EstimateItem[]>([]);

  // ── Material selection state ───────────────────────────────
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<EstimateItem | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [itemForm] = Form.useForm();

  // ── Edit/duplicate mode ────────────────────────────────────
  const [estimateId] = useState<string>(generateId());
  const [estimateNumber, setEstimateNumber] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // Initialize
  useEffect(() => {
    if (id) {
      // Edit mode — load existing estimate
      const existing = estimates.find((e) => e.id === id);
      if (existing) {
        customerForm.setFieldsValue({
          name: existing.customer.name,
          phone: existing.customer.phone || "",
          address: existing.customer.address || "",
        });
        estimateForm.setFieldsValue({
          estimateNumber: existing.estimateNumber,
          date: dayjs(existing.date),
        });
        setItems(existing.items);
        setEstimateNumber(existing.estimateNumber);
      }
    } else {
      // New estimate
      const counter = getNextCounter();
      const newNumber = generateEstimateNumber(counter);
      setEstimateNumber(newNumber);
      estimateForm.setFieldsValue({
        estimateNumber: newNumber,
        date: dayjs(),
      });
    }
  }, [id]);

  // ── Derived values ─────────────────────────────────────────
  const grandTotal = useMemo(() => calculateGrandTotal(items), [items]);
  const totalQuantity = useMemo(() => calculateTotalQuantity(items), [items]);
  const itemCount = useMemo(() => calculateItemCount(items), [items]);

  // ── Filtered materials ─────────────────────────────────────
  const enabledCategories = useMemo(
    () => categories.filter((c) => c.enabled).sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const filteredMaterials = useMemo(() => {
    let mats = materials.filter((m) => m.enabled);

    if (selectedCategoryId !== "all") {
      mats = mats.filter((m) => m.categoryId === selectedCategoryId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      mats = mats.filter((m) => {
        if (m.name.toLowerCase().includes(q)) return true;
        if (m.variants.some((v) => v.name.toLowerCase().includes(q))) return true;
        return false;
      });
    }

    return mats.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [materials, selectedCategoryId, searchQuery]);

  // ── Add/Edit Item handlers ─────────────────────────────────
  const openAddModal = useCallback((material: Material) => {
    setSelectedMaterial(material);
    setEditingItem(null);
    itemForm.resetFields();
    itemForm.setFieldsValue({
      materialId: material.id,
      variantId: material.variants.length === 1 ? material.variants[0].id : undefined,
      quantity: 1,
      rate: undefined,
    });
    setAddModalVisible(true);
  }, [itemForm]);

  const openEditModal = useCallback((item: EstimateItem) => {
    const mat = materials.find((m) => m.id === item.materialId);
    setSelectedMaterial(mat || null);
    setEditingItem(item);
    itemForm.setFieldsValue({
      variantId: item.variantId,
      quantity: item.quantity,
      rate: item.rate,
    });
    setAddModalVisible(true);
  }, [materials, itemForm]);

  const handleAddItem = useCallback(() => {
    itemForm.validateFields().then((values) => {
      const qty = sanitizeQuantity(values.quantity);
      const rate = sanitizeRate(values.rate);

      if (qty <= 0) {
        message.warning("Please enter a valid quantity greater than 0");
        return;
      }
      if (rate < 0) {
        message.warning("Rate cannot be negative");
        return;
      }

      if (editingItem) {
        // Update existing item
        const amount = calculateItemAmount(qty, rate);
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? { ...item, variantId: values.variantId, variantNameSnapshot: values.variantId
                  ? selectedMaterial?.variants.find((v) => v.id === values.variantId)?.name
                  : undefined,
                  quantity: qty, rate, amount }
              : item
          )
        );
        message.success("Item updated");
      } else {
        // Check for duplicate material + variant
        const material = selectedMaterial!;
        
        setItems((prev) => {
          const existingItemIdx = prev.findIndex(
            (i) => i.materialId === material.id && i.variantId === values.variantId
          );
          
          if (existingItemIdx !== -1) {
            // Increase quantity of existing duplicate item
            const existing = prev[existingItemIdx];
            const newQty = existing.quantity + qty;
            const newAmount = calculateItemAmount(newQty, rate); // Use the new rate
            const updated = [...prev];
            updated[existingItemIdx] = { ...existing, quantity: newQty, rate, amount: newAmount };
            message.success(`Increased quantity to ${newQty}`);
            return updated;
          } else {
            // Add new item
            const variant = values.variantId
              ? material.variants.find((v) => v.id === values.variantId)
              : undefined;
            const amount = calculateItemAmount(qty, rate);

            const newItem: EstimateItem = {
              id: generateId(),
              materialId: material.id,
              materialNameSnapshot: material.name,
              variantId: values.variantId,
              variantNameSnapshot: variant?.name,
              quantity: qty,
              rate,
              amount,
            };
            message.success("Item added");
            return [...prev, newItem];
          }
        });
      }

      setAddModalVisible(false);
      itemForm.resetFields();
    });
  }, [itemForm, editingItem, selectedMaterial]);

  const handleDeleteItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    message.success("Item removed");
  }, []);

  // ── Save Estimate ──────────────────────────────────────────
  const handleSave = useCallback(async () => {
    try {
      await customerForm.validateFields();
    } catch {
      message.error("Please fill in the customer name");
      return;
    }

    if (items.length === 0) {
      message.warning("Please add at least one material item");
      return;
    }

    setIsSaving(true);
    try {
      const customerValues = customerForm.getFieldsValue();
      const estimateValues = estimateForm.getFieldsValue();

      const estimate: Estimate = {
        id: id || estimateId,
        estimateNumber: estimateValues.estimateNumber || estimateNumber,
        date: estimateValues.date ? estimateValues.date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        customer: {
          name: customerValues.name.trim(),
          phone: customerValues.phone?.trim() || undefined,
          address: customerValues.address?.trim() || undefined,
        },
        items,
        totalItems: itemCount,
        totalQuantity,
        grandTotal,
        status: "saved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveEstimate(estimate);
      message.success("Estimate saved successfully");
      navigate(`/saved/${estimate.id}`);
    } catch {
      message.error("Something went wrong while saving the estimate. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [customerForm, estimateForm, items, id, estimateId, estimateNumber, itemCount, totalQuantity, grandTotal, saveEstimate, navigate]);

  // ── Generate PDF ───────────────────────────────────────────
  const handleGeneratePDF = useCallback(async () => {
    const customerValues = customerForm.getFieldsValue();
    if (!customerValues.name) {
      message.warning("Please enter customer name first");
      return;
    }
    if (items.length === 0) {
      message.warning("Please add at least one item");
      return;
    }
    setIsPdfLoading(true);
    try {
      const estimateValues = estimateForm.getFieldsValue();
      const estimate: Estimate = {
        id: id || estimateId,
        estimateNumber: estimateValues.estimateNumber || estimateNumber,
        date: estimateValues.date ? estimateValues.date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        customer: {
          name: customerValues.name.trim(),
          phone: customerValues.phone?.trim() || undefined,
          address: customerValues.address?.trim() || undefined,
        },
        items,
        totalItems: itemCount,
        totalQuantity,
        grandTotal,
        status: "saved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await generateEstimatePDF(estimate, businessConfig);
    } catch (err) {
      message.error("Something went wrong while generating the PDF. Please try again.");
    } finally {
      setIsPdfLoading(false);
    }
  }, [customerForm, estimateForm, items, id, estimateId, estimateNumber, itemCount, totalQuantity, grandTotal, businessConfig]);

  // ── WhatsApp Share ─────────────────────────────────────────
  const handleWhatsApp = useCallback(async () => {
    const customerValues = customerForm.getFieldsValue();
    if (!customerValues.name) {
      message.warning("Please enter customer name first");
      return;
    }
    if (items.length === 0) {
      message.warning("Please add at least one item");
      return;
    }
    setIsPdfLoading(true);
    try {
      const estimateValues = estimateForm.getFieldsValue();
      const estimate: Estimate = {
        id: id || estimateId,
        estimateNumber: estimateValues.estimateNumber || estimateNumber,
        date: estimateValues.date ? estimateValues.date.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        customer: {
          name: customerValues.name.trim(),
          phone: customerValues.phone?.trim() || undefined,
          address: customerValues.address?.trim() || undefined,
        },
        items,
        totalItems: itemCount,
        totalQuantity,
        grandTotal,
        status: "saved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await shareOnWhatsApp(estimate, businessConfig);
    } catch {
      message.error("Could not share on WhatsApp. Please try downloading the PDF instead.");
    } finally {
      setIsPdfLoading(false);
    }
  }, [customerForm, estimateForm, items, id, estimateId, estimateNumber, itemCount, totalQuantity, grandTotal, businessConfig]);

  // ── Table columns (desktop) ────────────────────────────────
  const columns: ColumnsType<EstimateItem> = [
    {
      title: "#",
      key: "index",
      width: 40,
      render: (_: unknown, __: EstimateItem, idx: number) => (
        <span style={{ color: "#667085", fontSize: 13 }}>{idx + 1}</span>
      ),
    },
    {
      title: "Description",
      key: "description",
      render: (_: unknown, record: EstimateItem) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>
            {record.materialNameSnapshot}
            {record.variantNameSnapshot && (
              <span style={{ color: "#B8873B", marginLeft: 6, fontSize: 13 }}>
                — {record.variantNameSnapshot}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: 70,
      align: "center" as const,
      render: (val: number) => <span style={{ fontWeight: 500 }}>{val}</span>,
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      width: 100,
      align: "right" as const,
      render: (val: number) => (
        <span style={{ fontSize: 13 }}>₹{val.toLocaleString("en-IN")}</span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 110,
      align: "right" as const,
      render: (val: number) => (
        <span style={{ fontWeight: 600, color: "#142B4A" }}>
          {formatINR(val)}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      align: "center" as const,
      render: (_: unknown, record: EstimateItem) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              style={{ color: "#667085" }}
            />
          </Tooltip>
          <Popconfirm
            title="Remove this item?"
            onConfirm={() => handleDeleteItem(record.id)}
            okText="Remove"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Remove">
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
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-header no-print">
        <div className="page-header-inner">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#172033", margin: 0 }}>
                {id ? "Edit Estimate" : "Price Estimator"}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: "#667085", marginTop: 2 }}>
                Select materials, enter rates, and generate a professional estimate.
              </p>
            </div>
            {estimateNumber && (
              <div className="badge badge-primary" style={{ fontSize: 12, fontWeight: 600 }}>
                {estimateNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="page-container" style={{ padding: "var(--space-5) var(--page-padding-desktop)" }}>
        <div className="estimator-grid">
          {/* ── LEFT PANEL — Customer + Estimate Details ─────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Customer Details */}
            <div className="card card-body">
              <div style={{ fontSize: 13, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 16 }}>
                Customer Details
              </div>
              <Form form={customerForm} layout="vertical" requiredMark={false}>
                <Form.Item
                  name="name"
                  label={<span style={{ fontSize: 13, fontWeight: 500 }}>Customer Name</span>}
                  rules={[{ required: true, message: "Customer name is required" }]}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="e.g. Rajesh Sharma" size="large" />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label={<span style={{ fontSize: 13, fontWeight: 500 }}>Mobile Number</span>}
                  style={{ marginBottom: 12 }}
                >
                  <Input placeholder="Optional" size="large" maxLength={15} />
                </Form.Item>
                <Form.Item
                  name="address"
                  label={<span style={{ fontSize: 13, fontWeight: 500 }}>Address</span>}
                  style={{ marginBottom: 0 }}
                >
                  <Input.TextArea
                    placeholder="Optional"
                    rows={2}
                    style={{ resize: "none" }}
                  />
                </Form.Item>
              </Form>
            </div>

            {/* Estimate Details */}
            <div className="card card-body">
              <div style={{ fontSize: 13, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 16 }}>
                Estimate Details
              </div>
              <Form form={estimateForm} layout="vertical" requiredMark={false}>
                <Form.Item
                  name="estimateNumber"
                  label={<span style={{ fontSize: 13, fontWeight: 500 }}>Estimate No.</span>}
                  style={{ marginBottom: 12 }}
                >
                  <Input size="large" readOnly style={{ background: "#FCFBF8", color: "#667085" }} />
                </Form.Item>
                <Form.Item
                  name="date"
                  label={<span style={{ fontSize: 13, fontWeight: 500 }}>Date</span>}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    size="large"
                    style={{ width: "100%" }}
                    format="DD MMM YYYY"
                    allowClear={false}
                  />
                </Form.Item>
              </Form>
            </div>

            {/* Summary Panel (desktop only) */}
            <div className="summary-panel desktop-only">
              <div className="summary-panel-title">Estimate Summary</div>
              <div className="summary-stat">
                <span className="summary-stat-label">Total Items</span>
                <span className="summary-stat-value">{itemCount}</span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat-label">Total Quantity</span>
                <span className="summary-stat-value">{totalQuantity}</span>
              </div>
              <div className="summary-total">
                <span className="summary-total-label">Grand Total</span>
                <span className="summary-total-amount">{formatINR(grandTotal)}</span>
              </div>
            </div>

            {/* Actions (desktop) */}
            <div className="card card-body desktop-only">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Button
                  type="primary"
                  size="large"
                  icon={isSaving ? <Spin size="small" /> : <SaveOutlined />}
                  onClick={handleSave}
                  loading={isSaving}
                  style={{ height: 44, fontWeight: 600, width: "100%" }}
                >
                  Save Estimate
                </Button>
                <Button
                  size="large"
                  icon={<FilePdfOutlined />}
                  onClick={handleGeneratePDF}
                  loading={isPdfLoading}
                  style={{ height: 44, width: "100%", borderColor: "#142B4A", color: "#142B4A" }}
                >
                  Generate PDF
                </Button>
                <Button
                  size="large"
                  icon={<WhatsAppOutlined />}
                  onClick={handleWhatsApp}
                  loading={isPdfLoading}
                  style={{ height: 44, width: "100%", background: "#16805B", color: "white", border: "none" }}
                >
                  Share on WhatsApp
                </Button>
                <Button
                  size="large"
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                  style={{ height: 44, width: "100%", color: "#667085" }}
                >
                  Print
                </Button>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL — Materials + Added Items ────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
            {/* Material Selection */}
            <div className="card card-body">
              <div style={{ fontSize: 13, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14 }}>
                Select Material
              </div>

              {/* Search */}
              <Input
                prefix={<SearchOutlined style={{ color: "#98A2B3" }} />}
                placeholder="Search materials, variants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                style={{ marginBottom: 12 }}
              />

              {/* Category Tabs */}
              <div className="category-tabs" style={{ marginBottom: 14 }}>
                <button
                  className={`category-tab${selectedCategoryId === "all" ? " active" : ""}`}
                  onClick={() => setSelectedCategoryId("all")}
                >
                  All
                </button>
                {enabledCategories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`category-tab${selectedCategoryId === cat.id ? " active" : ""}`}
                    onClick={() => setSelectedCategoryId(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Material Grid */}
              {filteredMaterials.length === 0 ? (
                <div className="empty-state" style={{ padding: "32px 0" }}>
                  <SearchOutlined style={{ fontSize: 32, color: "#E7E2D8", marginBottom: 12 }} />
                  <div className="empty-state-title">No materials found</div>
                  <div className="empty-state-desc">Try a different search term or category</div>
                </div>
              ) : (
                <div className="material-grid">
                  {filteredMaterials.map((mat) => (
                    <button
                      key={mat.id}
                      className="material-card"
                      onClick={() => openAddModal(mat)}
                      title={mat.name}
                    >
                      <MaterialIcon iconKey={mat.icon} size={26} color="#142B4A" />
                      <span className="material-card-name">{mat.name}</span>
                      {mat.variants.length > 0 && (
                        <span style={{ fontSize: 10, color: "#B8873B", fontWeight: 500 }}>
                          {mat.variants.filter(v => v.enabled).length} variants
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Added Items — Desktop Table */}
            <div className="card desktop-only">
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  Added Items
                </div>
                {items.length > 0 && (
                  <Tag color="blue" style={{ borderRadius: 20 }}>
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </Tag>
                )}
              </div>

              {items.length === 0 ? (
                <div className="empty-state">
                  <PlusOutlined style={{ fontSize: 32, color: "#E7E2D8", marginBottom: 12 }} />
                  <div className="empty-state-title">No items added yet</div>
                  <div className="empty-state-desc">Select a material above to add it to this estimate</div>
                </div>
              ) : (
                <Table
                  className="items-table"
                  dataSource={items}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  style={{ borderRadius: 0 }}
                />
              )}
            </div>

            {/* Added Items — Mobile Cards */}
            <div className="mobile-only">
              <div style={{ fontSize: 13, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
                Added Items ({items.length})
              </div>
              {items.length === 0 ? (
                <div style={{ background: "var(--color-surface)", borderRadius: 14, padding: "32px 16px", textAlign: "center", border: "1px solid var(--color-border)" }}>
                  <PlusOutlined style={{ fontSize: 28, color: "#E7E2D8", marginBottom: 8, display: "block" }} />
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#172033" }}>No items yet</div>
                  <div style={{ fontSize: 13, color: "#667085", marginTop: 4 }}>Select a material to add it</div>
                </div>
              ) : (
                items.map((item, _idx) => (
                  <div key={item.id} className="item-card fade-in">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div className="item-card-name">
                          {item.materialNameSnapshot}
                          {item.variantNameSnapshot && (
                            <span style={{ color: "#B8873B", marginLeft: 6, fontWeight: 400, fontSize: 13 }}>
                              — {item.variantNameSnapshot}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => openEditModal(item)}
                          style={{ color: "#667085", padding: "0 4px" }}
                        />
                        <Popconfirm
                          title="Remove this item?"
                          onConfirm={() => handleDeleteItem(item.id)}
                          okText="Remove"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            style={{ color: "#C0392B", padding: "0 4px" }}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                    <div className="item-card-details">
                      <div className="item-card-detail">
                        <span className="item-card-detail-label">Qty</span>
                        <span className="item-card-detail-value">{item.quantity}</span>
                      </div>
                      <div className="item-card-detail">
                        <span className="item-card-detail-label">Rate</span>
                        <span className="item-card-detail-value">₹{item.rate.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="item-card-detail">
                        <span className="item-card-detail-label">Amount</span>
                        <span className="item-card-detail-value item-card-amount">{formatINR(item.amount)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mobile Summary */}
            <div className="summary-panel mobile-only">
              <div className="summary-panel-title">Estimate Summary</div>
              <div className="summary-stat">
                <span className="summary-stat-label">Total Items</span>
                <span className="summary-stat-value">{itemCount}</span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat-label">Total Quantity</span>
                <span className="summary-stat-value">{totalQuantity}</span>
              </div>
              <div className="summary-total">
                <span className="summary-total-label">Grand Total</span>
                <span className="summary-total-amount">{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky Footer ──────────────────────────────── */}
      <div className="sticky-footer no-print">
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#667085", marginBottom: 2 }}>Grand Total</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#142B4A" }}>{formatINR(grandTotal)}</div>
          </div>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={isSaving}
            style={{ height: 44, flex: "0 0 auto" }}
          >
            Save
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            onClick={handleGeneratePDF}
            loading={isPdfLoading}
            style={{ height: 44, flex: "0 0 auto", borderColor: "#142B4A", color: "#142B4A" }}
          >
            PDF
          </Button>
          <Button
            icon={<WhatsAppOutlined />}
            onClick={handleWhatsApp}
            style={{ height: 44, flex: "0 0 auto", background: "#16805B", color: "white", border: "none" }}
          />
        </div>
      </div>

      {/* ── Add/Edit Item Modal ───────────────────────────────── */}
      <Modal
        title={
          <div style={{ fontSize: 16, fontWeight: 600, color: "#172033" }}>
            {editingItem ? "Edit Item" : selectedMaterial?.name || "Add Item"}
          </div>
        }
        open={addModalVisible}
        onCancel={() => { setAddModalVisible(false); itemForm.resetFields(); }}
        footer={null}
        width={440}
        destroyOnClose
      >
        <Form
          form={itemForm}
          layout="vertical"
          requiredMark={false}
          style={{ marginTop: 16 }}
          onFinish={handleAddItem}
        >
          {/* Material name display */}
          {!editingItem && selectedMaterial && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                background: "#EEF2F8",
                borderRadius: 10,
                marginBottom: 16,
              }}
            >
              <MaterialIcon iconKey={selectedMaterial.icon} size={28} color="#142B4A" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, color: "#172033" }}>
                  {selectedMaterial.name}
                </div>
                {selectedMaterial.variants.length > 0 && (
                  <div style={{ fontSize: 12, color: "#667085" }}>
                    Select a variant below
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Variant select */}
          {selectedMaterial && selectedMaterial.variants.filter(v => v.enabled).length > 0 && (
            <Form.Item
              name="variantId"
              label={<span style={{ fontSize: 13, fontWeight: 500 }}>Variant</span>}
              rules={[{ required: true, message: "Please select a variant" }]}
              style={{ marginBottom: 14 }}
            >
              <Select
                placeholder="Select variant"
                size="large"
                options={selectedMaterial.variants
                  .filter((v) => v.enabled)
                  .map((v) => ({ label: v.name, value: v.id }))}
              />
            </Form.Item>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <Form.Item
              name="quantity"
              label={<span style={{ fontSize: 13, fontWeight: 500 }}>Quantity</span>}
              rules={[
                { required: true, message: "Required" },
                {
                  validator: (_, value) => {
                    if (!value || value <= 0) return Promise.reject("Must be > 0");
                    return Promise.resolve();
                  },
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                min={0.01}
                step={1}
                size="large"
                style={{ width: "100%" }}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              name="rate"
              label={<span style={{ fontSize: 13, fontWeight: 500 }}>Rate (₹)</span>}
              rules={[
                { required: true, message: "Required" },
                {
                  validator: (_, value) => {
                    if (value === undefined || value === null) return Promise.reject("Required");
                    if (value < 0) return Promise.reject("Cannot be negative");
                    return Promise.resolve();
                  },
                },
              ]}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                min={0}
                step={1}
                size="large"
                style={{ width: "100%" }}
                placeholder="0"
                prefix="₹"
                className="rate-input"
              />
            </Form.Item>
          </div>

          {/* Live amount preview */}
          <Form.Item shouldUpdate style={{ marginBottom: 20 }}>
            {() => {
              const qty = itemForm.getFieldValue("quantity");
              const rate = itemForm.getFieldValue("rate");
              const amount = calculateItemAmount(
                sanitizeQuantity(qty),
                sanitizeRate(rate)
              );
              return qty > 0 && rate >= 0 && amount > 0 ? (
                <div
                  style={{
                    background: "#F0FBF6",
                    border: "1px solid #C3E6D8",
                    borderRadius: 10,
                    padding: "10px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#667085" }}>
                    {qty} × ₹{rate?.toLocaleString("en-IN") || 0}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#16805B" }}>
                    = {formatINR(amount)}
                  </span>
                </div>
              ) : null;
            }}
          </Form.Item>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button
              onClick={() => { setAddModalVisible(false); itemForm.resetFields(); }}
              style={{ height: 40 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={editingItem ? <CheckOutlined /> : <PlusOutlined />}
              style={{ height: 40, fontWeight: 600 }}
            >
              {editingItem ? "Update Item" : "Add Item"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
