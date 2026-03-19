import React, { useEffect, useRef, useState } from "react";

export default function ChatbotWidget() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi, I’m your RideAgent. Where are you headed?" },
  ]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.slice(-10),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply || "No response received." },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, something went wrong while processing your request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={styles.wrapper}>
      {!open ? (
        <button style={styles.floatingButton} onClick={() => setOpen(true)}>
          <span style={styles.floatingIcon}>🤖</span>
          <span>RideAgent</span>
        </button>
      ) : (
        <div style={styles.chatBox}>
          <div style={styles.header}>
            <div style={styles.headerCenter}>
              <div style={styles.headerDragBar} />
              <div style={styles.headerTitle}>RideAgent</div>
            </div>

            <button style={styles.headerIconButton} onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.messageRow,
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.role === "assistant" && (
                  <div style={styles.botAvatar}>
                    <span style={styles.botAvatarIcon}>🤖</span>
                  </div>
                )}

                <div
                  style={{
                    ...styles.bubble,
                    ...(msg.role === "user" ? styles.userBubble : styles.botBubble),
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ ...styles.messageRow, justifyContent: "flex-start" }}>
                <div style={styles.botAvatar}>
                  <span style={styles.botAvatarIcon}>🤖</span>
                </div>
                <div style={{ ...styles.bubble, ...styles.botBubble }}>
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputWrapper}>
            <div style={styles.inputArea}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                style={styles.textarea}
                rows={1}
              />
              <button onClick={sendMessage} disabled={loading} style={styles.sendButton}>
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TypingDots() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return ".";
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return <span>{dots}</span>;
}

const styles = {
  wrapper: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  floatingButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "linear-gradient(135deg, #f59e0b, #f97316)",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    padding: "14px 18px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(249,115,22,0.28)",
  },

  floatingIcon: {
    fontSize: "18px",
    lineHeight: 1,
  },

  chatBox: {
    width: "360px",
    height: "620px",
    background: "#f8f5f2",
    borderRadius: "28px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 22px 50px rgba(80, 44, 24, 0.20)",
    border: "1px solid rgba(255,255,255,0.65)",
  },

  header: {
    minHeight: "110px",
    padding: "18px 16px 14px",
    background: "linear-gradient(135deg, #f59e0b, #f97316)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    color: "#fff",
    position: "relative",
  },

  headerCenter: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "2px",
  },

  headerDragBar: {
    width: "110px",
    height: "8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.28)",
    marginBottom: "12px",
  },

  headerTitle: {
    fontSize: "18px",
    fontWeight: 700,
    lineHeight: 1.1,
  },

  headerStatus: {
    marginTop: "6px",
    fontSize: "13px",
    opacity: 0.95,
    fontWeight: 500,
  },

  headerIconButton: {
    width: "40px",
    height: "40px",
    borderRadius: "999px",
    border: "none",
    background: "rgba(255,255,255,0.22)",
    color: "#fff",
    fontSize: "22px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "22px 16px 16px",
    background: "#f3f1ef",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
  },

  botAvatar: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "999px",
    background: "#f97316",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 14px rgba(249,115,22,0.25)",
  },

  botAvatarIcon: {
    fontSize: "16px",
    lineHeight: 1,
  },

  bubble: {
    maxWidth: "75%",
    padding: "14px 16px",
    borderRadius: "20px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: "15px",
    lineHeight: "1.45",
  },

  userBubble: {
    background: "linear-gradient(135deg, #fb923c, #f97316)",
    color: "#fff",
    borderBottomRightRadius: "8px",
    boxShadow: "0 8px 18px rgba(249,115,22,0.18)",
  },

  botBubble: {
    background: "#e9e7e6",
    color: "#333",
    borderBottomLeftRadius: "8px",
  },

  inputWrapper: {
    background: "#f3f1ef",
    padding: "0 14px 14px",
  },

  inputArea: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#f8f5f2",
    border: "1px solid #ddd4ce",
    borderRadius: "999px",
    padding: "8px 8px 8px 16px",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
  },

  textarea: {
    flex: 1,
    resize: "none",
    border: "none",
    outline: "none",
    background: "transparent",
    paddingTop: "8px",
    fontFamily: "inherit",
    fontSize: "15px",
    color: "#333",
    maxHeight: "100px",
    lineHeight: 1.4,
  },

  sendButton: {
    width: "42px",
    height: "42px",
    border: "none",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #f59e0b, #f97316)",
    color: "#fff",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 8px 18px rgba(249,115,22,0.22)",
  },
};