"use client";

import { resetPassword } from "@/src/services/authService";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [token, setToken] = useState("");
  const [tokenChecked, setTokenChecked] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Auto-extract verification code from URL parameter and immediately clear it from the address bar
  useEffect(() => {
    const urlToken = searchParams.get("code") || searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
      // Clean up the address bar immediately so the code is completely hidden
      if (typeof window !== "undefined") {
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: newUrl }, "", newUrl);
      }
    }
    setTokenChecked(true);
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!token || !newPassword || !confirmNewPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await resetPassword(token, newPassword);
      if (res.success) {
        setSuccess(true);
        // Clear fields
        setNewPassword("");
        setConfirmNewPassword("");
        setToken("");
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(res.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. The token may be invalid or expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Render an invalid link state if no token was supplied in the URL
  if (tokenChecked && !token && !success) {
    return (
      <div
        className="rounded-3xl p-8 shadow-sm w-full max-w-md animate-fadeIn"
        style={{
          backgroundColor: "white",
          border: "1px solid var(--color-sand)",
        }}
      >
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ backgroundColor: "#fee2e2" }}
          >
            ⚠️
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-text-dark)" }}
          >
            Invalid Reset Link
          </h1>
          <p
            className="mt-3 mb-6 text-sm"
            style={{ color: "var(--color-text-light)" }}
          >
            This password reset link is invalid, expired, or has already been used. Please request a new link.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block px-6 py-2.5 rounded-full text-white font-medium text-sm transition-all duration-200 active:scale-95 hover:opacity-90"
            style={{ backgroundColor: "var(--color-primary)", cursor: "pointer" }}
          >
            Go to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl p-8 shadow-sm w-full max-w-md animate-fadeIn"
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
          🔒
        </div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--color-text-dark)" }}
        >
          Create New Password
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--color-text-light)" }}
        >
          Choose a new secure password for your account.
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
          Password updated successfully! Redirecting you to login...
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
            New Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-mid)" }}
          >
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="input-field"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || success}
          className="w-full py-3 rounded-full text-white font-medium text-sm mt-2 transition-all duration-200 active:scale-95"
          style={{
            backgroundColor: loading || success
              ? "var(--color-primary-light)"
              : "var(--color-primary)",
            cursor: loading || success ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Resetting password…" : "Reset Password"}
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
  );
}

export default function ResetPasswordPage() {
  return (
    <main
      className="flex-1 flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <Suspense fallback={
        <div className="text-center text-sm" style={{ color: "var(--color-text-mid)" }}>
          Loading reset password page...
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
