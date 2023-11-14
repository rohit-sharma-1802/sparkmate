import {
  TABS,
  LEFT_ARROW_KEYCODE,
  RIGHT_ARROW_KEYCODE,
  ACTIONS,
} from "../constants/constants";
import { putAxiosCall } from "./axiosUtil";
import { getSanitizedSuggestion } from "./getter";

export const changeTabUtils = ({ areChatsAvailable, areChatsLoading, tab }) => {
  if (!tab) return TABS.PROFILE;
  if (areChatsAvailable === false || areChatsLoading) return TABS.PROFILE;
  else return tab;
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
