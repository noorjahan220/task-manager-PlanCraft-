# 🧠 Smart Task Manager

<!-- Banner Image with fixed width to fit screen -->
<div align="center">
  <img src="https://i.ibb.co.com/wZhvjnTn/Screenshot-479.png" alt="Smart Task Manager Banner" width="100%" style="border-radius: 10px;">
</div>

<br/>

## 🔗 Live Links
- **Live Site:** [Click Here to Visit](#) *(Add your link here)*
- **Server API:** [Server Link](#) *(Add your link here)*

## 📖 Project Overview
**Smart Task Manager** is a web application designed to streamline project management while actively preventing team burnout. 

Unlike standard to-do apps, this system tracks the "Workload Capacity" of every team member. It includes an intelligent **"Auto Reassign"** feature that automatically balances tasks among the team, ensuring no single member is overwhelmed while others are idle.

## 🌟 Key Features

### 1. 👥 User & Team Management
*   **Authentication:** Secure registration and login system.
*   **Team Setup:** Create teams and manually add members with specific roles.
*   **Capacity Planning:** Set a **Workload Capacity (0–5 tasks)** for each member. This defines the maximum number of active tasks a user can comfortably handle.

### 2. 📝 Project & Task Management
*   **Projects:** Organize work into specific projects linked to teams.
*   **Task CRUD:** Full Create, Read, Update, and Delete capabilities.
*   **Task Details:** Includes Title, Description, Priority (Low/Medium/High), and Status.
*   **Smart Assignment Indicators:** 
    *   Visual indicators show real-time load vs. capacity (e.g., "3/5").
    *   **Overload Warning:** If you try to assign a task to a full member, the system warns: *"Riya has 4 tasks but capacity is 3. Assign anyway?"*

### 3. ⚖️ Smart Load Balancing (The Core Feature)
A unique algorithm to resolve bottlenecks with one click.
*   **The Logic:** Identifies members exceeding capacity and members with free slots.
*   **Auto-Reassign:** Moves tasks from overloaded members to available ones automatically.
*   **Safety Rules:** 
    *   **High Priority** tasks are never moved (they stay with the assigned expert).
    *   Only **Low** and **Medium** priority tasks are reassigned.
*   **Activity Logging:** Every automatic change is recorded in the system log.

### 4. 📊 Dashboard & Activity Log
*   **Team Health:** Color-coded list showing who is **Overloaded (Red)** vs. **Available (Green)**.
*   **Activity Log:** A history of all reassignments (e.g., *"10:30 AM — Task 'UI Design' reassigned from Riya to Farhan"*).

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React.js, HTML5, JavaScript (ES6+) |
| **Styling** | Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **Tools** | Vite, Context API (for state management) |

## 📦 Dependencies Used

### Client-side
- `react-router-dom`: For single-page application navigation.
- `axios`: For handling API requests to the backend.
- `react-icons`: For UI icons.
- `react-toastify` / `sweetalert2`: For overload warnings and success messages.
- `chart.js` / `recharts`: (Optional) For visualizing team capacity.

### Server-side
- `express`: The web framework.
- `mongoose`: For MongoDB object modeling.
- `cors`: To allow frontend-backend communication.
- `dotenv`: To secure sensitive API keys and database URIs.
- `jsonwebtoken` (JWT): For secure user authentication.

## 💻 How to Run Locally (Step-by-Step)

Follow these instructions to run the project on your local machine.

### Prerequisites
*   Node.js installed (v14 or higher).
*   MongoDB installed locally or a MongoDB Atlas URI.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/smart-task-manager.git
cd smart-task-manager
2. Backend Setup
Navigate to the server folder (if applicable) and install dependencies:

Bash

cd server
npm install
Create a .env file in the server directory:

env

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
Start the server:

Bash

npm start
3. Frontend Setup
Open a new terminal, navigate to the client folder, and install dependencies:

Bash

cd client
npm install
Create a .env file (if using Vite):

env

VITE_API_URL=http://localhost:5000
Start the React application:

Bash

npm run dev
