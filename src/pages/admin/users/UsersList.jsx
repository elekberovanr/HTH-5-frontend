import React, { useEffect, useState } from "react";
import API from "../../../services/api";
import styles from "./UsersList.module.css";
import { FiEdit3, FiTrash2, FiSave, FiSearch } from "react-icons/fi";
import { API_BASE_URL } from "../../../config/apiBase";
import { imgSrc } from "../../../utils/imgSrc";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data || []);
        setFilteredUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = (users || []).filter((user) =>
      user.email?.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleEdit = (user) => {
    setEditUserId(user._id);
    setEditData({
      username: user.username || "",
      email: user.email || "",
      password: "",
    });
  };

  const handleSave = async () => {
    try {
      const updated = {};
      if (editData.username.trim()) updated.username = editData.username.trim();
      if (editData.email.trim()) updated.email = editData.email.trim();
      if (editData.password.trim())
        updated.password = editData.password.trim();

      const res = await API.put(`/admin/update-user/${editUserId}`, updated);
      const data = res.data;

      setUsers((prev) =>
        prev.map((user) =>
          user._id === editUserId ? { ...user, ...data } : user
        )
      );

      setEditUserId(null);
      setEditData({ username: "", email: "", password: "" });
    } catch (err) {
      alert("Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/admin/delete-user/${id}`);
      setUsers(users.filter((user) => user._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const profileImgSrc = (profileImage) =>
    profileImage ? imgSrc(profileImage, API_BASE_URL) : null;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>User Management</h2>

      <div className={styles.searchBar}>
        <FiSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableWrapper}>
        <div className={`${styles.row} ${styles.header}`}>
          <div>Profile</div>
          <div>Username</div>
          <div>Email</div>
          <div>Password</div>
          <div>Actions</div>
        </div>

        {filteredUsers.map((user) => (
          <div className={styles.row} key={user._id}>
            {editUserId === user._id ? (
              <>
                <div>
                  {user.profileImage && (
                    <img
                      src={profileImgSrc(user.profileImage)}
                      alt="profile"
                      className={styles.avatar}
                    />
                  )}
                </div>

                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) =>
                    setEditData({ ...editData, username: e.target.value })
                  }
                />
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({ ...editData, email: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={editData.password}
                  onChange={(e) =>
                    setEditData({ ...editData, password: e.target.value })
                  }
                />

                <div className={styles.actions}>
                  <button onClick={handleSave}>
                    <FiSave />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  {user.profileImage && (
                    <img
                      src={profileImgSrc(user.profileImage)}
                      alt="profile"
                      className={styles.avatar}
                    />
                  )}
                </div>

                <div>{user.username}</div>
                <div>{user.email}</div>
                <div>••••••</div>

                <div className={styles.actions}>
                  <button onClick={() => handleEdit(user)}>
                    <FiEdit3 />
                  </button>
                  <button onClick={() => handleDelete(user._id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;
