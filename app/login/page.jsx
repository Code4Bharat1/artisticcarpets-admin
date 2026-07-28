"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("artistic_carpets_admin_token");
    if (token) router.push("/");
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest.post("/auth/admin/login", {
        identifier,
        password,
      });

      if (data.success && data.token) {
        localStorage.setItem("artistic_carpets_admin_token", data.token);
        localStorage.setItem(
          "artistic_carpets_admin_user",
          JSON.stringify(data.admin)
        );
        router.push("/");
      } else {
        setError(data.message || "Failed to authenticate.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      <div style={styles.card}>
        {/* Left Panel */}
        <div style={styles.leftPanel}>
          <div style={styles.leftTop}>
            <img src="/admin/logo2.jpeg" alt="Artistic Carpets" style={{ height: "60px", objectFit: "contain" }} />
          </div>
          
          <div style={styles.leftCenter}>
            <h2 style={styles.welcomeText}>
              Welcome Back to<br />Artistic Carpets
            </h2>
            <div style={styles.welcomeLine}></div>
          </div>

          <div style={styles.leftBottom}>
            <p style={styles.heritageText}>HANDWOVEN LUXURY HERITAGE SINCE 1924</p>
          </div>
        </div>

        {/* Right Panel */}
        <div style={styles.rightPanel}>
          <div style={styles.rightContent}>
            <h2 style={styles.formTitle}>Login to Your Account</h2>
            <p style={styles.formSubtitle}>Welcome back. Please enter your details.</p>

            {error && (
              <div style={styles.errorBox} className="fade-in">
                <AlertCircle size={16} style={{ color: "var(--color-danger)", flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="identifier">
                  EMAIL ADDRESS
                </label>
                <input
                  id="identifier"
                  type="text"
                  placeholder="admin@artisticcarpets.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={styles.input}
                  disabled={loading}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <div style={styles.passwordLabelRow}>
                  <label style={styles.label} htmlFor="password">
                    PASSWORD
                  </label>
                  <Link href="#" style={styles.forgotLink}>
                    Forgot Password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                style={{ ...styles.loginBtn, ...(loading ? styles.btnDisabled : {}) }}
                disabled={loading}
              >
                {loading ? "AUTHENTICATING..." : "LOGIN"}
              </button>

              <div style={styles.divider}>
                <span style={styles.dividerLine}></span>
                <span style={styles.dividerText}>OR LOGIN WITH</span>
                <span style={styles.dividerLine}></span>
              </div>

              <button type="button" style={styles.googleBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#FDF8F5", // Light cream background from screenshot
    position: "relative",
    padding: "20px",
  },
  backLink: {
    position: "absolute",
    top: "40px",
    left: "50px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "var(--primary-brand)",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.05em",
    textDecoration: "none",
  },
  card: {
    display: "flex",
    width: "100%",
    maxWidth: "1000px",
    height: "600px",
    backgroundColor: "#FFFFFF",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  leftPanel: {
    flex: 1,
    backgroundColor: "var(--primary-brand)", // Dark red
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#FFFFFF",
    position: "relative",
  },
  leftTop: {
    display: "flex",
    justifyContent: "flex-start",
  },
  brandTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: "24px",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  leftCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    flex: 1,
  },
  welcomeText: {
    fontFamily: "var(--font-serif)",
    fontSize: "36px",
    fontWeight: "600",
    lineHeight: "1.2",
    marginBottom: "20px",
    color: "#FFFFFF",
  },
  welcomeLine: {
    width: "60px",
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  leftBottom: {
    textAlign: "center",
  },
  heritageText: {
    fontSize: "10px",
    letterSpacing: "0.15em",
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    backgroundColor: "#FFFFFF",
  },
  rightContent: {
    width: "100%",
    maxWidth: "380px",
  },
  formTitle: {
    fontFamily: "var(--font-serif)",
    fontSize: "32px",
    fontWeight: "600",
    color: "var(--text-primary)",
    marginBottom: "8px",
  },
  formSubtitle: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    marginBottom: "36px",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "rgba(185, 28, 28, 0.08)",
    border: "1px solid rgba(185, 28, 28, 0.2)",
    borderRadius: "8px",
    padding: "10px 14px",
    marginBottom: "24px",
    color: "var(--color-danger)",
    fontSize: "13px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--text-primary)",
    letterSpacing: "0.05em",
    marginBottom: "8px",
  },
  passwordLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "8px",
  },
  forgotLink: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--primary-brand)",
    textDecoration: "none",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    backgroundColor: "#F2F5F8", // Light blue/gray background
    border: "1px solid transparent",
    borderRadius: "8px",
    fontSize: "14px",
    color: "var(--text-primary)",
    outline: "none",
    transition: "var(--transition-fast)",
  },
  loginBtn: {
    marginTop: "8px",
    width: "100%",
    padding: "16px",
    backgroundColor: "var(--primary-brand)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "0.05em",
    cursor: "pointer",
    transition: "var(--transition-fast)",
  },
  btnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "28px 0",
    gap: "12px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "var(--border-color)",
  },
  dividerText: {
    fontSize: "11px",
    color: "var(--text-muted)",
    letterSpacing: "0.05em",
    fontWeight: "600",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "14px",
    backgroundColor: "#FFFFFF",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "var(--transition-fast)",
    marginBottom: "28px",
  },
  signupText: {
    textAlign: "center",
    fontSize: "13px",
    color: "var(--text-secondary)",
  },
  signupLink: {
    color: "var(--primary-brand)",
    fontWeight: "600",
    textDecoration: "none",
  },
};
