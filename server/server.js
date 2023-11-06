const PORT = 8000
const express = require('express')
const {MongoClient} = require('mongodb')
const {v4: uuidv4} = require('uuid')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const cloudinary = require("./utils/cloudinary");
const fileUpload = require("express-fileupload");
const { generateUniqueId } = require("./utils/GenerateId");
const fs = require("fs");
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');

const  isValidDate  = require('./validateDate')


require('dotenv').config()

const uri = process.env.URI
const default_email = process.env.EMAIL
const default_password = process.env.PASSWORD

const validGenders = ['man', 'woman', 'everyone'];
const validGenderInterests = ['man', 'woman', 'everyone'];
const nameRegex = /^[A-Za-z]+$/;
const validEmailDomain = /@nitk\.edu\.in$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


const app = express()
app.use(cors())
app.use(express.json())
app.use(fileUpload());

const client = new MongoClient(uri)

// Default
app.get('/', async (req, res) => {
    await client.connect(()=>console.log('Connected to database'))
    res.send('Hello to my app')
})

// Sign up to the Database
app.post('/signup', async (req, res) => {
    const {email, password} = req.body

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error: 'Invalid password. Password must contain at least 8 characters, including one letter, one number, and one special character.'
        })
    }

    console.log(email, password);

    const generatedUserId = uuidv4()
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await client.connect()
        const database = client.db('SparkMate')
        const users = database.collection('users')


        const existingUser = await users.findOne({email})

        if (existingUser) {
            return res.status(409).send('User already exists. Please login')
        }

        const sanitizedEmail = email.toLowerCase()

        if (!validEmailDomain.test(sanitizedEmail)) {
            return res.status(400).json({ error: 'Invalid email domain. Email must end with @nitk.edu.in' });
        }

        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false })


        // Send OTP to user's email using nodemailer
        const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        secure: false,
        auth: {
            user: default_email,
            pass: default_password,
        },
        })

        const mailOptions = {
        from: default_email,
        to: sanitizedEmail,
        subject: 'OTP Verification',
        html: `<h3>Hey there from SparkMate team!</h3>
                <p>OTP to confirm your email :<b> ${otp} </b> </p>`,
        }

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
            expiresIn: 60 * 24
        })

        transporter.sendMail(mailOptions, async function (error, info) {
            try {
                console.log('Email sent: ' + info.response)
                res.status(201).json({token, userId: generatedUserId})
            } catch (error){
                console.error(error)
                return res.status(500).json({ error: 'Error sending OTP. Please try again later.' })
            }
        })
    } catch (err) {
        console.log(err)
    } finally {
        await client.close()
    }
})

//Verify user
app.post('/verifyUser', async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      await client.connect()
      const database = client.db('SparkMate')
      const users = database.collection('users')
  
      const user = await users.findOne({ email, otp })
  
      if (user) {
        await users.updateOne({ email }, { $unset: { otp: 1 } })
  
        res.status(200).json({ message: 'OTP verified successfully' })
      } else {
        res.status(401).json({ error: 'Invalid OTP' })
      }
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    } finally {
        await client.close()
    }
  });
  

// Log in to the Database
app.post('/login', async (req, res) => {
    const {email, password} = req.body

    if (!validEmailDomain.test(email)) {
        return res.status(400).json({ error: 'Invalid email domain. Email must end with @nitk.edu.in' });
    }

    try {
        await client.connect()
        const database = client.db('SparkMate')
        const users = database.collection('users')

        const user = await users.findOne({email})

        const correctPassword = await bcrypt.compare(password, user.hashed_password)

        console.log("in login module.");

        if (user && correctPassword) {
            const token = jwt.sign(user, email, {
                expiresIn: 60 * 24
            })
            res.status(201).json({token, userId: user.user_id})
        }

        res.status(400).json('Invalid Credentials')

    } catch (err) {
        console.log(err)
    } finally {
        await client.close()
    }
})

// Get individual user
app.get('/user', async (req, res) => {
    const userId = req.query.userId

    try {
        await client.connect()
        const database = client.db('SparkMate')
        const users = database.collection('users')

        const query = {user_id: userId}
        const user = await users.findOne(query)
        res.send(user)

    } finally {
        await client.close()
    }
})

// Update User with a match
app.put('/addmatch', async (req, res) => {
    const {userId, matchedUserId} = req.body

    try {
        await client.connect()
        const database = client.db('SparkMate')
        const users = database.collection('users')

        const query = {user_id: userId}
        const updateDocument = {
            $addToSet: {matches: {user_id: matchedUserId}}
        }
        const user = await users.updateOne(query, updateDocument)
        res.send(user)
    } finally {
        await client.close()
    }
})

// Get all Users by userIds in the Database
app.get('/users', async (req, res) => {
    const { userIds } = req.query;
    
    const userIDs = userIds ? JSON.parse(req.query.userIds) : []

    try {
        await client.connect()
        const database = client.db('SparkMate')
        const users = database.collection('users')
        const pipeline =
        [
                {
                    '$match': {
                        'user_id': {
                            '$in': userIDs
                        }
                    }
                }
            ]

        const foundUsers = await users.aggregate(pipeline).toArray()

        // console.log(foundUsers);
        res.json(foundUsers)

    } finally {
        await client.close()
    }
})

app.get('/gendered-users', async (req, res) => {
    const userId = req.query.userId;
    const gender = req.query.gender;

    if (!validGenders.includes(gender)) {
        return res.status(400).json({ error: 'Invalid gender parameter' });
    }

    try {
        await client.connect();
        const database = client.db('SparkMate');
        const users = database.collection('users');

        if (gender === 'everyone') {
            const suggestions = await getRandomSuggestions(users, userId);
            return res.json(suggestions);
        }

        const query = { gender_identity: gender, user_id: { $ne: userId } };
        const foundUsers = await users.find(query).toArray();
        res.json(foundUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await client.close();
    }
});

async function getRandomSuggestions(usersCollection, userId) {
    const randomSuggestions = await usersCollection.aggregate([
        { $match: { user_id: { $ne: userId } } }, 
        { $sample: { size: 10 } }
    ]).toArray();

    return randomSuggestions;
}

app.put('/user', async (req, res) => {
    const formData = req.body.formData;

    // Validating gender
    if (formData.gender_identity && !validGenders.includes(formData.gender_identity)) {
        return res.status(400).json({ error: 'Invalid gender identity' });
    }

    // Validating gender interest
    if (formData.gender_interest && !validGenderInterests.includes(formData.gender_interest)) {
        return res.status(400).json({ error: 'Invalid gender interest' });
    }

    // Validating email domain
    if (formData.email && !validEmailDomain.test(formData.email)) {
        return res.status(400).json({ error: 'Invalid email domain. Email must end with @nitk.edu.in' });
    }

    // Validating date format
    const { dob_day, dob_month, dob_year } = formData;
    if (!isValidDate(dob_day, dob_month, dob_year)) {
        return res.status(400).json({ error: 'Invalid date' });
    }

    // Validating first name
    if (formData.first_name && !nameRegex.test(formData.first_name)) {
        return res.status(400).json({ error: 'Invalid first name' });
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
      console.log(result);
      const query = { user_id: formData.user_id };
  
      const updateDocument = {
        $set: {
          first_name: formData.first_name,
          dob_day: formData.dob_day,
          dob_month: formData.dob_month,
          dob_year: formData.dob_year,
          show_gender: formData.show_gender,
          gender_identity: formData.gender_identity,
          gender_interest: formData.gender_interest,
          url: formData.url,
          about: formData.about,
          matches: formData.matches,
          image: {
            public_id: result.public_id,
            url: result.secure_url,
          },
        },
      };
  
      const insertedUser = await users.updateOne(query, updateDocument);
  
      res.json(insertedUser);
    } catch (err) {
      console.log(err);
    } finally {
      await client.close();
    }
});




// Get Messages by from_userId and to_userId
app.get('/messages', async (req, res) => {
    const {userId, correspondingUserId} = req.query

    try {
        await client.connect()
        const database = client.db('SparkMate')
        const messages = database.collection('messages')

        const query = {
            from_userId: userId, to_userId: correspondingUserId
        }

        const foundMessages = await messages.find(query).toArray()
        res.send(foundMessages)
    } finally {
        await client.close()
    }
})

// Add a Message to our Database
app.post('/message', async (req, res) => {
    const message = req.body.message

    try {
        await client.connect()
        const database = client.db('SparkMate')
        const messages = database.collection('messages')

        const insertedMessage = await messages.insertOne(message)
        res.send(insertedMessage)
    } finally {
        await client.close()
    }
})


app.listen(PORT, () => console.log('server running on PORT ' + PORT))