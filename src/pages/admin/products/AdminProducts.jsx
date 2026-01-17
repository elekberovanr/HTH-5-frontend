// src/pages/admin/products/AdminProducts.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, updateProduct } from "../../../redux/reducers/productSlice";
import axios from "../../../services/api";
import styles from "./AdminProducts.module.css";
import { FiEdit3, FiTrash2, FiSave } from "react-icons/fi";
import { API_BASE_URL } from "../../../config/apiBase";

const AdminProducts = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);

  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "", category: "" });
  const [filterEmail, setFilterEmail] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    dispatch(fetchProducts());
    fetchCategories();
  }, [dispatch]);

  const fetchCategories = async () => {
    const res = await axios.get("/categories");
    // əgər backend {categories: []} qaytarırsa, bu da işləyəcək:
    const data = Array.isArray(res.data) ? res.data : res.data.categories || [];
    setCategories(data);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      await axios.delete(`/admin/delete-product/${id}`);
      dispatch(fetchProducts());
    }
  };

  const handleEdit = (product) => {
    setEditId(product._id);
    setEditData({
      title: product.title || "",
      description: product.description || "",
      category: product.category?._id || product.category || "",
    });
  };

  const handleSave = () => {
    dispatch(updateProduct({ id: editId, data: editData }));
    setEditId(null);
    setEditData({ title: "", description: "", category: "" });
  };

  const filteredProducts = (products || []).filter(
    (p) =>
      (!filterEmail || p.user?.email?.includes(filterEmail)) &&
      (!filterCategory || p.category === filterCategory || p.category?._id === filterCategory)
  );

  return (
    <div className={styles.container}>
      <h2>Admin - Products</h2>

      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Search by email"
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
        />

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Description</th>
            <th>Email</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product._id}>
              <td data-label="Image">
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {product.images?.slice(0, 2).map((img, i) => (
                    <img
                      key={i}
                      src={`${API_BASE_URL}/uploads/${img}`}
                      alt=""
                    />
                  ))}
                </div>
              </td>

              {editId === product._id ? (
                <>
                  <td data-label="Title">
                    <input
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    />
                  </td>

                  <td data-label="Description">
                    <input
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    />
                  </td>

                  <td data-label="Email">{product.user?.email || "-"}</td>

                  <td data-label="Category">
                    <select
                      value={editData.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    >
                      <option value="">Select</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td data-label="Actions" className={styles.actions}>
                    <button onClick={handleSave}>
                      <FiSave />
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td data-label="Title">{product.title}</td>
                  <td data-label="Description">{product.description}</td>
                  <td data-label="Email">{product.user?.email || "-"}</td>
                  <td data-label="Category">{product.category?.name || "-"}</td>

                  <td data-label="Actions" className={styles.actions}>
                    <button onClick={() => handleEdit(product)}>
                      <FiEdit3 />
                    </button>
                    <button onClick={() => handleDelete(product._id)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProducts;
