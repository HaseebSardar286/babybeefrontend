"use client";

import { login } from "@/src/services/authService";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await login(email, password);
      
      if (!res.token) {
        setError(res.message || "Login failed. Please check your credentials.");
        return;
      }

      localStorage.setItem("token", res.token);
      
      try {
        const payload = JSON.parse(atob(res.token.split('.')[1]));
        if (payload.role && payload.role.toUpperCase() === "ADMIN") {
          router.push("/admin");
          return;
        }
      } catch (e) {
        console.error("Failed to decode token", e);
      }
      
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex-1 flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
        <div className="w-full max-w-md">
          {/* Card */}
          <div
            className="rounded-3xl p-8 shadow-sm"
            style={{
              backgroundColor: "white",
              border: "1px solid var(--color-sand)",
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                style={{ backgroundColor: "var(--color-blush)" }}
              >
                🐝
              </div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-dark)" }}
              >
                Welcome back
              </h1>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--color-text-light)" }}
              >
                Sign in to your BabyBee account
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mb-5 px-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: "#fce4e4",
                  color: "var(--color-primary)",
                }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--color-text-mid)" }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="login-email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="block text-xs font-medium"
                    style={{ color: "var(--color-text-mid)" }}
                  >
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-xs hover:underline"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  id="login-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>

              <button
                id="login-submit"
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3 rounded-full text-white font-medium text-sm mt-2 transition-all duration-200"
                style={{
                  backgroundColor: loading
                    ? "var(--color-primary-light)"
                    : "var(--color-primary)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full border-t"
                  style={{ borderColor: "var(--color-sand)" }}
                />
              </div>
              <div className="relative flex justify-center">
                <span
                  className="px-3 text-xs"
                  style={{
                    backgroundColor: "white",
                    color: "var(--color-text-light)",
                  }}
                >
                  or
                </span>
              </div>
            </div>

            <p
              className="text-center text-sm"
              style={{ color: "var(--color-text-mid)" }}
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium hover:underline"
                style={{ color: "var(--color-primary)" }}
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
    );
  }
