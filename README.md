# Eve Expense and Budget Tracker

Eve is a full-stack expense and budget tracker for everyday use in the Philippines. It records income and expenses, organizes them by account and category, and summarizes monthly spending in Philippine pesos.

## Team members

| Member | Role |
|---|---|
| John Andrei Chavenia | Frontend Developer |
| Carl Josef Gomez | Backend and Database Developer |
| Josiah Eric Datu | Storyboard, Testing, Progress Report, and Documentation |

## Run locally

### Requirements

- Node.js and npm
- A MongoDB database, either local or MongoDB Atlas

### Setup

1. Install the dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root. Add your own database connection string and a private JWT secret:

   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/eve
   JWT_SECRET=replace-with-a-long-random-secret
   ```

   For MongoDB Atlas, use the connection string provided by Atlas as `MONGO_URI`. Keep `.env` private and do not commit it.

3. Start the server:

   ```bash
   npm run dev
   ```

4. Open the address printed by the server. With the example `PORT` above, use [http://localhost:3000](http://localhost:3000).

## Main features

- Register and log in to a personal account.
- Add, view, edit, and delete income and expense transactions.
- Add and manage accounts and categories.
- Set monthly expense budgets and category subcategories.
- Filter transactions by category, account, and month.
- View monthly income, expenses, net change, balances, and budget summaries.
- Record transfers, recurring transactions, and account balance changes.

## Database design

The application reads and writes saved user data in MongoDB; frontend state is used to display API results, not as permanent storage. The main collections are:

- **User** - login details and profile name.
- **Account** - an account owned by a user, including its balance and asset or liability type.
- **Category** - an expense or income category owned by a user, with an optional budget and subcategories.
- **Transaction** - a dated income, expense, transfer, or balance adjustment. Transactions refer to their owner and related account, category, or transfer account.

Every account, category, and transaction is associated with its owning user. API routes check ownership before changing records.

## API overview

Protected routes require the JWT access token in the `Authorization: Bearer <token>` header.

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/users/register` | Create an account |
| `POST` | `/api/users/login` | Log in |
| `GET` | `/api/users/me` | Get the current user |
| `GET`, `POST` | `/api/account` | List or add accounts |
| `PUT`, `DELETE` | `/api/account/:id` | Edit or archive an account |
| `GET`, `POST` | `/api/categories` | List or add categories |
| `PUT`, `DELETE` | `/api/categories/:id` | Edit or remove a category from active use |
| `GET`, `POST` | `/api/transaction` | List or add transactions |
| `GET`, `PUT`, `DELETE` | `/api/transaction/:id` | View, edit, or delete a transaction |
| `POST` | `/api/transfer` | Record a transfer between accounts |

Routes return JSON responses and use HTTP status codes for successful requests and errors.
