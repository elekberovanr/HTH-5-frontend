import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import styles from "./Profile.module.css";
import { useNavigate } from "react-router-dom";
import {
  BiUserCircle,
  BiCake,
  BiPencil,
  BiLogOut,
  BiDonateHeart,
} from "react-icons/bi";
import { CiLocationArrow1 } from "react-icons/ci";
import { BsGenderAmbiguous } from "react-icons/bs";
import { FaHeart, FaTshirt } from "react-icons/fa";
import MyProducts from "./myProducts/MyProducts";
import Favorites from "../favorites/Favorites";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/reducers/userSlice";
import Donations from "../donations/Donations";
import { API_BASE_URL } from "../../config/apiBase";
import { imgSrc } from "../../utils/imgSrc";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("/auth/me");
        setProfile(res.data);
      } catch (err) {
        dispatch(logout());
        navigate("/login");
      }
    };

    fetchProfile();
  }, [token, dispatch, navigate]);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1b4b43",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        navigate("/login");
        Swal.fire("Logged out!", "You have been logged out.", "success");
      }
    });
  };

  if (!profile) return <p className={styles.loading}>Loading...</p>;

  const getImageUrl = (img, type = "profile") => {
    if (!img) {
      return type === "banner" ? "/default-banner.jpg" : "/assets/default-profile.jpg";
    }
    return imgSrc(img, API_BASE_URL);
  };

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.bannerWrapper}>
        <img
          src={getImageUrl(profile.bannerImage, "banner")}
          alt="Banner"
          className={styles.bannerImage}
        />
      </div>

      <div className={styles.profileTop}>
        <div className={styles.avatarSection}>
          {profile.profileImage ? (
            <img
              src={getImageUrl(profile.profileImage)}
              alt="Profile"
              className={styles.avatar}
            />
          ) : (
            <BiUserCircle className={styles.defaultIcon} />
          )}
        </div>

        <div className={styles.detailsSection}>
          <h2>{profile.name}</h2>
          <p className={styles.email}>{profile.email}</p>

          <div className={styles.meta}>
            {profile.city && (
              <p>
                <CiLocationArrow1 className={styles.icon} /> {profile.city}
              </p>
            )}
            {profile.gender && (
              <p>
                <BsGenderAmbiguous className={styles.icon} /> {profile.gender}
              </p>
            )}
            {profile.birthday && (
              <p>
                <BiCake className={styles.icon} />{" "}
                {new Date(profile.birthday).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className={styles.actions}>
            <button
              className={styles.editBtn}
              onClick={() => navigate("/profile/edit")}
            >
              <BiPencil /> Edit Profile
            </button>

            <button className={styles.logoutBtn} onClick={handleLogout}>
              <BiLogOut /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tabNav}>
        <button
          className={activeTab === "products" ? styles.active : ""}
          onClick={() => setActiveTab("products")}
        >
          <FaTshirt /> <span>My Products</span>
        </button>

        <button
          className={activeTab === "favorites" ? styles.active : ""}
          onClick={() => setActiveTab("favorites")}
        >
          <FaHeart /> <span>Favorites</span>
        </button>

        <button
          className={activeTab === "donations" ? styles.active : ""}
          onClick={() => setActiveTab("donations")}
        >
          <BiDonateHeart /> <span>Donations</span>
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "products" && <MyProducts />}
        {activeTab === "favorites" && <Favorites />}
        {activeTab === "donations" && <Donations />}
      </div>
    </div>
  );
};

export default Profile;
