import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_BASE = "http://127.0.0.1:8000/api/inventory";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    item_name: "",
    quantity: 1,
    status: "good",
  });

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}/inventory-tracking/`);

      console.log("Inventory API response:", res.data);

      const data = res.data;
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.results)) {
        list = data.results;
      } else if (data && typeof data === "object") {
        list = [data];
      }

      setItems(list);
    } catch (err) {
      console.error("Failed to load inventory:", err);
      setError("Failed to load inventory.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await axios.post(`${API_BASE}/inventory-tracking/`, {
        item_name: form.item_name,
        quantity: Number(form.quantity),
        status: form.status,
      });
      setForm({ item_name: "", quantity: 1, status: "good" });
      await loadItems();
    } catch (err) {
      console.error(err);
      setError("Failed to create item.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDepreciationPdf = () => {
    window.open(
      `${API_BASE}/inventory-tracking/report-pdf/`,
      "_blank"
    );
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <h1>Inventory Tracking (Test Page)</h1>

      {/* Simple create form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Item name:&nbsp;
            <input
              type="text"
              name="item_name"
              value={form.item_name}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Quantity:&nbsp;
            <input
              type="number"
              name="quantity"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: "0.5rem" }}>
          <label>
            Status:&nbsp;
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="good">Good / Working</option>
              <option value="needs_repair">Needs Repair</option>
              <option value="retired">Retired / Disposed</option>
              <option value="lost">Lost</option>
            </select>
          </label>
        </div>

        <button type="submit">Add test item</button>
      </form>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Normal list + PDF buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <h2>Items from API</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={handleDownloadDepreciationPdf}>
            Download Depreciation Report (PDF)
          </button>
        </div>
      </div>

      {items.length === 0 && !loading ? (
        <p>No items yet.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              #{item.id} – {item.item_name} (x{item.quantity}) – {item.status}
            </li>
          ))}
        </ul>
      )}

      {/* Printable sticker section with QR codes */}
      <hr style={{ margin: "2rem 0" }} />

      <div className="no-print" style={{ marginBottom: "1rem" }}>
        <h2>Sticker Labels (QR)</h2>
        <button onClick={handlePrint}>Print labels</button>
      </div>

      <div
        className="print-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "1rem",
        }}
      >
        {items.map((item) => {
          const qrValue = `INV-${item.id}`; // or a URL if you prefer
          return (
            <div
              key={item.id}
              style={{
                border: "1px solid #ccc",
                padding: "0.5rem",
                borderRadius: "4px",
                textAlign: "center",
                fontSize: "12px",
              }}
            >
              <QRCodeCanvas value={qrValue} size={96} />
              <div style={{ marginTop: "0.25rem" }}>
                <div style={{ fontWeight: "bold" }}>{item.item_name}</div>
                <div>ID: {item.id}</div>
                <div>Qty: {item.quantity}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}