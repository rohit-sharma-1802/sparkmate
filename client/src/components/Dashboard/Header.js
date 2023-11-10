import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { TABS } from "../../constants/constants";

import "./style/index.css";
import "./style/swipeCard.css";
import "./style/chatBox.css";

export default function Header({
  displayProfilePic,
  handleClick,
  tab,
  handleLogOut,
  handleChangePreference,
}) {
  return (
    <div className="header">
      <div className="userimg">
        {displayProfilePic ? (
          <img src={displayProfilePic} alt="" className="cover" />
        ) : (
          <Skeleton
            box={true}
            baseColor="#C0C0C0"
            width={"100%"}
            height={"100%"}
          />
        )}
      </div>
      <ul className="nav_icons">
        <li>
          <ion-icon
            iconName="filter"
            name="filter-outline"
            onClick={handleChangePreference}
          ></ion-icon>
        </li>
        <li>
          <ion-icon
            iconName={TABS.PROFILE}
            name={tab === TABS.PROFILE ? "person-add" : "person-add-outline"}
            onClick={handleClick}
          ></ion-icon>
        </li>
        <li>
          <ion-icon
            iconName={TABS.CHATS}
            name={tab === TABS.CHATS ? "chatbox" : "chatbox-outline"}
            onClick={handleClick}
          ></ion-icon>
        </li>
        <li>
          <ion-icon
            iconName="logout"
            name="log-out-outline"
            onClick={handleLogOut}
          ></ion-icon>
        </li>
      </ul>
    </div>
  );
}
