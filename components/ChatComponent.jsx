import React, { useEffect, useState } from "react";
import { useChannel } from "./MessageReactEffect";
import styles from "./ChatComponent.module.css";

const ChatComponent = () => {
  let inputBox = null;
  let messageEnd = null;

  const [messageText, setMessageText] = useState("");
  const [myLanguage, setmyLanguage] = useState("");
  const [receivedMessages, setMessages] = useState([]);
  const messageTextIsEmpty =
    messageText.trim().length === 0 || myLanguage.trim().length === 0;

  const languageToken = "¥";

  const [channel, ably] = useChannel("message-channel", (message) => {
    const lastMessage = String(message.data);

    const language = lastMessage.substring(
      lastMessage.indexOf(languageToken) + 1
    );

    if (language === myLanguage) {
      updateMessageHistory(message);
    } else {
      fetchData(
        message,
        lastMessage.substring(0, lastMessage.indexOf(languageToken)),
        language
      );
    }
  });

  const updateMessageHistory = (message) => {
    const history = receivedMessages.slice(-199);
    setMessages([...history, message]);
  };

  const sendChatMessage = (messageText) => {
    const messageWithlanguageToken = messageText + languageToken + myLanguage;

    channel.publish({ name: "chat-message", data: messageWithlanguageToken });
    setMessageText("");
    inputBox.focus();
  };

  const handleFormSubmission = (event) => {
    event.preventDefault();
    sendChatMessage(messageText);
  };

  const handleKeyPress = (event) => {
    if (event.charCode !== 13 || messageTextIsEmpty) {
      return;
    }
    sendChatMessage(messageText);
    event.preventDefault();
  };

  const fetchData = async (originalMessage, message, translateTo) => {
    const req = await fetch(
      `/api/watson?message=${message}&translateFrom=${translateTo}`
    );

    const newData = await req.json();

    originalMessage.data = newData;

    updateMessageHistory(originalMessage);
  };

  const messages = receivedMessages.map((message, index) => {
    const author = message.connectionId === ably.connection.id ? "me" : "other";

    const lastMessage = String(message.data);

    if (lastMessage.indexOf(languageToken) > -1) {
      message.data = lastMessage.substring(
        0,
        lastMessage.indexOf(languageToken)
      );
    }
    return (
      <span key={index} className={styles.message} data-author={author}>
        {message.data}
      </span>
    );
  });

  useEffect(() => {
    messageEnd.scrollIntoView({ behaviour: "smooth" });
  });

  return (
    <div className={styles.chatHolder}>
      <div className={styles.chatText}>
        {messages}
        <div
          ref={(element) => {
            messageEnd = element;
          }}
        ></div>
      </div>
      <div>
        <fieldset>
          <legend>I speak</legend>
          <input
            type="radio"
            id="pt"
            name="language"
            value="pt"
            onChange={(e) => setmyLanguage(e.target.value)}
          />
          <label htmlFor="pt">Portuguese</label>
          <input
            type="radio"
            id="en"
            name="language"
            value="en"
            onChange={(e) => setmyLanguage(e.target.value)}
          />
          <label htmlFor="en">English</label>
        </fieldset>
      </div>
      <form onSubmit={handleFormSubmission} className={styles.form}>
        <textarea
          ref={(element) => {
            inputBox = element;
          }}
          value={messageText}
          placeholder="Type a message..."
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.textarea}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={messageTextIsEmpty}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;
