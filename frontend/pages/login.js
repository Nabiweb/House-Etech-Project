import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '@styles/Home.module.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('house-etech-token', response.data.token);
      localStorage.setItem('house-etech-user', JSON.stringify({ email: response.data.email, role: response.data.role }));
      axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
      router.push('/manage');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.contactSection}>
      <h2>Admin Login</h2>
      <p>Sign in to manage property listings.</p>

      <form className={styles.manageForm} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.actionButton} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
