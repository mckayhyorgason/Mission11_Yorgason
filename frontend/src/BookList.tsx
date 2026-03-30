import { useEffect, useMemo, useState } from 'react'
import type { Book } from './types/book'
import { useCart } from './CartContext'

const API_BASE_URL = 'http://localhost:5151/api/books'
const CATEGORIES_URL = `${API_BASE_URL}/categories`

type BookListProps = {
  pageNumber: number
  pageSize: number
  sortByTitle: boolean
  selectedCategories: string[]
  onPageNumberChange: (value: number) => void
  onPageSizeChange: (value: number) => void
  onSortByTitleChange: (value: boolean) => void
  onSelectedCategoriesChange: (value: string[]) => void
}

function BookList({
  pageNumber,
  pageSize,
  sortByTitle,
  selectedCategories,
  onPageNumberChange,
  onPageSizeChange,
  onSortByTitleChange,
  onSelectedCategoriesChange,
}: BookListProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addItem, totalItems, totalPrice } = useCart()

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const url = new URL(API_BASE_URL)
        url.searchParams.set('pageNumber', pageNumber.toString())
        url.searchParams.set('pageSize', pageSize.toString())
        url.searchParams.set('sortByTitle', sortByTitle ? 'true' : 'false')
        if (selectedCategories.length > 0) {
          selectedCategories.forEach((category) => {
            url.searchParams.append('categories', category)
          })
        }

        const response = await fetch(url.toString())
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }

        const totalHeader = response.headers.get('X-Total-Count')
        const data = (await response.json()) as Book[]

        setBooks(data)
        setTotalCount(totalHeader ? Number(totalHeader) : data.length)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooks()
  }, [pageNumber, pageSize, sortByTitle, selectedCategories])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(CATEGORIES_URL)
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`)
        }

        const data = (await response.json()) as string[]
        setCategories(data)
      } catch (err) {
        // Don't block the book list if categories fail to load.
        setCategories([])
      }
    }

    fetchCategories()
  }, [])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const isCategorySelected = useMemo(
    () => new Set(selectedCategories),
    [selectedCategories],
  )

  const toggleCategory = (category: string) => {
    if (isCategorySelected.has(category)) {
      onSelectedCategoriesChange(
        selectedCategories.filter((item) => item !== category),
      )
    } else {
      onSelectedCategoriesChange([...selectedCategories, category])
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="mb-3">
        <h1 className="h3 m-0">Bookstore</h1>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-2">
          <div className="card">
            <div className="card-body">
              <h2 className="h6">Filter by Category</h2>
              {categories.length === 0 ? (
                <p className="text-muted small mb-0">No categories available.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {categories.map((category) => (
                    <div className="form-check" key={category}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`category-${category.replace(/\s+/g, '-').toLowerCase()}`}
                        checked={isCategorySelected.has(category)}
                        onChange={() => toggleCategory(category)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`category-${category.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => onSelectedCategoriesChange([])}
                  disabled={selectedCategories.length === 0}
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-10">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="pageSize" className="form-label m-0">
                Results per page
              </label>
              <select
                id="pageSize"
                className="form-select"
                style={{ width: 'auto' }}
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="sortByTitle" className="form-label m-0">
                Sort by title
              </label>
              <select
                id="sortByTitle"
                className="form-select"
                style={{ width: 'auto' }}
                value={sortByTitle ? 'true' : 'false'}
                onChange={(e) => onSortByTitleChange(e.target.value === 'true')}
              >
                <option value="true">On</option>
                <option value="false">Off</option>
              </select>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <h2 className="h6 mb-1">Cart Summary</h2>
                <div className="text-muted small">
                  {totalItems} items in cart
                </div>
              </div>
              <div className="fs-5 fw-semibold">
                ${totalPrice.toFixed(2)}
              </div>
            </div>
          </div>

      {isLoading && <div className="alert alert-info">Loading books...</div>}
      {error && <div className="alert alert-danger">Error: {error}</div>}

      {!isLoading && !error && (
        <div className="table-responsive-lg">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Publisher</th>
                <th>ISBN</th>
                <th>Classification</th>
                <th>Category</th>
                <th>Pages</th>
                <th>Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center">
                    No books found.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.bookId}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.publisher}</td>
                    <td>{book.isbn}</td>
                    <td>{book.classification}</td>
                    <td>{book.category}</td>
                    <td>{book.pageCount}</td>
                    <td>${book.price.toFixed(2)}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-primary btn-add-cart"
                        onClick={() => addItem(book)}
                      >
                        Add to cart
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

          <div className="d-flex align-items-center justify-content-between">
            <div>
              Page {pageNumber} of {totalPages}
            </div>
            <div className="btn-group">
              <button
                className="btn btn-outline-primary"
                onClick={() => onPageNumberChange(Math.max(1, pageNumber - 1))}
                disabled={pageNumber === 1}
              >
                Previous
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() =>
                  onPageNumberChange(Math.min(totalPages, pageNumber + 1))
                }
                disabled={pageNumber === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookList
