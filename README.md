# Expense Tracker - Cashlytics (*MEAN Project*)

This is my final project of MEAN stack course at Webskitters Academy.

## Project Overview:

The **Cashlytics** is a user-friendly application designed to help individuals track their daily expenses and categorize them efficiently. It includes user authentication, expense management, and basic reporting to provide insights into spending habits.

### Functional Requirements

#### 1. User Features

##### *User Authentication:*

* User signup and login with JWT-based authentication with email varification.
* Secure password storage using hashing (e.g., bcrypt).

##### *Expense Management:*

* Add a new expense with details like date, amount, category, and description.
* Edit or delete existing expenses.
* View a list of expenses sorted by date.

##### *Expense Categories:*

* Use predefined categories such as Food, Travel, Shopping, etc.
* Allow users to create custom categories.

##### *Reports:*

* View a summary of expenses categorized by type.
* Generate total expenses for a selected date range.
* Export the report or email it your mail address.

#### 2. Admin Features

##### *Admin Authentication:*

* Admin login with JWT-based authentication.
* Reset password through Forgot Password.
* Secure password storage using hashing (e.g., bcrypt).

##### *Expense Categories:*

* Create default categories that can be use by all users.

##### *Expense Colours:*

* Create colours that can be assigned to categories.

##### *Users List:*

* See all users and their basic info.
* Activate/Deactivate user.

##### *Contacts:*

* Get contact messages from users.
* Mark them Panding/In Progress/Resolved (Default: Pending).
* Delete contact messages if needed.

### Non-Functional Requirements

##### *Responsive Design:*

* Mobile-friendly user interface.

##### *Performance:*

* Optimize database queries for faster responses.

##### *Security:*

* Protect sensitive user data and prevent unauthorized access using JWT.

### Tech Stack

##### Frontend:

* Angular 19 (UI Development)
* Angular Material and Tailwind CSS (UI components and styling)
* Chart js (for data visualization in reports)

##### Backend:

* Node.js (TypeScript) with Express.js (Server-Side Logic)
* MongoDB (Database with Mongoose for object modeling)

##### Tools and Libraries:

* Postman (API Testing)
* Multer (File uploads for receipt images, optional)
* EJS (Admin Panel)
* bcrypt (Password hashing)
* JSON Web Token (Authentication)
* nodemailer (Sending mail)
* puppeteer (Generating report PDF)
* swagger (API Documentaion)

## Start the Project

1. First clone the repository

```bash
git clone https://github.com/Sayantan5665/Expense-Tracker-MEAN.git
```

### Backend

1. Then go to **Expense-Tracker-Backend** folder inside **Expense-Tracker-MEAN**

```bash
cd Expense-Tracker-Backend
```

2. Now type **npm install** in terminal to install the dependencies of the project.

```bash
npm install
```

3. Then **npm start** to start the backend.

```bash
npm start
```

### Frontend

1. For frontend go to **Expense-Tracker-Frontend** folder inside **Expense-Tracker-MEAN**

```bash
cd Expense-Tracker-Frontend
```

2. Now type **npm install** in terminal to install the dependencies of the project.

```bash
npm install
```

3. Then **ng serve** to start the frontend.

```bash
ng serve
```
