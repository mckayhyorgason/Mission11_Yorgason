import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import AdminBooks from './pages/AdminBooks'
import BookList from './pages/BookList'
import CartPage from './pages/CartPage'
import { CartProvider, useCart } from './CartContext'

function App() {
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [sortByTitle, setSortByTitle] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const handlePageSizeChange = (value: number) => {
    setPageNumber(1)
    setPageSize(value)
  }

  const handleSortByTitleChange = (value: boolean) => {
    setPageNumber(1)
    setSortByTitle(value)
  }

  const handleSelectedCategoriesChange = (value: string[]) => {
    setPageNumber(1)
    setSelectedCategories(value)
  }

  return (
    <CartProvider>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <BookList
              pageNumber={pageNumber}
              pageSize={pageSize}
              sortByTitle={sortByTitle}
              selectedCategories={selectedCategories}
              onPageNumberChange={setPageNumber}
              onPageSizeChange={handlePageSizeChange}
              onSortByTitleChange={handleSortByTitleChange}
              onSelectedCategoriesChange={handleSelectedCategoriesChange}
            />
          }
        />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/adminbooks" element={<AdminBooks />} />
        <Route
          path="*"
          element={
            <BookList
              pageNumber={pageNumber}
              pageSize={pageSize}
              sortByTitle={sortByTitle}
              selectedCategories={selectedCategories}
              onPageNumberChange={setPageNumber}
              onPageSizeChange={handlePageSizeChange}
              onSortByTitleChange={handleSortByTitleChange}
              onSelectedCategoriesChange={handleSelectedCategoriesChange}
            />
          }
        />
      </Routes>
    </CartProvider>
  )
}

const Navbar = () => {
  const { totalItems } = useCart()

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <NavLink
          className="navbar-brand btn btn-link text-white text-decoration-none p-0"
          to="/"
        >
          Mission Bookstore
        </NavLink>
        <div className="ms-auto d-flex align-items-center gap-3">
          <NavLink
            className={({ isActive }) =>
              `btn btn-sm ${isActive ? 'btn-light' : 'btn-outline-light'}`
            }
            to="/"
          >
            Books
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `btn btn-sm ${isActive ? 'btn-light' : 'btn-outline-light'}`
            }
            to="/adminbooks"
          >
            Admin
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `btn btn-sm position-relative ${
                isActive ? 'btn-light' : 'btn-outline-light'
              }`
            }
            to="/cart"
          >
            <span className="d-inline-flex align-items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.6 13.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L23 6H6" />
              </svg>
              Cart
            </span>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {totalItems}
            </span>
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default App
