/**
 * Admin Dashboard
 * Overview with stats, charts, and recent activity
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

// Stat Card Component
function StatCard({ title, value, change, changeType, icon, color }) {
  return (
    <div className="stat-card" style={{ '--accent': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
        {change && (
          <div className={`stat-change ${changeType}`}>
            {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : ''}
            {change}
          </div>
        )}
      </div>
    </div>
  );
}

// Mini Chart Component (simple bar chart)
function MiniChart({ data, color }) {
  const max = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="mini-chart">
      {data.map((d, i) => (
        <div key={i} className="chart-bar-wrapper">
          <div 
            className="chart-bar"
            style={{ 
              height: `${(d.value / max) * 100}%`,
              background: color 
            }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="chart-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Recent Activity Item
function ActivityItem({ type, message, time, user }) {
  const icons = {
    ticket: '🎟️',
    payment: '💳',
    checkin: '✅',
    user: '👤',
    event: '📅',
  };

  return (
    <div className="activity-item">
      <span className="activity-icon">{icons[type] || '📋'}</span>
      <div className="activity-content">
        <div className="activity-message">{message}</div>
        <div className="activity-meta">
          {user && <span className="activity-user">{user}</span>}
          <span className="activity-time">{time}</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('week');

  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', timeRange],
    queryFn: async () => {
      const response = await api.get('/analytics/dashboard', {
        params: { range: timeRange }
      });
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent activity
  const { data: activity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const response = await api.get('/analytics/activity', {
        params: { limit: 10 }
      });
      return response.data || [];
    },
    refetchInterval: 15000,
  });

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  // Format relative time
  const formatTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now - then;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Sample data if API not ready
  const defaultStats = {
    totalTickets: 0,
    ticketsSold: 0,
    ticketsCheckedIn: 0,
    totalRevenue: 0,
    currency: 'USD',
    todayTickets: 0,
    todayRevenue: 0,
    pendingTickets: 0,
    checkInRate: 0,
    salesByDay: [],
    ticketsByType: [],
  };

  const s = stats || defaultStats;

  return (
    <div className="dashboard">
      {/* Header with time range selector */}
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <div className="time-range-selector">
          {['today', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              className={`range-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(s.totalRevenue, s.currency)}
          change={s.revenueChange}
          changeType={s.revenueChange > 0 ? 'positive' : 'negative'}
          icon="💰"
          color="#10b981"
        />
        <StatCard
          title="Tickets Sold"
          value={s.ticketsSold?.toLocaleString()}
          change={s.ticketsSoldChange}
          changeType="positive"
          icon="🎟️"
          color="#3b82f6"
        />
        <StatCard
          title="Checked In"
          value={s.ticketsCheckedIn?.toLocaleString()}
          change={`${s.checkInRate || 0}%`}
          changeType="neutral"
          icon="✅"
          color="#8b5cf6"
        />
        <StatCard
          title="Pending"
          value={s.pendingTickets?.toLocaleString()}
          icon="⏳"
          color="#f59e0b"
        />
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Sales Chart */}
        <div className="chart-card">
          <div className="card-header">
            <h3>Sales Overview</h3>
            <span className="card-subtitle">Last 7 days</span>
          </div>
          <div className="chart-container">
            {s.salesByDay?.length > 0 ? (
              <MiniChart 
                data={s.salesByDay.map(d => ({ 
                  label: d.day, 
                  value: d.count 
                }))} 
                color="#3b82f6" 
              />
            ) : (
              <div className="chart-empty">No data available</div>
            )}
          </div>
        </div>

        {/* Ticket Types Distribution */}
        <div className="chart-card">
          <div className="card-header">
            <h3>Ticket Types</h3>
            <span className="card-subtitle">Distribution</span>
          </div>
          <div className="ticket-types">
            {s.ticketsByType?.length > 0 ? (
              s.ticketsByType.map((type, i) => (
                <div key={i} className="type-item">
                  <div className="type-info">
                    <span className="type-name">{type.name}</span>
                    <span className="type-count">{type.count}</span>
                  </div>
                  <div className="type-bar">
                    <div 
                      className="type-fill"
                      style={{ 
                        width: `${(type.count / s.ticketsSold) * 100}%`,
                        background: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][i % 4]
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="chart-empty">No ticket types</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-row">
        {/* Recent Activity */}
        <div className="activity-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <Link to="/admin/logs" className="card-link">View All</Link>
          </div>
          <div className="activity-list">
            {activity?.length > 0 ? (
              activity.map((item, i) => (
                <ActivityItem
                  key={i}
                  type={item.type}
                  message={item.message}
                  time={formatTime(item.timestamp)}
                  user={item.user}
                />
              ))
            ) : (
              <div className="activity-empty">No recent activity</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="actions-card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <Link to="/admin/tickets/new" className="action-btn">
              <span className="action-icon">➕</span>
              <span>New Ticket</span>
            </Link>
            <Link to="/admin/tickets/import" className="action-btn">
              <span className="action-icon">📥</span>
              <span>Import Tickets</span>
            </Link>
            <Link to="/admin/events/new" className="action-btn">
              <span className="action-icon">📅</span>
              <span>New Event</span>
            </Link>
            <Link to="/admin/reports" className="action-btn">
              <span className="action-icon">📊</span>
              <span>Generate Report</span>
            </Link>
            <Link to="/admin/tickets/verify" className="action-btn">
              <span className="action-icon">✅</span>
              <span>Verify Ticket</span>
            </Link>
            <Link to="/admin/settings" className="action-btn">
              <span className="action-icon">⚙️</span>
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard {
          max-width: 1400px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .dashboard-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text, #f8fafc);
          margin: 0;
        }

        .time-range-selector {
          display: flex;
          gap: 0.25rem;
          background: var(--color-surface, #1e293b);
          padding: 0.25rem;
          border-radius: 0.5rem;
        }

        .range-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          color: var(--color-text-muted, #94a3b8);
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .range-btn:hover {
          color: var(--color-text, #f8fafc);
        }

        .range-btn.active {
          background: var(--color-primary, #3b82f6);
          color: white;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background: var(--color-surface, #1e293b);
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          border-left: 4px solid var(--accent);
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--color-text, #f8fafc);
          line-height: 1.2;
        }

        .stat-title {
          font-size: 0.875rem;
          color: var(--color-text-muted, #94a3b8);
          margin-top: 0.25rem;
        }

        .stat-change {
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 0.5rem;
          padding: 0.125rem 0.5rem;
          border-radius: 1rem;
          display: inline-block;
        }

        .stat-change.positive {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .stat-change.negative {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .stat-change.neutral {
          color: var(--color-text-muted);
          background: rgba(148, 163, 184, 0.1);
        }

        /* Charts Row */
        .charts-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .chart-card, .activity-card, .actions-card {
          background: var(--color-surface, #1e293b);
          border-radius: 0.75rem;
          padding: 1.25rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .card-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text, #f8fafc);
          margin: 0;
        }

        .card-subtitle {
          font-size: 0.75rem;
          color: var(--color-text-muted, #94a3b8);
        }

        .card-link {
          font-size: 0.875rem;
          color: var(--color-primary, #3b82f6);
          text-decoration: none;
        }

        .card-link:hover {
          text-decoration: underline;
        }

        /* Mini Chart */
        .chart-container {
          height: 200px;
        }

        .mini-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 100%;
          gap: 0.5rem;
        }

        .chart-bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }

        .chart-bar {
          width: 100%;
          max-width: 40px;
          border-radius: 0.25rem 0.25rem 0 0;
          transition: height 0.3s ease;
          min-height: 4px;
        }

        .chart-label {
          font-size: 0.625rem;
          color: var(--color-text-muted);
          margin-top: 0.5rem;
          text-transform: uppercase;
        }

        .chart-empty {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
        }

        /* Ticket Types */
        .ticket-types {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .type-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .type-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .type-name {
          color: var(--color-text);
        }

        .type-count {
          color: var(--color-text-muted);
          font-weight: 600;
        }

        .type-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .type-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        /* Bottom Row */
        .bottom-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 900px) {
          .bottom-row {
            grid-template-columns: 1fr;
          }
        }

        /* Activity */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 320px;
          overflow-y: auto;
        }

        .activity-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 0.5rem;
        }

        .activity-icon {
          font-size: 1.25rem;
        }

        .activity-content {
          flex: 1;
          min-width: 0;
        }

        .activity-message {
          font-size: 0.875rem;
          color: var(--color-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .activity-meta {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.25rem;
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .activity-empty {
          text-align: center;
          color: var(--color-text-muted);
          padding: 2rem;
        }

        /* Quick Actions */
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 0.5rem;
          text-decoration: none;
          color: var(--color-text);
          font-size: 0.8125rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: rgba(59, 130, 246, 0.1);
          color: var(--color-primary);
        }

        .action-icon {
          font-size: 1.5rem;
        }

        @media (max-width: 640px) {
          .charts-row {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}

