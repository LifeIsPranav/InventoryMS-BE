import React, { useState } from "react";

const initialWage = {
  userId: '',
  month: '',
  hoursWorked: '',
  totalSalary: '',
  overworked: false,
  calculatedAt: '',
};

export default function WageForm({ wage = initialWage, onSubmit, onCancel }) {
  const [form, setForm] = useState(wage);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit({
      ...form,
      month: form.month ? new Date(form.month) : undefined,
      hoursWorked: form.hoursWorked ? Number(form.hoursWorked) : undefined,
      totalSalary: form.totalSalary ? Number(form.totalSalary) : undefined,
      calculatedAt: form.calculatedAt ? new Date(form.calculatedAt) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="wage-form">
      <label>User ID
        <input name="userId" value={form.userId} onChange={handleChange} required />
      </label>
      <label>Month
        <input name="month" type="month" value={form.month} onChange={handleChange} />
      </label>
      <label>Hours Worked
        <input name="hoursWorked" type="number" value={form.hoursWorked} onChange={handleChange} />
      </label>
      <label>Total Salary
        <input name="totalSalary" type="number" value={form.totalSalary} onChange={handleChange} />
      </label>
      <label>Overworked
        <input name="overworked" type="checkbox" checked={form.overworked} onChange={handleChange} />
      </label>
      <label>Calculated At
        <input name="calculatedAt" type="datetime-local" value={form.calculatedAt} onChange={handleChange} />
      </label>
      <div style={{ marginTop: 16 }}>
        <button type="submit">Submit</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
