import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { Book } from './types/book'

type CartItem = {
  book: Book
  quantity: number
}

type CartState = {
  items: CartItem[]
}

type CartAction =
  | { type: 'add'; book: Book }
  | { type: 'remove'; bookId: number }
  | { type: 'setQuantity'; bookId: number; quantity: number }
  | { type: 'clear' }

type CartContextValue = {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (book: Book) => void
  removeItem: (bookId: number) => void
  setQuantity: (bookId: number, quantity: number) => void
  clear: () => void
}

const CART_STORAGE_KEY = 'bookstore-cart'

const CartContext = createContext<CartContextValue | null>(null)

const loadInitialState = (): CartState => {
  if (typeof window === 'undefined') {
    return { items: [] }
  }

  const stored = sessionStorage.getItem(CART_STORAGE_KEY)
  if (!stored) {
    return { items: [] }
  }

  try {
    const parsed = JSON.parse(stored) as CartState
    if (!parsed || !Array.isArray(parsed.items)) {
      return { items: [] }
    }
    return parsed
  } catch {
    return { items: [] }
  }
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'add': {
      const existing = state.items.find((item) => item.book.bookId === action.book.bookId)
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.book.bookId === action.book.bookId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }
      }
      return { items: [...state.items, { book: action.book, quantity: 1 }] }
    }
    case 'remove':
      return { items: state.items.filter((item) => item.book.bookId !== action.bookId) }
    case 'setQuantity': {
      if (action.quantity <= 0) {
        return { items: state.items.filter((item) => item.book.bookId !== action.bookId) }
      }
      return {
        items: state.items.map((item) =>
          item.book.bookId === action.bookId
            ? { ...item, quantity: action.quantity }
            : item,
        ),
      }
    }
    case 'clear':
      return { items: [] }
    default:
      return state
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState)

  useEffect(() => {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const totalItems = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items],
  )

  const totalPrice = useMemo(
    () =>
      state.items.reduce((sum, item) => sum + item.quantity * item.book.price, 0),
    [state.items],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      totalItems,
      totalPrice,
      addItem: (book) => dispatch({ type: 'add', book }),
      removeItem: (bookId) => dispatch({ type: 'remove', bookId }),
      setQuantity: (bookId, quantity) =>
        dispatch({ type: 'setQuantity', bookId, quantity }),
      clear: () => dispatch({ type: 'clear' }),
    }),
    [state.items, totalItems, totalPrice],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
