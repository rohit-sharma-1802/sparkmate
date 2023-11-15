import { TABS } from "../../constants/constants";
import "./style/index.css";
import "./style/end-of-swipe.css";

export function NotFoundLeft({ tab }) {
  return tab === TABS.PROFILE ? (
    <div className="no-match">
      <h1>Interested in you</h1>
      <p>
        When someone swipes right on you, you'll be able to find them right here
      </p>
    </div>
  ) : (
    <div className="no-match">
      <h1>Get Swiping</h1>
      <p>
        When you match with other users they'll appear here, where you can chat
      </p>
    </div>
  );
}

export function NotFoundRight() {
  return (
    <div class="end-of-swipe">
      <h1>
        <ion-icon name="alert-circle-outline"></ion-icon>
      </h1>
      <h2>Limit Exceeded</h2>
      <p>Please try again tomorrow...</p>
    </div>
  );
}
