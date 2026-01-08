import 'dotenv/config';
import { closeConnection, createConnection } from "./Configuration.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
}

export async function FetchAll() {
    try {
        const db = await createConnection();

        const result = await db.query("SELECT * FROM users;");

        return result[0];
    } catch (error) {
        console.log("Error Connecting ", error);
        throw error;
    }
}

export async function Register(data) {
    try {
        const db = await createConnection();

        let { name, email, password } = data;
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.execute("INSERT INTO users (name,email,password) VALUES (?,?,?)", [name, email, hashedPassword]);

        return {
            "status": 200,
            "message": "User saved",
            "body": result
        };
    } catch (error) {
        console.log("Error ", error);
        return {
            "status": 500,
            "message": "Internal Error while saving user",
            "body": error
        }
    }
}

export async function Login(data) {
    try {
        let username = data.username;
        let password = data.password;

        let db = await createConnection();
        let users = await db.execute("SELECT * FROM users WHERE email = ?", [username]);

        // Check if user exists
        if (users[0].length == 0) {
            return {
                "status": 401,
                "message": "Invalid username or password"  // Generic message for security
            }
        }

        const user = users[0][0];  // Store user object

        // Verify password with bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return {
                "status": 401,
                "message": "Invalid username or password"
            }
        }

        // Generate JWT tokens - FIXED: use user.id not users[0].id
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // Return tokens - cookie will be set in route handler
        return {
            "status": 200,
            "data": {
                accessToken,
                refreshToken,
                user: { id: user.id, email: user.email, name: user.name }
            }
        }
    } catch (error) {
        console.log("Error while login: ", error);
        return {
            "status": 500,
            "message": "Internal error while login"
        }
    }
}

export async function storeData(data) {
    try {
        let db = await createConnection();
        let { task_name, description, start_date, end_date, totalduration, user_id } = data;
        console.log("The totalduration is ", totalduration);
        let result = await db.query("INSERT INTO taskdata(task_name,description,start_time,end_time,user_id) VALUES(?,?,?,?,?);", [task_name, description, start_date, end_date, user_id, totalduration]);

        return {
            "status": 200,
            "message": "Task saved",
            "body": result
        };
    } catch (error) {
        console.log("Error ", error);
        return {
            "status": 500,
            "message": "Internal Error while saving task",
            "body": error
        }
    }
}

export async function getData(userId) {
    try {
        let db = await createConnection();
        let result = await db.query("SELECT * FROM taskdata WHERE user_id = ?;", [userId]);

        return {
            "status": 200,
            "message": "Tasks retrieved",
            "body": await result[0]
        };
    } catch (error) {
        console.log("Error ", error);
        return {
            "status": 500,
            "message": "Internal Error while saving task",
            "body": error
        }
    }
}
export async function Shutdown() {
    try {
        await closeConnection(); // Close pool on server shutdown
    } catch (error) {
        console.log("Error closing the connection");
        throw error;
    }
}