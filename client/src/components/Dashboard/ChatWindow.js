import { useContext, useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import io from "socket.io-client";

import { ChatContext } from "../../context/dashboardContext";
import ErrorBoundary from "../ErrorBoundary";
import { postAxiosCall } from "../../utils/helper";
import "./style/index.css";
import "./style/swipeCard.css";
import "./style/chatBox.css";

const socket = io.connect("http://localhost:8000");
function ChatBox() {
  const { messagesArray, userID } = useContext(ChatContext);
  const [updatedMessageArray, setUpdatedMessageArray] = useState([
    ...messagesArray,
  ]);

  useEffect(() => {}, [messagesArray]);

  socket.on("message-from-server", (data) => {
    setUpdatedMessageArray([...updatedMessageArray, data]);
  });

  return (
    <div className="chatbox">
      {updatedMessageArray?.length > 0 &&
        updatedMessageArray?.map((message, index) => {
          const { message: comment, timeStamp, senderUserId: id } = message;
          return (
            <div
              key={index}
              className={
                id === userID ? "message my_msg" : "message friend_msg"
              }
            >
              <p>
                {comment}
                <br />
                <span>{timeStamp}</span>
              </p>
            </div>
          );
        })}
    </div>
  );
}

function ChatHeader() {
  const { displayProfilePic, displayName, status } = useContext(ChatContext);

  // TODO : make api call to handle unmatch request
  const handleUnmatch = () => {
    console.log(`You have unmatched with ${displayName}`);
  };

  // TODO : make api call to handle delete chat request
  const handleDeleteChat = () => {};

  // TODO : make a api call to handle report user request
  const handleReport = () => {
    handleUnmatch();
  };

  return (
    <div className="header">
      <div className="imgText">
        <div className="userimg">
          <img src={displayProfilePic} alt="" className="cover" />
        </div>
        <h4>
          {displayName} <br />
          <span>{status}</span>
        </h4>
      </div>
      <ul className="nav_icons">
        <li>
          <ion-icon name="ellipsis-vertical"></ion-icon>
        </li>
      </ul>
    </div>
  );
}

export default function ChatWindow() {
  const [message, setMessage] = useState("");
  const { matchedID } = useContext(ChatContext);
  const [cookie] = useCookies(["user"]);

  const handleAddingEmoji = () => {};

  const handleSend = async () => {
    socket.emit("message", message, cookie.UserId);
    await postAxiosCall({
      route: "/message",
      postData: {
        from_userId: cookie.UserId,
        to_userId: matchedID,
        message: message,
      },
    });
  };

  const handleTyping = (event) => {
    setMessage(event.target.value);
  };

  return (
    <div className="rightSide-chatBox">
      <ChatHeader />
      <ErrorBoundary fallback="Error">
        <div className="chatbox">
          <ChatBox />
        </div>
      </ErrorBoundary>
      <div className="chat_input">
        <ion-icon name="happy-outline" onClick={handleAddingEmoji}></ion-icon>
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={handleTyping}
        />
        <ion-icon name="send-outline" onClick={handleSend}></ion-icon>
      </div>
    </div>
  );
}
