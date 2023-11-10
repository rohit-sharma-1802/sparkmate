import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import "./style/index.css";
import "./style/swipeCard.css";
import "./style/chatBox.css";

export default function ChatElement({
  handleChatClick,
  inboxID = "",
  displayProfilePic = "",
  displayName = "",
  lastMessage = "",
  status = "",
  noOfUnreadMessages = 0,
  loader,
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
        {loader === false ? (
          <img src={displayProfilePic} className="cover" alt="" />
        ) : (
          <Skeleton
            circle={true}
            baseColor="#DCDCDC"
            width={"100%"}
            height={"100%"}
          />
        )}
      </div>
      <div className="details">
        <div className="listHead">
          {loader === false && <h4>{displayName}</h4>}
          {loader === true && (
            <Skeleton
              borderRadius={10}
              height={14}
              width={250}
              baseColor="#DCDCDC"
              containerClassName="flex-1"
            />
          )}
        </div>
        {/* <div className="message_p">
          <p>{lastMessage}</p>
          {noOfUnreadMessages > 0 && <b>{noOfUnreadMessages}</b>}
        </div> */}
      </div>
    </div>
  );
}
