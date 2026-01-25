import React, { useEffect, useState } from "react";
import API from "../../../services/api";
import styles from "./MyProducts.module.css";
import { Link } from "react-router-dom";
import { FiTrash2, FiMoreVertical } from "react-icons/fi";
import { BiPencil } from "react-icons/bi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Delete from "../../../components/delete/Delete";
import { useSelector } from "react-redux";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { API_BASE_URL } from "../../../config/apiBase";
import { imgSrc as toImgSrc } from "../../../utils/imgSrc";

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const theme = useSelector((state) => state.theme.mode);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products/my/products");
        setProducts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const askDelete = (id) => {
    setToDeleteId(id);
    setShowDialog(true);
    setOpenMenu(null);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/products/${toDeleteId}`);
      setProducts((prev) => prev.filter((p) => p._id !== toDeleteId));
      toast.success("Product deleted successfully!", { autoClose: 2000 });
    } catch (err) {
      toast.error("Failed to delete the product.");
      console.error("Delete error:", err);
    } finally {
      setShowDialog(false);
      setToDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDialog(false);
    setToDeleteId(null);
  };

  return (
    <div className={`${styles.container} ${theme === "dark" ? styles.dark : ""}`}>
      {loading ? (
        <div className={styles.spinnerWrapper}>
          <LoadingSpinner />
        </div>
      ) : (
        <div className={styles.grid}>
          {products.length === 0 ? (
            <p className={styles.empty}>No product yet...</p>
          ) : (
            products.map((product) => {
              const firstImg = product.images?.[0] || product.image;

              const imgSrc = firstImg
                ? toImgSrc(firstImg, API_BASE_URL)
                : "/no-image.png";

              return (
                <div key={product._id} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <img
                      src={imgSrc}
                      alt={product.title}
                      className={styles.image}
                    />

                    <button
                      className={styles.menuBtn}
                      onClick={() =>
                        setOpenMenu(openMenu === product._id ? null : product._id)
                      }
                    >
                      <FiMoreVertical />
                    </button>

                    {openMenu === product._id && (
                      <div className={styles.dropdownMenu}>
                        <Link
                          to={`/profile/edit/${product._id}`}
                          className={styles.dropdownItem}
                        >
                          <BiPencil /> Edit
                        </Link>

                        <button
                          onClick={() => askDelete(product._id)}
                          className={styles.dropdownItem}
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.info}>
                    <h3 className={styles.productTitle}>{product.title}</h3>
                    <p className={styles.desc}>
                      {product.description?.slice(0, 60)}...
                    </p>
                    <Link
                      to={`/product/${product._id}`}
                      className={styles.readMoreBtn}
                    >
                      Read more..
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <Delete
        isOpen={showDialog}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      <ToastContainer position="top-center" />
    </div>
  );
};

export default MyProducts;
