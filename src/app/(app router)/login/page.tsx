"use client";

import { login } from "@/src/services/authService";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await login(email, password);

      localStorage.setItem("token", res.token);

      alert("Login successful");
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-10">
      <h1 className="text-2xl font-bold">Login</h1>

      <input
        placeholder="Email"
        className="border p-2"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        className="border p-2"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin} className="bg-blue-500 text-white p-2">
        Login
      </button>
    </div>
  );
}
