import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../redux/reducers/themeSlice";
import { useState, useEffect } from "react";
import styles from "./Header.module.css";

import { FiMenu, FiX, FiSun, FiMoon } from "react-icons/fi";
import { BiAddToQueue, BiMessage, BiMoney } from "react-icons/bi";
import { HiSearch } from "react-icons/hi";
import { FaHome } from "react-icons/fa";
import logo2 from "../../assets/logo2.png";

import { API_BASE_URL } from "../../config/apiBase";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");
  const user = useSelector((state) => state.user.user);
  const theme = useSelector((state) => state.theme.mode);
  const notifications = useSelector((state) => state.chat.notifications || {});
  const unreadCount = Object.values(notifications).reduce(
    (sum, val) => sum + val,
    0
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const resizeHandler = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  if (isAdminPage) return null;

  const avatarSrc = user?.profileImage
    ? `${API_BASE_URL}/uploads/${user.profileImage}`
    : null;

  return (
    <header className={styles.header}>
      <div className={styles.nav}>
        <Link to="/" className={styles.logoWrap}>
          <img src={logo2} alt="Logo" className={styles.logo} />
          <span className={styles.title}>HTH</span>
        </Link>

        {!isMobile && (
          <nav className={styles.navLinks}>
            <Link to="/" className={styles.link}>
              <FaHome /> Home
            </Link>
            <Link to="/search" className={styles.link}>
              <HiSearch /> Search
            </Link>
            <Link to="/chat" className={styles.link}>
              <BiMessage />
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
              Chat
            </Link>
            <Link to="/donation" className={styles.link}>
              <BiMoney /> Donation
            </Link>
            <button
              onClick={() => dispatch(toggleTheme())}
              className={styles.themeToggle}
            >
              {theme === "dark" ? <FiSun /> : <FiMoon />}
            </button>
          </nav>
        )}

        <div className={styles.right}>
          {user ? (
            <>
              <Link to="/add" className={styles.icon}>
                <BiAddToQueue />
              </Link>

              <Link to="/profile" className={styles.profileLink}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt="P" className={styles.avatar} />
                ) : (
                  <FaHome className={styles.icon} />
                )}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.authLink}>
                Login
              </Link>
              <Link to="/register" className={styles.authLink}>
                Register
              </Link>
            </>
          )}

          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={styles.menuToggle}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          )}
        </div>
      </div>

      {isMobile && menuOpen && (
        <nav className={styles.mobileMenu}>
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className={styles.link}
          >
            <FaHome /> Home
          </Link>
          <Link
            to="/search"
            onClick={() => setMenuOpen(false)}
            className={styles.link}
          >
            <HiSearch /> Search
          </Link>
          <Link
            to="/chat"
            onClick={() => setMenuOpen(false)}
            className={styles.link}
          >
            <BiMessage />
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
            Chat
          </Link>
          <Link
            to="/donation"
            onClick={() => setMenuOpen(false)}
            className={styles.link}
          >
            <BiMoney /> Donation
          </Link>
          <button
            onClick={() => dispatch(toggleTheme())}
            className={styles.themeToggle}
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>
        </nav>
      )}
    </header>
  );
}

export default Header;
