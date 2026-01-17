import React, { useEffect, useState } from "react";
import styles from "./ChatList.module.css";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchChats,
  setSelectedChat,
  resetUnread,
  incrementUnread,
} from "../../../redux/reducers/chatSlice";
import API from "../../../services/api";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../../config/apiBase";

const ChatList = () => {
  const dispatch = useDispatch();
  const { chatList, selectedChatId } = useSelector((state) => state.chat);
  const user = useSelector((state) => state.user.user);
  const theme = useSelector((state) => state.theme.mode);

  const [socket, setSocket] = useState(null);

  // ✅ socket connect (component içində)
  useEffect(() => {
    const s = io(API_BASE_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // ✅ chat list fetch
  useEffect(() => {
    if (user?._id) dispatch(fetchChats(user._id));
  }, [dispatch, user?._id]);

  // ✅ realtime message listener
  useEffect(() => {
    if (!socket || !user?._id) return;

    const onNewMessage = (msg) => {
      if (!msg?.chat) return;
      if (msg.sender?._id === user._id || msg.sender === user._id) return;

      // msg.chat bəzən id string olur, bəzən object ola bilər
      const chatId = typeof msg.chat === "string" ? msg.chat : msg.chat?._id;

      if (chatId && selectedChatId !== chatId) {
        dispatch(incrementUnread(chatId));
      }

      dispatch(fetchChats(user._id));
    };

    socket.on("newMessage", onNewMessage);
    return () => socket.off("newMessage", onNewMessage);
  }, [socket, dispatch, selectedChatId, user?._id]);

  const handleChatClick = async (chat) => {
    dispatch(setSelectedChat(chat));
    dispatch(resetUnread(chat._id));

    try {
      await API.put(`/chat/read/${user._id}`, { chatId: chat._id });
      dispatch(fetchChats(user._id));
    } catch (err) {
      console.error("❌ Failed to mark as read:", err);
    }
  };

  return (
    <div className={`${styles.chatlist} ${theme === "dark" ? "dark" : ""}`}>
      <h3 className={styles.title}>Chats</h3>

      {(chatList || []).map((chat) => {
        const otherUser = chat.participants?.find((p) => p._id !== user?._id);
        if (!otherUser) return null;

        const avatarSrc = otherUser.profileImage
          ? `${API_BASE_URL}/uploads/${otherUser.profileImage}`
          : `${API_BASE_URL}/uploads/default.png`;

        return (
          <div
            key={chat._id}
            className={`${styles.chatItem} ${
              chat._id === selectedChatId ? styles.active : ""
            }`}
            onClick={() => handleChatClick(chat)}
          >
            <img
              src={avatarSrc}
              alt={otherUser.username || otherUser.name}
              className={styles.avatar}
            />

            <div className={styles.chatInfo}>
              <p className={styles.name}>{otherUser.username || otherUser.name}</p>
              <p className={styles.lastMsg}>
                {chat.latestMessage?.content ||
                  (chat.latestMessage?.image ? "📷 Photo" : "No messages yet")}
              </p>
            </div>

            {chat.unreadCount > 0 && (
              <span className={styles.badge}>{chat.unreadCount}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
