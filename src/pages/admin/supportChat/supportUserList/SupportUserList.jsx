import React, { useEffect, useState } from "react";
import styles from "./SupportUserList.module.css";
import API from "../../../../services/api";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedChat } from "../../../../redux/reducers/chatSlice";
import defaultAvatar from "../../../../assets/default-user.png";
import { API_BASE_URL } from "../../../../config/apiBase";

const SupportUserList = ({ onSelectUser, selectedUser }) => {
  const [users, setUsers] = useState([]);
  const globalNotifications = useSelector((state) => state.chat.notifications || {});
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/support/admin");

        // Sıralama: ən son mesaja görə
        const sorted = (res.data || []).sort((a, b) => {
          const aTime = new Date(a.lastMessage?.createdAt || 0);
          const bTime = new Date(b.lastMessage?.createdAt || 0);
          return bTime - aTime;
        });

        setUsers(sorted);
      } catch (err) {
        console.error("Failed to fetch support users:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleSelect = (user) => {
    dispatch(setSelectedChat({ _id: user._id }));
    onSelectUser(user);
  };

  return (
    <div className={styles.userList}>
      {users
        .slice()
        .sort((a, b) => {
          const timeA = new Date(a.lastMessage?.createdAt || 0).getTime();
          const timeB = new Date(b.lastMessage?.createdAt || 0).getTime();
          return timeB - timeA;
        })
        .map((user) => {
          const unreadCount = globalNotifications[user._id] || 0;

          const imageSrc = user.profileImage
            ? user.profileImage.startsWith("http")
              ? user.profileImage
              : `${API_BASE_URL}/uploads/${user.profileImage}`
            : defaultAvatar;

          return (
            <div
              key={user._id}
              className={`${styles.userItem} ${
                selectedUser?._id === user._id ? styles.active : ""
              }`}
              onClick={() => handleSelect(user)}
            >
              <img
                src={imageSrc}
                alt="profile"
                className={styles.avatar}
                onError={(e) => (e.currentTarget.src = defaultAvatar)}
              />

              <div className={styles.details}>
                <div className={styles.nameWrapper}>
                  <div className={styles.nameEmail}>
                    <div className={styles.name}>{user.name}</div>
                    <div className={styles.email}>{user.email}</div>
                  </div>

                  {unreadCount > 0 && (
                    <span className={styles.notificationBadge}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>

                <div className={styles.lastMessage}>
                  {user.lastMessage?.content ||
                    (user.lastMessage?.image ? "📷 Photo" : "")}
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default SupportUserList;
