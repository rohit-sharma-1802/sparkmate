import { TABS } from "../constants/constants";
import calculateAge from "./calculateAge";
import {
  LEFT_ARROW_KEYCODE,
  RIGHT_ARROW_KEYCODE,
  ACTIONS,
} from "../constants/constants";

export const changeTabUtils = ({ areChatsAvailable, areChatsLoading, tab }) => {
  if (!tab) return TABS.PROFILE;
  if (areChatsAvailable === false || areChatsLoading) return TABS.PROFILE;
  else return tab;
};

export const getFilteredMatches = ({ user, genderedUsers }) => {
  if (!user) return [];

  const { user_id: userID } = user;

  const matchedUserIds = !user?.matches
    ? []
    : user?.matches
        .map(({ user_id }) => user_id)
        .concat(userID)
        .filter(Boolean);

  const filteredGenderedUsers =
    genderedUsers?.filter(
      (genderedUser) => !matchedUserIds?.includes(genderedUser.user_id)
    ) ?? [];

  return filteredGenderedUsers;
};

export const getSanitizedMatches = (matches) => {
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

export const getSanitizedSuggestion = (suggestion) => {
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
  } = suggestion;
  const displayPic = url.length === 0 ? image?.url : url;
  const age = dob
    ? dob
    : dob_year && dob_month && dob_day
    ? `${dob_year}-${dob_month}-${dob_day}`
    : "";
  return {
    displayPic,
    first_name,
    age: calculateAge(age),
    matchedID: user_id,
    about,
  };
};

export const isValidKeyCodeForSwipe = (keyCode) =>
  keyCode && keyCode !== LEFT_ARROW_KEYCODE && keyCode !== RIGHT_ARROW_KEYCODE;

export const areSuggestionAvailable = ({ suggestionArrayLength, index }) =>
  suggestionArrayLength === index || suggestionArrayLength === 0;
  
export const isValidLeftSwipe = (event) =>
  event.target.attributes.iconName?.value === ACTIONS.LEFT_SWIPE ||
  event.keyCode === LEFT_ARROW_KEYCODE;

export const isValidRightSwipe = (event) =>
  event.target.attributes.iconName?.value === ACTIONS.RIGHT_SWIPE ||
  event.keyCode === RIGHT_ARROW_KEYCODE;
