🧑‍💻 DevTinder

Where Developers Meet

DevTinder is a MERN-stack web app that connects developers with similar interests. It supports user authentication, profile creation, and connection requests (accept/reject), similar to how Tinder matches people — but for devs.

🚀 Features

🔐 JWT-based authentication (Signup/Login)

👤 User profiles with skills and bio

🤝 Send, accept, or reject connection requests

📰 Personalized feed (hides connected users)

⚙️ Express + Mongoose backend

☁️ MongoDB Atlas integration

🛠️ Tech Stack
Component	Technology
Frontend	React (optional if you’ve built it)
Backend	Node.js, Express.js
Database	MongoDB / MongoDB Atlas
Authentication	JWT
Environment Management	dotenv
Validation	mongoose-validator / custom middleware
⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/<your-username>/DevTinder.git
cd DevTinder

2️⃣ Install dependencies
npm install

3️⃣ Create a .env file in the root folder
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=8000

4️⃣ Run the server
npm start


or (for development with auto-restart)

npm run dev


Server will start on:

http://localhost:8000

📡 API Endpoints
Method	Endpoint	Description
POST	/signup	Register new user
POST	/login	Login user
GET	/feed	Get recommended users
PATCH	/request/send/:status/:toUserId	Send connection request
POST	/request/review/:status/:requestId	Accept/Reject request
GET	/user/profile	Get user profile
🧪 Example API Response
[
  {
    "_id": "6501c1234f2a5a5a7c9d12e0",
    "firstName": "Abhishek",
    "lastName": "Tripathi",
    "skills": ["Node.js", "Express", "MongoDB"],
    "about": "Backend Developer passionate about scalable systems"
  }
]

🧰 Folder Structure
DevTinder/
│
├── src/
│   ├── index.js          # Entry point
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routers
│   ├── middleware/       # Auth & validation
│   └── utils/            # Helper functions
│
├── .env.example
├── package.json
└── README.md

🧑‍🏫 Author

Abhishek Tripathi
💼 Backend Developer | Passionate about clean code & scalable systems
📧 Add your contact or portfolio link here if you want

💡 Future Plans

Add real-time chat using Socket.io

Add frontend (React) with clean UI

Integrate image uploads and notifications

📜 License

This project is open-source under the MIT License — feel free to fork, modify, and contribute.
