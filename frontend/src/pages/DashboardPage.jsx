import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchApi } from '../utils/api';

const DashboardPage = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const data = await fetchApi('/polls');
        setPolls(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  if (loading) return <div className="text-center" style={{marginTop: '4rem'}}>Loading polls...</div>;
  if (error) return <div className="text-center" style={{color: 'var(--error-color)', marginTop: '4rem'}}>{error}</div>;

  const filteredPolls = polls.filter(poll => {
    const matchesSearch = poll.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? poll.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Active Polls</h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Search polls..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}
        />
        <select 
          value={selectedCategory} 
          onChange={e => setSelectedCategory(e.target.value)}
          style={{ width: '200px', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}
        >
          <option value="" style={{background: '#1e293b', color: 'white'}}>All Categories</option>
          <option value="General" style={{background: '#1e293b', color: 'white'}}>General</option>
          <option value="Engineering" style={{background: '#1e293b', color: 'white'}}>Engineering</option>
          <option value="Human Resources" style={{background: '#1e293b', color: 'white'}}>Human Resources</option>
          <option value="Marketing" style={{background: '#1e293b', color: 'white'}}>Marketing</option>
          <option value="Product" style={{background: '#1e293b', color: 'white'}}>Product</option>
        </select>
      </div>
      
      {filteredPolls.length === 0 ? (
        <div className="glass-panel text-center">
          <p style={{ color: 'var(--text-secondary)' }}>No polls available right now.</p>
        </div>
      ) : (
        <div className="polls-grid">
          {filteredPolls.map((poll) => {
            const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);
            return (
              <Link to={`/poll/${poll.id}`} key={poll.id} className="glass-panel poll-card" style={{ opacity: isExpired ? 0.6 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="poll-title">{poll.question}</h3>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                    {poll.category || 'General'}
                  </span>
                </div>
                <p className="poll-meta">Created by: {poll.createdBy?.username || 'Unknown'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <p className="poll-meta">{poll.options?.length || 0} Options</p>
                  {poll.expiresAt && (
                    <p style={{ fontSize: '0.75rem', color: isExpired ? 'var(--error-color)' : 'var(--primary-light)' }}>
                      {isExpired ? 'Expired' : `Closes: ${new Date(poll.expiresAt).toLocaleDateString()}`}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
