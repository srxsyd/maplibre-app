import { useState } from 'react';
import './AdminGate.css';

// switches between the guest and admin views. Not real user auth, just a single shared
// passcode checked by the server, enough to keep guests out of admin-only routes.
const AdminGate = ({ role, isAuthenticated, onEnterAdmin, onResumeAdmin, onExitAdmin }) => {
  const [showForm, setShowForm] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onEnterAdmin(passcode);
      setShowForm(false);
      setPasscode('');
    } catch (err) {
      setError('Incorrect passcode.');
    } finally {
      setBusy(false);
    }
  };

  if (role === 'admin') {
    return (
      <div className="admin-gate">
        <span className="admin-gate-status">Admin view</span>
        <button className="admin-gate-link" onClick={onExitAdmin}>
          Switch to guest
        </button>
      </div>
    );
  }

  return (
    <div className="admin-gate">
      <span className="admin-gate-status">Guest view</span>
      {isAuthenticated ? (
        <button className="admin-gate-link" onClick={onResumeAdmin}>
          Switch to admin
        </button>
      ) : showForm ? (
        <form className="admin-gate-form" onSubmit={handleSubmit}>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Admin passcode"
            autoFocus
          />
          <button type="submit" disabled={busy}>
            Go
          </button>
          {error && <span className="admin-gate-error">{error}</span>}
        </form>
      ) : (
        <button className="admin-gate-link" onClick={() => setShowForm(true)}>
          Switch to admin
        </button>
      )}
    </div>
  );
};

export default AdminGate;
