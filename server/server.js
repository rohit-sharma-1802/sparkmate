const PORT = 8000;
const express = require("express");
const http = require("http");
const {Server} = require("socket.io");
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

const { isValidDate } = require("./validateDate");

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
const io = new Server(server,{
  cors:{
    origin : 'http://localhost:3000'
  }
});
app.use(cors());
app.use(express.json());
app.use(fileUpload());


io.on('connection',(socket)=>{
 socket.on("message",(data)=>{
  socket.emit("message-from-server",data)
 })
})
const client = new MongoClient(uri);

// Default
app.get("/", async (req, res) => {
  await client.connect(() => console.log("Connected to database"));
  res.send("Hello to my app");
});

// Sign up to the Database
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);

  const generatedUserId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await client.connect();
    const database = client.db("SparkMate");
    const users = database.collection("users");

    const existingUser = await users.findOne({ email });

    if (existingUser) {
      return res.status(409).send("User already exists. Please login");
    }

    const sanitizedEmail = email.toLowerCase();

    if (!validEmailDomain.test(sanitizedEmail)) {
      return res.status(400).json({
        error: "Invalid email domain. Email must end with @nitk.edu.in",
      });
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
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5); // Set OTP expiry time to 10 minutes from now

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

    localStorage.setItem("accesstoken",token)

    res.status(201).json({ token, userId: generatedUserId });

    // transporter.sendMail(mailOptions, async function (error, info) {
    //   try {
    //     console.log("Email sent: " + info.response);
    //     res.status(201).json({ token, userId: generatedUserId });
    //   } catch (error) {
    //     console.error(error);
    //     return res
    //       .status(500)
    //       .json({ error: "Error sending OTP. Please try again later." });
    //   }
    // });
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
    res.send(user);
  } finally {
    await client.close();
  }
});

app.put("/addmatch", async (req, res) => {
  const { userId, matchedUserId } = req.body;

  try {
    await client.connect();
    const database = client.db("SparkMate");
    const users = database.collection("users");

    const currentUserQuery = { user_id: userId, likes: matchedUserId };
    const currentUserAlreadyLiked = await users.findOne(currentUserQuery);

    if (currentUserAlreadyLiked) {
      const addMatchesQueryCurrentUser = { user_id: userId };
      const addMatchesUpdateCurrentUser = {
        $addToSet: { matches: { user_id: matchedUserId } },
      };
      await users.updateOne(addMatchesQueryCurrentUser, addMatchesUpdateCurrentUser);

      const addMatchesQueryMatchedUser = { user_id: matchedUserId };
      const addMatchesUpdateMatchedUser = {
        $addToSet: { matches: { user_id: userId } },
      };
      await users.updateOne(addMatchesQueryMatchedUser, addMatchesUpdateMatchedUser);

      const removeLikedUserQuery = { user_id: userId };
      const removeLikedUserUpdate = {
        $pull: { likes: matchedUserId },
      };

      await users.updateOne(removeLikedUserQuery, removeLikedUserUpdate);
    } else {
      const updateMatchedUserDocument = {
        $addToSet: { likes: userId },
      };
      await users.updateOne({ user_id: matchedUserId }, updateMatchedUserDocument);
    }

    res.send({ success: true });
  } catch (error) {
    console.error("Error in /addmatch:", error);
    res.status(500).send({ error: "Internal Server Error" });
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

    // console.log(foundUsers);
    res.json(foundUsers);
  } finally {
    await client.close();
  }
});

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

    if (gender === "everyone") {
      const suggestions = await getRandomSuggestions(users, userId);
      return res.json(suggestions);
    }

    const query = { gender_identity: gender, user_id: { $ne: userId } };
    const foundUsers = await users.find(query).toArray();
    res.json(foundUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
});

async function getRandomSuggestions(usersCollection, userId) {
  const randomSuggestions = await usersCollection
    .aggregate([
      { $match: { user_id: { $ne: userId } } },
      { $sample: { size: 10 } },
    ])
    .toArray();

  return randomSuggestions;
}

app.post("/user", async (req, res) => {
  const formData = req.body;

  console.log(formData);

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
  // const { dob_day, dob_month, dob_year } = formData;
  // if (!isValidDate(dob_day, dob_month, dob_year)) {
  //   return res.status(400).json({ error: "Invalid date" });
  // }

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

// Get Messages by Room ID
app.get("/messages", async (req, res) => {
  const { from_userId, to_userId } = req.body;
  const room_id = generateRoomId(from_userId, to_userId);

  try {
    await client.connect();
    const database = client.db("SparkMate");
    console.log("connected")
    const messages = database.collection("messages");

    const query = { room_id };
    const sortOptions = { timestamp: 1 };
    const foundMessages = await messages
      .find(query)
      .sort(sortOptions)
      .toArray();

    res.send(foundMessages);
  }catch(e){
    console.log(e.message);
  } finally {
    await client.close();
  }
});

// Add a Message to our Database
app.post("/message", async (req, res) => {
  const { from_userId, to_userId, message } = req.body;

  try {
    await client.connect();
    const database = client.db("SparkMate");
    const messages = database.collection("messages");

    const room_id = generateRoomId(from_userId, to_userId);

    const insertedMessage = await messages.insertOne({
      room_id,
      from_userId,
      message,
    });

    io.to(room_id).emit("message", {
      message
    });

    res.send(insertedMessage);
  } finally {
    await client.close();
  }
});

server.listen(PORT, () => console.log("Server running on PORT " + PORT));
