import React, { useEffect, useState } from "react";
import API from "../../../services/api";
import styles from "./EditProfile.module.css";
import { useNavigate } from "react-router";
import { FaPen } from "react-icons/fa";
import { API_BASE_URL } from "../../../config/apiBase";
import { imgSrc } from "../../../utils/imgSrc";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    gender: "",
    birthday: "",
    profileImage: null,
    bannerImage: null,
  });

  const [preview, setPreview] = useState({
    profileImage: null,
    bannerImage: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/me");
        const user = res.data;

        setFormData({
          name: user.name || "",
          city: user.city || "",
          gender: user.gender || "",
          birthday: user.birthday ? user.birthday.slice(0, 10) : "",
          profileImage: null,
          bannerImage: null,
        });

        setPreview({
          profileImage: user.profileImage
            ? imgSrc(user.profileImage, API_BASE_URL)
            : null,
          bannerImage: user.bannerImage
            ? imgSrc(user.bannerImage, API_BASE_URL)
            : null,
        });
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
      setPreview((prev) => ({ ...prev, [name]: URL.createObjectURL(file) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      await API.put("/auth/me", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/profile");
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Profil yenilənmədi");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.bannerWrapper}>
        {preview.bannerImage && (
          <img
            src={preview.bannerImage}
            alt="Banner"
            className={styles.bannerImage}
          />
        )}

        <label className={styles.bannerEdit}>
          <FaPen />
          <input
            type="file"
            name="bannerImage"
            accept="image/*"
            onChange={handleChange}
          />
        </label>
      </div>

      <div className={styles.profileBox}>
        <div className={styles.profileImageWrapper}>
          {preview.profileImage && (
            <img
              src={preview.profileImage}
              alt="Profile"
              className={styles.avatar}
            />
          )}

          <label className={styles.profileEdit}>
            <FaPen />
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleChange}
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <h2 className={styles.title}>Edit Profile</h2>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />

          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
          />

          <button type="submit" className={styles.button}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
