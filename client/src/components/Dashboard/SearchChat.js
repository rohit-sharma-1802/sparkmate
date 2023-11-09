import { useState, useEffect } from "react";

import ChatElement from "./ChatElement";

import "./style/index.css";
import "./style/swipeCard.css";
import "./style/chatBox.css";

const sanitizedString = (params) => params.trim().toLowerCase();

export default function ChatDisplay({ chatsArray, handleChatClick }) {
  const [searchText, setSearchText] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };

  useEffect(() => {
    if (searchText.length === 0) setFilteredChats(chatsArray);
    else {
      const chats = chatsArray?.filter((chat) =>
        sanitizedString(chat.displayName).includes(sanitizedString(searchText))
      );
      setFilteredChats(chats);
    }
  }, [chatsArray, searchText]);

  return (
    <>
      <div className="search_chat">
        <div>
          <input
            type="text"
            placeholder="Search or start new chat"
            onChange={handleSearch}
            value={searchText}
          />
          <ion-icon name="search-outline"></ion-icon>
        </div>
      </div>
      <div className="chatlist">
        {filteredChats?.length === 0 && <h4>No available chats</h4>}
        {filteredChats?.length > 0 &&
          filteredChats.map((chat) => {
            return (
              <ChatElement
                key={chat.id}
                displayProfilePic={chat.displayProfilePic}
                displayName={chat.displayName}
                lastMessage={chat.lastMessage}
                status={chat.status}
                noOfUnreadMessages={chat.noOfUnreadMessages ?? 0}
                handleChatClick={handleChatClick}
                inboxID={chat.id}
              />
            );
          })}
      </div>
    </>
  );
}
