import React, { useState } from "react";
import styles from "./ForgotPassword.module.css";
import { useNavigate } from "react-router";
import API from "../../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    console.log("SUBMIT CLICKED. email =", email);

    setError("");
    setLoading(true);

    try {
      console.log("BASE URL:", API.defaults.baseURL);

      const res = await API.post("/auth/forgot-password", { email });

      console.log("RESPONSE:", res.data);
      localStorage.setItem("resetEmail", email);
      navigate("/reset-password");
    } catch (err) {
      console.log("ERROR FULL:", err);
      console.log("ERROR RESPONSE:", err.response?.data);

      setError(err.response?.data?.error || err.message || "Kod göndərilə bilmədi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Forgot password?</h2>

        <form onSubmit={handleSendCode} className={styles.form}>
          <input
            type="email"
            placeholder="Emaili daxil edin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Sending..." : "Send code"}
          </button>

          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
