# 🕒 SlotSwapper

**SlotSwapper** is a peer-to-peer **time-slot swapping application** built as part of the **ServiceHive Full Stack Intern** challenge.

It enables users to manage calendar events, mark them as *swappable*, and exchange time slots with other users seamlessly through an intuitive interface.

---

## 🚀 Overview

**Core Concept**

* Users have calendars containing time slots (events).
* A user can mark a slot as **SWAPPABLE**.
* Other users can view swappable slots and propose a swap using one of their own.
* The recipient can **Accept** or **Reject** the swap.
* If accepted, the slots are exchanged and both are marked **BUSY** again.

---

## 🧩 Features

* 🔐 **User Authentication** with JWT
* 🗕️ **Event Management** (CRUD)
* 🔁 **Swap Requests & Responses** between users
* ⚙️ **Dynamic State Updates** without page refresh
* 🦯 **Protected Routes** for authenticated users
* 🧠 **Clean Database Schema & Swap Logic**

---

## 🎗️ Tech Stack

| Layer                | Technology                                               |
| -------------------- | -------------------------------------------------------- |
| **Frontend**         | React (Vite) + Tailwind CSS + React Router + React Query |
| **Backend**          | FastAPI + SQLAlchemy + Pydantic                          |
| **Database**         | SQLite (local) / PostgreSQL (optional)                   |
| **Auth**             | JWT (python-jose)                                        |
| **State Management** | React Query + Context API                                |

---

## 📁 Project Structure

```
slotswapper/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── events.py
│   │   │   └── swap.py
│   │   └── core/
│   │       ├── config.py
│   │       ├── security.py
│   │       └── database.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── contexts/
    │   ├── lib/
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Installation and Setup

### 🖥️ Backend Setup

**Requirements**

* Python 3.11+
* pip

**Steps**

```bash
cd backend
python -m venv venv
# Activate:
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

**Create `.env` file**

```bash
cp .env.example .env
```

**.env Example**

```env
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./slotswapper.db
CORS_ORIGINS=http://localhost:5173
```

**Run Server**

```bash
uvicorn app.main:app --reload --port 8000
```

Visit: 👉 [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 🌐 Frontend Setup

**Requirements**

* Node.js 18+

**Steps**

```bash
cd frontend
npm install
npm run dev
```

Visit: 👉 [http://localhost:5173](http://localhost:5173)

---

## 🔐 Authentication API

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| `POST` | `/auth/register` | Register a new user     |
| `POST` | `/auth/login`    | Login and get JWT token |

**Header for protected routes**

```http
Authorization: Bearer <your_token_here>
```

---

## 📅 Event APIs

| Method   | Endpoint       | Description               |
| -------- | -------------- | ------------------------- |
| `GET`    | `/events`      | Get current user’s events |
| `POST`   | `/events`      | Create a new event        |
| `PUT`    | `/events/{id}` | Update event              |
| `DELETE` | `/events/{id}` | Delete event              |

**Example Request**

```json
{
  "title": "Team Meeting",
  "startTime": "2025-11-06T10:00:00Z",
  "endTime": "2025-11-06T11:00:00Z",
  "status": "BUSY"
}
```

---

## 🔄 Swap APIs

| Method | Endpoint                          | Description                              |
| ------ | --------------------------------- | ---------------------------------------- |
| `GET`  | `/swap/swappable-slots`           | Get other users’ swappable slots         |
| `POST` | `/swap/swap-request`              | Create a swap request                    |
| `POST` | `/swap/swap-response/{requestId}` | Accept or Reject a swap request          |
| `GET`  | `/swap/requests`                  | List incoming and outgoing swap requests |

**Swap Request**

```json
{
  "mySlotId": 12,
  "theirSlotId": 34
}
```

**Swap Response**

```json
{
  "accept": true
}
```

---

## 🧠 Data Models

### 🧟 User

| Field         | Type    |
| ------------- | ------- |
| id            | Integer |
| name          | String  |
| email         | String  |
| password_hash | String  |

### 🕖 Event

| Field     | Type                                       |
| --------- | ------------------------------------------ |
| id        | Integer                                    |
| title     | String                                     |
| startTime | Timestamp                                  |
| endTime   | Timestamp                                  |
| status    | Enum (`BUSY`, `SWAPPABLE`, `SWAP_PENDING`) |
| userId    | Integer (FK)                               |

### 🔁 SwapRequest

| Field       | Type                                     |
| ----------- | ---------------------------------------- |
| id          | Integer                                  |
| mySlotId    | Integer                                  |
| theirSlotId | Integer                                  |
| requesterId | Integer                                  |
| responderId | Integer                                  |
| status      | Enum (`PENDING`, `ACCEPTED`, `REJECTED`) |

---

## 🧩 Business Logic Summary

* When a user requests a swap:

  * Both slots must be `SWAPPABLE`.
  * Create a `SwapRequest` with `PENDING` status.
  * Set both slots to `SWAP_PENDING`.

* When accepted:

  * Swap the owners (`userId`) of both slots.
  * Set both statuses to `BUSY`.
  * Mark the `SwapRequest` as `ACCEPTED`.

* When rejected:

  * Revert both slots to `SWAPPABLE`.
  * Mark the `SwapRequest` as `REJECTED`.

---

## 💬 Frontend Pages

| Page           | Description                                |
| -------------- | ------------------------------------------ |
| `/register`    | User sign-up                               |
| `/login`       | User login                                 |
| `/dashboard`   | View and manage your events                |
| `/marketplace` | View other users’ swappable slots          |
| `/requests`    | Manage incoming and outgoing swap requests |

---

## 🧠 Design Choices & Assumptions

* Events are swapped by changing their `userId` directly (simpler transaction).
* Slot statuses (`BUSY`, `SWAPPABLE`, `SWAP_PENDING`) prevent race conditions.
* Uses React Query for live frontend state sync.
* SQLite for simplicity (easily extendable to PostgreSQL).

---

## 🌟 Bonus Features (Optional Ideas)

* 🔔 Real-time notifications (WebSockets)
* 🐳 Docker support for easy local setup
* ✅ Unit & integration testing
* 🌍 Deployment via Render + Vercel

---

## 🧾 API Summary Table

| Method | Path                       | Purpose                            |
| ------ | -------------------------- | ---------------------------------- |
| POST   | `/auth/register`           | Register user                      |
| POST   | `/auth/login`              | Login user                         |
| GET    | `/events`                  | Get user’s events                  |
| POST   | `/events`                  | Create event                       |
| PUT    | `/events/{id}`             | Update event                       |
| DELETE | `/events/{id}`             | Delete event                       |
| GET    | `/swap/swappable-slots`    | List other users’ swappable events |
| POST   | `/swap/swap-request`       | Request swap                       |
| POST   | `/swap/swap-response/{id}` | Accept/Reject swap                 |
| GET    | `/swap/requests`           | List incoming/outgoing requests    |

---

## ⚡ Run Commands Quick Reference

**Backend**

```bash
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
npm run dev
```

---

## 🪪 License

This project is created for **educational and evaluation purposes** for the
**ServiceHive Full Stack Internship Challenge**.

---
