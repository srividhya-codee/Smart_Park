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

## 👤 User Workflow

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