import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CartPage } from '../pages/CartPage.tsx';
import { CatalogPage } from '../pages/CatalogPage.tsx';
import { CheckoutPage } from '../pages/CheckoutPage.tsx';
import { useCreateSessionMutation } from '../shared/api/sessionApi';

function App() {
  const [createSession, { isLoading, error }] = useCreateSessionMutation();

  useEffect(() => {
    const token = localStorage.getItem('sessionToken');

    if (token) {
      return;
    }

    createSession()
      .unwrap()
      .then((response) => {
        localStorage.setItem('sessionToken', response.data.token);
      })
      .catch((error) => {
        console.error('Failed to create session:', error);
      });
  }, [createSession]);

  if (isLoading) {
    return <div>Creating session...</div>;
  }

  if (error) {
    return <div>Failed to create session</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
    </Routes>
  );
}

export default App;
