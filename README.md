# SmartPark – AI Roadside Parking & Virtual Guardian

SmartPark is a smart roadside parking management system designed to help
drivers find available parking spaces, reserve parking bays, and manage
parking efficiently.

The system provides two separate experiences:

- User – Find and reserve nearby parking
- Admin – Monitor and manage the parking system

---

## Technologies Used

- React
- TypeScript
- Node.js
- Express.js
- PostgreSQL
- Redis
- REST API
- Docker

---

## Prerequisites

Before running the project, install:

- Node.js v24.19.0
- npm
- PostgreSQL
- Redis

---

## React Version

React: 19.1.0

---

## Running Steps

Open VS Code

↓

Open SmartPark folder

↓

Open Terminal

↓

npm install

↓

npm run dev

↓

Open Edge

↓

localhost:3000

↓

SmartPark Login

---

# Application Workflow

##  User Workflow

The user logs into SmartPark and can use the parking-related features.

```text
User Login
    ↓
Allow Current Location
    ↓
Find Nearby Parking
    ↓
View Available Parking Spots
    ↓
Select Parking Spot
    ↓
Reserve Parking
    ↓
Complete Booking
    ↓
View Digital Parking Pass
    ↓
Manage My Bookings


Admin Login
    ↓
Admin Authentication
    ↓
Admin Dashboard
    ↓
Monitor Parking Occupancy
    ↓
Manage Parking Spots
    ↓
View Traffic & Parking Analytics
    ↓
View Reports
    ↓
Monitor Redis Locks
    ↓
Monitor PostgreSQL Data

Over all system workflow

                    SmartPark
                       ↓
                    Login
                       ↓
              ┌────────┴────────┐
              ↓                 ↓
            USER              ADMIN
              ↓                 ↓
       Nearby Parking      Admin Dashboard
              ↓                 ↓
         Select Spot       Monitor System
              ↓                 ↓
          Reservation       Manage Parking
              ↓                 ↓
        Digital Pass        Analytics

##  Demo Access

No signup is required to explore the application.

###  User Dashboard

Enter any valid email address and password.

Example:

Email: evaluator@example.com  
Password: 12345

This will open the User Dashboard.

###  Admin Dashboard

Use the administrator email:

Email: admin@smartpark.com  
Password: `<ADMIN_DEMO_PASSWORD>`

This will open the Admin Dashboard.

> Note: Replace `<ADMIN_DEMO_PASSWORD>` with the actual demo password before publishing the README. Do not publish sensitive production credentials.


##  Deployment

SmartPark is deployed as a web application using Render.

### Deployment Flow

Local Development
        ↓
VS Code
        ↓
Git
        ↓
GitHub
        ↓
Render
        ↓
Live SmartPark Application

### Live Application

 Live Demo: [ https://smart-parkai-1brw.onrender.com]

##  Author

**Srividhya**

Developer & Project Author

### Project

**SmartPark – AI Roadside Parking & Virtual Guardian**

A smart parking management system designed to simplify roadside parking discovery, reservation, digital parking management, and administrative monitoring.
