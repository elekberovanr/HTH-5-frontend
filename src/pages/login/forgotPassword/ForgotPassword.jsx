import React, { useState } from "react";
import styles from "./ForgotPassword.module.css";
import { useNavigate } from "react-router";
import API from "../../../services/api"; // path əgər fərqlidirsə düzəlt
// Məs: ../../../services/api ola bilər, səndə bu fayl haradadırsa ona uyğun et

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/auth/forgot-password", { email });
      localStorage.setItem("resetEmail", email);
      navigate("/reset-password");
    } catch (err) {
      setError(err.response?.data?.error || "Kod göndərilə bilmədi");
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

          <button type="submit" className={styles.button}>
            Send code
          </button>

          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
