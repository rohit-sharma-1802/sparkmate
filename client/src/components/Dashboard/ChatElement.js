import "./style/index.css";
import "./style/swipeCard.css";
import "./style/chatBox.css";

export default function ChatElement({
  handleChatClick,
  inboxID,
  displayProfilePic,
  displayName,
  lastMessage,
  status,
  noOfUnreadMessages = 0,
}) {
  return (
    <div
      className={
        status === "active"
          ? "block active"
          : status === "unread"
          ? "block unread"
          : "block"
      }
      onClick={() => handleChatClick(inboxID)}
    >
      <div className="imgBox">
        <img src={displayProfilePic} className="cover" alt="" />
      </div>
      <div className="details">
        <div className="listHead">
          <h4>{displayName}</h4>
        </div>
        <div className="message_p">
          <p>{lastMessage}</p>
          {noOfUnreadMessages > 0 && <b>{noOfUnreadMessages}</b>}
        </div>
      </div>
    </div>
  );
}
