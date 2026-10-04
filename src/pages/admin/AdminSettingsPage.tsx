import { useState } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Upload,
  Card,
  Divider,
  Switch,
  InputNumber,
} from "antd";
import { UploadOutlined, SaveOutlined } from "@ant-design/icons";
import { useApp } from "../../context/AppContext";
import type { BusinessConfig } from "../../types";
import { uploadFileToSupabase } from "../../utils/supabaseApi";

export default function AdminSettingsPage() {
  const { businessConfig, updateBusinessConfig } = useApp();
  const [form] = Form.useForm<BusinessConfig>();
  const [saving, setSaving] = useState(false);

  form.setFieldsValue(businessConfig);

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    setTimeout(() => {
      updateBusinessConfig(values);
      message.success("Business settings saved successfully");
      setSaving(false);
    }, 300);
  };

  const handleLogoUpload = async (file: File) => {
    message.loading({ content: 'Uploading logo...', key: 'logoUpload' });
    const url = await uploadFileToSupabase(file, 'logo');
    if (url) {
      form.setFieldValue("logo", url);
      updateBusinessConfig({ ...form.getFieldsValue(), logo: url });
      message.success({ content: 'Logo uploaded successfully', key: 'logoUpload' });
    } else {
      message.error({ content: 'Upload failed', key: 'logoUpload' });
    }
    return false; // prevent auto-upload
  };

  const handleHeroImageUpload = async (file: File) => {
    message.loading({ content: 'Uploading image...', key: 'heroUpload' });
    const url = await uploadFileToSupabase(file, 'hero');
    if (url) {
      form.setFieldValue("heroImage", url);
      updateBusinessConfig({ ...form.getFieldsValue(), heroImage: url });
      message.success({ content: 'Hero image uploaded successfully', key: 'heroUpload' });
    } else {
      message.error({ content: 'Upload failed', key: 'heroUpload' });
    }
    return false; // prevent auto-upload
  };

  const handleHeroBgUpload = async (file: File) => {
    message.loading({ content: 'Uploading background...', key: 'bgUpload' });
    const url = await uploadFileToSupabase(file, 'background');
    if (url) {
      form.setFieldValue("heroBackground", url);
      updateBusinessConfig({ ...form.getFieldsValue(), heroBackground: url });
      message.success({ content: 'Background uploaded successfully', key: 'bgUpload' });
    } else {
      message.error({ content: 'Upload failed', key: 'bgUpload' });
    }
    return false; // prevent auto-upload
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#172033", margin: 0 }}>
          Business Settings
        </h2>
        <p style={{ fontSize: 13, color: "#667085", marginTop: 4, marginBottom: 0 }}>
          Configure your business information. This appears on all estimates and PDFs.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        <Card
          title="Business Information"
          style={{ borderRadius: 14 }}
        >
          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
              name="name"
              label="Business Name"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="e.g. Maurya Electronics" size="large" />
            </Form.Item>
            <Form.Item name="tagline" label="Tagline">
              <Input placeholder="e.g. Electrical Materials & Services" size="large" />
            </Form.Item>
            <Form.Item name="address" label="Address">
              <Input.TextArea rows={2} placeholder="Full business address" />
            </Form.Item>
            <Form.Item name="phone" label="Phone Number">
              <Input placeholder="e.g. 9654922408" size="large" />
            </Form.Item>
            <Form.Item name="gstNumber" label="GST Number (optional)">
              <Input placeholder="e.g. 09XXXXX1234X1ZY" size="large" />
            </Form.Item>
            <Form.Item name="logo" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="heroImage" hidden>
              <Input />
            </Form.Item>

            <Divider />

            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#172033", marginBottom: 16 }}>PDF Configuration</h3>
            
            <Form.Item name="footerText" label="Footer Text">
              <Input.TextArea rows={2} placeholder="e.g. Thank you for choosing..." />
            </Form.Item>
            
            <Form.Item
              name="footerText"
              label="PDF Notes / Footer"
            >
              <Input.TextArea
                placeholder="Notes for the customer, e.g. Payment terms"
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </Form.Item>
            
            <div style={{ display: "flex", gap: 20 }}>
              <Form.Item name="watermarkVisible" label="Watermark Visible" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="watermarkOpacity" label="Watermark Opacity (0.01 - 0.2)">
                <InputNumber min={0.01} max={0.2} step={0.01} style={{ width: "100%" }} />
              </Form.Item>
            </div>

            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={saving}
              style={{ height: 42, fontWeight: 600 }}
            >
              Save Business Settings
            </Button>
          </Form>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Logo Upload */}
          <Card title="Business Logo" style={{ borderRadius: 14 }}>
            <p style={{ fontSize: 13, color: "#667085", marginBottom: 16 }}>
              Upload your logo to appear on estimates, PDFs, and the app header.
              Recommended: PNG with transparent background.
            </p>
            {businessConfig.logo && (
              <div style={{ marginBottom: 16 }}>
                <img
                  src={businessConfig.logo}
                  alt="Current logo"
                  style={{
                    height: 60,
                    maxWidth: "100%",
                    objectFit: "contain",
                    display: "block",
                    marginBottom: 8,
                    border: "1px solid #E7E2D8",
                    borderRadius: 8,
                    padding: 8,
                    background: "#F7F5F0",
                  }}
                />
                <Button
                  size="small"
                  danger
                  onClick={() => {
                    form.setFieldValue("logo", "");
                    updateBusinessConfig({ ...businessConfig, logo: "" });
                  }}
                >
                  Remove Logo
                </Button>
              </div>
            )}
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleLogoUpload}
            >
              <Button icon={<UploadOutlined />} style={{ height: 40 }}>
                {businessConfig.logo ? "Replace Logo" : "Upload Logo"}
              </Button>
            </Upload>
          </Card>

          {/* Hero Image Upload */}
          <Card title="Hero Image (Home Page)" style={{ borderRadius: 14 }}>
            <p style={{ fontSize: 13, color: "#667085", marginBottom: 16 }}>
              Upload a professional electrical-materials image for the home page hero section.
            </p>
            {businessConfig.heroImage && (
              <div style={{ marginBottom: 16 }}>
                <img
                  src={businessConfig.heroImage}
                  alt="Current hero"
                  style={{
                    height: 100,
                    maxWidth: "100%",
                    objectFit: "cover",
                    display: "block",
                    marginBottom: 8,
                    border: "1px solid #E7E2D8",
                    borderRadius: 8,
                  }}
                />
                <Button
                  size="small"
                  danger
                  onClick={() => {
                    form.setFieldValue("heroImage", "");
                    updateBusinessConfig({ ...businessConfig, heroImage: "" });
                  }}
                >
                  Remove Image
                </Button>
              </div>
            )}
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleHeroImageUpload}
            >
              <Button icon={<UploadOutlined />} style={{ height: 40 }}>
                {businessConfig.heroImage ? "Replace Image" : "Upload Image"}
              </Button>
            </Upload>
          </Card>

          {/* Hero Background Upload */}
          <Card title="Hero Background Image" style={{ borderRadius: 14 }}>
            <p style={{ fontSize: 13, color: "#667085", marginBottom: 16 }}>
              Upload an ambient background image for the hero section (optional).
            </p>
            {businessConfig.heroBackground && (
              <div style={{ marginBottom: 16 }}>
                <img
                  src={businessConfig.heroBackground}
                  alt="Current background"
                  style={{
                    height: 100,
                    maxWidth: "100%",
                    objectFit: "cover",
                    display: "block",
                    marginBottom: 8,
                    border: "1px solid #E7E2D8",
                    borderRadius: 8,
                  }}
                />
                <Button
                  size="small"
                  danger
                  onClick={() => {
                    form.setFieldValue("heroBackground", "");
                    updateBusinessConfig({ ...businessConfig, heroBackground: "" });
                  }}
                >
                  Remove Background
                </Button>
              </div>
            )}
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleHeroBgUpload}
            >
              <Button icon={<UploadOutlined />} style={{ height: 40 }}>
                {businessConfig.heroBackground ? "Replace Background" : "Upload Background"}
              </Button>
            </Upload>
          </Card>
        </div>
      </div>
    </div>
  );
}

