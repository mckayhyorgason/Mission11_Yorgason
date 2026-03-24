import { useEffect, useState } from 'react'
import type { Book } from './types/book'

const API_BASE_URL = 'http://localhost:5151/api/books'

function BookList() {
  const [books, setBooks] = useState<Book[]>([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [sortByTitle, setSortByTitle] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const url = new URL(API_BASE_URL)
        url.searchParams.set('pageNumber', pageNumber.toString())
        url.searchParams.set('pageSize', pageSize.toString())
        url.searchParams.set('sortByTitle', sortByTitle ? 'true' : 'false')

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
  }, [pageNumber, pageSize, sortByTitle])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const handlePageSizeChange = (value: number) => {
    setPageNumber(1)
    setPageSize(value)
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <h1 className="h3 m-0">Bookstore</h1>
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="pageSize" className="form-label m-0">
            Results per page
          </label>
          <select
            id="pageSize"
            className="form-select"
            style={{ width: 'auto' }}
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
            onChange={(e) => setSortByTitle(e.target.value === 'true')}
          >
            <option value="true">On</option>
            <option value="false">Off</option>
          </select>
        </div>
      </div>

      {isLoading && <div className="alert alert-info">Loading books...</div>}
      {error && <div className="alert alert-danger">Error: {error}</div>}

      {!isLoading && !error && (
        <div className="table-responsive">
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
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center">
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
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber === 1}
          >
            Previous
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
            disabled={pageNumber === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookList
