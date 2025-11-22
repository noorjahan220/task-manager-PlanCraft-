🧠 Smart Task Manager
Smart Task Manager is a web application designed to streamline project management while preventing team burnout. Unlike standard to-do apps, this system actively tracks member workload capacity and includes an intelligent "Auto Reassign" feature to balance tasks among team members automatically.

🚀 Features
1. User & Team Management
Authentication: Secure User Registration and Login.
Team Setup: Create teams and add members manually (Name, Role).
Capacity Planning: Set a Workload Capacity (0–5 tasks) for each member to define how much work they can comfortably handle.
2. Project & Task Management
Projects: Create projects and link them to specific teams.
Task CRUD: Add, Edit, Delete, and Filter tasks.
Task Details:
Title & Description
Priority (Low / Medium / High)
Status (Pending / In Progress / Done)
Smart Assignment:
Visual indicators show current load vs. capacity (e.g., 3/5).
Overload Warning: If you assign a task to a full member, the system warns you: "Riya has 4 tasks but capacity is 3. Assign anyway?"

3. ⚖️ Smart Load Balancing (Auto-Reassignment)
A unique feature to resolve bottlenecks with one click.

The Logic:
Identifies members exceeding their capacity.
Identifies members with available capacity.
Moves tasks from overloaded members to available members.
Safety Rules:
High Priority tasks are never moved (they stay with the expert).
Only Low and Medium priority tasks are reassigned.
Logging: Every automatic change is recorded in the Activity Log.
4. Dashboard & Activity Log
Overview: View Total Projects and Total Tasks.
Team Health: Color-coded list showing who is Overloaded (Red) vs. Available (Green).
Activity Log: A history of reassignments (e.g., "10:30 AM — Task 'UI Design' reassigned from Riya to Farhan").
🛠️ Tech Stack
(Please update this section based on your actual code)

Frontend: React.js / HTML & JS
Backend: Node.js (Express) 
Database: MongoDB 
Styling:  Tailwind CSS 






# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
