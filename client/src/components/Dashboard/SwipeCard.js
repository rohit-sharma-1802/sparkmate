import { useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
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
            ) : (
              <img src={displayPic} className="cover" alt="" />
            )}
          </div>
          <div className="the-back">
            {loading === true ? (
              <span>Loading...</span>
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
      {/* <div class="card">
        <div class="card-inner">
          <div
            class="front"
            style={{
              backgroundImage: `linear-gradient(
      to bottom,
      rgba(245, 246, 252, 0.02),
      rgba(117, 19, 93, 0.79)
    ),
    url(${dis})`,
            }}
          >
            <h2>Jenna Ortega</h2>
            <p>Wednesday Adams</p>
            <button>Hover me</button>
          </div>
          <div class="back">
            <img src={wavingHand} alt="waving hand" />
            <h1>
              Jenna <span>Ortega</span>
            </h1>
            <p>
              Hi, I'm the famous Wednesday Adams character ya all know from the{" "}
              <span>@Wednesday</span> web series!
            </p>
            <ul>
              <li>
                <h2>12K</h2>
                <p>Followers</p>
              </li>
              <li>
                <h2>250</h2>
                <p>Following</p>
              </li>
              <li>
                <h2>5K</h2>
                <p>Likes</p>
              </li>
            </ul>
            <div class="social-media">
              <button>Follow</button>
              <a href="#">
                <ion-icon name="logo-instagram"></ion-icon>
              </a>
              <a href="#">
                <ion-icon name="logo-pinterest"></ion-icon>
              </a>
            </div>
          </div>
        </div>
      </div> */}
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
