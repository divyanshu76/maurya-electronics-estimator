import { useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Popconfirm,
  message,
  Tag,
  Select,
  Space,
  } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BranchesOutlined,
} from "@ant-design/icons";
import { useApp } from "../../context/AppContext";
import type { Material, MaterialVariant } from "../../types";
import { generateId } from "../../utils/calculations";
import { ICON_KEYS, MaterialIcon } from "../../components/icons/MaterialIcons";

export default function AdminMaterialsPage() {
  const { materials, categories, updateMaterials } = useApp();
  const [materialModal, setMaterialModal] = useState(false);
  const [variantModal, setVariantModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [variantMaterial, setVariantMaterial] = useState<Material | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [matForm] = Form.useForm();
    const [newVariantName, setNewVariantName] = useState("");

  const filteredMaterials = useMemo(() => {
    let mats = [...materials];
    if (filterCategory !== "all") {
      mats = mats.filter((m) => m.categoryId === filterCategory);
    }
    return mats.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [materials, filterCategory]);

  const openMaterialModal = (mat?: Material) => {
    setEditingMaterial(mat || null);
    matForm.resetFields();
    if (mat) {
      matForm.setFieldsValue({
        name: mat.name,
        categoryId: mat.categoryId,
        icon: mat.icon,
        enabled: mat.enabled,
      });
    } else {
      matForm.setFieldsValue({ enabled: true, icon: "default" });
    }
    setMaterialModal(true);
  };

  const handleSaveMaterial = async () => {
    const values = await matForm.validateFields();
    if (editingMaterial) {
      updateMaterials(
        materials.map((m) =>
          m.id === editingMaterial.id ? { ...m, ...values } : m
        )
      );
      message.success("Material updated");
    } else {
      const newMat: Material = {
        id: generateId(),
        name: values.name,
        categoryId: values.categoryId,
        icon: values.icon || "default",
        variants: [],
        enabled: values.enabled ?? true,
        sortOrder: materials.length + 1,
      };
      updateMaterials([...materials, newMat]);
      message.success("Material added");
    }
    setMaterialModal(false);
  };

  const handleDeleteMaterial = (id: string) => {
    updateMaterials(materials.filter((m) => m.id !== id));
    message.success("Material deleted");
  };

  const handleToggleMaterial = (id: string, enabled: boolean) => {
    updateMaterials(materials.map((m) => (m.id === id ? { ...m, enabled } : m)));
  };

  const openVariantModal = (mat: Material) => {
    setVariantMaterial(mat);
    setNewVariantName("");
    setVariantModal(true);
  };

  const handleAddVariant = () => {
    if (!variantMaterial || !newVariantName.trim()) return;
    const newVariant: MaterialVariant = {
      id: generateId(),
      name: newVariantName.trim(),
      enabled: true,
    };
    updateMaterials(
      materials.map((m) =>
        m.id === variantMaterial.id
          ? { ...m, variants: [...m.variants, newVariant] }
          : m
      )
    );
    setNewVariantName("");
    setVariantMaterial(
      materials
        .map((m) =>
          m.id === variantMaterial.id
            ? { ...m, variants: [...m.variants, newVariant] }
            : m
        )
        .find((m) => m.id === variantMaterial.id) || null
    );
    message.success("Variant added");
  };

  const handleDeleteVariant = (matId: string, varId: string) => {
    const updated = materials.map((m) =>
      m.id === matId
        ? { ...m, variants: m.variants.filter((v) => v.id !== varId) }
        : m
    );
    updateMaterials(updated);
    setVariantMaterial(updated.find((m) => m.id === matId) || null);
    message.success("Variant deleted");
  };

  const handleToggleVariant = (matId: string, varId: string, enabled: boolean) => {
    const updated = materials.map((m) =>
      m.id === matId
        ? { ...m, variants: m.variants.map((v) => (v.id === varId ? { ...v, enabled } : v)) }
        : m
    );
    updateMaterials(updated);
    setVariantMaterial(updated.find((m) => m.id === matId) || null);
  };

  const handleRenameVariant = (matId: string, varId: string, name: string) => {
    updateMaterials(
      materials.map((m) =>
        m.id === matId
          ? { ...m, variants: m.variants.map((v) => (v.id === varId ? { ...v, name } : v)) }
          : m
      )
    );
  };

  const getCategoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name || id;

  const columns: ColumnsType<Material> = [
    {
      title: "Icon",
      key: "icon",
      width: 50,
      render: (_: unknown, r: Material) => <MaterialIcon iconKey={r.icon} size={22} color="#142B4A" />,
    },
    {
      title: "Material Name",
      dataIndex: "name",
      key: "name",
      render: (val: string, r: Material) => (
        <div>
          <div style={{ fontWeight: 500 }}>{val}</div>
          {r.variants.length > 0 && (
            <div style={{ fontSize: 12, color: "#667085", marginTop: 2 }}>
              {r.variants.filter(v => v.enabled).length} variant{r.variants.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "categoryId",
      key: "categoryId",
      render: (val: string) => (
        <Tag style={{ borderRadius: 20, fontSize: 12 }}>{getCategoryName(val)}</Tag>
      ),
    },
    {
      title: "Enabled",
      key: "enabled",
      width: 80,
      render: (_: unknown, r: Material) => (
        <Switch checked={r.enabled} onChange={(v) => handleToggleMaterial(r.id, v)} size="small" />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      render: (_: unknown, r: Material) => (
        <Space>
          <Button type="text" size="small" icon={<BranchesOutlined />} onClick={() => openVariantModal(r)} title="Manage variants" />
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openMaterialModal(r)} />
          <Popconfirm
            title="Delete this material?"
            onConfirm={() => handleDeleteMaterial(r.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" icon={<DeleteOutlined />} style={{ color: "#C0392B" }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#172033", margin: 0 }}>Materials</h2>
          <p style={{ fontSize: 13, color: "#667085", margin: 0 }}>Manage all electrical materials in the catalog.</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openMaterialModal()} style={{ height: 40 }}>
          Add Material
        </Button>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 16 }}>
        <Select
          value={filterCategory}
          onChange={setFilterCategory}
          style={{ width: 220 }}
          options={[
            { label: "All Categories", value: "all" },
            ...categories.map((c) => ({ label: c.name, value: c.id })),
          ]}
        />
        <span style={{ marginLeft: 12, fontSize: 13, color: "#667085" }}>
          {filteredMaterials.length} material{filteredMaterials.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E7E2D8", overflow: "hidden" }}>
        <Table
          dataSource={filteredMaterials}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 30, showSizeChanger: false }}
          size="middle"
        />
      </div>

      {/* Material Modal */}
      <Modal
        title={editingMaterial ? "Edit Material" : "Add Material"}
        open={materialModal}
        onCancel={() => setMaterialModal(false)}
        footer={null}
        width={420}
      >
        <Form form={matForm} layout="vertical" requiredMark={false} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Material Name" rules={[{ required: true }]}>
            <Input size="large" placeholder="e.g. 16A Socket" />
          </Form.Item>
          <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
            <Select
              size="large"
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
              placeholder="Select category"
            />
          </Form.Item>
          <Form.Item name="icon" label="Icon">
            <Select
              size="large"
              options={ICON_KEYS.map((k) => ({ label: k, value: k }))}
              placeholder="Select icon"
            />
          </Form.Item>
          <Form.Item name="enabled" label="Enabled" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button onClick={() => setMaterialModal(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSaveMaterial}>
              {editingMaterial ? "Update" : "Add"} Material
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Variants Modal */}
      <Modal
        title={`Variants — ${variantMaterial?.name || ""}`}
        open={variantModal}
        onCancel={() => setVariantModal(false)}
        footer={null}
        width={500}
      >
        <div style={{ marginTop: 16 }}>
          {/* Add variant */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <Input
              placeholder="New variant name (e.g. 5W, 16A, Red)"
              value={newVariantName}
              onChange={(e) => setNewVariantName(e.target.value)}
              onPressEnter={handleAddVariant}
              size="large"
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddVariant}
              disabled={!newVariantName.trim()}
              style={{ height: 40 }}
            >
              Add
            </Button>
          </div>

          {/* Variant list */}
          {variantMaterial?.variants.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#667085", fontSize: 13 }}>
              No variants yet. Add one above.
            </div>
          ) : (
            <div>
              {variantMaterial?.variants.map((v) => (
                <div
                  key={v.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom: "1px solid #F0EDE6",
                  }}
                >
                  <Switch
                    checked={v.enabled}
                    onChange={(val) => handleToggleVariant(variantMaterial!.id, v.id, val)}
                    size="small"
                  />
                  <Input
                    value={v.name}
                    onChange={(e) => handleRenameVariant(variantMaterial!.id, v.id, e.target.value)}
                    style={{ flex: 1, height: 32 }}
                  />
                  <Popconfirm
                    title="Delete this variant?"
                    onConfirm={() => handleDeleteVariant(variantMaterial!.id, v.id)}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="text" size="small" icon={<DeleteOutlined />} style={{ color: "#C0392B" }} />
                  </Popconfirm>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
