import { useState, useEffect, useContext } from "react";
import ProfileElement from "./ProfileElement";

import { TABS } from "../../constants/constants";
import { ProfileDisplayContext } from "../../context/dashboardContext";

import "./style/index.css";
import "./style/swipeCard.css";
import "./style/chatBox.css";
import ErrorBoundary from "../Error/ErrorBoundary";

const sanitizedString = (params) => params.trim().toLowerCase();

export default function ProfileDisplay() {
  const [searchText, setSearchText] = useState("");
  const [filteredProfile, setFilteredProfile] = useState([]);
  const { matchedArray, loader, tab } = useContext(ProfileDisplayContext);

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };

  useEffect(() => {
    if (
      matchedArray.length === 1 &&
      (!matchedArray[0] || !matchedArray[0].userID)
    )
      return;
    if (searchText.length === 0) setFilteredProfile(matchedArray);
    else {
      const profiles = matchedArray?.filter((chat) =>
        sanitizedString(chat.displayName).includes(sanitizedString(searchText))
      );
      setFilteredProfile(profiles);
    }
  }, [matchedArray, searchText]);

  return (
    <>
      <div className="search_chat">
        <div>
          <input
            type="text"
            placeholder={
              tab === TABS.PROFILE
                ? "Search who have matched you"
                : "Search or start a new chat"
            }
            onChange={handleSearch}
            value={searchText}
          />
          <ion-icon name="search-outline"></ion-icon>
        </div>
      </div>
      <ErrorBoundary fallback="Error">
        <div className="chatlist">
          {loader === true &&
            Array.from({ length: 8 }).map((index) => (
              <ProfileElement key={index} />
            ))}
          {loader === false && filteredProfile?.length === 0 && (
            <h4>
              {tab === TABS.PROFILE
                ? `Interested in you. When someone swipes right on you, you'll be able to find them right here`
                : `Get Swiping. When you match with other users they'll appear here, where you can send them a message`}
            </h4>
          )}
          {loader === false &&
            filteredProfile?.length > 0 &&
            filteredProfile.map((profile) => {
              const displayName =
                profile.displayName.charAt(0).toUpperCase() +
                profile.displayName.slice(1);
              return (
                <ProfileElement
                  key={profile.userID}
                  displayProfilePic={profile.displayProfilePic}
                  displayName={displayName}
                  ID={profile.userID}
                />
              );
            })}
        </div>
      </ErrorBoundary>
    </>
  );
}
