import { useEffect } from 'react';
import '../styles/globals.css';
import Layout from '@components/Layout';
import { setAuthToken } from '@lib/api';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('house-etech-token');
      setAuthToken(token);
    }
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
