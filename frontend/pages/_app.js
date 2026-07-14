import { useEffect } from 'react';
import axios from 'axios';
import '../styles/globals.css';
import Layout from '@components/Layout';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('house-etech-token');
      if (token) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
    }
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
