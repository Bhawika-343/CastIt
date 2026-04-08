import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const PollDetailPage = () => {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [voting, setVoting] = useState(false);
  const [success, setSuccess] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPoll();
  }, [id]);

  const fetchPoll = async () => {
    try {
      const data = await fetchApi(`/polls/${id}`);
      setPoll(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!selectedOption) return;

    setVoting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await fetchApi(`/polls/${id}/vote`, {
        method: 'POST',
        body: JSON.stringify({ optionId: selectedOption })
      });
      setSuccess("Your vote has been cast!");
      fetchPoll(); // Refresh to get updated vote counts
    } catch (err) {
      setError(err.message);
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <div className="text-center" style={{marginTop: '4rem'}}>Loading...</div>;
  if (error && !poll) return <div className="text-center" style={{color: 'var(--error-color)', marginTop: '4rem'}}>{error}</div>;
  if (!poll) return <div className="text-center" style={{marginTop: '4rem'}}>Poll not found.</div>;

  const totalVotes = poll.options.reduce((acc, opt) => acc + opt.voteCount, 0);
  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);

  const exportToCSV = () => {
    const header = "Option,Votes,Percentage\n";
    const rows = poll.options.map(opt => {
      const pct = totalVotes === 0 ? 0 : Math.round((opt.voteCount / totalVotes) * 100);
      return `"${opt.text.replace(/"/g, '""')}",${opt.voteCount},${pct}%`;
    }).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + header + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `poll_results_${poll.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>{poll.question}</h1>
          <button onClick={exportToCSV} className="btn" style={{ background: 'var(--bg-lighter)', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Export CSV
          </button>
        </div>
        
        <p className="poll-meta" style={{ marginBottom: '2rem' }}>
          By {poll.createdBy?.username || 'Unknown'} • Category: {poll.category || 'General'} • {totalVotes} Total Votes
          {poll.expiresAt && ` • ${isExpired ? 'Expired' : 'Closes'}: ${new Date(poll.expiresAt).toLocaleString()}`}
        </p>

        {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
        {success && <div style={{ color: 'var(--success-color)', marginBottom: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>{success}</div>}

        <div className="poll-options">
          {poll.options.map((option) => {
            const percentage = totalVotes === 0 ? 0 : Math.round((option.voteCount / totalVotes) * 100);
            
            return (
              <div 
                key={option.id} 
                className={`poll-option ${selectedOption === option.id ? 'selected' : ''}`}
                onClick={() => setSelectedOption(option.id)}
              >
                <div className="poll-option-fill" style={{ width: `${percentage}%` }}></div>
                <div className="poll-option-content">
                  <span style={{ fontWeight: 500 }}>{option.text}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {option.voteCount} votes ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn" 
            onClick={handleVote} 
            disabled={!selectedOption || voting || isExpired}
            title={isExpired ? "This poll has expired" : ""}
          >
            {voting ? 'Voting...' : isExpired ? 'Poll Closed' : 'Submit Vote'}
          </button>
        </div>

        {totalVotes > 0 && (
          <div style={{ height: '300px', marginTop: '3rem' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Results Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={poll.options} dataKey="voteCount" nameKey="text" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                  {poll.options.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} 
                  itemStyle={{ color: 'white' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollDetailPage;
