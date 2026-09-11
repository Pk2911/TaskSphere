# Task Management API

A simple REST API for managing tasks, users, projects, and task activity.

This project uses Node.js, Express, TypeScript, PostgreSQL, and Prisma.

## What does this project do?

The API allows users to:

- Create and manage tasks
- Assign tasks to users
- Organize tasks into projects
- Move tasks through different statuses
- Log in and authenticate securely
- Record important task activities

## Technologies Used

- **Node.js** – runs the application
- **Express** – handles API requests and routes
- **TypeScript** – adds type safety to the code
- **PostgreSQL** – stores the application data
- **Prisma** – connects the application to the database
- **Zod** – validates incoming data
- **JWT** – handles authentication
- **bcrypt** – securely hashes passwords
- **ESLint** – checks code quality
- **Prettier** – keeps the code formatted

## Project Structure

The application follows a layered structure:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Repositories
   ↓
Prisma
   ↓
PostgreSQL
```

Each layer has a specific responsibility:

- **Routes** – define API endpoints
- **Controllers** – receive requests and send responses
- **Services** – contain the main application logic
- **Repositories** – communicate with the database
- **Prisma** – provides database access
- **PostgreSQL** – stores the data

## Database Design

The database is designed using separate tables instead of keeping everything in one large table.

The main tables are:

### Users

Stores information about users, such as their email, password hash, and role.

Users can have roles such as:

- `admin`
- `member`

### Tasks

Stores the tasks in the system.

A task contains information such as:

- Title
- Description
- Status
- Due date
- Assigned user
- Project

Task statuses are:

```text
TODO
IN_PROGRESS
DONE
```

### Projects

Stores projects that can contain multiple tasks.

A project also has an owner.

### Task Comments

Stores comments made on tasks.

Each comment belongs to a specific task and user.

### Audit Logs

Stores important actions performed in the system.

For example, when a task is moved to `DONE`, an audit log is created.

### Refresh Tokens

Stores refresh-token information used to keep users authenticated securely.

## Relationships

The tables are connected using relationships.

For example:

```text
User
 ├── Tasks
 ├── Comments
 ├── Projects
 ├── Audit Logs
 └── Refresh Tokens

Project
 └── Tasks

Task
 ├── Comments
 └── Audit Logs
```

This keeps the database organized and avoids storing the same information repeatedly.

## Database Migrations

Prisma migrations are used to create and update the database structure.

To create or update the database:

```bash
npx prisma migrate dev
```

To generate the Prisma client:

```bash
npx prisma generate
```

## Transaction: Move Task to Done

The API provides:

```text
PATCH /tasks/:id/done
```

When this endpoint is called, two things must happen:

1. The task status changes to `DONE`.
2. An audit log is created for that action.

These two operations are performed inside **one database transaction**.

This means they are treated as one unit:

```text
Task → DONE
     +
Audit Log → Created
```

If both operations succeed, the changes are saved.

If either operation fails, the transaction is rolled back.

For example:

```text
Update task → SUCCESS
Create audit log → FAIL

Result:
Task update → ROLLED BACK
Audit log → ROLLED BACK
```

This prevents the database from ending up in an inconsistent state.

The transaction was tested for both successful execution and rollback.

## Composite Index

The `Task` table has this composite index:

```text
(projectId, status)
```

This helps when the application needs to find tasks belonging to a particular project with a particular status.

For example:

```text
Find all DONE tasks in Project 5
```

Without the index, PostgreSQL may need to examine many task records.

With the composite index, PostgreSQL can find matching tasks more efficiently.

The index is defined in Prisma as:

```prisma
@@index([projectId, status])
```

## Other Indexes

The project also uses indexes for commonly searched relationships and activity records:

```text
Task(userId)
Project(ownerId)
TaskComment(taskId, createdAt)
AuditLog(taskId, createdAt)
RefreshToken(userId)
```

These indexes help the database find related records more efficiently.

## Authentication

The API provides:

```text
POST /auth/signup
POST /auth/login
POST /auth/refresh
POST /auth/logout
```

Passwords are stored as bcrypt hashes instead of plain text.

JWT access tokens are used to authenticate protected requests.

Refresh tokens are stored in PostgreSQL so they can be revoked during logout or token refresh.

## Task Endpoints

```text
GET    /tasks
GET    /tasks/:id
POST   /tasks
PATCH  /tasks/:id
DELETE /tasks/:id
PATCH  /tasks/:id/assign
PATCH  /tasks/:id/done
```

The task assignment endpoint requires an admin user.

The move-to-done endpoint requires authentication.

## Admin User Deletion

Admins can delete a user using:

```text
DELETE /auth/users/:id
```

Deleting a user also removes their related data through database cascade rules.

This includes related:

- Tasks
- Comments
- Audit logs
- Refresh tokens
- Owned projects
- Tasks belonging to those projects

This prevents unwanted orphaned records in the database.

## Installation

Install the project dependencies:

```bash
npm install
```

Create a `.env` file and add the required database and JWT configuration.

Then run:

```bash
npx prisma migrate dev
npx prisma generate
```

## Run the Application

Build the project:

```bash
npm run build
```

Start the server:

```bash
npm start
```

The API runs at:

```text
http://localhost:3000
```

You can check whether the API is running with:

```text
GET /health
```

## Code Quality

Check the code with ESLint:

```bash
npm run lint
```

Format the code with Prettier:

```bash
npm run format
```

Build the project:

```bash
npm run build
```

```

Then save it.

```
