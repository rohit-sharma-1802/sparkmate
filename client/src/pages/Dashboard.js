import TinderCard from "react-tinder-card";
import { useEffect, useState } from "react";
import ChatContainer from "../components/ChatContainer";
import { useCookies } from "react-cookie";
import axios from "axios";
import React from "react";

const Dashboard = () => {
  // const [user, setUser] = useState(null)
  // const [genderedUsers, setGenderedUsers] = useState([])
  // const [lastDirection, setLastDirection] = useState()
  // const [cookies, setCookie, removeCookie] = useCookies(['user'])

  // const userId = cookies.UserId

  // const getUser = async () => {
  //     try {
  //         const response = await axios.get('http://localhost:8000/user', {
  //             params: {userId}
  //         })
  //         setUser(response.data)
  //     } catch (error) {
  //         console.log(error)
  //     }
  // }
  // const getGenderedUsers = async () => {
  //     try {
  //         const response = await axios.get('http://localhost:8000/gendered-users')
  //         console.log(response);
  //         setGenderedUsers([response.data])
  //     } catch (error) {
  //         console.log(error)
  //     }
  // }

  // console.log("gendred users", genderedUsers);

  // useEffect(() => {
  //     getUser()

  // }, [])

  // useEffect(() => {
  //     if (user) {
  //         getGenderedUsers()
  //     }
  // }, [user])

  // const updateMatches = async (matchedUserId) => {
  //     try {
  //         await axios.put('http://localhost:8000/addmatch', {
  //             userId,
  //             matchedUserId
  //         })
  //         getUser()
  //     } catch (err) {
  //         console.log(err)
  //     }
  // }

  // const swiped = (direction, swipedUserId) => {
  //     if (direction === 'right') {
  //         updateMatches(swipedUserId)
  //     }
  //     setLastDirection(direction)
  // }

  // const outOfFrame = (name) => {
  //     console.log(name + ' left the screen!')
  // }

  // const matchedUserIds = user?.matches?.map(({user_id}) => user_id).concat(userId)

  // const filteredGenderedUsers = genderedUsers?.filter(genderedUser => !matchedUserIds?.includes(genderedUser.user_id))

  // console.log('filteredGenderedUsers ', filteredGenderedUsers)
  return (
    <div className="user-dashboard">
      <div className="container">
        <div className="leftSide">
          <div className="header">
            <div className="userimg">
              <img src="images/user.jpg" alt="" className="cover" />
            </div>
            <ul className="nav_icons">
              <li>
                <ion-icon name="person-add-outline"></ion-icon>
              </li>
              <li>
                <ion-icon name="chatbox"></ion-icon>
              </li>
              <li>
                <ion-icon name="log-out-outline"></ion-icon>
              </li>
            </ul>
          </div>
          <div className="search_chat">
            <div className="search-container">
              <input type="text" placeholder="Search or start new chat" />
              <ion-icon name="search-outline"></ion-icon>
            </div>
          </div>
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
