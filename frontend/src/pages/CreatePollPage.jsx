import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../utils/api';

const CreatePollPage = () => {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('General');
  const [expiresAt, setExpiresAt] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      setError("Please provide at least 2 valid options.");
      return;
    }

    setLoading(true);
    
    try {
      let expiredDateStr = null;
      if (expiresAt) {
        const d = new Date(expiresAt);
        expiredDateStr = d.toISOString();
      }
      
      await fetchApi('/polls', {
        method: 'POST',
        body: JSON.stringify({
          question,
          category,
          expiresAt: expiredDateStr,
          options: validOptions,
        }),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div className="glass-panel">
        <h2>Create a New Poll</h2>
        {error && <p style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Question</label>
            <input
              type="text"
              className="input-field"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What is your favorite framework?"
              required
            />
          </div>

          <div className="form-group" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}>
                <option value="General" style={{background: '#1e293b', color: 'white'}}>General</option>
                <option value="Engineering" style={{background: '#1e293b', color: 'white'}}>Engineering</option>
                <option value="Human Resources" style={{background: '#1e293b', color: 'white'}}>Human Resources</option>
                <option value="Marketing" style={{background: '#1e293b', color: 'white'}}>Marketing</option>
                <option value="Product" style={{background: '#1e293b', color: 'white'}}>Product</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Auto-Close Deadline (Optional)</label>
              <input
                type="datetime-local"
                className="input-field"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}
              />
            </div>
          </div>
          
          <div className="options-container" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <label className="input-label">Options</label>
            {options.map((opt, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input 
                  type="text" 
                  className="input-field"
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {options.length > 2 && (
                  <button type="button" onClick={() => removeOption(index)} className="btn btn-secondary" style={{ padding: '0 1rem', color: 'var(--error-color)', borderColor: 'var(--glass-border)' }}>
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button type="button" onClick={addOption} className="btn btn-secondary" style={{ marginBottom: '1.5rem', width: '100%', borderStyle: 'dashed' }}>
            + Add Option
          </button>
          
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePollPage;
