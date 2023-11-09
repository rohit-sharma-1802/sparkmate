import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

import Header from "./Header";
import ChatDisplay from "./SearchChat";
import SwipeCard from "./SwipeCard";
import ChatWindow from "./ChatWindow";

import {
  ACTIONS,
  TABS,
  LEFT_ARROW_KEYCODE,
  RIGHT_ARROW_KEYCODE,
} from "../../constants/constants";

import ProfileImg from "../../images/img1.jpg";
import matchedImg1 from "../../images/img2.jpg";
import matchedImg2 from "../../images/img3.jpg";
import recommendedImg from "../../images/img7.png";

import "./style/index.css";
import "./style/swipeCard.css";
import "./style/chatBox.css";

const TEMP_CHATS_ARRAY = [
  {
    displayProfilePic: matchedImg1,
    displayName: "Jhon Doe",
    lastMessage: "How are you doing",
    status: "active",
    id: 1,
  },
  {
    displayProfilePic: matchedImg2,
    displayName: "Olivia",
    lastMessage: "I just subscribed to your channel",
    status: "unread",
    noOfUnreadMessages: 2,
    // status: "active",
    id: 2,
  },
];

const TEMP_MESSAGE_ARRAY = [
  {
    comment: "Hi",
    messagedAt: "12:18",
    userID: 1,
  },
  {
    comment: "Hey",
    messagedAt: "12:20",
    userID: 2,
  },
];

export default function DashboardComponent() {
  const [tab, setTab] = useState(TABS.PROFILE);
  const [displayChat, setDisplayChat] = useState(null);
  const [chatsDetails, setChatsDetails] = useState({
    displayProfilePic: "",
    displayName: "",
    messagesArray: [],
    status: "",
    userID: null,
  });
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const navigate = useNavigate();

  const changeTab = (event) => {
    if (displayChat.length === 0) setTab(TABS.PROFILE);
    else setTab(event.target.attributes.iconName?.value);
  };

  const handleSwipe = (event) => {
    if (
      event.target.attributes.iconName?.value === ACTIONS.LEFT_SWIPE ||
      event.keyCode === LEFT_ARROW_KEYCODE
    )
      console.log("left-swipe");
    else if (
      event.target.attributes.iconName?.value === ACTIONS.RIGHT_SWIPE ||
      event.keyCode === RIGHT_ARROW_KEYCODE
    )
      console.log("right-swipe");
  };

  const handleChatClick = (inboxID) => {
    console.log(inboxID);
    // make a api call to fetch all the chats for the given inboxID
    setChatsDetails({
      displayProfilePic: matchedImg1,
      displayName: "Jhon Doe",
      status: "online",
      messagesArray: TEMP_MESSAGE_ARRAY,
      userID: 1,
    });
    setTab(TABS.CHATS);
  };

  const handleLogOut = () => {
    removeCookie("UserId", cookies.UserId);
    removeCookie("AuthToken", cookies.AuthToken);
    navigate("/");
  };

  const handleChangePreference = () => {
    navigate("/onboarding");
  };

  useEffect(() => {
    // make a api call to fetch all the chats for the given userID
    setDisplayChat(TEMP_CHATS_ARRAY);
  }, []);

  useEffect(() => {
    if (tab === TABS.CHATS && displayChat.length > 0)
      handleChatClick(displayChat[0].id);
  }, [displayChat, tab]);

  return (
    <div className="container">
      <div className="leftSide">
        <Header
          displayProfilePic={ProfileImg}
          handleClick={changeTab}
          tab={tab}
          handleLogOut={handleLogOut}
          handleChangePreference={handleChangePreference}
        />
        <ChatDisplay
          chatsArray={displayChat}
          handleChatClick={handleChatClick}
        />
      </div>
      {tab === TABS.PROFILE && (
        <SwipeCard
          displayPic={recommendedImg}
          name={"Jenna Ortega"}
          age={23}
          pronouns={"She/Her"}
          about={"lorem ispum"}
          handleSwipe={handleSwipe}
        />
      )}
      {tab === TABS.CHATS && (
        <ChatWindow
          displayProfilePic={chatsDetails.displayProfilePic}
          displayName={chatsDetails.displayName}
          status={chatsDetails.status}
          messagesArray={chatsDetails.messagesArray}
          userID={chatsDetails.userID}
          matchedID={chatsDetails.matchedID}
        />
      )}
    </div>
  );
}
