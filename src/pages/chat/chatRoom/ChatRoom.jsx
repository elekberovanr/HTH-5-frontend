import React, { useEffect, useRef, useState } from "react";
import styles from "./ChatRoom.module.css";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import API from "../../../services/api";
import { BiSend } from "react-icons/bi";
import { BsImage } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa";
import {
  fetchChats,
  markChatAsRead,
  resetChat,
  setSelectedChat,
  incrementUnread,
} from "../../../redux/reducers/chatSlice";
import { API_BASE_URL } from "../../../config/apiBase";
import { imgSrc } from "../../../utils/imgSrc";

const ChatRoom = () => {
  const { chatId } = useParams();
  const dispatch = useDispatch();
  const { chatList, selectedChat } = useSelector((state) => state.chat);
  const user = useSelector((state) => state.user.user);

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const chatBoxRef = useRef(null);

  const recipient = selectedChat?.participants?.find((p) => p._id !== user?._id);

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

  useEffect(() => {
    if (user?._id) dispatch(fetchChats(user._id));
  }, [dispatch, user?._id]);

  useEffect(() => {
    if (!chatId || !chatList?.length) return;
    const found = chatList.find((c) => c._id === chatId);
    if (found) dispatch(setSelectedChat(found));
  }, [chatId, chatList, dispatch]);

  useEffect(() => {
    const markRead = async () => {
      if (!selectedChat?._id || !user?._id) return;
      try {
        await API.put(`/chat/read/${user._id}`, { chatId: selectedChat._id });
        dispatch(markChatAsRead(selectedChat._id));
      } catch (err) {
        console.error("Mark as read failed:", err);
      }
    };
    markRead();
  }, [selectedChat?._id, user?._id, dispatch]);

  useEffect(() => {
    if (!selectedChat?._id) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const res = await API.get(`/chat/messages/${selectedChat._id}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    if (socket) {
      socket.emit("joinRoom", selectedChat._id);
    }
  }, [selectedChat?._id, socket]);

  useEffect(() => {
    if (!socket || !user?._id) return;

    const onNewMessage = (msg) => {
      if (msg?.sender?._id === user._id || msg?.sender === user._id) return;

      const msgChatId = typeof msg.chat === "string" ? msg.chat : msg.chat?._id;

      if (msgChatId === selectedChat?._id) {
        setMessages((prev) => [...prev, msg]);
        dispatch(markChatAsRead(selectedChat._id));
      } else if (msgChatId) {
        dispatch(incrementUnread({ chatId: msgChatId, count: 1 }));
      }
    };

    socket.on("newMessage", onNewMessage);
    return () => socket.off("newMessage", onNewMessage);
  }, [socket, user?._id, selectedChat?._id, dispatch]);

  useEffect(() => {
    chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() && !file) return;
    if (!selectedChat?._id || !recipient?._id) return;

    const formData = new FormData();
    formData.append("chatId", selectedChat._id);
    formData.append("content", newMsg);
    if (file) formData.append("image", file);

    try {
      const res = await API.post("/chat/message", formData);
      const msgData = res.data;

      setMessages((prev) => [...prev, msgData]);

      socket?.emit("sendMessage", {
        ...msgData,
        receiverId: recipient._id,
      });

      setNewMsg("");
      setFile(null);
    } catch (err) {
      console.error("Message sending failed:", err);
    }
  };

  const formatTime = (time) => {
    const date = new Date(time);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  if (!user?._id || !selectedChat?._id) {
    return <div className={styles.empty}>Select a chat...</div>;
  }

  const recipientAvatar = recipient?.profileImage
    ? imgSrc(recipient.profileImage, API_BASE_URL)
    : `${API_BASE_URL}/uploads/default.png`;

  return (
    <div className={styles.chatRoom}>
      <div className={styles.header}>
        <FaArrowLeft
          onClick={() => dispatch(resetChat())}
          className={styles.backIcon}
        />

        <img
          src={recipientAvatar}
          alt={recipient?.username || recipient?.name || "Profile"}
          className={styles.profileImage}
        />

        <h3>{recipient?.username || recipient?.name}</h3>
      </div>

      <div className={styles.chatBox} ref={chatBoxRef}>
        {isLoading ? (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <span>Loading messages...</span>
          </div>
        ) : (
          (messages || []).map((msg) => {
            const isMine =
              msg?.sender?._id === user?._id || msg?.sender === user?._id;

            const msgImageSrc = msg.image
              ? imgSrc(msg.image, API_BASE_URL)
              : null;

            return (
              <div
                key={msg._id}
                className={`${styles.messageRow} ${
                  isMine ? styles.mine : styles.theirs
                }`}
              >
                <div className={styles.bubbleContainer}>
                  <div className={styles.bubble}>
                    {msg.content && <p>{msg.content}</p>}

                    {msgImageSrc && (
                      <img
                        src={msgImageSrc}
                        alt="message"
                        className={styles.messageImage}
                      />
                    )}

                    <span className={styles.time}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {file && (
        <div className={styles.previewImageWrapper}>
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className={styles.previewImage}
          />
        </div>
      )}

      <div className={styles.inputSection}>
        <label htmlFor="file-upload" className={styles.uploadIcon}>
          <BsImage />
        </label>

        <input
          type="file"
          id="file-upload"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          className={styles.inputField}
        />

        <button className={styles.sendButton} onClick={sendMessage}>
          <BiSend />
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
