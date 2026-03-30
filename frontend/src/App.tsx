import { useState } from 'react'
import './App.css'
import BookList from './BookList'
import CartPage from './CartPage'
import { CartProvider, useCart } from './CartContext'

function App() {
  const [view, setView] = useState<'list' | 'cart'>('list')
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
      <Navbar view={view} onNavigate={setView} />
      {view === 'cart' ? (
        <CartPage onContinueShopping={() => setView('list')} />
      ) : (
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
      )}
    </CartProvider>
  )
}

type NavbarProps = {
  view: 'list' | 'cart'
  onNavigate: (view: 'list' | 'cart') => void
}

const Navbar = ({ view, onNavigate }: NavbarProps) => {
  const { totalItems } = useCart()

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <button
          className="navbar-brand btn btn-link text-white text-decoration-none p-0"
          onClick={() => onNavigate('list')}
        >
          Mission Bookstore
        </button>
        <div className="ms-auto d-flex align-items-center gap-3">
          <button
            className={`btn btn-sm ${view === 'list' ? 'btn-light' : 'btn-outline-light'}`}
            onClick={() => onNavigate('list')}
          >
            Books
          </button>
          <button
            className={`btn btn-sm position-relative ${
              view === 'cart' ? 'btn-light' : 'btn-outline-light'
            }`}
            onClick={() => onNavigate('cart')}
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
          </button>
        </div>
      </div>
    </nav>
  )
}

export default App
