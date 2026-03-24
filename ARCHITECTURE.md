# Architecture

## Overview
- **Backend**: ASP.NET Core API providing book data from the database.
- **Frontend**: React (Vite) app that consumes the API and renders a paginated, sortable book list.
- **Database**: Provided, pre-populated with book records. Models must match the existing schema.

## Data Flow
1. Frontend requests books from the API with paging and sorting parameters.
2. Backend queries the database using those parameters and returns results.
3. Frontend renders the list and controls (page size, page navigation, sort by title).

## Key Constraints
- All book fields are required: Title, Author, Publisher, ISBN, Category, Pages, Price.
- UI must support pagination (default 5 per page) and adjustable page size.
- Sorting by title is required.
- Styling uses Bootstrap.

## Project Structure
- `backend/`: API, data access, models, controllers
- `frontend/`: UI components, pages, API calls, styles
