import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '@styles/Home.module.css';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sendState, setSendState] = useState('idle');
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    async function loadListings() {
      try {
        const response = await axios.get('/api/listings');
        setListings(response.data || []);
      } catch (err) {
        setError('Failed to load listings.');
      } finally {
        setLoading(false);
      }
    }

    loadListings();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);
    setSendState('sending');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormError('Please complete every field before sending.');
      setSendState('idle');
      return;
    }

    try {
      await axios.post('/api/contact', { name, email, message });
      setSendState('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setFormError('Unable to send your message. Please try again later.');
      setSendState('error');
    }
  }

  return (
    <div className={styles.homePage}>
      <section className={styles.hero}>
        <h1>Find a home you love</h1>
        <p>Browse thoughtfully curated houses with all the amenities you want.</p>
      </section>

      <section id="listings" className={styles.listingsSection}>
        <h2>Available Properties</h2>
        {loading && <p>Loading houses...</p>}
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.grid}>
          {listings.map((house) => (
            <article key={house._id} className={styles.card}>
              <img src={house.image} alt={house.title} />
              <div className={styles.cardBody}>
                <h3>{house.title}</h3>
                <p>{house.description}</p>
                <p className={styles.price}>${house.price.toLocaleString()}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className={styles.contactSection}>
        <div className={styles.contactIntro}>
          <h2>Get in touch</h2>
          <p>Contact our team to book a tour or ask about financing options.</p>
        </div>

        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              rows="5"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us what you're looking for"
            />
          </div>

          {formError && <p className={styles.error}>{formError}</p>}
          {sendState === 'sent' && <p className={styles.success}>Your message was sent successfully.</p>}

          <button type="submit" className={styles.contactButton} disabled={sendState === 'sending'}>
            {sendState === 'sending' ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </section>
    </div>
  );
}
