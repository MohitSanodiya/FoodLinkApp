# 🌍 FoodLink AI - Project Overview & Use Cases

## 📌 Executive Summary
**FoodLink AI** is an intelligent, full-stack web application designed to bridge the gap between food surplus and food scarcity. It connects food donors (like hotels, hostels, and restaurants) directly with food receivers (like NGOs and Gaushalas) to ensure that excess food is safely redistributed to people and animals in need, drastically reducing food waste.

## ❗ The Problem It Solves
Every day, thousands of kilograms of perfectly edible food are wasted in commercial kitchens, hostels, and restaurants. Simultaneously, thousands of people go hungry, and animal shelters struggle to feed strays. 
**FoodLink AI** solves this logistical problem by providing a real-time platform where donors can notify nearby receivers the moment surplus food becomes available.

---

## 🔄 How It Works (The Complete Flow)

1. **Food Registration (Donation):**
   - A **Hostel/Hotel** realizes they have excess food after a meal.
   - They log into their FoodLink dashboard and create a "Food Post," detailing the type of food, quantity, and expiration time.

2. **Smart Notification System:**
   - The platform instantly notifies **NGOs** located in the same city.
   - If the food is deemed unfit for human consumption but safe for animals, the system redirects the notification to **Gaushalas** (animal shelters).

3. **Acceptance & Pickup:**
   - An NGO views the available food and clicks **Accept**.
   - The status of the food post changes to `ACCEPTED`.
   - The NGO arranges for the food to be picked up from the donor's location before it expires.

4. **Platform Monitoring (Admin):**
   - The **Platform Administrator** oversees all activity, verifies new organizations (NGOs/Hotels) to ensure safety, and tracks the total amount of food saved across the platform.

---

## 👥 User Roles & Use Cases

### 1. 🏨 Hostels, Hotels & Restaurants (Donors)
* **Use Case:** They consistently generate excess food and need a reliable, quick way to dispose of it ethically rather than throwing it in the trash.
* **Features:**
  - Create food donation posts.
  - Track the status of their donations (Pending, Accepted, Expired).
  - View their personal "Meals Saved" impact metrics.

### 2. 🤝 NGOs (Human Food Receivers)
* **Use Case:** Organizations that feed the homeless or underprivileged need a steady supply of safe, edible food without spending hours calling restaurants.
* **Features:**
  - Browse available food donations in their specific city.
  - Accept food donations instantly.
  - Coordinate pickup directly with the donor.

### 3. 🐄 Gaushalas & Animal Shelters (Animal Food Receivers)
* **Use Case:** Shelters require large amounts of food scraps, vegetable peels, or stale food that is safe for animals but not for humans.
* **Features:**
  - Receive redirected food donations that are tagged for animals.
  - Accept and arrange pickups for animal feed.

### 4. 👑 System Administrator (Overseer)
* **Use Case:** A central authority needs to ensure the platform remains secure, users are legitimate, and food safety is maintained.
* **Features:**
  - View comprehensive analytics (Total Users, Total Donations, Success Rates).
  - Manage users (Verify, Suspend, or Delete accounts).
  - Oversee the entire flow of food across the platform.

---

## 💻 Technology Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript, Bootstrap 5 (Hosted on **Netlify**)
* **Primary Backend:** Java 17, Spring Boot, Spring Security (JWT), Spring Data JPA (Hosted on **Render**)
* **Admin Analytics Backend:** Node.js, Express.js, Sequelize ORM (Hosted on **Render**)
* **Database:** PostgreSQL (Hosted on **Aiven Cloud**)

## 🚀 Key Features

* **Role-Based Access Control:** Secure JWT authentication ensuring users only see what they are supposed to.
* **City-Based Filtering:** NGOs only see food available in their registered city.
* **Real-time Status Tracking:** Food posts move dynamically between `PENDING`, `ACCEPTED`, `REDIRECTED`, and `EXPIRED`.
* **Microservices Architecture:** Uses a dual-backend system (Java for core logic, Node.js for admin logic) to demonstrate modern scalable architecture.
