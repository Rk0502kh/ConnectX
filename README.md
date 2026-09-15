# ConnectX

**ChatConnect** – A real‑time cross‑platform mobile chat application built with React Native (frontend) and Java Servlet/Hibernate (backend) on MySQL.

## Project Structure
```
ConnectX/
├─ frontend/        # React Native app
├─ backend/         # Java Maven backend
├─ database/        # SQL scripts
└─ README.md        # This file
```

## Setup Overview
* Follow the detailed **README** files inside `frontend/` and `backend/` for installation, build, and run instructions.
* The backend runs on Apache Tomcat and exposes REST APIs under `/api/` and a WebSocket endpoint at `/ws/chat`.
* The frontend communicates with the backend via the defined API.

---
*All code is original and complies with the academic requirements.*