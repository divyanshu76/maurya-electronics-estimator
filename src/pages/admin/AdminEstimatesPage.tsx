import { Table, Button, Input, Space, Popconfirm } from "antd";
import { DeleteOutlined, SearchOutlined, DownloadOutlined } from "@ant-design/icons";
import { useApp } from "../../context/AppContext";
import { generateEstimatePDF } from "../../utils/pdfGenerator";
import { useState } from "react";
import type { Estimate } from "../../types";

export default function AdminEstimatesPage() {
  const { estimates, deleteEstimate, businessConfig } = useApp();
  const [searchText, setSearchText] = useState("");

  const filteredEstimates = estimates.filter((e) =>
    e.customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
    e.estimateNumber.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Estimate #",
      dataIndex: "estimateNumber",
      key: "estimateNumber",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Customer",
      dataIndex: ["customer", "name"],
      key: "customerName",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Amount",
      dataIndex: "grandTotal",
      key: "amount",
      render: (amount: number) => `₹${amount.toLocaleString("en-IN")}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Estimate) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => generateEstimatePDF(record, businessConfig)}
            title="Download PDF"
          />
          <Popconfirm
            title="Delete the estimate"
            description="Are you sure to delete this estimate?"
            onConfirm={() => deleteEstimate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="Delete" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "white", borderRadius: 8, border: "1px solid #E7E2D8" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: "#142B4A" }}>Saved Estimates</h2>
        <Input
          placeholder="Search customer or estimate #"
          prefix={<SearchOutlined style={{ color: "#98A2B3" }} />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredEstimates}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
