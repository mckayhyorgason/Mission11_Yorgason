import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Book } from '../types/book'

const API_BASE_URL = 'http://localhost:5151/api/books'

type BookForm = Omit<Book, 'bookId'>

const emptyForm: BookForm = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
}

function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const [newBook, setNewBook] = useState<BookForm>(emptyForm)
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize],
  )

  const fetchBooks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const url = new URL(API_BASE_URL)
      url.searchParams.set('pageNumber', pageNumber.toString())
      url.searchParams.set('pageSize', pageSize.toString())

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
  }, [pageNumber, pageSize])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(totalPages)
    }
  }, [pageNumber, totalPages])

  const handlePageSizeChange = (value: number) => {
    setPageNumber(1)
    setPageSize(value)
  }

  const updateNewBookField = <K extends keyof BookForm>(
    field: K,
    value: BookForm[K],
  ) => {
    setNewBook((prev) => ({ ...prev, [field]: value }))
  }

  const updateEditBookField = <K extends keyof BookForm>(
    field: K,
    value: BookForm[K],
  ) => {
    if (!editingBook) {
      return
    }
    setEditingBook({ ...editingBook, [field]: value })
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    setActionMessage(null)

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook),
      })

      if (!response.ok) {
        throw new Error(`Create failed: ${response.status}`)
      }

      setNewBook(emptyForm)
      setActionMessage('Book added successfully.')
      await fetchBooks()
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : 'Unable to add book.',
      )
    }
  }

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editingBook) {
      return
    }

    setActionMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/${editingBook.bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBook),
      })

      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`)
      }

      setEditingBook(null)
      setActionMessage('Book updated successfully.')
      await fetchBooks()
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : 'Unable to update book.',
      )
    }
  }

  const handleDelete = async (book: Book) => {
    setActionMessage(null)

    const confirmed = window.confirm(
      `Delete "${book.title}" by ${book.author}?`,
    )
    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${book.bookId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`)
      }

      setActionMessage('Book deleted successfully.')
      if (editingBook?.bookId === book.bookId) {
        setEditingBook(null)
      }
      await fetchBooks()
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : 'Unable to delete book.',
      )
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="mb-3">
        <h1 className="h3 m-0">Admin Books</h1>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-9">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="adminPageSize" className="form-label m-0">
                Results per page
              </label>
              <select
                id="adminPageSize"
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
            <div>
              Page {pageNumber} of {totalPages}
            </div>
          </div>

          {actionMessage && (
            <div className="alert alert-info">{actionMessage}</div>
          )}
          {isLoading && (
            <div className="alert alert-info">Loading books...</div>
          )}
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
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => setEditingBook({ ...book })}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(book)}
                            >
                              Delete
                            </button>
                          </div>
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
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber === 1}
              >
                Previous
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
                disabled={pageNumber === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-3">
          {editingBook && (
            <div className="card mb-3">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h2 className="h6 m-0">Edit Book</h2>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setEditingBook(null)}
                  >
                    Cancel
                  </button>
                </div>
                <form onSubmit={handleUpdate} className="d-flex flex-column gap-2">
                  <input
                    className="form-control form-control-sm"
                    value={editingBook.title}
                    onChange={(e) => updateEditBookField('title', e.target.value)}
                    placeholder="Title"
                    required
                  />
                  <input
                    className="form-control form-control-sm"
                    value={editingBook.author}
                    onChange={(e) => updateEditBookField('author', e.target.value)}
                    placeholder="Author"
                    required
                  />
                  <input
                    className="form-control form-control-sm"
                    value={editingBook.publisher}
                    onChange={(e) =>
                      updateEditBookField('publisher', e.target.value)
                    }
                    placeholder="Publisher"
                    required
                  />
                  <input
                    className="form-control form-control-sm"
                    value={editingBook.isbn}
                    onChange={(e) => updateEditBookField('isbn', e.target.value)}
                    placeholder="ISBN"
                    required
                  />
                  <input
                    className="form-control form-control-sm"
                    value={editingBook.classification}
                    onChange={(e) =>
                      updateEditBookField('classification', e.target.value)
                    }
                    placeholder="Classification"
                    required
                  />
                  <input
                    className="form-control form-control-sm"
                    value={editingBook.category}
                    onChange={(e) => updateEditBookField('category', e.target.value)}
                    placeholder="Category"
                    required
                  />
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={editingBook.pageCount}
                    onChange={(e) =>
                      updateEditBookField('pageCount', Number(e.target.value))
                    }
                    placeholder="Pages"
                    min={1}
                    required
                  />
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={editingBook.price}
                    onChange={(e) =>
                      updateEditBookField('price', Number(e.target.value))
                    }
                    placeholder="Price"
                    min={0}
                    step="0.01"
                    required
                  />
                  <button className="btn btn-sm btn-primary" type="submit">
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-body">
              <h2 className="h6">Add New Book</h2>
              <form onSubmit={handleCreate} className="d-flex flex-column gap-2">
                <input
                  className="form-control form-control-sm"
                  value={newBook.title}
                  onChange={(e) => updateNewBookField('title', e.target.value)}
                  placeholder="Title"
                  required
                />
                <input
                  className="form-control form-control-sm"
                  value={newBook.author}
                  onChange={(e) => updateNewBookField('author', e.target.value)}
                  placeholder="Author"
                  required
                />
                <input
                  className="form-control form-control-sm"
                  value={newBook.publisher}
                  onChange={(e) => updateNewBookField('publisher', e.target.value)}
                  placeholder="Publisher"
                  required
                />
                <input
                  className="form-control form-control-sm"
                  value={newBook.isbn}
                  onChange={(e) => updateNewBookField('isbn', e.target.value)}
                  placeholder="ISBN"
                  required
                />
                <input
                  className="form-control form-control-sm"
                  value={newBook.classification}
                  onChange={(e) =>
                    updateNewBookField('classification', e.target.value)
                  }
                  placeholder="Classification"
                  required
                />
                <input
                  className="form-control form-control-sm"
                  value={newBook.category}
                  onChange={(e) => updateNewBookField('category', e.target.value)}
                  placeholder="Category"
                  required
                />
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={newBook.pageCount}
                  onChange={(e) =>
                    updateNewBookField('pageCount', Number(e.target.value))
                  }
                  placeholder="Pages"
                  min={1}
                  required
                />
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={newBook.price}
                  onChange={(e) =>
                    updateNewBookField('price', Number(e.target.value))
                  }
                  placeholder="Price"
                  min={0}
                  step="0.01"
                  required
                />
                <button className="btn btn-sm btn-success" type="submit">
                  Add Book
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminBooks
