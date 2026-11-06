# 🏡 StaySpot – Accommodation Listing Platform

<p align="center">
  <strong>A Full-Stack Accommodation Listing Platform</strong>
</p>

<p align="center">
  <a href="https://project-iugf.onrender.com/">
    <img src="https://img.shields.io/badge/Live%20Demo-Visit%20StaySpot-success?style=for-the-badge" alt="Live Demo"/>
  </a>
  <a href="https://github.com/Suraj1307/Project">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github" alt="GitHub"/>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22%2B-green?logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-5.x-black?logo=express" alt="Express"/>
  <img src="https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/EJS-Templating-brightgreen" alt="EJS"/>
  <img src="https://img.shields.io/badge/Cloudinary-Image%20Storage-blue?logo=cloudinary" alt="Cloudinary"/>
</p>

## 🌐 Live Demo

**Explore StaySpot:** https://project-iugf.onrender.com/

StaySpot is a full-stack web application that allows users to discover, create, manage, and review accommodation listings. Users can explore different stays, upload property images, manage their listings, and share their experiences through reviews.

The application implements secure authentication, session management, listing ownership controls, image uploads, and dynamic server-side rendering.

---

## ✨ Features

### 👤 User Authentication & Authorization
- User registration and login.
- Secure authentication using Passport.js and Passport Local.
- Password hashing using Passport Local Mongoose.
- Session-based authentication.
- Protected routes for authenticated users.
- Authorization checks for listing owners and review authors.
- Login and signup rate limiting.

### 🏠 Listing Management
- Create new accommodation listings.
- Browse available accommodation listings.
- View detailed information about individual properties.
- Edit and delete existing listings.
- Upload property images using Cloudinary.
- Categorize properties based on different categories.
- Manage property details such as price, location, country, amenities, and maximum guest capacity.

### ⭐ Review & Rating System
- Add reviews to accommodation listings.
- Submit ratings from 1 to 5 stars.
- Delete reviews.
- Restrict review modifications to authorized users.
- Maintain listing ratings and review information.

### ❤️ Wishlist
- Save favorite accommodation listings.
- Manage wishlist items.
- Quickly access saved properties.

### 🔒 Security
- CSRF token protection.
- Secure HTTP-only session cookies.
- MongoDB-backed session storage.
- Input validation using Joi.
- Security-related HTTP headers.
- Authentication rate limiting.
- MongoDB ObjectId validation.
- Centralized error handling.

### ☁️ Image Management
- Cloudinary integration for image storage.
- Multer middleware for handling image uploads.
- Support for JPEG, JPG, and PNG formats.
- Organized image storage in the StaySpot Cloudinary folder.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Backend | Node.js, Express.js |
| Frontend | EJS, HTML, CSS, JavaScript, Bootstrap |
| Database | MongoDB Atlas, Mongoose |
| Authentication | Passport.js, Passport Local |
| Session Management | Express Session, Connect Mongo |
| Image Storage | Cloudinary |
| File Upload | Multer |
| Validation | Joi |
| Template Engine | EJS, EJS-Mate |
| Security | CSRF Protection, Secure Cookies, HTTP Security Headers |
| Testing | Node.js Test Runner |
| Deployment | Render |

---

## 📂 Project Structure

```text
Project/
│
├── backend/
│   ├── controllers/
│   │   ├── listings.js
│   │   ├── reviews.js
│   │   └── users.js
│   │
│   ├── models/
│   │   ├── listing.js
│   │   ├── review.js
│   │   └── user.js
│   │
│   ├── routes/
│   │   ├── listing.js
│   │   ├── review.js
│   │   └── user.js
│   │
│   ├── init/
│   │   ├── data.js
│   │   └── index.js
│   │
│   ├── tests/
│   │   └── schema.test.js
│   │
│   ├── utils/
│   │   ├── ExpressError.js
│   │   ├── escapeRegex.js
│   │   ├── listingMetadata.js
│   │   ├── redirectWithFlash.js
│   │   ├── updateListingRating.js
│   │   └── wrapAsync.js
│   │
│   ├── app.js
│   ├── cloudConfig.js
│   ├── middleware.js
│   └── schema.js
│
├── frontend/
│   ├── public/
│   │   ├── css/
│   │   └── js/
│   │
│   └── views/
│       ├── includes/
│       ├── layouts/
│       ├── listings/
│       ├── static/
│       ├── users/
│       └── error.ejs
│
├── app.js
├── package.json
├── package-lock.json
└── .gitignore
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Suraj1307/Project.git
```

### 2. Navigate to the Project Directory

```bash
cd Project
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

```env
ATLASDB_URL=your_mongodb_connection_string

SECRET=your_session_secret

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

PORT=8080
```

**Environment Variables:**

| Variable | Description |
|---|---|
| `ATLASDB_URL` | MongoDB Atlas connection string |
| `SECRET` | Session secret |
| `CLOUD_NAME` | Cloudinary cloud name |
| `CLOUD_API_KEY` | Cloudinary API key |
| `CLOUD_API_SECRET` | Cloudinary API secret |
| `PORT` | Application server port |

### 5. Start the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Open your browser:

```text
http://localhost:8080
```

### Prerequisites
- Node.js 22.16.0 or higher.
- MongoDB Atlas account or compatible MongoDB instance.
- Cloudinary account.

---

## 🧪 Running Tests

The project includes automated tests for request schema validation.

Run the test suite:

```bash
npm test
```

---

## 🏗️ Application Architecture

StaySpot follows a modular **MVC (Model-View-Controller)** architecture.

### 1. Models
Mongoose models define the database structure and relationships for:
- Users
- Listings
- Reviews

### 2. Views
EJS templates dynamically render application pages and display data from the server.

### 3. Controllers
Controllers manage application logic, including:
- Listing operations.
- User authentication.
- Review management.

### 4. Routes
Express routes define application endpoints and connect incoming requests with their respective controllers and middleware.

### 5. Middleware
Custom middleware handles:
- Authentication and authorization.
- Request validation.
- CSRF protection.
- Security headers.
- Rate limiting.
- Error handling.

---

## 🔐 Security Implementation

Security is an important part of StaySpot.

- Passwords are securely hashed using Passport Local Mongoose.
- Express sessions maintain authenticated user state.
- MongoDB stores session information.
- HTTP-only cookies help prevent client-side JavaScript from accessing session cookies.
- Joi validates incoming user, listing, and review data.
- Authorization middleware restricts listing and review modifications to their respective owners.
- CSRF tokens protect state-changing requests.
- Rate limiting helps prevent repeated login and signup attempts.
- Security headers provide additional browser-side protections.

---

## 🚀 Future Improvements

- Advanced listing search and filtering.
- Map-based property discovery.
- Booking and reservation management.
- Payment gateway integration.
- Email notifications.
- Admin dashboard and analytics.
- Enhanced recommendation system.

---

## 👨‍💻 Author

**Suraj Kumar**

- GitHub: [@Suraj1307](https://github.com/Suraj1307)
- Project Repository: [StaySpot](https://github.com/Suraj1307/Project)
- Live Application: [StaySpot – Live](https://project-iugf.onrender.com/)

---

## 📄 License

This project is licensed under the ISC License.
