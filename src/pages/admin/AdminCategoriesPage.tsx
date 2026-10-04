import { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Popconfirm,
  message,
  Select,
  Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useApp } from "../../context/AppContext";
import type { Category } from "../../types";
import { generateId } from "../../utils/calculations";
import { ICON_KEYS } from "../../components/icons/MaterialIcons";
import { MaterialIcon } from "../../components/icons/MaterialIcons";

export default function AdminCategoriesPage() {
  const { categories, updateCategories } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  const openModal = (cat?: Category) => {
    setEditingCategory(cat || null);
    form.resetFields();
    if (cat) {
      form.setFieldsValue({ name: cat.name, icon: cat.icon, enabled: cat.enabled });
    } else {
      form.setFieldsValue({ enabled: true, icon: "default" });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (editingCategory) {
      const updated = categories.map((c) =>
        c.id === editingCategory.id ? { ...c, ...values } : c
      );
      updateCategories(updated);
      message.success("Category updated");
    } else {
      const newCat: Category = {
        id: generateId(),
        name: values.name,
        icon: values.icon || "default",
        enabled: values.enabled ?? true,
        sortOrder: categories.length + 1,
      };
      updateCategories([...categories, newCat]);
      message.success("Category added");
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    updateCategories(categories.filter((c) => c.id !== id));
    message.success("Category deleted");
  };

  const handleToggle = (id: string, enabled: boolean) => {
    updateCategories(categories.map((c) => (c.id === id ? { ...c, enabled } : c)));
  };

  const moveUp = (cat: Category) => {
    const idx = sorted.findIndex((c) => c.id === cat.id);
    if (idx <= 0) return;
    const newSorted = [...sorted];
    [newSorted[idx - 1], newSorted[idx]] = [newSorted[idx], newSorted[idx - 1]];
    updateCategories(newSorted.map((c, i) => ({ ...c, sortOrder: i + 1 })));
  };

  const moveDown = (cat: Category) => {
    const idx = sorted.findIndex((c) => c.id === cat.id);
    if (idx >= sorted.length - 1) return;
    const newSorted = [...sorted];
    [newSorted[idx], newSorted[idx + 1]] = [newSorted[idx + 1], newSorted[idx]];
    updateCategories(newSorted.map((c, i) => ({ ...c, sortOrder: i + 1 })));
  };

  const columns: ColumnsType<Category> = [
    {
      title: "Order",
      key: "order",
      width: 80,
      render: (_: unknown, record: Category, idx: number) => (
        <Space>
          <Button type="text" size="small" icon={<ArrowUpOutlined />} onClick={() => moveUp(record)} disabled={idx === 0} />
          <Button type="text" size="small" icon={<ArrowDownOutlined />} onClick={() => moveDown(record)} disabled={idx === sorted.length - 1} />
        </Space>
      ),
    },
    {
      title: "Icon",
      key: "icon",
      width: 60,
      render: (_: unknown, record: Category) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <MaterialIcon iconKey={record.icon} size={22} color="#142B4A" />
        </div>
      ),
    },
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      render: (val: string) => <span style={{ fontWeight: 500 }}>{val}</span>,
    },
    {
      title: "Enabled",
      key: "enabled",
      width: 100,
      render: (_: unknown, record: Category) => (
        <Switch
          checked={record.enabled}
          onChange={(v) => handleToggle(record.id, v)}
          size="small"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_: unknown, record: Category) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm
            title="Delete this category?"
            description="Materials in this category will still exist but won't be shown under a category."
            onConfirm={() => handleDelete(record.id)}
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#172033", margin: 0 }}>Categories</h2>
          <p style={{ fontSize: 13, color: "#667085", margin: 0 }}>Manage material categories shown in the estimator.</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} style={{ height: 40 }}>
          Add Category
        </Button>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E7E2D8", overflow: "hidden" }}>
        <Table
          dataSource={sorted}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </div>

      <Modal
        title={editingCategory ? "Edit Category" : "Add Category"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input size="large" placeholder="e.g. Switch & Socket" />
          </Form.Item>
          <Form.Item name="icon" label="Icon">
            <Select
              size="large"
              options={ICON_KEYS.map((k) => ({ label: k, value: k }))}
              placeholder="Select icon"
            />
          </Form.Item>
          <Form.Item name="enabled" label="Enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSave}>
              {editingCategory ? "Update" : "Add"} Category
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
