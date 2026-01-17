import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./ResetPassword.module.css";
import API from "../../../services/api"; 
// ⚠️ path fərqlidirsə düzəlt: məsələn ../../../services/api

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("resetEmail");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/auth/reset-password", {
        email,
        code,
        newPassword,
      });

      alert("Şifrə uğurla yeniləndi!");
      localStorage.removeItem("resetEmail");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Yenilənmə zamanı xəta baş verdi");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Reset Password</h2>

        <form onSubmit={handleReset} className={styles.form}>
          <input type="email" value={email} disabled className={styles.input} />

          <input
            type="text"
            placeholder="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={styles.input}
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={styles.input}
            required
          />

          <button type="submit" className={styles.button}>
            Reset Password
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
