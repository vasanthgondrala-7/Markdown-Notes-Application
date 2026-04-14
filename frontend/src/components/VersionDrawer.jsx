// src/components/VersionDrawer.jsx
import React, { useEffect, useState } from 'react';
import { getVersions, restoreVersion } from '../services/api';

export default function VersionDrawer({ noteId, onClose, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVersions(noteId)
      .then(setVersions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [noteId]);

  async function handleRestore(versionId) {
    try {
      const result = await restoreVersion(noteId, versionId);
      onRestore(result.data);
      onClose();
    } catch (e) {
      alert('Failed to restore version.');
    }
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
          Version History
        </h3>

        {loading && <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Loading...</p>}

        {!loading && versions.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            No saved versions yet. Versions are created each time you save.
          </p>
        )}

        {versions.map(v => (
          <div key={v.id} className="version-item">
            <div className="version-title">{v.title || 'Untitled'}</div>
            <div className="version-excerpt">{v.excerpt || 'No content'}</div>
            <div className="version-date">
              {new Date(v.saved_at).toLocaleString()}
            </div>
            <button className="btn-restore" onClick={() => handleRestore(v.id)}>
              Restore this version
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
