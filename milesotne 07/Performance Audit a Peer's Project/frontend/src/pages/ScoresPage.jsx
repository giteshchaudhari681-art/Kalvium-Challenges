import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ScoreList from '../components/ScoreList';
import { Trophy, Gamepad2, Info } from 'lucide-react';

const ScoresPage = () => {
  const [scores, setScores] = useState([]);
  const [totalScores, setTotalScores] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchScores = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/scores', {
          signal: controller.signal,
        });
        setScores(res.data.scores ?? res.data);
        setTotalScores(res.data.pagination?.total ?? res.data.length ?? 0);
      } catch (err) {
        if (err.code !== 'ERR_CANCELED') {
          console.error(err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchScores();

    return () => {
      controller.abort();
    };
  }, []);

  const handleDelete = (id) => {
    setScores(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="content-wrapper header-inner">
          <div className="title-group">
            <div className="version-tag">
              <Gamepad2 size={16} className="animate-pulse" />
              <span>Database Entry</span>
            </div>
            <h1 className="main-title">ARCADE HEROES</h1>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon-box">
              <Trophy size={32} color="var(--accent-cyan)" />
            </div>
            <div>
              <div className="stats-label">Total Highscores</div>
              <div className="stats-value">{totalScores}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="content-wrapper">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p style={{ color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono', fontSize: '0.8rem', letterSpacing: '0.2em' }}>
              CONNECTING_TO_MAINFRAME...
            </p>
          </div>
        ) : (
          <ScoreList scores={scores} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
};

export default ScoresPage;
