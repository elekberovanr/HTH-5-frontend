import React, { useRef, useState } from "react";
import styles from "./Register.module.css";
import { FiUser, FiMail, FiLock, FiCalendar, FiMapPin } from "react-icons/fi";
import { BsGenderAmbiguous } from "react-icons/bs";
import API from "../../services/api";
import { useNavigate } from "react-router";
import ReCAPTCHA from "react-google-recaptcha";

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
    gender: "",
    city: "",
    profileImage: null,
  });

  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const recaptchaRef = useRef(null);

  // Səhifə açılan kimi KEY-i görmək üçün (debug)
  console.log("RECAPTCHA SITE KEY:", SITE_KEY);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    setForm((prev) => ({ ...prev, profileImage: e.target.files?.[0] || null }));
  };

  const handleCaptcha = (token) => {
    setRecaptchaToken(token || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1) Site key yoxdursa, captcha işləməyəcək
    if (!SITE_KEY) {
      return setError(
        "Captcha site key tapılmadı. Lokal üçün .env faylına, deploy üçün Vercel env-ə VITE_RECAPTCHA_SITE_KEY əlavə et."
      );
    }

    // 2) Sadə validasiyalar
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!recaptchaToken) return setError("Please complete the captcha.");

    // 3) FormData
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key !== "confirmPassword" && val !== null && val !== "") {
        formData.append(key, val);
      }
    });

    // backend bunu gözləyir
    formData.append("recaptchaToken", recaptchaToken);

    try {
      await API.post("/auth/register", formData);
      alert("✅ Registration successful");
      navigate("/login");
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "❌ Registration failed");

      // token bir dəfəlik ola bilər → reset
      setRecaptchaToken("");
      recaptchaRef.current?.reset();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Register</h2>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <FiUser className={styles.icon} />
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <FiMail className={styles.icon} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <FiLock className={styles.icon} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <FiLock className={styles.icon} />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <FiCalendar className={styles.icon} />
            <input
              type="date"
              name="birthday"
              value={form.birthday}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <BsGenderAmbiguous className={styles.icon} />
            <select name="gender" value={form.gender} onChange={handleChange} required>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <FiMapPin className={styles.icon} />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>

          {/* Şəkil də göndərmək istəyirsənsə bunu aç */}
          {/* 
          <div className={styles.inputGroup}>
            <input type="file" name="profileImage" onChange={handleFile} />
          </div>
          */}

          <div className={styles.captchaWrapper}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={SITE_KEY}   // ✅ burdan oxuyur
              onChange={handleCaptcha}
            />
          </div>

          <button type="submit" className={styles.button}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
