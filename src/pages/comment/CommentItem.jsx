import React, { useState } from "react";
import styles from "./CommentBox.module.css";
import { formatDistanceToNow } from "date-fns";
import { FaReply, FaTrash } from "react-icons/fa";
import API from "../../services/api";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "../../config/apiBase";
import { imgSrc } from "../../utils/imgSrc";

const CommentItem = ({
  comment,
  isReply = false,
  onDelete,
  onReply,
  onReplySubmit,
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const user = useSelector((state) => state.user.user);

  const username = comment.userId?.name || "Unknown";

  const avatarSrc = comment.userId?.profileImage
    ? imgSrc(comment.userId.profileImage, API_BASE_URL)
    : "/default-avatar.png";

  const handleDelete = async () => {
    try {
      await API.delete(`/comments/${comment._id}`);
      onDelete(comment._id);
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleReplyClick = () => {
    setShowReplyInput(true);
    setReplyText(`@${username} `);
    onReply?.(comment);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await onReplySubmit?.(replyText.trim(), comment);
      setReplyText("");
      setShowReplyInput(false);
    } catch (err) {
      console.error("Failed to send reply:", err);
    }
  };

  return (
    <div className={`${styles.commentItem} ${isReply ? styles.replyItem : ""}`}>
      <img src={avatarSrc} alt="avatar" className={styles.avatar} />

      <div className={styles.commentContent}>
        <div className={styles.commentHeader}>
          <strong>{username}</strong>
          <span className={styles.commentMeta}>
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>

        <div className={styles.commentText}>{comment.text}</div>

        <div className={styles.actions}>
          <button onClick={handleReplyClick} className={styles.replyBtn}>
            <FaReply /> Reply
          </button>

          {user?._id === comment.userId?._id && (
            <button onClick={handleDelete} className={styles.deleteBtn}>
              <FaTrash /> Delete
            </button>
          )}
        </div>

        {showReplyInput && (
          <form onSubmit={handleReplySubmit} className={styles.replyForm}>
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className={styles.commentInput}
            />
            <button type="submit" className={styles.commentButton}>
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
