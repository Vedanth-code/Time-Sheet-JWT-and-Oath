# API Documentation

## Authentication Strings

### Google OAuth
**Endpoint:** `GET /auth/google`
- **Description:** Initiates Google OAuth authentication flow.
- **Scope:** profile, email

### Google OAuth Callback
**Endpoint:** `GET /auth/google/callback`
- **Description:** Callback URL for Google OAuth.
- **Success Behavior:** 
  - Generates JWT `accessToken`.
  - Sets `accessToken` cookie (httpOnly).
  - Redirects to `http://localhost:5173/dashboard?username={username}`.
- **Failure Behavior:** Redirects to `/login`.

### Logout (Legacy/Browser)
**Endpoint:** `GET /auth/logout`
- **Description:** Logs out the user by clearing the `token` cookie.
- **Redirect:** `http://localhost:5173/`

### Logout (API)
**Endpoint:** `POST /api/logout`
- **Description:** Logs out the user by clearing `accessToken` and `refreshToken` cookies.
- **Response:** JSON
  ```json
  { "success": true, "message": "Logged out successfully" }
  ```

### Get Current User
**Endpoint:** `GET /auth/user`
- **Description:** Returns the currently authenticated user's session data.
- **Authentication:** Session-based (req.isAuthenticated())
- **Response:**
  - **Success (200):** `{ "user": { ... } }`
  - **Error (401):** `{ "message": "Not authenticated" }`

### Login
**Endpoint:** `POST /login`
- **Description:** Authenticates a user with credentials.
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password"
  }
  ```
- **Response (200):**
  - Sets cookies: `accessToken`, `refreshToken`.
  - JSON Body:
    ```json
    {
      "accessToken": "...",
      "user": { ... }
    }
    ```
- **Response (Error):** Status code from operation result with error message.

### Register
**Endpoint:** `POST/saveUser`
- **Description:** Registers a new user.
- **Body:** User registration data.
- **Response:**
  ```json
  {
    "status": 200,
    "message": "...",
    "body": { ... }
  }
  ```

### Verify Token
**Endpoint:** `GET /api/verify`
- **Middleware:** `authenticateToken`
- **Response:**
  ```json
  { "authenticated": true }
  ```

---

## Data Operations

### Fetch All Data
**Endpoint:** `GET /api/`
- **Middleware:** `authenticateToken`
- **Description:** Fetches all data using `FetchAll` operation.
- **Response:** Result from `FetchAll`.

### Save Task
**Endpoint:** `POST /api/savetask`
- **Middleware:** `authenticateToken`, `upload.single('file')`
- **Description:** Saves a new task with an optional file attachment (uploaded to AWS S3).
- **Body:** FormData
  - File field: `file`
  - Other fields: Task details
- **Response:**
  - **Success (200):** `{ "status": 200, "message": "..." }`
  - **Error (400):** `{ "status": 400, "message": "..." }`

### Get Tasks
**Endpoint:** `GET /api/getTask`
- **Middleware:** `authenticateToken`
- **Description:** Retrieves tasks for the authenticated user.
- **Response:**
  - **Success (200):**
    ```json
    {
      "status": 200,
      "message": "...",
      "data": [ ... ]
    }
    ```
  - **Error (400):** `{ "status": 400, "message": "..." }`

---

## Static Assets

### Get Image (Local)
**Endpoint:** `GET /images`
- **Query Params:** `filename`
- **Description:** Serves an image from the local `uploads` directory.
- **Note:** This seems to be for local storage, whereas `savetask` uses S3.
- **Response:** File stream or 404 Error.
