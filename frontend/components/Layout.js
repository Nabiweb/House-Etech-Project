import Head from 'next/head';
import Link from 'next/link';

export default function Layout({ children }) {
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
