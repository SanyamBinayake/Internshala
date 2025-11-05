import { useState } from "react";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { setToken } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await api.post("/auth/login", form);
    setToken(data.access_token);
    nav("/app/dashboard");
  };

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 400 }}>
      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button>Login</button>
    </form>
  );
}
