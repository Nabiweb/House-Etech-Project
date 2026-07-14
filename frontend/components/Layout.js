import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAuthenticated(!!localStorage.getItem('house-etech-token'));
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('house-etech-token');
    localStorage.removeItem('house-etech-user');
    setAuthenticated(false);
    router.push('/login');
  }

  return (
    <>
      <Head>
        <title>House Etech</title>
        <meta name="description" content="Modern real estate listing built with Next.js and Node.js" />
      </Head>
      <div className="page-shell">
        <header className="site-header">
          <div className="brand">House Etech</div>
          <nav>
            <Link href="/">Home</Link>
            <Link href="/manage">Manage Listings</Link>
            {authenticated ? (
              <button onClick={handleLogout} className="logoutButton">
                Logout
              </button>
            ) : (
              <Link href="/login">Login</Link>
            )}
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>Built with Next.js, Express, and MongoDB.</p>
        </footer>
      </div>
    </>
  );
}
