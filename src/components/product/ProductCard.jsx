import React, { useEffect, useState } from "react";
import styles from "./ProductCard.module.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { addFavorite, removeFavorite, getFavorites } from "../../services/api";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { API_BASE_URL } from "../../config/apiBase";
import { imgSrc } from "../../utils/imgSrc";

const ProductCard = ({ product }) => {
  const user = useSelector((state) => state.user.user);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !product?._id) return;
      try {
        const favorites = await getFavorites();
        const exists = favorites.some((f) => f.product?._id === product._id);
        setIsFavorited(exists);
      } catch (err) {
        console.error("Error checking favorites:", err.message);
      }
    };
    checkFavorite();
  }, [product?._id, user]);

  const handleFavoriteClick = async () => {
    if (!user || !product?._id) return;
    try {
      if (isFavorited) {
        await removeFavorite(product._id);
        setIsFavorited(false);
      } else {
        await addFavorite(product._id);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error("Favorite error:", err.response?.data || err.message);
    }
  };

  if (!product) return null;

  const userData = product.user || product.userId;
  const userName = userData?.name || "User";

  const profileImg = userData?.profileImage
    ? imgSrc(userData.profileImage, API_BASE_URL)
    : "/default-user.png";

  const productImg = product.images?.[0]
    ? imgSrc(product.images[0], API_BASE_URL)
    : "/no-image.png";

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={productImg}
          alt={product.title}
          className={styles.productImage}
        />

        <button className={styles.favoriteBtn} onClick={handleFavoriteClick}>
          {isFavorited ? (
            <FaHeart className={styles.heartIcon} />
          ) : (
            <FaRegHeart className={styles.heartIcon} />
          )}
        </button>
      </div>

      <div className={styles.cardContent}>
        {userData && (
          <Link to={`/user/${userData._id}`} className={styles.userInfo}>
            <img src={profileImg} alt="user" className={styles.profileImage} />
            <span>{userName}</span>
          </Link>
        )}

        <h3 className={styles.title}>{product.title}</h3>

        <p className={styles.description}>
          {product.description?.slice(0, 20)}...
        </p>

        <Link to={`/product/${product._id}`} className={styles.readMore}>
          Read more..
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
