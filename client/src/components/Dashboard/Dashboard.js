/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "./Header";
import SwipeCard from "./SwipeCard";
import ChatWindow from "./ChatWindow";
import ProfileDisplay from "./ProfileDisplay";

import { TABS } from "../../constants/constants";
import calculateAge from "../../utils/calculateAge";
import {
  areSuggestionAvailable,
  changeTabUtils,
  getFilteredMatches,
  getSanitizedMatches,
  getSanitizedSuggestion,
  isValidKeyCodeForSwipe,
  isValidLeftSwipe,
  isValidRightSwipe,
} from "../../utils/helper";

import matchedImg1 from "../../images/img2.jpg";
import matchedImg2 from "../../images/img3.jpg";

import "./style/index.css";
import "./style/swipeCard.css";
import "./style/chatBox.css";
import {
  ChatContext,
  ProfileDisplayContext,
} from "../../context/dashboardContext";

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
  const [user, setUser] = useState(null);
  const [genderedUsers, setGenderedUsers] = useState([]);
  const [suggestion, setSuggestion] = useState({
    displayPic: "",
    about: "",
    dob: "",
    pronouns: "She/Her",
    matchedID: "",
  });
  const [suggestionLoader, setSuggestionLoader] = useState(true);
  const [viewMatchLoader, setViewMatchLoader] = useState(true);
  const [index, setIndex] = useState(1);
  const [tab, setTab] = useState(TABS.PROFILE);
  const [displayChat, setDisplayChat] = useState(null);
  const [displayMatches, setDisplayMatches] = useState([
    {
      displayProfilePic: "",
      displayName: "",
      userID: null,
    },
  ]);
  const [chatLoader, setChatLoader] = useState(false);
  const [chatsDetails, setChatsDetails] = useState({
    displayProfilePic: "",
    displayName: "",
    messagesArray: [],
    status: "",
    userID: null,
  });
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const navigate = useNavigate();

  const SERVER_URL = `http://localhost:8000`;

  useEffect(() => {
    if (!cookies.UserId) navigate("/");
  }, [cookies.UserId]);

  const getUser = async () => {
    setSuggestionLoader(true);
    try {
      const response = await axios({
        method: "GET",
        url: `${SERVER_URL}/user`,
        params: { userId: cookies.UserId },
      });
      setUser(response.data);
      setSuggestionLoader(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getGenderedUsers = async () => {
    setSuggestionLoader(true);
    try {
      const response = await axios({
        method: "GET",
        url: `${SERVER_URL}/gendered-users`,
        params: { userId: cookies.UserId, gender: user.gender_interest },
      });
      setGenderedUsers(response.data);
      setSuggestionLoader(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getUser();
  }, [cookies.UserId]);

  useEffect(() => {
    if (user) {
      getGenderedUsers();
    }
  }, [cookies?.UserId, user?.gender_interest]);

  const filteredGenderedUsers = getFilteredMatches({ user, genderedUsers });

  // TODO : complete this function

  const getMatches = async () => {
    setViewMatchLoader(true);
    try {
      if (!user) return;
      const response = await axios({
        method: "GET",
        url: `${SERVER_URL}/gendered-users`,
        params: { userId: cookies.UserId, gender: user.gender_interest },
      });
      const sanitizedMatches = getSanitizedMatches(response.data);
      setDisplayMatches(sanitizedMatches);
      setViewMatchLoader(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getMatches();
  }, [filteredGenderedUsers[0]]);

  useEffect(() => {
    if (filteredGenderedUsers.length > 0) {
      const { displayPic, age, about, first_name, matchedID } =
        getSanitizedSuggestion(filteredGenderedUsers[0]);
      setSuggestion((prevState) => ({
        ...prevState,
        displayPic,
        dob: age,
        about,
        first_name,
        matchedID,
      }));
    }
  }, [filteredGenderedUsers[0]]);

  const changeTab = (event) => {
    const chooseTab = changeTabUtils({
      areChatsAvailable: displayChat.length,
      areChatsLoading: chatLoader,
      tab: event.target.attributes.iconName?.value,
    });
    setTab(chooseTab);
  };

  const handleRenderMatch = async (userId) => {
    try {
      setSuggestionLoader(true);
      const response = await axios({
        method: "GET",
        url: `${SERVER_URL}/user`,
        params: { userId },
      });
      const { displayPic, age, about, first_name, matchedID } =
        getSanitizedSuggestion(response.data);
      setSuggestion((prevState) => ({
        ...prevState,
        displayPic,
        dob: age,
        about,
        first_name,
        matchedID,
      }));
      setSuggestionLoader(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSwipe = async (event, matchedID) => {
    if (isValidKeyCodeForSwipe(event.keyCode)) return;
    if (
      areSuggestionAvailable({
        suggestionArrayLength: filteredGenderedUsers.length,
        index,
      })
    )
      return;
    else {
      const { displayPic, age, about, first_name, matchedID } =
        getSanitizedSuggestion(filteredGenderedUsers[index]);
      setSuggestion((prevState) => ({
        ...prevState,
        displayPic,
        dob: calculateAge(age),
        about,
        first_name,
        matchedID,
      }));
      setIndex((prevIndex) => prevIndex + 1);
    }

    const filteredMatches = displayMatches.filter(
      (match) => match.userID !== matchedID
    );
    console.log(filteredMatches, displayMatches);
    if (JSON.stringify(filteredMatches) !== JSON.stringify(displayMatches))
      setDisplayMatches(filteredMatches);

    if (isValidLeftSwipe(event)) {
      console.log("You left swiped!");
      // TODO : make a api call to handle left swipes
    } else if (isValidRightSwipe(event)) {
      try {
        await axios({
          method: "PUT",
          url: `${SERVER_URL}/addMatch`,
          data: { userId: cookies.UserId, matchedUserId: matchedID },
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleChatClick = (inboxID) => {
    // TODO : make a api call to fetch all the chats for the given inboxID
    if (!inboxID) return;
    setChatsDetails({
      displayProfilePic: matchedImg1,
      displayName: "Jhon Doe",
      status: "online",
      messagesArray: TEMP_MESSAGE_ARRAY,
      userID: 1,
    });
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
    // TODO : make a api call to fetch all the chats for the given userID
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
          displayProfilePic={user?.image?.url ?? ""}
          handleClick={changeTab}
          tab={tab}
          handleLogOut={handleLogOut}
          handleChangePreference={handleChangePreference}
        />
        {tab === TABS.PROFILE && (
          <ProfileDisplayContext.Provider
            value={{
              matchedArray: displayMatches,
              handleProfileClick: handleRenderMatch,
              loader: viewMatchLoader,
              tab: TABS.PROFILE,
            }}
          >
            <ProfileDisplay />
          </ProfileDisplayContext.Provider>
        )}
        {tab === TABS.CHATS && (
          <ProfileDisplayContext.Provider
            value={{
              matchedArray: displayChat,
              handleProfileClick: handleChatClick,
              loader: chatLoader,
              tab: TABS.CHATS,
            }}
          >
            <ProfileDisplay />
          </ProfileDisplayContext.Provider>
        )}
      </div>
      {tab === TABS.PROFILE && (
        <SwipeCard
          displayPic={suggestion.displayPic}
          name={suggestion.first_name}
          age={suggestion.dob}
          pronouns={suggestion.pronouns}
          about={suggestion.about}
          handleSwipe={handleSwipe}
          loading={suggestionLoader}
          matchedID={suggestion.matchedID}
        />
      )}
      {tab === TABS.CHATS && (
        <ChatContext.Provider value={{ ...chatsDetails }}>
          <ChatWindow />
        </ChatContext.Provider>
      )}
    </div>
  );
}
