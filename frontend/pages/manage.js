import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import styles from '@styles/Home.module.css';

const emptyListing = {
  title: '',
  description: '',
  image: '',
  price: ''
};

export default function Manage() {
  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [formState, setFormState] = useState(emptyListing);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const selectedListing = useMemo(() => {
    return listings.find((item) => item._id === selected) || null;
  }, [listings, selected]);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    if (selectedListing) {
      setFormState({
        title: selectedListing.title,
        description: selectedListing.description,
        image: selectedListing.image,
        price: selectedListing.price.toString()
      });
      setError(null);
      setStatus(null);
    }
  }, [selectedListing]);

  async function fetchListings() {
    try {
      const response = await axios.get('/api/listings');
      setListings(response.data || []);
    } catch (err) {
      setError('Unable to load listings.');
    }
  }

  function resetForm() {
    setSelected(null);
    setFormState(emptyListing);
    setError(null);
    setStatus(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setSaving(true);

    const payload = {
      title: formState.title,
      description: formState.description,
      image: formState.image,
      price: Number(formState.price)
    };

    if (!payload.title || !payload.description || !payload.image || !payload.price) {
      setError('All fields are required and price must be positive.');
      setSaving(false);
      return;
    }

    try {
      const method = selected ? 'put' : 'post';
      const url = selected ? `/api/listings/${selected}` : '/api/listings';
      const response = await axios[method](url, payload);
      setStatus(selected ? 'Listing updated.' : 'Listing created.');
      setListings((prev) => {
        if (selected) {
          return prev.map((item) => (item._id === selected ? response.data : item));
        }
        return [...prev, response.data];
      });
      resetForm();
    } catch (err) {
      setError(err.response?.data?.errors?.join(' ') || err.response?.data?.error || 'Failed to save listing.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setError(null);
    setStatus(null);
    try {
      await axios.delete(`/api/listings/${id}`);
      setListings((prev) => prev.filter((item) => item._id !== id));
      if (id === selected) {
        resetForm();
      }
      setStatus('Listing deleted.');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete listing.');
    }
  }

  return (
    <div className={styles.manageSection}>
      <section className={styles.contactSection}>
        <h2>Manage Listings</h2>
        <p>Update or remove existing properties, or add a new listing.</p>

        <form className={styles.manageForm} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={formState.title}
              onChange={(event) => setFormState({ ...formState, title: event.target.value })}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows="4"
              value={formState.description}
              onChange={(event) => setFormState({ ...formState, description: event.target.value })}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="image">Image URL</label>
            <input
              id="image"
              value={formState.image}
              onChange={(event) => setFormState({ ...formState, image: event.target.value })}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="price">Price</label>
            <input
              id="price"
              type="number"
              min="1"
              value={formState.price}
              onChange={(event) => setFormState({ ...formState, price: event.target.value })}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {status && <p className={styles.success}>{status}</p>}

          <div>
            <button type="submit" className={styles.actionButton} disabled={saving}>
              {saving ? 'Saving...' : selected ? 'Update listing' : 'Create listing'}
            </button>
            {selected && (
              <button type="button" className={styles.cancelButton} onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className={styles.manageList}>
        {listings.map((listing) => (
          <article key={listing._id} className={styles.manageCard}>
            <div className={styles.manageCardHeader}>
              <strong>{listing.title}</strong>
              <div>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => setSelected(listing._id)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => handleDelete(listing._id)}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className={styles.manageCardBody}>
              <p>{listing.description}</p>
              <p className={styles.price}>${Number(listing.price).toLocaleString()}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
