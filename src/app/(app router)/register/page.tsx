"use client";

import { register } from "@/src/services/authService";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/src/components/Navbar";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main
        className="flex-1 flex items-center justify-center px-4 py-16"
        style={{ backgroundColor: "var(--color-cream)" }}
      >
        <div className="w-full max-w-md">
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
                🌿
              </div>
              <h1
                className="text-2xl font-bold"
                style={{ color: "var(--color-text-dark)" }}
              >
                Create your account
              </h1>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--color-text-light)" }}
              >
                Join thousands of caring parents
              </p>
            </div>

            {success ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">🎉</div>
                <h3
                  className="font-bold text-lg mb-2"
                  style={{ color: "var(--color-text-dark)" }}
                >
                  Welcome to BabyBee!
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{ color: "var(--color-text-mid)" }}
                >
                  Your account has been created successfully.
                </p>
                <Link href="/login" className="btn-primary">
                  Sign In
                </Link>
              </div>
            ) : (
              <>
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

                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--color-text-mid)" }}
                    >
                      Full name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="register-name"
                      placeholder="Sarah Johnson"
                      value={form.name}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--color-text-mid)" }}
                    >
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="register-email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--color-text-mid)" }}
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="register-password"
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--color-text-mid)" }}
                    >
                      Confirm password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="register-confirm-password"
                      placeholder="Repeat your password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <button
                    id="register-submit"
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full py-3 rounded-full text-white font-medium text-sm mt-2 transition-all duration-200"
                    style={{
                      backgroundColor: loading
                        ? "var(--color-primary-light)"
                        : "var(--color-primary)",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Creating account…" : "Create Account"}
                  </button>
                </div>

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
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium hover:underline"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Sign In
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
