import Head from 'next/head';

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
            <a href="#listings">Listings</a>
            <a href="#contact">Contact</a>
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
