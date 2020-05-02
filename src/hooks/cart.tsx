import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const STORAGE_PRODUCTS_KEY = '@Gomarketplace:products';

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem(STORAGE_PRODUCTS_KEY);

      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const filteredProducts = products.filter(product => product.id !== id);

      const productIncrement = products.find(product => product.id === id);

      const productIndex = products.findIndex(product => product.id === id);

      if (productIncrement) {
        productIncrement.quantity += 1;

        filteredProducts.splice(productIndex, 0, productIncrement);

        setProducts(filteredProducts);
      }

      await AsyncStorage.setItem(
        STORAGE_PRODUCTS_KEY,
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const filteredProducts = products.filter(product => product.id !== id);

      const productDecrement = products.find(product => product.id === id);

      const productIndex = products.findIndex(product => product.id === id);

      if (productDecrement && productDecrement.quantity > 1) {
        productDecrement.quantity -= 1;

        filteredProducts.splice(productIndex, 0, productDecrement);
      }

      setProducts(filteredProducts);

      await AsyncStorage.setItem(
        STORAGE_PRODUCTS_KEY,
        JSON.stringify(products),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      const productIndex = products.findIndex(p => p.id === product.id);

      // if (productIndex < 0) {
      setProducts(oldState => [...oldState, { ...product, quantity: 1 }]);
      await AsyncStorage.setItem(
        STORAGE_PRODUCTS_KEY,
        JSON.stringify([...products, { ...product, quantity: 1 }]),
      );
      // } else {
      //   increment(product.id);
      // }
    },
    [products, increment],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
