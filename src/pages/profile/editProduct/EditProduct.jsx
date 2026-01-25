import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import API from "../../../services/api";
import styles from "./EditProduct.module.css";
import { FiUpload, FiSave } from "react-icons/fi";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../../config/apiBase";
import { imgSrc } from "../../../utils/imgSrc";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
  });

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const theme = useSelector((state) => state.theme.mode);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await API.get(`/products/${id}`);
        setForm({
          title: productRes.data.title || "",
          description: productRes.data.description || "",
          category:
            productRes.data.category?._id || productRes.data.category || "",
        });
        setExistingImages(productRes.data.images || []);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }

      try {
        const catRes = await API.get("/categories");
        const data = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data.categories || [];
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category", form.category);
    images.forEach((file) => formData.append("images", file));

    try {
      await API.put(`/products/${id}`, formData);
      navigate("/profile");
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className={`${styles.container} ${theme === "dark" ? styles.dark : ""}`}>
      <h2 className={styles.title}>Edit Product</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className={styles.input}
        />

        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          className={styles.textarea}
        />

        <label>Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className={styles.select}
        >
          <option value="">Select</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <label>New Images</label>
        <div className={styles.uploadWrapper}>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className={styles.fileInput}
          />
          <FiUpload className={styles.uploadIcon} />
        </div>

        <div className={styles.imagePreview}>
          {existingImages.map((img, idx) => (
            <div key={idx} className={styles.card}>
              <img
                src={imgSrc(img, API_BASE_URL)}
                alt="existing"
                className={styles.previewImg}
              />
            </div>
          ))}
        </div>

        <button type="submit" className={styles.saveBtn}>
          <FiSave /> Save
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
