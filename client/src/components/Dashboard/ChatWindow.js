import { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import io from "socket.io-client";

import { ChatContext } from "../../context/dashboardContext";
import ErrorBoundary from "../Error/ErrorBoundary";
import { formattedTime, formattedName } from "../../utils/helper";
import { postAxiosCall } from "../../utils/axiosUtil";

import "./style/index.css";
import "./style/swipeCard.css";
import "./style/chatBox.css";
import { ENTER_KEYCODE } from "../../constants/constants";

const socket = io.connect("http://localhost:8000");

function ChatBox() {
  const { messagesArray } = useContext(ChatContext);
  const [updatedMessageArray, setUpdatedMessageArray] = useState([]);
  const [cookies] = useCookies(["user"]);

  useEffect(() => {
    setUpdatedMessageArray(messagesArray);
  }, [messagesArray]);

  socket.on("message-from-server", (data) => {
    setUpdatedMessageArray([...updatedMessageArray, data]);
  });

  return (
    <>
      {updatedMessageArray?.length > 0 &&
        updatedMessageArray?.map((message, index) => {
          const { message: comment, timestamp, from_userId: id } = message;
          return (
            <div
              key={index}
              className={
                id === cookies.UserId ? "message my_msg" : "message friend_msg"
              }
            >
              <p>
                {comment}
                <br />
                <span>{formattedTime(timestamp)}</span>
              </p>
            </div>
          );
        })}
    </>
  );
}

function ChatHeader() {
  const { displayProfilePic, displayName, matchedID, handleUnMatch } =
    useContext(ChatContext);

  return (
    <div className="header">
      <div className="imgText">
        <div className="userimg">
          <img src={displayProfilePic} alt="" className="cover" />
        </div>
        <h4>{formattedName(displayName)}</h4>
      </div>
      <ul className="nav_icons">
        <li>
          <ion-icon
            name="ellipsis-vertical"
            onClick={() => handleUnMatch(matchedID)}
          ></ion-icon>
        </li>
      </ul>
    </div>
  );
}

export default function ChatWindow() {
  const [message, setMessage] = useState("");
  const { matchedID, areChatsAvailable } = useContext(ChatContext);
  const [cookie] = useCookies(["user"]);

  const handleAddingEmoji = (event, emoji = "💖") => {
    setMessage((prevMessage) => `${prevMessage} ${emoji}`);
  };

  const handleSend = async () => {
    if (message.trim().length === 0) return;

    const messageToSend = message;
    setMessage("");

    socket.emit("message", messageToSend, cookie.UserId);

    await postAxiosCall({
      route: "/message",
      postData: {
        from_userId: cookie.UserId,
        to_userId: matchedID,
        message: messageToSend,
      },
    });
  };

  const handleSendOnKeyPress = (event) => {
    if (
      !event.keyCode ||
      event.keyCode !== ENTER_KEYCODE ||
      message.trim().length === 0
    )
      return;
    handleSend();
  };

  const handleTyping = (event) => {
    setMessage(event.target.value);
  };

  return (
    <div className="rightSide-chatBox">
      {areChatsAvailable > 0 && <ChatHeader />}
      <ErrorBoundary fallback="Error">
        <div className="chatbox">{areChatsAvailable > 0 && <ChatBox />}</div>
      </ErrorBoundary>
      {areChatsAvailable > 0 && (
        <div className="chat_input">
          <ion-icon
            name="happy-outline"
            onClick={(event, emoji) => handleAddingEmoji(event, emoji)}
          ></ion-icon>
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={handleTyping}
            onKeyDown={handleSendOnKeyPress}
          />
          <ion-icon name="send-outline" onClick={handleSend}></ion-icon>
        </div>
      )}
    </div>
  );
}
