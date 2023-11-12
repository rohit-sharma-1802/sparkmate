/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useContext } from "react";
import Header from "./Header";
import ChatDisplay from "./SearchChat";
import SwipeCard from "./SwipeCard";
import ChatWindow from "./ChatWindow";
import io from "socket.io-client";

import {
  ACTIONS,
  TABS,
  LEFT_ARROW_KEYCODE,
  RIGHT_ARROW_KEYCODE,
} from "../../constants/constants";
import calculateAge from "../../utils/calculateAge";

import matchedImg1 from "../../images/img2.jpg";
import matchedImg2 from "../../images/img3.jpg";

import "./style/index.css";
import "./style/swipeCard.css";
import "./style/chatBox.css";

const socket=io.connect("http://localhost:8000")

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
  const [chatLoader, setChatLoader] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const [matchId, setMatchId] = useState(null);

  const [tab, setTab] = useState(TABS.PROFILE);
  const [displayChat, setDisplayChat] = useState(null);
  const [chatsDetails, setChatsDetails] = useState({
    displayProfilePic: "",
    displayName: "",
    messagesArray: [],
    status: "",
    userID: null,
  });
  const [index, setIndex] = useState(1);
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cookies.UserId) navigate("/");
  }, [cookies.UserId]);

  const getUser = async () => {
    setSuggestionLoader(true);
    try {
      const response = await axios({
        method: "GET",
        url: "http://localhost:8000/user",
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
        url: "http://localhost:8000/gendered-users",
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



  const matchedUserIds = !user?.matches ? [] :user?.matches
    ?.map(({ user_id }) => user_id)
    .concat(cookies.UserId)
    .filter(Boolean);

  const filteredGenderedUsers =
    genderedUsers?.filter(
      (genderedUser) => !matchedUserIds?.includes(genderedUser.user_id)
    ) ?? [];

  useEffect(() => {
    if (filteredGenderedUsers.length > 0) {
      const {
        first_name,
        dob,
        dob_year,
        dob_month,
        dob_day,
        about,
        url = "",
        image,
        user_id,
      } = filteredGenderedUsers[0];
      const displayPic = url.length === 0 ? image?.url : url;
      const age = dob
        ? dob
        : dob_year && dob_month && dob_day
        ? `${dob_year}-${dob_month}-${dob_day}`
        : "";
      setSuggestion((prevState) => ({
        ...prevState,
        displayPic,
        dob: calculateAge(age),
        about,
        first_name,
        matchedID: user_id,
      }));
    }
  }, [filteredGenderedUsers[0]]);

  const changeTab = (event) => {
    if (displayChat.length === 0) setTab(TABS.PROFILE);
    else if (chatLoader === true) setTab(TABS.PROFILE);
    else setTab(event.target.attributes.iconName?.value);
  };

  const handleSwipe = async (event, matchedID) => {
    if (
      event.keyCode &&
      event.keyCode !== LEFT_ARROW_KEYCODE &&
      event.keyCode !== RIGHT_ARROW_KEYCODE
    )
      return;
    if (filteredGenderedUsers.length === index) {
      return;
    } else if (filteredGenderedUsers.length === 0) return;
    else {
      const {
        first_name,
        dob,
        dob_year,
        dob_month,
        dob_day,
        about,
        url = "",
        image,
      } = filteredGenderedUsers[index];
      const displayPic = url.length === 0 ? image?.url : url;
      const age = dob
        ? dob
        : dob_year && dob_month && dob_day
        ? `${dob_year}-${dob_month}-${dob_day}`
        : "";
      setSuggestion((prevState) => ({
        ...prevState,
        displayPic,
        dob: calculateAge(age),
        about,
        first_name,
      }));
      setIndex((prevIndex) => prevIndex + 1);
    }

    if (
      event.target.attributes.iconName?.value === ACTIONS.LEFT_SWIPE ||
      event.keyCode === LEFT_ARROW_KEYCODE
    ) {
      console.log("You left swiped!");
      // make a api call
    } else if (
      event.target.attributes.iconName?.value === ACTIONS.RIGHT_SWIPE ||
      event.keyCode === RIGHT_ARROW_KEYCODE
    ) {
      try {
        const likedData = await axios({
          method: "PUT",
          url: "http://localhost:8000/addMatch",
          data: { userId: cookies.UserId, matchedUserId: matchedID },
        });
        if(likedData.data.matched)
        {
          setMatchId(matchedID);
          setIsFetched(true);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleChatClick = (inboxID) => {
    // make a api call to fetch all the chats for the given inboxID
    if (!inboxID) return;
    
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
    if(isFetched)
    {
      axios.get(`http://localhost:8000/${matchId}`)
      .then((res)=>{
        console.log(res.data);
        setDisplayChat(TEMP_CHATS_ARRAY);
        setIsFetched(false);

      })
      .catch((err)=>{

      })
    }
    // make a api call to fetch all the chats for the given userID
  }, [isFetched]);

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
        <ChatDisplay
          chatsArray={displayChat}
          handleChatClick={handleChatClick}
          loader={chatLoader}
        />
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
