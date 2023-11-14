import { getAxiosCall, putAxiosCall } from "./axiosUtil";
import { getSanitizedSuggestion } from "./getter";

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

export const unmatchUtil = async ({ userID, matchedID }) => {
  if (userID === matchedID) return;
  const { hasErrorOccurred } = await putAxiosCall({
    route: `/unmatch`,
    data: { userId: userID, matchedUserId: matchedID },
  });
  return hasErrorOccurred;
};
