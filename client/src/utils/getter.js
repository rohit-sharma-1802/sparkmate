import calculateAge from "./calculateAge";
import { getAxiosCall } from "./axiosUtil";

// TODO : checking obj fields properly

export const getSanitizedSuggestion = (suggestion) => {
  if (!suggestion) return;
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
  const age =
    typeof dob === "string" && dob.split("-").length === 3
      ? calculateAge(dob)
      : dob;
  return {
    displayPic,
    first_name,
    dob: age,
    matchedID: user_id ?? matchedID,
    about,
    pronouns,
  };
};

const getSanitizedProfiles = (matches) => {
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

export const getAllMatches = async ({ userId, genderPref }) => {
  const { data, hasErrorOccurred } = await getAxiosCall({
    route: `/matches`,
    params: { userId },
  });

  if (hasErrorOccurred === true)
    return [{ displayProfilePic: "", displayName: "", userID: null }];

  const filteredMatches = data.filter((match) => match.user_id !== userId);

  return getSanitizedProfiles(filteredMatches);
};

export const getAllLikes = async ({ userId }) => {
  const { data, hasErrorOccurred } = await getAxiosCall({
    route: `/likes`,
    params: { userId },
  });

  return !hasErrorOccurred
    ? getSanitizedProfiles(data)
    : [{ displayProfilePic: "", displayName: "", userID: null }];
};

export const getFilteredMatches = ({ user, genderedUsers }) => {
  if (!user) return [];
  return genderedUsers;
};

export const getAllChats = async ({ senderID, recipientID }) => {
  if (senderID === recipientID) return [];
  const { data, hasErrorOccurred } = await getAxiosCall({
    route: `/messages`,
    params: { from_userId: senderID, to_userId: recipientID },
  });
  return !hasErrorOccurred ? data : [];
};

export const getNotificationMessage = (username) => {
  const notificationMessage = [
    `You and ${username}: Sparks Ignited! 💘`,
    `You and ${username} – A spark has been kindled! 💞`,
    `${username} and You, a spark has been lit! 💖`,
  ];
  const randomMessage =
    notificationMessage[Math.floor(Math.random() * notificationMessage.length)];

  return randomMessage;
};
