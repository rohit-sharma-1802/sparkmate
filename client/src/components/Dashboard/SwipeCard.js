import { useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaSpotify } from "react-icons/fa";

import { ACTIONS } from "../../constants/constants";
import wavingHand from "../../images/waving-hand.png";

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
      <div className="card">
        <div className="card-inner">
          <div className="front">
            {loading === true ? (
              <Skeleton
                box={true}
                baseColor="#C0C0C0"
                width={"100%"}
                height={600}
              />
            ) : (
              <>
                <img src={displayPic} alt="jenna" preload />
                <div className="gradient"></div>
                <h2>{name}</h2>
              </>
            )}
          </div>
          <div className="back">
            {loading === true ? (
              <span>Loading...</span>
            ) : (
              <>
                <img src={wavingHand} alt="waving hand" />
                <h1>{name}</h1>
                <p style={{ textAlign: "justify" }}>{about}</p>
                <ul>
                  <li>
                    <h2>Age</h2>
                    <p>{age}</p>
                  </li>
                  <li>
                    <h2>Height</h2>
                    <p>182 cm</p>
                  </li>
                </ul>
                <div className="social-media">
                  <a href="#">
                    <ion-icon name="logo-instagram"></ion-icon>
                  </a>
                  <a href="#">
                    <FaSpotify style={{ width: "500%", color: "green" }} />
                  </a>
                </div>
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
