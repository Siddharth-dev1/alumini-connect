import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../components/UIHelpers';
import Modal from '../components/Modal';
import { BookOpen, Download, ExternalLink, Plus, Search, Trash2, FileText } from 'lucide-react';

const CareerResources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  // Share Resource Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [resData, setResData] = useState({
    title: '',
    description: '',
    category: 'Career Guide',
    externalUrl: '',
    fileType: 'PDF'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (search) params.append('search', search);

      const res = await API.get(`/resources?${params.toString()}`);
      setResources(res.data);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [categoryFilter]);

  const handleShareResource = async (e) => {
    e.preventDefault();
    try {
      setShareLoading(true);
      const formData = new FormData();
      formData.append('title', resData.title);
      formData.append('description', resData.description);
      formData.append('category', resData.category);
      formData.append('externalUrl', resData.externalUrl);
      formData.append('fileType', resData.fileType);

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await API.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Resource shared successfully!');
      setShowShareModal(false);
      setResData({ title: '', description: '', category: 'Career Guide', externalUrl: '', fileType: 'PDF' });
      setSelectedFile(null);
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to share resource');
    } finally {
      setShareLoading(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await API.delete(`/resources/${id}`);
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <LoadingSpinner message="Loading career library resources..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-header" style={{ marginBottom: 0, flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Career Guidance & Resource Hub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Access placement roadmaps, interview question banks, resume templates, and study guides</p>
        </div>

        {(user?.role === 'alumni' || user?.role === 'admin' || user?.role === 'student') && (
          <button className="btn btn-primary" onClick={() => setShowShareModal(true)}>
            <Plus size={16} /> Share Career Resource
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <form onSubmit={(e) => { e.preventDefault(); fetchResources(); }}>
          <div className="grid-2">
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search resources, topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.2rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>

            <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Resource Categories</option>
              <option value="Resume Guide">Resume Guides</option>
              <option value="Interview Prep">Interview Prep</option>
              <option value="Career Guide">Career Guides</option>
              <option value="Technical Docs">Technical Documentation</option>
              <option value="Placement Material">Placement Materials</option>
            </select>
          </div>
        </form>
      </div>

      {/* Resource Cards */}
      {resources.length === 0 ? (
        <EmptyState title="No Resources Found" description="Try selecting a different category or search term." />
      ) : (
        <div className="grid-2">
          {resources.map(resItem => {
            const isUploader = user.role === 'admin' || (resItem.uploadedBy?._id === user._id || resItem.uploadedBy === user._id);

            return (
              <div key={resItem._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <span className="badge badge-primary">{resItem.category}</span>
                      <span className="badge badge-info">{resItem.fileType || 'PDF'}</span>
                    </div>

                    {isUploader && (
                      <button onClick={() => handleDeleteResource(resItem._id)} className="btn btn-outline btn-sm" title="Delete resource">
                        <Trash2 size={14} color="var(--danger)" />
                      </button>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '0.5rem' }}>{resItem.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    {resItem.description}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                    Shared by: <strong>{resItem.uploadedBy?.name || 'Alumni Contributor'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
                  {resItem.fileUrl ? (
                    <a href={resItem.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                      <Download size={14} /> Download File
                    </a>
                  ) : null}

                  {resItem.externalUrl ? (
                    <a href={resItem.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                      Open Material Link <ExternalLink size={12} />
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SHARE RESOURCE MODAL */}
      {showShareModal && (
        <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Career Resource">
          <form onSubmit={handleShareResource}>
            <div className="form-group">
              <label className="form-label">Resource Title</label>
              <input
                type="text"
                className="form-input"
                value={resData.title}
                onChange={(e) => setResData({ ...resData, title: e.target.value })}
                placeholder="e.g. System Design Primer PDF"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={resData.category} onChange={(e) => setResData({ ...resData, category: e.target.value })}>
                <option value="Resume Guide">Resume Guide</option>
                <option value="Interview Prep">Interview Prep</option>
                <option value="Career Guide">Career Guide</option>
                <option value="Technical Docs">Technical Documentation</option>
                <option value="Placement Material">Placement Material</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={resData.description}
                onChange={(e) => setResData({ ...resData, description: e.target.value })}
                placeholder="Briefly describe what this resource contains..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">External Resource Link (GitHub / Overleaf / Drive)</label>
              <input
                type="text"
                className="form-input"
                value={resData.externalUrl}
                onChange={(e) => setResData({ ...resData, externalUrl: e.target.value })}
                placeholder="https://github.com/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Or Upload File (PDF, DOCX, PPTX)</label>
              <input
                type="file"
                className="form-input"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowShareModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={shareLoading}>
                {shareLoading ? 'Sharing...' : 'Share Resource'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CareerResources;
