import express from "express";
import { FetchAll, Register, Login, Shutdown, authenticateToken, storeData, getData } from "./operations.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import session from "express-session";
import passport from "passport";
import "./config/passport.js";


const app = express();


app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Generate JWT token
        const accessToken = jwt.sign(
            { userId: req.user.id, email: req.user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set cookie
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        // Redirect to frontend with username
        const username = encodeURIComponent(req.user.name);
        res.redirect(`http://localhost:5173/dashboard?username=${username}`);
    }
);

// Logout route
app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.clearCookie('token');
        res.redirect('http://localhost:5173/');
    });
});

// Get current user
app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});


app.get('/api/verify', authenticateToken, async (req, res) => {
    res.status(200).json({ authenticated: true });
})

app.get('/api/', authenticateToken, async (req, res) => {

    const result = await FetchAll();
    res.send(result);

    // const timesheets = await getTimesheets(req.user.userId);
    // res.json(timesheets);
})

app.post('/saveUser', async (req, res) => {
    const data = req.body;

    let result = await Register(data);
    res.status(result.status).json({ status: result.status, message: result.message, body: result.body });
})

app.post('/login', async (req, res) => {
    let reqdata = req.body;
    console.log("The parameters are ", reqdata);

    let result = await Login(reqdata);
    if (result.status === 200) {

        // Set httpOnly cookie for access token (short-lived)
        res.cookie('accessToken', result.data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/api'
        });


        // Set httpOnly cookie for refresh token
        res.cookie('refreshToken', result.data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/api'
        });

        // Send access token and user info
        res.status(200).json({
            accessToken: result.data.accessToken,
            user: result.data.user
        });
    } else {
        res.status(result.status).json({ message: result.message });
    }

})

// Logout route in Node.js
app.post('/api/logout', (req, res) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Match login setting
        sameSite: 'strict',
        path: '/api'  // Must match the path used when setting the cookie
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    res.json({ success: true, message: 'Logged out successfully' });
});


import multer from "multer";
import path from "path";

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('📁 Saving to: uploads/');  // Debug
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        console.log('📄 Filename:', file.originalname);  // Debug
        cb(null, file.originalname);
    }
});


const upload = multer({ storage: storage })

app.post('/api/savetask', authenticateToken, upload.single('file'), async (req, res) => {
    let token = req.cookies.accessToken;
    let currUser;

    // ✅ DEBUG: Check if file uploaded
    console.log('File uploaded:', req.file ? req.file.filename : 'NO FILE');

    await jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("JWT verification failed:", err);
            return;
        }
        currUser = decoded;

    })

    let reqdata = { ...req.body, "user_id": await currUser.userId, "attachment_path": req.file.filename };

    let data = await storeData(reqdata);

    if (data.status == 200) {
        res.status(200).json({
            "status": 200,
            "message": data.message
        })
    } else {
        res.status(400).json({
            "status": 400,
            "message": data.message
        })
    }
})

app.get('/api/getTask', authenticateToken, async (req, res) => {

    let token = req.cookies.accessToken;
    let userId = jwt.verify(token, process.env.JWT_SECRET, (err, debuged) => {
        if (err) {
            return 0;
        }
        return debuged.userId;
    })

    console.log("the userid is ", await userId);


    let data = await getData(await userId);

    if (data.status == 200) {
        res.status(200).json({
            "status": 200,
            "message": data.message,
            "data": data.body
        })
    } else {
        res.status(400).json({
            "status": 400,
            "message": data.message
        })
    }
})


app.get('/images', (req, res) => {
    const filename = req.query.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    console.log("the filename is ", filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ error: 'Image not found' });
    }
});


app.listen(8080, () => {
    console.log("The app is listening to 8080");
});

// In your server.js
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await Shutdown();
    process.exit(0);
});