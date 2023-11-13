const PORT = 8000;
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const cloudinary = require("./utils/cloudinary");
const fileUpload = require("express-fileupload");
const { generateUniqueId } = require("./utils/GenerateId");
const fs = require("fs");
const { generateRoomId } = require("./utils/generateRoomId");
const { isValidDate } = require("./utils/validateDate");

require("dotenv").config();

const uri = process.env.URI;
const default_email = process.env.EMAIL;
const default_password = process.env.PASSWORD;

const validGenders = ["man", "woman", "everyone"];
const validGenderInterests = ["man", "woman", "everyone"];
const nameRegex = /^[A-Za-z]+$/;
const validEmailDomain = /@nitk\.edu\.in$/;
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
app.use(cors());
app.use(express.json());
app.use(fileUpload());

io.on("connection", (socket) => {
  socket.on("message", (data, cokie) => {
    const timeStp = new Date();
    const mes = data;
    const from_user_Id = cokie;
    console.log(data, from_user_Id);
    const combine = { timeStp, mes, from_user_Id };
    socket.emit("message-from-server", combine);
  });
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Default
app.get("/", async (req, res) => {
  await client.connect(() => console.log("Connected to database"));
  res.send("Hello to my app");
});

// Sign up to the Database
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;


  const generatedUserId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await client.connect();
    const database = client.db("SparkMate");
    const users = database.collection("users");

    const sanitizedEmail = email.toLowerCase();

    if (!validEmailDomain.test(sanitizedEmail)) {
      return res.status(400).json({
        error: "Invalid email domain. Email must end with @nitk.edu.in",
      });
    }
  
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ error: "Password does not meet the criteria." });
    }
    
    const existingUser = await users.findOne({ sanitizedEmail });

    if (existingUser) {
      return res.status(409).send("User already exists. Please login");
    }

    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
      alphabets: false,
    });

    // Send OTP to user's email using nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: default_email,
        pass: default_password,
      },
    });

    const mailOptions = {
      from: default_email,
      to: sanitizedEmail,
      subject: "OTP Verification",
      html: `<h3>Hey there from SparkMate team!</h3>
                <p>OTP to confirm your email :<b> ${otp} </b> </p>`,
    };

    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5); // Set OTP expiry time to 5 minutes from now

    const data = {
      user_id: generatedUserId,
      email: sanitizedEmail,
      hashed_password: hashedPassword,
      otp: otp,
      otp_expiry: otpExpiry, // Store OTP expiry time in the database
    };

    const insertedUser = await users.insertOne(data);
    await users.createIndex({ otp_expiry: 1 }, { expireAfterSeconds: 300 });

    const token = jwt.sign(insertedUser, sanitizedEmail, {
      expiresIn: 60 * 24,
    });


    transporter.sendMail(mailOptions, async function (error, info) {
      try {
        console.log("Email sent: " + info.response);
        return res.status(201).json({ token, userId: generatedUserId });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ error: "Error sending OTP. Please try again later." });
      }
    });
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
});

//Verify user
app.post("/verifyUser", async (req, res) => {
  const { email, otpValue } = req.body;
  console.log(email + " " + otpValue);
  try {
    await client.connect();
    const database = client.db("SparkMate");
    const users = database.collection("users");
    const user = await users.findOne({ email, otp: otpValue });
    console.log(user);
    if (user) {
      await users.updateOne({ email }, { $unset: { otp: 1, otp_expiry: 1 } });

      res
        .status(200)
        .json({ message: "OTP verified successfully", userId: user.user_id });
    } else {
      res.status(401).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await client.close();
  }
});

// Log in to the Database
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!validEmailDomain.test(email)) {
    return res.status(400).json({
      error: "Invalid email domain. Email must end with @nitk.edu.in",
    });
  }

  try {
    await client.connect();
    const database = client.db("SparkMate");
    const users = database.collection("users");

    const user = await users.findOne({ email });

    const correctPassword = await bcrypt.compare(
      password,
      user.hashed_password
    );

    console.log("in login module");

    if (user && correctPassword) {
      const token = jwt.sign(user, email, {
        expiresIn: 60 * 24,
      });
      res.status(201).json({ token, userId: user.user_id });
    }

    res.status(400).json("Invalid Credentials");
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
});

// Get individual user
app.get("/user", async (req, res) => {
  const userId = req.query.userId;

  try {
    await client.connect();
    const database = client.db("SparkMate");
    const users = database.collection("users");

    const query = { user_id: userId };
    const user = await users.findOne(query);
    const { _id, hashed_password, ...filteredUser } = user;
    res.send(filteredUser);
  } finally {
    await client.close();
  }
});

app.put("/addmatch", async (req, res) => {
  const { userId, matchedUserId } = req.body;

  try {
    await client.connect();

    const otherUser = await getUserById(matchedUserId);

    const hasMatchedIndex = otherUser.matches.findIndex(
      (match) => match.userId === userId && match.hasMatched === false
    );

    if (hasMatchedIndex !== -1) {
      await updateMatchStatus(userId, matchedUserId);
      res.status(200).json({
        success: true,
        message: "Match updated successfully",
        matched: true,
      });
      return;
    }

    await addUserMatch(userId, { userId: matchedUserId, hasMatched: false });
    await addUserMatch(matchedUserId, { userId, hasMatched: false });

    res.status(200).json({
      success: true,
      message: "Match added successfully",
      matched: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    await client.close();
  }
});

async function getUserById(userId) {
  const database = client.db("SparkMate");
  const users = database.collection("users");

  return await users.findOne({ user_id: userId });
}

async function addUserMatch(userId, matchObject) {
  await client.connect();
  const database = client.db("SparkMate");
  const users = database.collection("users");

  await users.updateOne(
    { user_id: userId },
    { $push: { matches: matchObject } }
  );
}

async function updateMatchStatus(userId, matchedUserId) {
  const db = client.db("SparkMate");
  const users = db.collection("users");

  console.log("Updating matches for:", userId, matchedUserId);

  await users.updateOne(
    { user_id: userId, "matches.userId": matchedUserId },
    { $set: { "matches.$.hasMatched": true } }
  );

  await users.updateOne(
    { user_id: matchedUserId, "matches.userId": userId },
    { $set: { "matches.$.hasMatched": true } }
  );
}

// Fetch all matches of the current user with hasMatched: true
// hasMatched to indicate match has happened from both users
app.post("/matches", async (req, res) => {
  const { userId } = req.body;

  try {
    await client.connect();
    const database = client.db("SparkMate");
    const users = database.collection("users");

    const currentUser = await users.findOne({ user_id: userId });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const matchDetails = await users
      .find({
        user_id: { $ne: userId },
        matches: {
          $elemMatch: {
            user_id: { $in: currentUser.matches.map((match) => match.user_id) },
            hasMatched: true,
          },
        },
      })
      .project({
        _id: 0,
        user_id: 1,
        about: 1,
        first_name: 1,
        gender_identity: 1,
        gender_interest: 1,
        dob: 1,
        image: 1,
      })
      .toArray();
      console.log(matchDetails);
    return res.json(matchDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await client.close();
  }
});

// Get all Users by userIds in the Database
app.get("/users", async (req, res) => {
  const { userIds } = req.query;

  const userIDs = userIds ? JSON.parse(req.query.userIds) : [];

  try {
    await client.connect();
    const database = client.db("SparkMate");
    const users = database.collection("users");
    const pipeline = [
      {
        $match: {
          user_id: {
            $in: userIDs,
          },
        },
      },
    ];

    const foundUsers = await users.aggregate(pipeline).toArray();

    res.json(foundUsers);
  } finally {
    await client.close();
  }
});

// for fetching suggestions
app.get("/gendered-users", async (req, res) => {
  const userId = req.query.userId;
  const gender = req.query.gender;

  if (!validGenders.includes(gender)) {
    return res.status(400).json({ error: "Invalid gender parameter" });
  }

  try {
    await client.connect();
    const database = client.db("SparkMate");
    const users = database.collection("users");

    const currentUserMatches = await users.findOne(
      { user_id: userId },
      { projection: { matches: 1 } }
    );
    
    const excludedUserIds = currentUserMatches.matches.map(
      (match) => match.userId
    );
    let foundUsers;
    if (gender === "everyone") {
      foundUsers = await getRandomSuggestions(users, userId, excludedUserIds);
    } else {
      const query = {
        gender_identity: gender,
        user_id: { $nin: [...excludedUserIds, userId] },
        "matches.userId": { $nin: [...excludedUserIds, userId] }, // Exclude users in matches
      };
      foundUsers = await users.find(query).toArray();
    }

    const simplifiedSuggestions = foundUsers.map((user) => ({
      user_id: user.user_id,
      about: user.about,
      first_name: user.first_name,
      gender_identity: user.gender_identity,
      dob: user.dob,
      image: user.image,
    }));

    return res.json(simplifiedSuggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

async function getRandomSuggestions(usersCollection, userId, excludedUserIds) {
  const randomSuggestions = await usersCollection
    .aggregate([
      { $match: { user_id: { $nin: [...excludedUserIds, userId] } } },
      { $sample: { size: 20 } },
    ])
    .toArray();

  return randomSuggestions;
}

app.post("/user", async (req, res) => {
  const formData = req.body;

  // Validating gender
  if (
    formData.gender_identity &&
    !validGenders.includes(formData.gender_identity)
  ) {
    return res.status(400).json({ error: "Invalid gender identity" });
  }

  // Validating gender interest
  if (
    formData.gender_interest &&
    !validGenderInterests.includes(formData.gender_interest)
  ) {
    return res.status(400).json({ error: "Invalid gender interest" });
  }

  // Validating email domain
  if (formData.email && !validEmailDomain.test(formData.email)) {
    return res.status(400).json({
      error: "Invalid email domain. Email must end with @nitk.edu.in",
    });
  }

  // Validating date format
  const { dob } = formData;
  if (!isValidDate(dob)) {
    return res.status(400).json({ error: "Invalid date / age" });
  }

  // Validating first name
  if (formData.first_name && !nameRegex.test(formData.first_name)) {
    return res.status(400).json({ error: "Invalid first name" });
  }

  try {
    await client.connect();
    const database = client.db("SparkMate");
    const users = database.collection("users");
    const supplierId = generateUniqueId();
    const uploadPath =
      __dirname + "/uploads/" + supplierId + "_" + req.files.image.name;
    const file = req.files.image;
    file.mv(uploadPath, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: "Unable To Upload File",
        });
      }
    });
    const image = "./uploads/" + supplierId + "_" + req.files.image.name;
    const result = await cloudinary.uploader.upload(image);
    if (fs.existsSync(uploadPath)) {
      fs.unlink(uploadPath, (err) => {});
    }
    const query = { user_id: formData.user_id };

    const updateDocument = {
      $set: {
        first_name: formData.first_name,
        dob: formData.dob,
        show_gender: formData.show_gender,
        gender_identity: formData.gender_identity,
        gender_interest: formData.gender_interest,
        about: formData.about,
        matches: formData.matches,
        image: {
          public_id: result.public_id,
          url: result.secure_url,
        },
      },
    };

    const options = { upsert: true };

    const insertedUser = await users.updateOne(query, updateDocument, options);

    console.log(insertedUser);

    res.json(insertedUser);
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
});

// Unmatch a user
app.put("/unmatch", async (req, res) => {
  const { userId, matchedUserId } = req.body;
  const room_id = generateRoomId(userId, matchedUserId);

  try {
    await client.connect();
    const database = client.db("SparkMate");
    const users = database.collection("users");
    const chatRooms = database.collection("chatRooms");

    // Update the current user's matches array to remove the matched user
    await users.updateOne(
      { user_id: userId },
      { $pull: { matches: { userId: matchedUserId } } }
    );

    // Update the matched user's matches array to remove the current user
    await users.updateOne(
      { user_id: matchedUserId },
      { $pull: { matches: { userId: userId } } }
    );

    // Delete the chatroom
    const existingRoom = await chatRooms.findOne({ room_id });
    if(existingRoom){
      await rooms.deleteOne({ room_id });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});


// Get Messages by Room ID
app.get("/messages", async (req, res) => {
  const { from_userId, to_userId } = req.query;
  const room_id = generateRoomId(from_userId, to_userId);

  try {
    await client.connect();
    const database = client.db("SparkMate");
    const rooms = database.collection("chatRooms");

    const room = await rooms.findOne({ room_id });

    if (room) {
      const messages = room.messages || [];
      const sortedMessages = messages.sort((a, b) => a.timestamp - b.timestamp);

      res.send(sortedMessages);
    } else {
      res.status(404).json({ error: "Chat room doesn't exist" });
    }
  } catch (e) {
    console.log(e.message);
  } finally {
    await client.close();
  }
});

// Add a Message to our Database
app.post("/message", async (req, res) => {
  const { from_userId, to_userId, message } = req.body;

  console.log(from_userId, to_userId, message);

  try {
    await client.connect();
    const database = client.db("SparkMate");
    const chatRooms = database.collection("chatRooms");

    const room_id = generateRoomId(from_userId, to_userId);
    const timestamp = new Date();

    // Check if the room already exists
    const existingRoom = await chatRooms.findOne({ room_id });

    if (existingRoom) {
      // Room exists, add the new message to the messages array
      const updatedRoom = await chatRooms.findOneAndUpdate(
        { room_id },
        {
          $push: {
            messages: {
              from_userId,
              message,
              timestamp,
            },
          },
        },
        { returnDocument: "after" }
      );
      // Get the last inserted message
      const insertedMessage = updatedRoom.value.messages.slice(-1)[0];

      io.to(room_id).emit("message", {
        message: insertedMessage,
      });

      res.send(insertedMessage);
    } else {
      // Room doesn't exist, create a new room with the first message
      const newRoom = {
        room_id,
        messages: [
          {
            from_userId,
            message,
            timestamp,
          },
        ],
      };

      const insertedRoom = await chatRooms.insertOne(newRoom);

      io.to(room_id).emit("message", {
        message: newRoom.messages[0],
      });

      res.send(newRoom.messages[0]);
    }
  } finally {
    await client.close();
  }
});

server.listen(PORT, () => console.log("Server running on PORT " + PORT));
