import { useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ACTIONS } from "../../constants/constants";

import "./style/index.css";
import "./style/swipeCard.css";
import "./style/chatBox.css";

export default function SwipeCard({
  displayPic,
  name,
  age,
  pronouns,
  about,
  handleSwipe,
  loading,
  matchedID,
  error,
}) {
  useEffect(() => {
    document.addEventListener("keydown", handleSwipe, false);
    return () => {
      document.removeEventListener("keydown", handleSwipe, false);
    };
  }, [handleSwipe]);

  return (
    <div className="rightSide-SwipeCard">
      <div className="left-icon">
        <ion-icon
          name="arrow-back-circle-outline"
          iconName={ACTIONS.LEFT_SWIPE}
          onClick={(event) => handleSwipe(event, matchedID)}
        ></ion-icon>
      </div>
      <div className="person-card">
        <div className="the-card">
          <div className="the-front">
            {loading === true ? (
              <Skeleton
                box={true}
                baseColor="#C0C0C0"
                width={"100%"}
                height={"100%"}
              />
            ) : error.isError ? (
              <p>{error.message}</p>
            ) : (
              <img src={displayPic} className="cover" alt="" />
            )}
          </div>
          <div className="the-back">
            {loading === true ? (
              <span>Loading...</span>
            ) : error.isError ? (
              <p>{error.message}</p>
            ) : (
              <>
                <p>
                  <strong>Name:</strong> {name}
                </p>
                <p>
                  <strong>Age:</strong> {age}
                </p>
                <p>
                  <strong>About me:</strong> {about}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="right-icon">
        <ion-icon
          name="arrow-forward-circle-outline"
          iconName={ACTIONS.RIGHT_SWIPE}
          onClick={(event) => handleSwipe(event, matchedID)}
        ></ion-icon>
      </div>
    </div>
  );
}
