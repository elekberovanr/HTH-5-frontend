import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../config/apiBase"; 
// ⚠️ path əgər fərqlidirsə (../../config/apiBase) uyğunlaşdır

const CommentSocketContext = createContext(null);

const CommentSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const commentSocket = io(`${API_BASE_URL}/comments`, {
      withCredentials: true,
      transports: ["websocket"],
    });

    setSocket(commentSocket);

    return () => {
      commentSocket.disconnect();
    };
  }, []);

  return (
    <CommentSocketContext.Provider value={socket}>
      {children}
    </CommentSocketContext.Provider>
  );
};

export const useCommentSocket = () => useContext(CommentSocketContext);

export default CommentSocketProvider;
