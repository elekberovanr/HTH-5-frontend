import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useSelector } from 'react-redux';
import CommentItem from './CommentItem';
import styles from './CommentBox.module.css';
import { useCommentSocket } from '../../components/comments/CommentSocketProvider';

const CommentBox = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const user = useSelector((state) => state.user.user);
  const socket = useCommentSocket();

  const fetchComments = async () => {
    try {
      const res = await API.get(`/comments/${productId}`);
      setComments(res.data);
    } catch (err) {
      console.error('Cannot load comments:', err.message);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [productId]);

  useEffect(() => {
    if (!socket) return;

    socket.on('newComment', (data) => {
      setComments((prev) => [data, ...prev]);
    });

    socket.on('deleteComment', (id) => {
      setComments((prev) =>
        prev.filter((c) => c._id !== id && c.parentId !== id && c.parentId?._id !== id)
      );
    });

    return () => {
      socket.off('newComment');
      socket.off('deleteComment');
    };
  }, [socket]);

  const handleSubmit = async (customText = text, replyingTo = replyTo) => {
    if (!customText.trim()) return;
    try {
      const rootParentId =
        replyingTo?.parentId?._id || replyingTo?.parentId || replyingTo?._id || null;

      await API.post('/comments', {
        productId,
        text: customText.trim(),
        parentId: rootParentId,
      });

      setText('');
      setReplyTo(null);
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };

  return (
    <div className={styles.commentBox}>
      {replyTo && (
        <div className={styles.replyInfo}>
          Reply: <strong>@{replyTo.userId?.name}</strong>
          <button onClick={() => setReplyTo(null)} className={styles.cancelReply}>Cancel</button>
        </div>
      )}

      <div className={styles.inputRow}>
        <input
          type="text"
          placeholder={replyTo ? `@${replyTo.userId?.name}` : 'Add comments..'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={styles.input}
        />
        <button onClick={() => handleSubmit()} className={styles.sendBtn}>Send</button>
      </div>

      <div className={styles.commentList}>
        {comments
          .filter((c) => !c.parentId)
          .map((comment) => {
            const replies = comments.filter(
              (r) => r.parentId?._id === comment._id || r.parentId === comment._id
            );

            return (
              <div key={comment._id}>
                <CommentItem
                  comment={comment}
                  isReply={false}
                  onDelete={() =>
                    setComments((prev) =>
                      prev.filter(
                        (c) =>
                          c._id !== comment._id &&
                          c.parentId !== comment._id &&
                          c.parentId?._id !== comment._id
                      )
                    )
                  }
                  onReply={(target) => {
                    setReplyTo(target);
                    setText(`@${target.userId?.name} `);
                  }}
                  autoReplyText={`@${comment.userId?.name} `}
                  onReplySubmit={handleSubmit}
                />

                {replies.map((reply) => {
                  const parent = comments.find((c) => c._id === reply.parentId);
                  return (
                    <CommentItem
                      key={reply._id}
                      comment={reply}
                      isReply={true}
                      parentUsername={parent?.userId?.name || ''}
                      onDelete={() =>
                        setComments((prev) => prev.filter((c) => c._id !== reply._id))
                      }
                      onReply={(target) => {
                        setReplyTo(target);
                        setText(`@${target.userId?.name} `);
                      }}
                      autoReplyText={`@${reply.userId?.name} `}
                      onReplySubmit={handleSubmit}
                    />
                  );
                })}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentBox;
