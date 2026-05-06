# FoodLink AI - Food Waste Management System

A complete full-stack platform designed to connect Hotels, Hostels, NGOs, and Gaushalas, utilizing an AI-powered system to redistribute extra food and reduce food waste.

## ⚙️ Tech Stack
- **Backend**: Spring Boot 3.x (Java 17)
- **Database**: MySQL 8+
- **Security**: JWT & Role-Based Authorization
- **Frontend**: Vanilla JavaScript + HTML5 + CSS3 + Bootstrap 5 (AJAX API integration)
- **AI**: Grok AI (mocked API integration for analysis)

## 📦 Directory Structure
- `/backend`: The Spring Boot Maven project containing all APIs, Services, and DB Entities.
- `/frontend`: Decoupled lightweight public folder containing static assets ready to be deployed to **Netlify** or **GitHub Pages**.

## 🚀 Setup Instructions

### 1. Database Setup
Ensure you have MySQL installed and running locally.
1. Create a database named `foodlink` in your MySQL Server.
```sql
CREATE DATABASE foodlink;
```
2. In `backend/src/main/resources/application.properties`, verify the credentials match your MySQL installation (Default is `root/root`).

### 2. Run the Backend
1. Open a terminal to the `/backend` folder.
2. Build the project:
```bash
./mvnw clean compile
```
3. Run the Spring Boot Server:
```bash
./mvnw spring-boot:run
```
The application will launch on `http://localhost:8080`. The database tables will be auto-generated upon the first launch.

### 3. Run the Frontend
Because we strictly utilize Vanilla HTML/JS, you simply need to serve the `/frontend` directory statically.
- You can open `index.html` natively in the browser if you bypassed CORS during development.
- For the best experience, use a local live server extension in VS Code on your `D:/FoodLink-AI_2/frontend` folder or run a python server:
```bash
cd frontend
python -m http.server 3000
```
- Open `http://localhost:3000` to interact with FoodLink UI.

### 4. Postman Testing
We have included `postman_collection.json` in the root folder. You can import this directly into Postman to test all endpoints (Register, Login, Upload Food, Get Notifs).

## 📄 Core Functional Flow
1. Register 3 different accounts with the roles `HOSTEL`, `NGO`, and `GAUSHALA` with different latitudes/longitudes.
2. Sign in as `HOSTEL`. Add an food item. The Grok AI mock service examines the condition and marks it as suitable for `NGO` or `GAUSHALA`.
3. The platform finds the nearest suitable organization utilizing Haversine Distance coordinate formulas.
4. Sign in as `NGO` to view pending queries dispatched directly via coordinates. Accept or Reject them. Rejecting them auto-forwards them to Gaushalas.
5. The `ExpiryService` automatically runs in the background and drops any unaccepted submissions older than 4 hours.
