/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import axios from "axios";

import Header from "./Header";
import SwipeCard from "./SwipeCard";
import ChatWindow from "./ChatWindow";
import ProfileDisplay from "./ProfileDisplay";
import ErrorBoundary from "../ErrorBoundary";

import { TABS } from "../../constants/constants";
import {
  changeTabUtils,
  getAllMatches,
  getAxiosCall,
  getFilteredMatches,
  getSanitizedSuggestion,
  handleSwipeEvent,
  renderMatchUtil,
} from "../../utils/helper";

import {
  ChatContext,
  ProfileDisplayContext,
} from "../../context/dashboardContext";

import matchedImg1 from "../../images/img2.jpg";
import matchedImg2 from "../../images/img3.jpg";

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
  const [user, setUser] = useState(null);
  const [genderedUsers, setGenderedUsers] = useState([]);

  const [suggestion, setSuggestion] = useState({
    data: {
      displayPic: "",
      about: "",
      dob: "",
      pronouns: "She/Her",
      matchedID: "",
      first_name: "",
    },
    loading: true,
    showingLikedUserProfile: false,
    error: { isError: false, message: "" },
  });

  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState(TABS.PROFILE);

  const [displayChat, setDisplayChat] = useState({
    data: [{ displayProfilePic: "", displayName: "", userID: null }],
    loading: false,
  });
  const [displayMatches, setDisplayMatches] = useState({
    data: [{ displayProfilePic: "", displayName: "", userID: null }],
    loading: true,
  });

  const [chatsDetails, setChatsDetails] = useState({
    displayProfilePic: "",
    displayName: "",
    messagesArray: [],
    status: "",
    matchedID: null,
  });

  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cookies.UserId) navigate("/");
  }, [cookies.UserId]);

  const getUser = async () => {
    const { data, hasErrorOccurred } = await getAxiosCall({
      route: `/user`,
      params: { userId: cookies.UserId },
    });
    if (!hasErrorOccurred) setUser(data);
  };

  const getGenderedUsers = async () => {
    setSuggestion((prevState) => ({ ...prevState, loading: true }));
    const res = await getAxiosCall({
      route: `/gendered-users`,
      params: { userId: cookies.UserId, gender: user.gender_interest },
    });
    const { data, hasErrorOccurred } = res;
    if (!hasErrorOccurred) {
      setGenderedUsers(data);
      setSuggestion((prevState) => ({ ...prevState, loading: false }));
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

  // TODO : complete this function

  const getMatches = async () => {
    setDisplayMatches((prevState) => ({ ...prevState, loading: true }));
    if (!user) return;
    const data = await getAllMatches({
      userId: user.user_id,
      genderPref: user.gender_interest,
    });
    setDisplayMatches(() => ({ data: [data[0]], loading: false }));
  };

  const filteredGenderedUsers = getFilteredMatches({
    user,
    genderedUsers,
    displayMatches: displayMatches.data,
  });

  useEffect(() => {
    getMatches();
  }, [user]);

  useEffect(() => {
    if (filteredGenderedUsers.length > 0) {
      const data = getSanitizedSuggestion(filteredGenderedUsers[0]);
      setSuggestion((prevState) => ({
        ...prevState,
        loading: false,
        data,
      }));
    }
  }, [filteredGenderedUsers[0]]);

  const changeTab = (event) => {
    const chooseTab = changeTabUtils({
      areChatsAvailable: displayChat.data.length,
      areChatsLoading: displayChat.loading,
      tab: event.target.attributes.iconName?.value,
    });
    setTab(chooseTab);
  };

  const handleRenderMatch = async (userId) => {
    setSuggestion((prevState) => ({ ...prevState, loading: true }));
    const data = await renderMatchUtil({ userId });
    setSuggestion((prevState) => ({
      ...prevState,
      data,
      loading: false,
      showingLikedUserProfile: true,
    }));
  };

  const handleSwipe = async (event, matchedID) => {
    const data = await handleSwipeEvent({
      event,
      index,
      lengthOfSugestionArray: filteredGenderedUsers.length,
      suggestion:
        suggestion.showingLikedUserProfile === false
          ? filteredGenderedUsers[index]
          : suggestion,
      userId: cookies.UserId,
      matchedUserId: matchedID,
    });
    if (!data) return;
    if (data.isError) {
      setSuggestion((prevState) => ({
        ...prevState,
        loading: false,
        showingLikedUserProfile: false,
        error: { isError: true, message: data.message },
      }));
      return;
    }

    const indexOfMatchProfile = displayMatches.data.findIndex(
      ({ userID }) => userID === data.matchedID
    );
    if (indexOfMatchProfile !== -1)
      displayMatches.data.splice(indexOfMatchProfile, 1);

    if (suggestion.showingLikedUserProfile === false)
      setIndex((prevIndex) => prevIndex + 1);

    setSuggestion((prevState) => ({
      ...prevState,
      loading: false,
      data,
      showingLikedUserProfile: false,
    }));
  };

  const handleChatClick = (inboxID) => {
    // TODO : make a api call to fetch all the chats for the given inboxID
    if (!inboxID) return;
    setChatsDetails({
      displayProfilePic: matchedImg1,
      displayName: "Jhon Doe",
      status: "online",
      messagesArray: TEMP_MESSAGE_ARRAY,
      matchedID: 1,
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
    setDisplayChat((prevState) => ({ ...prevState, data: TEMP_CHATS_ARRAY }));
  }, []);

  useEffect(() => {
    if (tab === TABS.CHATS && displayChat.data.length > 0)
      handleChatClick(displayChat.data[0].id);
  }, [displayChat.data, tab]);

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
              matchedArray: displayMatches.data,
              handleProfileClick: handleRenderMatch,
              loader: displayMatches.loading,
              tab: TABS.PROFILE,
            }}
          >
            <ProfileDisplay />
          </ProfileDisplayContext.Provider>
        )}
        {tab === TABS.CHATS && (
          <ProfileDisplayContext.Provider
            value={{
              matchedArray: displayChat.data,
              handleProfileClick: handleChatClick,
              loader: displayChat.loading,
              tab: TABS.CHATS,
            }}
          >
            <ProfileDisplay />
          </ProfileDisplayContext.Provider>
        )}
      </div>
      {tab === TABS.PROFILE && (
        <SwipeCard
          displayPic={suggestion.data.displayPic}
          name={suggestion.data.first_name}
          age={suggestion.data.dob}
          pronouns={suggestion.data.pronouns}
          about={suggestion.data.about}
          handleSwipe={handleSwipe}
          matchedID={suggestion.data.matchedID}
          loading={suggestion.loading}
          error={suggestion.error}
        />
      )}
      {tab === TABS.CHATS && (
        <ChatContext.Provider value={{ ...chatsDetails }}>
          <ErrorBoundary fallback="Error">
            <ChatWindow />
          </ErrorBoundary>
        </ChatContext.Provider>
      )}
    </div>
  );
}
