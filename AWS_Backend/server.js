import express from "express";
import { FetchAll, Register, Login, Shutdown, authenticateToken, storeData, getData } from "./operations.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import session from "express-session";
import passport from "passport";
import "./config/passport.js";


import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';

let bucketfileName;

const port = process.env.PORT || 8080;

const app = express();


app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://timesheet-aws-frontend.s3-website.eu-north-1.amazonaws.com"],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());


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

// Add as FIRST route in your app.js/server.js
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok' });
});


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
        res.redirect(`https://dw3amckjax0vt.cloudfront.net/dashboard?username=${username}`);
    }
);

// Logout route
app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.clearCookie('token');
        res.redirect('https://dw3amckjax0vt.cloudfront.net/');
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
            secure: false, // process.env.NODE_ENV === 'production', // Disabled for HTTP AWS
            sameSite: 'lax', // 'strict', // Relaxed for cross-origin
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/api'
        });


        // Set httpOnly cookie for refresh token
        res.cookie('refreshToken', result.data.refreshToken, {
            httpOnly: true,

            secure: false, // process.env.NODE_ENV === 'production',
            sameSite: 'lax', // 'strict',
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
        secure: false, // process.env.NODE_ENV === 'production', // Match login setting
        sameSite: 'lax', // 'strict',
        path: '/api'  // Must match the path used when setting the cookie
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    res.json({ success: true, message: 'Logged out successfully' });
});



// // Multer configuration offline

// import multer from "multer";
// import path from "path";
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         console.log('📁 Saving to: uploads/');  // Debug
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         console.log('📄 Filename:', file.originalname);  // Debug
//         cb(null, file.originalname);
//     }
// });

// const upload = multer({ storage: storage })





// AWS S3 Client (use IAM credentials or env vars)
const s3Client = new S3Client({
    region: process.env.AWS_REGION, // Your RDS region
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const storage = multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME, // Create this in AWS S3 Console
    acl: 'public-read',  // Makes files publicly accessible via direct URL
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        bucketfileName = `${Date.now()}_${file.originalname}`;
        cb(null, bucketfileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed!'), false);
        }
    }
});


app.post('/api/savetask', authenticateToken, upload.single('file'), async (req, res) => {
    let token = req.cookies.accessToken;
    let currUser;

    // ✅ DEBUG: Check if file uploaded
    console.log('File uploaded:', req.file ? req.file.originalname : 'NO FILE');

    await jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("JWT verification failed:", err);
            return;
        }
        currUser = decoded;

    })

    let reqdata = { ...req.body, "user_id": currUser.userId, "attachment_path": bucketfileName };

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


app.listen(port, '0.0.0.0', () => {
    console.log("The app is listening to ", port);
});

// In your server.js
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await Shutdown();
    process.exit(0);
});