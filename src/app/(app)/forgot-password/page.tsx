"use client";

import { forgotPassword } from "@/src/services/authService";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await forgotPassword(email);
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to request password reset. Please check if the email is correct.",
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
      <div className="w-full max-w-md animate-fadeIn">
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
              🔑
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--color-text-dark)" }}
            >
              Forgot Password
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-text-light)" }}
            >
              Enter your email and we will send you a secure link to reset your password.
            </p>
          </div>

          {/* Success Notification */}
          {success && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm border animate-slideDown"
              style={{
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                borderColor: "#c8e6c9",
              }}
            >
              A password reset link has been sent to your email. Please check your inbox!
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm border animate-shake"
              style={{
                backgroundColor: "#fce4e4",
                color: "var(--color-primary)",
                borderColor: "#f8bbd0",
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
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded-full text-white font-medium text-sm mt-2 transition-all duration-200 active:scale-95"
              style={{
                backgroundColor: loading
                  ? "var(--color-primary-light)"
                  : "var(--color-primary)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Sending reset link…" : "Send Reset Link"}
            </button>

            <div className="text-center mt-6">
              <Link
                href="/login"
                className="text-xs hover:underline font-semibold"
                style={{ color: "var(--color-text-mid)" }}
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
