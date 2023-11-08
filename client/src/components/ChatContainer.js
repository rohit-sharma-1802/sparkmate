import ChatHeader from "./ChatHeader";
import MatchesDisplay from "./MatchesDisplay";
import ChatDisplay from "./ChatDisplay";
import React, { useState } from "react";

const ChatContainer = ({ user }) => {
  const [clickedUser, setClickedUser] = useState(null);

  return (
    // <div className="chat-container">
    //     <ChatHeader user={user}/>

    //     <div>
    //         <button className="option" onClick={() => setClickedUser(null)}>Matches</button>
    //         <button className="option" disabled={!clickedUser}>Chat</button>
    //     </div>

    //     {!clickedUser && <MatchesDisplay matches={user.matches} setClickedUser={setClickedUser}/>}

    //     {clickedUser && <ChatDisplay user={user} clickedUser={clickedUser}/>}
    // </div>

    <div className="chatlist">
      <div className="block active">
        <div className="imgBox">
          <img src="images/img1.jpg" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Jhon Doe</h4>
          </div>
          <div className="message_p">
            <p>How are you doing?</p>
          </div>
        </div>
      </div>

      <div className="block unread">
        <div className="imgBox">
          <img src="images/img2.jpg" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Andre</h4>
          </div>
          <div className="message_p">
            <p>I love your youtube videos!</p>
            <b>1</b>
          </div>
        </div>
      </div>

      <div className="block unread">
        <div className="imgBox">
          <img src="images/img3.jpg" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Olivia</h4>
          </div>
          <div className="message_p">
            <p>I just subscribed to your channel</p>
            <b>2</b>
          </div>
        </div>
      </div>
      <div className="block">
        <div className="imgBox">
          <img src="images/img4.jpg" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Parker</h4>
          </div>
          <div className="message_p">
            <p>Hey!</p>
          </div>
        </div>
      </div>
      <div className="block">
        <div className="imgBox">
          <img src="images/img7.png" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Jenna</h4>
          </div>
          <div className="message_p">
            <p>I'll get back to you</p>
          </div>
        </div>
      </div>
      <div className="block">
        <div className="imgBox">
          <img src="images/img7.png" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Jenna</h4>
          </div>
          <div className="message_p">
            <p>I'll get back to you</p>
          </div>
        </div>
      </div>
      <div className="block">
        <div className="imgBox">
          <img src="images/img7.png" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Jenna</h4>
          </div>
          <div className="message_p">
            <p>I'll get back to you</p>
          </div>
        </div>
      </div>
      <div className="block">
        <div className="imgBox">
          <img src="images/img7.png" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Jenna</h4>
          </div>
          <div className="message_p">
            <p>I'll get back to you</p>
          </div>
        </div>
      </div>
      <div className="block">
        <div className="imgBox">
          <img src="images/img8.jpg" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Josh</h4>
          </div>
          <div className="message_p">
            <p>Congratulations</p>
          </div>
        </div>
      </div>
      <div className="block">
        <div className="imgBox">
          <img src="images/img9.jpg" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Dian</h4>
          </div>
          <div className="message_p">
            <p>Thanks alot</p>
          </div>
        </div>
      </div>
      <div className="block">
        <div className="imgBox">
          <img src="images/img5.jpg" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Sam</h4>
          </div>
          <div className="message_p">
            <p>Did you finish the project?</p>
          </div>
        </div>
      </div>
      <div className="block">
        <div className="imgBox">
          <img src="images/img6.jpg" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Junior</h4>
          </div>
          <div className="message_p">
            <p>Nice course</p>
          </div>
        </div>
      </div>
      <div className="block">
        <div className="imgBox">
          <img src="images/img10.jpg" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Zoey</h4>
          </div>
          <div className="message_p">
            <p>I'll get back to you</p>
          </div>
        </div>
      </div>
      <div className="block">
        <div className="imgBox">
          <img src="images/img8.jpg" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Josh</h4>
          </div>
          <div className="message_p">
            <p>Congratulations</p>
          </div>
        </div>
      </div>
      <div className="block">
        <div className="imgBox">
          <img src="images/img9.jpg" className="cover" alt="" />
        </div>
        <div className="details">
          <div className="listHead">
            <h4>Dian</h4>
          </div>
          <div className="message_p">
            <p>Thanks alot</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
