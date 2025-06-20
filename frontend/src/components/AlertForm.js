import React, { useState } from "react";

const alertTypes = [
  "defaultAlert",
  "lowStock",
  "outOfStock",
  "transportationDelay",
  "missedEta",
  "overwork",
  "inventoryMismatch",
  "routeDeviation",
  "unauthorizedAccess",
  "stockExpired",
  "systemError"
];

const initialAlert = {
  type: 'defaultAlert',
  triggeredOn: '',
  resolved: false,
  targetId: '',
  message: '',
};

export default function AlertForm({ alert = initialAlert, onSubmit, onCancel }) {
  const [form, setForm] = useState(alert);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({ ...form, triggeredOn: form.triggeredOn ? new Date(form.triggeredOn) : undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="alert-form">
      <label>Type
        <select name="type" value={form.type} onChange={handleChange} required>
          {alertTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label>Triggered On
        <input name="triggeredOn" type="datetime-local" value={form.triggeredOn} onChange={handleChange} />
      </label>
      <label>Resolved
        <input name="resolved" type="checkbox" checked={form.resolved} onChange={handleChange} />
      </label>
      <label>Target ID
        <input name="targetId" value={form.targetId} onChange={handleChange} required />
      </label>
      <label>Message
        <input name="message" value={form.message} onChange={handleChange} required />
      </label>
      <div style={{ marginTop: 16 }}>
        <button type="submit">Submit</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
