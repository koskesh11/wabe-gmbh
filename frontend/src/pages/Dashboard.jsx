import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { uploads } from '../api';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [projectId] = useState(() => {
    // Create or get project ID from localStorage
    let id = localStorage.getItem('projectId');
    if (!id) {
      id = 'default-' + Date.now();
      localStorage.setItem('projectId', id);
    }
    return id;
  });

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await uploads.getProjectFiles(projectId);
      setFiles(response.data.files || []);
    } catch (err) {
      setError('Fehler beim Laden der Dateien');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    // Validate files
    for (const file of newFiles) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`Datei ${file.name} ist zu groß (max. 10 MB)`);
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError(`Dateityp ${file.type} ist nicht erlaubt`);
        return;
      }
    }

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      const response = await uploads.uploadFiles(projectId, newFiles);
      setFiles([...files, ...response.data.files]);
      setSuccess(`${response.data.count} Datei(en) erfolgreich hochgeladen`);
      e.target.value = ''; // Reset input
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      const message = err.response?.data?.error || 'Upload fehlgeschlagen';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Datei wirklich löschen?')) return;

    try {
      await uploads.deleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
      setSuccess('Datei gelöscht');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Fehler beim Löschen der Datei');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="dashboard-logo">Wabe GmbH</div>
        <div className="user-info">
          <span>{user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">Abmelden</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Projektdateien</h2>
          <p>Laden Sie Dachfotos und Dokumente für unser Team zur Überprüfung hoch</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="upload-section">
          <label htmlFor="file-input" className="upload-zone">
            <div className="upload-icon">📤</div>
            <div className="upload-text">Klicken Sie zum Hochladen oder ziehen Sie Dateien hierher</div>
            <div className="upload-hint">Akzeptiert: JPG, PNG, PDF (max. 10 MB pro Datei)</div>
          </label>
          <input
            type="file"
            id="file-input"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </div>

        {files.length > 0 && (
          <div className="files-section">
            <div className="files-header">
              <h3>{files.length} Datei(en) hochgeladen</h3>
            </div>
            <div className="file-list">
              {files.map((file) => (
                <div key={file.id} className="file-item">
                  <div className="file-details">
                    <div className="file-icon">
                      {file.file_type === '.pdf' ? '📄' : '🖼️'}
                    </div>
                    <div className="file-info">
                      <div className="file-name">{file.file_name}</div>
                      <div className="file-meta">
                        {formatFileSize(file.file_size)} • {formatDate(file.created_at)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="btn-delete"
                    title="Datei löschen"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && files.length === 0 && !error && (
          <div className="empty-state">
            <p>Keine Dateien hochgeladen.</p>
            <p>Beginnen Sie mit dem Hochladen von Fotos oder Dokumenten.</p>
          </div>
        )}
      </div>
    </div>
  );
}
