# Budget Counter

A personal budget management REST API built with Spring Boot and PostgreSQL, with a React frontend for visualization.

## What it does

- Manage accounts (create, list, delete)
- Track transactions (income and expenses) assigned to accounts
- Account balance updates automatically on every transaction
- Filter transactions by category and date range
- Budget summary with total income, total expenses, and expenses grouped by category
- Swagger UI for manual API testing

## Tech stack

**Backend:** Java 25, Spring Boot 4, Spring Data JPA, PostgreSQL, MapStruct, Lombok, springdoc-openapi  
**Frontend:** React, TypeScript, Vite, TanStack Query, Zustand, Axios  
**Infrastructure:** Docker, Docker Compose

## Running the app

Prerequisites: Docker and Docker Compose installed.

```bash
docker compose up --build
```

That's it. The following services will start:

| Service  | URL                                    |
|----------|----------------------------------------|
| Frontend | http://localhost:3000                  |
| Backend  | http://localhost:8080                  |
| Swagger  | http://localhost:8080/swagger-ui/index.html |
| Database | localhost:5432 (budgetapp / postgres)  |

To stop:

```bash
docker compose down
```

To stop and remove all data (volumes):

```bash
docker compose down -v
```

## API endpoints

### Accounts

| Method | Endpoint              | Description                              |
|--------|-----------------------|------------------------------------------|
| GET    | /api/accounts         | List all accounts                        |
| GET    | /api/accounts/{id}    | Get account by ID                        |
| POST   | /api/accounts         | Create account                           |
| DELETE | /api/accounts/{id}    | Delete account (only if no transactions) |

### Transactions

| Method | Endpoint                  | Description                                         |
|--------|---------------------------|-----------------------------------------------------|
| GET    | /api/transactions         | List transactions (filters: ?category=, ?from=, ?to=) |
| POST   | /api/transactions         | Add transaction (balance updates automatically)     |
| DELETE | /api/transactions/{id}    | Delete transaction (balance reverts automatically)  |

### Summary

| Method | Endpoint                      | Description                                              |
|--------|-------------------------------|----------------------------------------------------------|
| GET    | /api/transactions/summary     | Total income, total expenses, expenses by category       |

Date filter format: `ISO 8601`, e.g. `?from=2024-01-01T00:00:00&to=2024-12-31T23:59:59`

### Example request

```bash
# Create an account
curl -X POST http://localhost:8080/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"name": "Main Account"}'

# Add a transaction
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount": 150.00, "type": "EXPENSE", "category": "Food", "description": "Groceries", "accountId": 1}'
```

## Running unit tests

Navigate to the backend directory and run:

```bash
cd backend
./mvnw test
```

Tests cover `TransactionService` and `AccountService` — balance updates, error handling (404, 409), and budget summary calculations.

## Project structure

```
budget-app/
├── backend/
│   └── src/
│       ├── main/java/com/filip/budgetapp/
│       │   ├── account/          # Account entity, service, controller, mapper
│       │   └── transaction/      # Transaction entity, service, controller, mapper
│       └── test/java/com/filip/budgetapp/
│           ├── account/          # AccountServiceTest
│           └── transaction/      # TransactionServiceTest
├── frontend/
│   └── src/
│       ├── hooks/                # API hooks (useAccountsApi, useTransactionsApi)
│       ├── pages/                # AccountsPage, TransactionsPage, DashboardPage
│       └── store/                # Zustand store
├── docker-compose.yml
└── README.md
```