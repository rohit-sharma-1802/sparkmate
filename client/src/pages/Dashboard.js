import TinderCard from "react-tinder-card";
import { useEffect, useState } from "react";
import ChatContainer from "../components/ChatContainer";
import { useCookies } from "react-cookie";
import axios from "axios";
import React from "react";
import MatchContainer from "../components/MatchContainer";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [genderedUsers, setGenderedUsers] = useState([]);
  const [lastDirection, setLastDirection] = useState();
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const [chatListStatus, setChatListStatus] = useState(false);
  const [matchListStatus, setMatchListStatus] = useState(true);

  //changing the status of the chat and match to be displayed in the left side

  const activeChatList = () => {
    setChatListStatus(true);
    setMatchListStatus(false);
    console.log("activated click");
  };

  const activeMatchList = () => {
    setChatListStatus(false);
    setMatchListStatus(true);
    console.log("activated click");
  };

  const userId = cookies.UserId;
  const authToken = cookies.AuthToken;

  const handleClick = () => {
    if (authToken) {
      removeCookie("UserId", cookies.UserId);
      removeCookie("AuthToken", cookies.AuthToken);
      window.open("/", "_self");
      return;
    }
  };
  const getUser = async () => {
    try {
      const response = await axios.get("http://localhost:8000/user", {
        params: { userId },
      });
      setUser(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  const getGenderedUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/gendered-users");
      console.log(response);
      setGenderedUsers([response.data]);
    } catch (error) {
      console.log(error);
    }
  };

  console.log("gendred users", genderedUsers);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      getGenderedUsers();
    }
  }, [user]);

  const updateMatches = async (matchedUserId) => {
    try {
      await axios.put("http://localhost:8000/addmatch", {
        userId,
        matchedUserId,
      });
      getUser();
    } catch (err) {
      console.log(err);
    }
  };

  const swiped = (direction, swipedUserId) => {
    if (direction === "right") {
      updateMatches(swipedUserId);
    }
    setLastDirection(direction);
  };

  const outOfFrame = (name) => {
    console.log(name + " left the screen!");
  };

  const matchedUserIds = user?.matches
    ?.map(({ user_id }) => user_id)
    .concat(userId);

  const filteredGenderedUsers = genderedUsers?.filter(
    (genderedUser) => !matchedUserIds?.includes(genderedUser.user_id)
  );

  console.log("filteredGenderedUsers ", filteredGenderedUsers);

  return (
    /*
    <div className="card-container">
              {filteredGenderedUsers?.map((genderedUser, index) => (
                <TinderCard
                  className="swipe"
                  key={genderedUser.user_id}
                  onSwipe={(dir) => swiped(dir, genderedUser.user_id)}
                  onCardLeftScreen={() => outOfFrame(genderedUser.first_name)}
                >
                  <div className="rightSide">
                    <div className="left-icon">
                      <ion-icon name="arrow-back-circle-outline"></ion-icon>
                    </div>
                    <div className="person-card">
                      <div className="the-card">
                        <div className="the-front">
                          <img src={genderedUser.image_url} alt={genderedUser.name} />
                        </div>
                        <div className="the-back">
                          <p>
                            <strong>Name:</strong> {genderedUser.name}
                          </p>
                          <p>
                            <strong>Age:</strong> {genderedUser.age}
                          </p>
                          <p>
                            <strong>I would describe myself as:</strong>{" "}
                            {genderedUser.description}
                          </p>
                          <p className="about_me">
                            <strong>About me:</strong> {genderedUser.about_me}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="right-icon">
                      <ion-icon name="arrow-forward-circle-outline"></ion-icon>
                    </div>
                  </div>
                </TinderCard>
              ))}
              <div className="swipe-info">
                {lastDirection ? <p>You swiped {lastDirection}</p> : <p />}
              </div>
            </div>
    */
    <div className="user-dashboard">
      <div className="container">
        <div className="leftSide">
          <div className="header">
            <div className="userimg">
              <img src="images/user.jpg" alt="" className="cover" />
            </div>
            <ul className="nav_icons">
              <li onClick={activeMatchList}>
                <ion-icon name="person-add-outline"></ion-icon>
              </li>
              <li onClick={activeChatList}>
                <ion-icon name="chatbox"></ion-icon>
              </li>
              <li onClick={handleClick}>
                <ion-icon name="log-out-outline"></ion-icon>
              </li>
            </ul>
          </div>
          <div className="search_chat">
            {/* <div className="search-container">
              <input type="text" placeholder="Search or start new chat" />
              <ion-icon name="search-outline"></ion-icon>
            </div> */}
          </div>
          {chatListStatus && !matchListStatus ? (
            <ChatContainer user={user} />
          ) : (
            <MatchContainer />
          )}
        </div>
        <div className="rightSide">
          <div className="left-icon">
            <ion-icon name="arrow-back-circle-outline"></ion-icon>
          </div>
          <div className="person-card">
            <div className="the-card">
              <div className="the-front">
                <img src="images/img7.png" alt="mia" />
              </div>
              <div className="the-back">
                <p>
                  <strong>Name:</strong> Jenna Ortega
                </p>
                <p>
                  <strong>Age:</strong> 23
                </p>
                <p>
                  <strong>I would describe myself as:</strong> She/Her
                </p>
                <p className="about_me">
                  <strong>About me:</strong> Lorem ipsum dolor, sit amet
                  consectetur adipisicing elit. Architecto eaque cum ullam ipsam
                  esse voluptates, modi eos praesentium harum itaque dignissimos
                  rerum distinctio iusto, perferendis, asperiores nostrum
                  quaerat reprehenderit id perspiciatis. Doloribus recusandae,
                  ducimus at explicabo perspiciatis quam ipsa autem omnis
                  laudantium architecto ipsum hic, velit sunt fugit vitae
                  aliquid!
                </p>
              </div>
            </div>
          </div>
          <div className="right-icon">
            <ion-icon name="arrow-forward-circle-outline"></ion-icon>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
