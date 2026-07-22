import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect if already logged in
    const token = localStorage.getItem("artistic_carpets_admin_token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

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
        localStorage.setItem("artistic_carpets_admin_user", JSON.stringify(data.admin));
        navigate("/");
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
      {/* Background patterns */}
      <div style={styles.glow} />
      
      <div style={styles.card} className="glass">
        <div style={styles.brand}>
          <h1 style={styles.title}>Artistic Carpets</h1>
          <p style={styles.subtitle}>Management Console Access</p>
        </div>

        {error && (
          <div style={styles.errorBox} className="fade-in">
            <AlertCircle size={18} style={{ color: "var(--color-danger)", flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="identifier">Email or Phone</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                id="identifier"
                type="text"
                placeholder="admin@artisticcarpets.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                style={styles.inputWithIcon}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.inputWithIcon}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ ...styles.submitBtn, ...(loading ? styles.btnDisabled : {}) }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In to Admin"}
          </button>
        </form>
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
    backgroundColor: "var(--bg-primary)",
    position: "relative",
    overflow: "hidden",
    padding: "20px",
  },
  glow: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, var(--bg-hero) 0%, transparent 70%)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    padding: "48px 40px",
    borderRadius: "var(--border-radius-lg)",
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    boxShadow: "var(--shadow-md)",
    zIndex: 10,
    animation: "fadeIn 0.4s ease-out",
  },
  brand: {
    textAlign: "center",
    marginBottom: "32px",
  },
  title: {
    fontFamily: "var(--font-serif)",
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "6px",
    color: "var(--primary-brand)",
  },
  subtitle: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "rgba(185, 28, 28, 0.08)",
    border: "1px solid rgba(185, 28, 28, 0.2)",
    borderRadius: "var(--border-radius-sm)",
    padding: "12px 16px",
    marginBottom: "24px",
    color: "var(--color-danger)",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "16px",
    color: "var(--text-muted)",
    pointerEvents: "none",
  },
  inputWithIcon: {
    width: "100%",
    backgroundColor: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--border-radius-sm)",
    padding: "12px 16px 12px 48px",
    fontSize: "15px",
    transition: "var(--transition-fast)",
    color: "var(--text-primary)",
    outline: "none",
  },
  eyeBtn: {
    position: "absolute",
    right: "16px",
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtn: {
    marginTop: "12px",
    width: "100%",
    padding: "14px",
    fontSize: "15px",
    fontWeight: "600",
  },
  btnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
    transform: "none !important",
    boxShadow: "none !important",
  },
};
