import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../../services/api";
import ProductCard from "../../components/product/ProductCard";
import styles from "./UserProfile.module.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchChats, setSelectedChat } from "../../redux/reducers/chatSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { BiCake, BiLocationPlus } from "react-icons/bi";
import { API_BASE_URL } from "../../config/apiBase";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);

  const [profileUser, setProfileUser] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get(`/users/${id}`);
        setProfileUser(res.data);
      } catch (err) {
        setError("User not found or network error.");
      }
    };

    const fetchUserProducts = async () => {
      try {
        const res = await API.get(`/products/user/${id}`);
        setUserProducts(res.data || []);
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    };

    fetchUser();
    fetchUserProducts();
  }, [id]);

  const handleStartChat = async () => {
    try {
      const res = await API.post("/chat", { receiverId: id });
      const chatId = res.data._id;

      const chatDetail = await API.get(`/chat/chat-info/${chatId}`);
      dispatch(fetchChats(user._id));
      dispatch(setSelectedChat(chatDetail.data));

      navigate(`/chat/${chatId}`);
    } catch (err) {
      alert("Failed to start chat");
    }
  };

  if (error) return <p className={styles.error}>{error}</p>;
  if (!profileUser) return <LoadingSpinner />;

  const bannerSrc = profileUser.bannerImage
    ? `${API_BASE_URL}/uploads/${profileUser.bannerImage}`
    : `${API_BASE_URL}/uploads/default-banner.jpg`;

  const avatarSrc = profileUser.profileImage
    ? `${API_BASE_URL}/uploads/${profileUser.profileImage}`
    : `${API_BASE_URL}/uploads/default-user.png`;

  return (
    <div className={styles.container}>
      <div className={styles.bannerWrapper}>
        <img src={bannerSrc} alt="Banner" className={styles.banner} />
      </div>

      <div className={styles.profileSection}>
        <img src={avatarSrc} alt="Profile" className={styles.avatar} />

        <div className={styles.details}>
          <h2>{profileUser.username || profileUser.name}</h2>
          <p>{profileUser.email}</p>

          {profileUser.city && (
            <p>
              <BiLocationPlus /> {profileUser.city}
            </p>
          )}

          {profileUser.gender && <p>⚧ {profileUser.gender}</p>}

          {profileUser.birthday && (
            <p>
              <BiCake /> {new Date(profileUser.birthday).toLocaleDateString()}
            </p>
          )}

          {user?._id && user._id !== profileUser._id && (
            <button className={styles.chatButton} onClick={handleStartChat}>
              Message
            </button>
          )}
        </div>
      </div>

      <h3 className={styles.sectionTitle}>Shared Products</h3>

      <div className={styles.productList}>
        {userProducts.length > 0 ? (
          userProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p className={styles.noProducts}>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
