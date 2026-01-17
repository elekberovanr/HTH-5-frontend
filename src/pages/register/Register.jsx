import React, { useState } from "react";
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

    if (!SITE_KEY) return setError("Captcha site key tapılmadı (VITE_RECAPTCHA_SITE_KEY).");

    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!recaptchaToken) return setError("Please complete the captcha.");

    const formData = new FormData();
    for (const key in form) {
      if (key !== "confirmPassword" && form[key]) {
        formData.append(key, form[key]);
      }
    }

    // ✅ backend bu adı gözləməlidir
    formData.append("recaptchaToken", recaptchaToken);

    try {
      await API.post("/auth/register", formData);
      alert("✅ Registration successful");
      navigate("/login");
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "❌ Registration failed");
      // captcha token bir dəfəlik ola bilər, reset üçün:
      setRecaptchaToken("");
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
            <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
          </div>

          <div className={styles.inputGroup}>
            <FiMail className={styles.icon} />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          </div>

          <div className={styles.inputGroup}>
            <FiLock className={styles.icon} />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          </div>

          <div className={styles.inputGroup}>
            <FiLock className={styles.icon} />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
          </div>

          <div className={styles.inputGroup}>
            <FiCalendar className={styles.icon} />
            <input type="date" name="birthday" onChange={handleChange} required />
          </div>

          <div className={styles.inputGroup}>
            <BsGenderAmbiguous className={styles.icon} />
            <select name="gender" onChange={handleChange} required>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <FiMapPin className={styles.icon} />
            <input type="text" name="city" placeholder="City" onChange={handleChange} required />
          </div>

          {/* Əgər şəkil inputun varsa */}
          {/* <input type="file" name="profileImage" onChange={handleFile} /> */}

          <div className={styles.captchaWrapper}>
           <ReCAPTCHA
  sitekey="6Lf0yU0sAAAAACWM1eQjjtdMHMr5eKWy9oZibILj"
  onChange={handleCaptcha}
/>

          </div>

          <button type="submit" className={styles.button}>Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
