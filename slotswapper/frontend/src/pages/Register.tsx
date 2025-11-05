import { useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      alert("Registration successful!");
      nav("/login");
    } catch (err: any) {
      console.error(err);
      alert("Registration failed. Check console for details.");
    }
  };

  return (
    <form
      onSubmit={submit}
      style={{ display: "grid", gap: 8, maxWidth: 400, margin: "auto", marginTop: 40 }}
    >
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button type="submit">Register</button>
    </form>
  );
}
