import {
  TABS,
  LEFT_ARROW_KEYCODE,
  RIGHT_ARROW_KEYCODE,
  ACTIONS,
} from "../constants/constants";
import { putAxiosCall } from "./axiosUtil";

export const changeTabUtils = ({ areChatsAvailable, areChatsLoading, tab }) => {
  if (!tab) return TABS.PROFILE;
  if (areChatsAvailable === false || areChatsLoading) return TABS.PROFILE;
  else return tab;
};

export const isValidKeyCodeForSwipe = (keyCode) =>
  keyCode && keyCode !== LEFT_ARROW_KEYCODE && keyCode !== RIGHT_ARROW_KEYCODE;

const areSuggestionAvailable = ({
  lengthOfSugestionArray,
  index,
  suggestion,
}) =>
  (lengthOfSugestionArray === index || lengthOfSugestionArray === 0) &&
  !suggestion;

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
  displayLikes,
}) => {
  if (isValidKeyCodeForSwipe(event.keyCode)) return;

  if (areSuggestionAvailable({ lengthOfSugestionArray, index, suggestion }))
    return {
      isError: true,
      message: "You have exceeded your limit! Please try again tomorrow.",
    };

  if (isValidLeftSwipe(event)) {
    console.log("You left swiped!");
    // TODO : make a api call to handle left swipes
  } else if (isValidRightSwipe(event)) {
    await putAxiosCall({
      route: `/addmatch`,
      data: { userId, matchedUserId },
    });
  }

  const indexOfMatchProfile = displayLikes.data.findIndex(
    ({ userID }) => userID === matchedUserId
  );
  if (indexOfMatchProfile !== -1)
    displayLikes.data.splice(indexOfMatchProfile, 1);

  return { isError: false, message: "" };
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
