import { useState } from 'react';
import { exportTrip } from '../lib/exportTrip';
import './ExportTrip.css';

// downloads the rendered map plus the itinerary list as a single png/jpeg/pdf
const ExportTrip = ({ map, route }) => {
  const [format, setFormat] = useState('png');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const disabled = !map || route.length === 0 || busy;

  const handleExport = async () => {
    setBusy(true);
    setError('');
    try {
      await exportTrip(map, route, format);
    } catch (err) {
      setError('Export failed — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="export-trip">
      <select value={format} onChange={(e) => setFormat(e.target.value)} disabled={busy} aria-label="Export format">
        <option value="png">PNG</option>
        <option value="jpeg">JPEG</option>
        <option value="pdf">PDF</option>
      </select>
      <button type="button" onClick={handleExport} disabled={disabled}>
        {busy ? 'Exporting…' : 'Export'}
      </button>
      {error && <span className="export-trip-error">{error}</span>}
    </div>
  );
};

export default ExportTrip;
