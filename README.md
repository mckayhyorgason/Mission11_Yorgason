# Mission 11 Bookstore

This project is an online bookstore built across multiple assignments using ASP.NET Core API (backend) and React (frontend). The first milestone focuses on the database layer and a React UI that lists books with pagination and sorting.

## Requirements (Milestone 1)
- Store book data: Title, Author, Publisher, ISBN, Category, Pages, Price (all required)
- Connect to the provided database and match models to its tables
- Display all books in a list
- Add pagination (default 5 books per page)
- Allow users to change the number of results per page
- Add sorting by book title
- Style the page using Bootstrap

## Repo Structure
- `backend/`: ASP.NET Core API
- `frontend/`: React app

## Getting Started
Backend (from repo root):
```bash
cd backend/Mission11_Yorgason
dotnet restore
dotnet run --project Mission11_Yorgason/Mission11_Yorgason.csproj
```

Frontend (from repo root):
```bash
cd frontend
npm install
npm run dev
```
