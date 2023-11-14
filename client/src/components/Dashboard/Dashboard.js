/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

import Header from "./Header";
import SwipeCard from "./SwipeCard";
import ChatWindow from "./ChatWindow";
import ProfileDisplay from "./ProfileDisplay";
import ErrorBoundary from "../Error/ErrorBoundary";

import { TABS } from "../../constants/constants";
import { changeTabUtils, handleSwipeEvent } from "../../utils/helper";

import {
  getAllChats,
  getAllMatches,
  getFilteredMatches,
  getSanitizedSuggestion,
  getAllLikes,
} from "../../utils/getter";
import { getAxiosCall } from "../../utils/axiosUtil";
import { unmatchUtil, renderMatchUtil } from "../../utils/utils";

import {
  ChatContext,
  ProfileDisplayContext,
} from "../../context/dashboardContext";

import "./style/index.css";
import "./style/swipeCard.css";
import "./style/chatBox.css";

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
  const [displayLikes, setDisplayLikes] = useState({
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
    setDisplayChat((prevState) => ({ ...prevState, loading: true }));
    if (!user) return;
    const data = await getAllMatches({
      userId: user.user_id,
      genderPref: user.gender_interest,
    });
    setDisplayChat(() => ({ data, loading: false }));
  };

  const getLikes = async () => {
    setDisplayLikes((prevState) => ({ ...prevState, loading: true }));
    if (!user) return;
    const data = await getAllLikes({ userId: user.user_id });
    setDisplayLikes(() => ({ data, loading: false }));
  };

  const filteredGenderedUsers = getFilteredMatches({
    user,
    genderedUsers,
  });

  useEffect(() => {
    getMatches();
  }, [user]);

  useEffect(() => {
    getLikes();
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

  const handleChatClick = async (matchedID) => {
    if (!matchedID) return;
    const messagesArray = await getAllChats({
      senderID: cookies.UserId,
      recipientID: matchedID,
    });

    const getDetails =
      displayChat.data.find(
        (conversations) => conversations.userID === matchedID
      ) || {};

    if (Object.keys(getDetails) === 0) return;

    const { displayProfilePic, displayName, userID } = getDetails;

    setChatsDetails({
      displayProfilePic,
      displayName,
      status: "online",
      messagesArray: [...messagesArray],
      matchedID: userID,
    });
  };

  const changeTab = (event) => {
    const chooseTab = changeTabUtils({
      areChatsAvailable: displayChat.data.length,
      areChatsLoading: displayChat.loading,
      tab: event.target.attributes.iconName?.value,
    });
    if (chooseTab === TABS.CHATS) {
      if (displayChat.loading === true) return;
      handleChatClick(displayChat.data[0].userID);
    }
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

  const handleUnMatch = async (userID) => {
    const hasErrorOccurred = await unmatchUtil({
      userID: cookies.UserId,
      matchedID: userID,
    });
    if (hasErrorOccurred) return;
    setDisplayChat((prevDisplayMatches) => {
      const filteredMatches = prevDisplayMatches.data.filter(
        (match) => match.userID !== userID
      );
      return { ...prevDisplayMatches, data: filteredMatches };
    });
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

    const indexOfMatchProfile = displayLikes.data.findIndex(
      ({ userID }) => userID === data.matchedID
    );
    if (indexOfMatchProfile !== -1)
      displayLikes.data.splice(indexOfMatchProfile, 1);

    if (suggestion.showingLikedUserProfile === false)
      setIndex((prevIndex) => prevIndex + 1);

    setSuggestion((prevState) => ({
      ...prevState,
      loading: false,
      data,
      showingLikedUserProfile: false,
    }));
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
    setDisplayChat((prevState) => ({
      ...prevState,
      data: displayChat.data,
    }));
  }, [displayChat.data]);

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
              matchedArray: displayLikes.data,
              handleProfileClick: handleRenderMatch,
              loader: displayLikes.loading,
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
        <ChatContext.Provider
          value={{
            ...chatsDetails,
            areChatsAvailable: displayChat.data.length,
            handleUnMatch,
          }}
        >
          <ErrorBoundary fallback="Error">
            <ChatWindow />
          </ErrorBoundary>
        </ChatContext.Provider>
      )}
    </div>
  );
}
