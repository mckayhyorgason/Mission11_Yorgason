import { useCart } from './CartContext'

type CartPageProps = {
  onContinueShopping: () => void
}

function CartPage({ onContinueShopping }: CartPageProps) {
  const { items, totalPrice, removeItem, setQuantity, clear } = useCart()

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <h1 className="h3 m-0">Your Cart</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={onContinueShopping}>
            Continue Shopping
          </button>
          {items.length > 0 && (
            <button className="btn btn-outline-danger" onClick={clear}>
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="alert alert-info">Your cart is empty.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th style={{ width: '150px' }}>Quantity</th>
                <th>Subtotal</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.book.bookId}>
                  <td>{item.book.title}</td>
                  <td>${item.book.price.toFixed(2)}</td>
                  <td>
                    <div className="input-group input-group-sm">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setQuantity(item.book.bookId, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="form-control text-center"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          setQuantity(item.book.bookId, Number(e.target.value))
                        }
                      />
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setQuantity(item.book.bookId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>${(item.book.price * item.quantity).toFixed(2)}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeItem(item.book.bookId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items.length > 0 && (
        <div className="d-flex justify-content-end">
          <div className="card" style={{ minWidth: '240px' }}>
            <div className="card-body">
              <h5 className="card-title">Order Total</h5>
              <p className="card-text fs-5 fw-semibold mb-0">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
