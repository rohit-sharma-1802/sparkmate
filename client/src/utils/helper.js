import { TABS } from "../constants/constants";
import calculateAge from "../utils/calculateAge";
import {
  LEFT_ARROW_KEYCODE,
  RIGHT_ARROW_KEYCODE,
  ACTIONS,
} from "../constants/constants";
import axios from "axios";

export const changeTabUtils = ({ areChatsAvailable, areChatsLoading, tab }) => {
  if (!tab) return TABS.PROFILE;
  if (areChatsAvailable === false || areChatsLoading) return TABS.PROFILE;
  else return tab;
};

export const getFilteredMatches = ({ user, genderedUsers }) => {
  if (!user) return [];
  return genderedUsers;
};

const getSanitizedMatches = (matches) => {
  const sanitizedMatches = matches.map((match) => {
    const { first_name, url = "", image, user_id } = match;
    const displayPic = url.length === 0 ? image?.url : url;
    return {
      displayProfilePic: displayPic,
      displayName: first_name,
      userID: user_id,
    };
  });
  return sanitizedMatches;
};

// TODO : checking obj fields properly

export const getSanitizedSuggestion = (suggestion) => {
  const {
    first_name,
    dob,
    about,
    url = "",
    image,
    user_id = undefined,
    matchedID = undefined,
    pronouns = "She/Her",
  } = suggestion;
  const displayPic = url.length === 0 ? image?.url : url;
  const age = dob.split("-").length === 3 ? calculateAge(dob) : dob;
  return {
    displayPic,
    first_name,
    dob: age,
    matchedID: user_id ?? matchedID,
    about,
    pronouns,
  };
};

export const isValidKeyCodeForSwipe = (keyCode) =>
  keyCode && keyCode !== LEFT_ARROW_KEYCODE && keyCode !== RIGHT_ARROW_KEYCODE;

const areSuggestionAvailable = ({ lengthOfSugestionArray, index }) =>
  lengthOfSugestionArray === index || lengthOfSugestionArray === 0;

const isValidLeftSwipe = (event) =>
  event.target.attributes.iconName?.value === ACTIONS.LEFT_SWIPE ||
  event.keyCode === LEFT_ARROW_KEYCODE;

const isValidRightSwipe = (event) =>
  event.target.attributes.iconName?.value === ACTIONS.RIGHT_SWIPE ||
  event.keyCode === RIGHT_ARROW_KEYCODE;

export const handleSwipeEvent = async ({
  event,
  lengthOfSugestionArray,
  suggestion,
  index,
  userId,
  matchedUserId,
}) => {
  if (isValidKeyCodeForSwipe(event.keyCode)) return;
  if (
    areSuggestionAvailable({ lengthOfSugestionArray, index }) ||
    !suggestion?.data
  )
    return {
      isError: true,
      message: "You have exceeded your limit! Please try again tomorrow.",
    };

  if (isValidLeftSwipe(event)) {
    console.log("You left swiped!");
    // TODO : make a api call to handle left swipes
  } else if (isValidRightSwipe(event)) {
    await putAxiosCall({
      url: `/addmatch`,
      data: { userId, matchedUserId },
    });
  }
  const { displayPic, dob, about, first_name, matchedID, pronouns } =
    getSanitizedSuggestion(suggestion.data);

  return { displayPic, dob, about, first_name, matchedID, pronouns };
};

export const getAllMatches = async ({ userId, genderPref }) => {
  const { data, hasErrorOccurred } = await getAxiosCall({
    route: `/matches`,
    params: { userId },
  });

  if (hasErrorOccurred === true)
    return [{ displayProfilePic: "", displayName: "", userID: null }];

  const filteredMatches = data.filter((match) => match.user_id !== userId);

  return !hasErrorOccurred
    ? getSanitizedMatches(filteredMatches)
    : [{ displayProfilePic: "", displayName: "", userID: null }];
};

export const getAllChats = async ({ senderID, recipientID }) => {
  if (senderID === recipientID) return [];
  const { data, hasErrorOccurred } = await getAxiosCall({
    route: `/messages`,
    params: { from_userId: senderID, to_userId: recipientID },
  });
  return !hasErrorOccurred ? data : [];
};

export const unmatchUtil = async ({ userID, matchedID }) => {
  if (userID === matchedID) return;
  const { hasErrorOccurred } = await putAxiosCall({
    route: `/unmatch`,
    data: { userId: userID, matchedUserId: matchedID },
  });
  return hasErrorOccurred;
};

export const formattedTime = (params) => {
  const inputDate = new Date(params);
  const now = new Date();

  const isToday = inputDate.toDateString() === now.toDateString();
  const isYesterday =
    inputDate.toDateString() === new Date(now - 864e5).toDateString();

  return isToday
    ? `Today, ${inputDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })}`
    : isYesterday
    ? `Yesterday, ${inputDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })}`
    : `${inputDate.getDate()}/${
        inputDate.getMonth() + 1
      }/${inputDate.getFullYear()}`;
};

export const formattedName = (params) =>
  params.charAt(0).toUpperCase().concat(params.slice(1));

export const renderMatchUtil = async ({ userId }) => {
  const { data, hasErrorOccurred } = await getAxiosCall({
    route: `/user`,
    params: { userId },
  });
  return !hasErrorOccurred
    ? getSanitizedSuggestion(data)
    : {
        displayPic: "",
        about: "",
        matchedID: "",
        first_name: "",
        dob: "",
        pronouns: "",
      };
};

export const getAxiosCall = async ({ route, params }) => {
  const response = { data: undefined, hasErrorOccurred: false };
  const BASE_PATH = `http://localhost:8000`;
  const url = `${BASE_PATH}${route}`;

  try {
    const { data } = await axios({ method: "GET", url, params });
    response.data = data;
  } catch (error) {
    console.log(error);
    response.hasErrorOccurred = true;
  }
  return response;
};

export const postAxiosCall = async ({ route, postData }) => {
  const response = { data: undefined, hasErrorOccurred: false };
  const BASE_PATH = `http://localhost:8000`;
  const url = `${BASE_PATH}${route}`;

  try {
    const { data } = await axios({ method: "POST", url, data: postData });
    response.data = data;
  } catch (error) {
    console.log(error);
    response.hasErrorOccurred = true;
  }
  return response;
};

export const putAxiosCall = async ({ route, data }) => {
  const BASE_PATH = `http://localhost:8000`;
  const url = `${BASE_PATH}${route}`;

  try {
    await axios({ method: "PUT", url, data });
  } catch (error) {
    console.log(error);
  }
};
