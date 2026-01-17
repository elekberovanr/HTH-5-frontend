import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { BsGenderAmbiguous } from "react-icons/bs";
import { FiCalendar, FiLock, FiMail, FiMapPin, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router";
import API from "../../services/api";
import styles from "./Register.module.css";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCaptcha = (token) => {
    setRecaptchaToken(token || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1) Site key mütləq env-də olmalıdır
    if (!SITE_KEY) {
      return setError("Captcha site key tapılmadı. Vercel-də VITE_RECAPTCHA_SITE_KEY əlavə et.");
    }

    // 2) Sadə validasiyalar
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    if (!recaptchaToken) return setError("Please complete the captcha.");

    // 3) FormData
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key !== "confirmPassword" && val) formData.append(key, val);
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
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
            />
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

          <div className={styles.captchaWrapper}>
           <ReCAPTCHA
  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
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
