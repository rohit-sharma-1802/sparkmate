import { useContext } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { TABS } from "../../constants/constants";
import { ProfileDisplayContext } from "../../context/dashboardContext";
import { formattedName } from "../../utils/helper";
import { getNotificationMessage } from "../../utils/getter";

import "./style/index.css";
import "./style/swipeCard.css";
import "./style/chatBox.css";

export default function ProfileElement({
  ID = "",
  displayProfilePic = "",
  displayName = "",
  lastMessage = "",
  status = "",
  noOfUnreadMessages = 0,
}) {
  const { loader, tab, handleProfileClick } = useContext(ProfileDisplayContext);
  return (
    <div
      className={
        status === "active"
          ? "block active"
          : status === "unread"
          ? "block unread"
          : "block"
      }
      onClick={() => handleProfileClick(ID)}
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
          {loader === false &&
            (tab === TABS.PROFILE ? (
              <p>{getNotificationMessage(formattedName(displayName))}</p>
            ) : (
              <h4>{formattedName(displayName)}</h4>
            ))}
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
