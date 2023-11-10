import "./style/index.css";
import "./style/swipeCard.css";
import "./style/chatBox.css";
import { useState } from "react";
import io from 'socket.io-client'
import axios from "axios"
import { useCookies } from "react-cookie";
const socket=io.connect("http://localhost:8000");


function ChatBox({ messagesArray, userID }) {
  return (
    <div className="chatbox">
      {messagesArray?.length === 0 && <h1>Chat Now!</h1>}
      {messagesArray?.length > 0 &&
        messagesArray?.map((message, index) => {
          const { comment, messagedAt, userID: id } = message;
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
                <span>{messagedAt}</span>
              </p>
            </div>
          );
        })}
    </div>
  );
}

function ChatHeader({
  displayProfilePic,
  displayName,
  status,
  handleUnmatch,
  handleDeleteChat,
  handleReport,
}) {
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

export default function ChatWindow({
  displayProfilePic,
  displayName,
  status,
  messagesArray,
  userID,
  matchedID,
}) {
  const [message, setMessage] = useState("");
  const [cookie] = useCookies(["user"]);
  const handleUnmatch = () => {
    console.log(`You have unmatched with ${displayName}`);
  };
  const handleDeleteChat = () => {};
  const handleReport = () => {
    handleUnmatch();
  };
  const handleAddingEmoji = () => {};
  const handleSend = () => {
    socket.emit("message",message)
    const userId=cookie.UserId;
  
  console.log(userId);
     socket.on("message-from-server", async (message)=>{
     await axios.post('http://localhost:8000/message',{
          "from_userId": userId,
          "to_userId": "b23c37ba-79b8-488e-9c17-bd7557bcc120",
          "message": message
        })
     })
  };
  const handleTyping = (event) => {
    setMessage(event.target.value);
  };
  return (
    <div className="rightSide-chatBox">
      <ChatHeader
        displayProfilePic={displayProfilePic}
        displayName={displayName}
        status={status}
        handleUnmatch={handleUnmatch}
        handleDeleteChat={handleDeleteChat}
        handleReport={handleReport}
      />
      <div className="chatbox">
        <ChatBox messagesArray={messagesArray} userID={userID} />
      </div>
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
