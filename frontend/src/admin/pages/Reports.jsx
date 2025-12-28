/**
 * Reports & Analytics Page
 * Comprehensive reporting with charts and data export
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

export default function Reports() {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('sales');

  // Fetch report data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report', reportType, dateRange],
    queryFn: async () => {
      const response = await api.get(`/analytics/${reportType}`, {
        params: { range: dateRange }
      });
      return response.data;
    },
  });

  // Fetch summary stats
  const { data: summary } = useQuery({
    queryKey: ['report-summary', dateRange],
    queryFn: async () => {
      const response = await api.get('/analytics/summary', {
        params: { range: dateRange }
      });
      return response.data;
    },
  });

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const handleExport = async (format) => {
    try {
      const response = await fetch(
        `/api/analytics/export/${reportType}?format=${format}&range=${dateRange}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const stats = summary || {
    totalRevenue: 0,
    ticketsSold: 0,
    ticketsCheckedIn: 0,
    avgTicketValue: 0,
    checkInRate: 0,
    currency: 'USD',
  };

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => handleExport('csv')}>
            📥 Export CSV
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('pdf')}>
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Report Type</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="sales">Sales Report</option>
            <option value="checkins">Check-in Report</option>
            <option value="events">Event Report</option>
            <option value="revenue">Revenue Report</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date Range</label>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">Total Revenue</div>
          <div className="summary-value">{formatCurrency(stats.totalRevenue, stats.currency)}</div>
          <div className="summary-change positive">↑ 12% from last period</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Tickets Sold</div>
          <div className="summary-value">{stats.ticketsSold?.toLocaleString()}</div>
          <div className="summary-change positive">↑ 8% from last period</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Checked In</div>
          <div className="summary-value">{stats.ticketsCheckedIn?.toLocaleString()}</div>
          <div className="summary-change neutral">{stats.checkInRate}% rate</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Avg. Ticket Value</div>
          <div className="summary-value">{formatCurrency(stats.avgTicketValue, stats.currency)}</div>
          <div className="summary-change positive">↑ 5% from last period</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Revenue Over Time */}
        <div className="chart-card large">
          <div className="card-header">
            <h3>Revenue Over Time</h3>
          </div>
          <div className="chart-area">
            {isLoading ? (
              <div className="chart-loading">Loading...</div>
            ) : (
              <div className="simple-chart">
                {reportData?.timeline?.map((item, i) => (
                  <div key={i} className="chart-column">
                    <div 
                      className="chart-bar"
                      style={{ 
                        height: `${(item.revenue / (reportData?.maxRevenue || 1)) * 100}%` 
                      }}
                    >
                      <span className="bar-value">{formatCurrency(item.revenue)}</span>
                    </div>
                    <span className="bar-label">{item.label}</span>
                  </div>
                )) || (
                  <div className="chart-empty">No data available for this period</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tickets by Type */}
        <div className="chart-card">
          <div className="card-header">
            <h3>Tickets by Type</h3>
          </div>
          <div className="pie-chart-area">
            {reportData?.byType?.map((type, i) => (
              <div key={i} className="type-row">
                <div 
                  className="type-dot"
                  style={{ 
                    background: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][i % 5]
                  }}
                />
                <span className="type-name">{type.name}</span>
                <span className="type-count">{type.count}</span>
                <span className="type-percent">{type.percent}%</span>
              </div>
            )) || (
              <div className="chart-empty">No data available</div>
            )}
          </div>
        </div>

        {/* Check-ins by Hour */}
        <div className="chart-card">
          <div className="card-header">
            <h3>Check-ins by Hour</h3>
          </div>
          <div className="chart-area">
            <div className="hourly-chart">
              {reportData?.byHour?.map((hour, i) => (
                <div key={i} className="hour-bar">
                  <div 
                    className="hour-fill"
                    style={{ 
                      width: `${(hour.count / (reportData?.maxHourly || 1)) * 100}%` 
                    }}
                  />
                  <span className="hour-label">{hour.hour}</span>
                  <span className="hour-count">{hour.count}</span>
                </div>
              )) || (
                <div className="chart-empty">No check-in data</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-card">
        <div className="card-header">
          <h3>Detailed Data</h3>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Tickets Sold</th>
                <th>Revenue</th>
                <th>Check-ins</th>
                <th>Avg. Value</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.details?.map((row, i) => (
                <tr key={i}>
                  <td>{row.date}</td>
                  <td>{row.sold}</td>
                  <td>{formatCurrency(row.revenue, stats.currency)}</td>
                  <td>{row.checkins}</td>
                  <td>{formatCurrency(row.avgValue, stats.currency)}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="5" className="empty-row">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .reports-page {
          max-width: 1400px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        /* Filters */
        .filters-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .filter-group label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-group select {
          padding: 0.625rem 1rem;
          background: var(--color-surface);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.375rem;
          color: var(--color-text);
          min-width: 180px;
        }

        /* Summary Grid */
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .summary-card {
          background: var(--color-surface);
          border-radius: 0.75rem;
          padding: 1.25rem;
        }

        .summary-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .summary-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--color-text);
        }

        .summary-change {
          font-size: 0.75rem;
          margin-top: 0.5rem;
        }

        .summary-change.positive { color: #10b981; }
        .summary-change.negative { color: #ef4444; }
        .summary-change.neutral { color: var(--color-text-muted); }

        /* Charts */
        .charts-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 1024px) {
          .charts-section {
            grid-template-columns: 1fr;
          }
        }

        .chart-card {
          background: var(--color-surface);
          border-radius: 0.75rem;
          padding: 1.25rem;
        }

        .chart-card.large {
          grid-column: span 1;
        }

        .card-header {
          margin-bottom: 1rem;
        }

        .card-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 0;
        }

        .chart-area {
          height: 240px;
        }

        .chart-loading, .chart-empty {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-muted);
        }

        /* Simple Bar Chart */
        .simple-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 100%;
          gap: 0.5rem;
        }

        .chart-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          max-width: 60px;
        }

        .chart-bar {
          width: 100%;
          background: linear-gradient(180deg, var(--color-primary), rgba(59, 130, 246, 0.3));
          border-radius: 0.25rem 0.25rem 0 0;
          min-height: 4px;
          position: relative;
        }

        .bar-value {
          position: absolute;
          bottom: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.625rem;
          color: var(--color-text-muted);
          white-space: nowrap;
        }

        .bar-label {
          margin-top: 0.5rem;
          font-size: 0.625rem;
          color: var(--color-text-muted);
        }

        /* Type Distribution */
        .pie-chart-area {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .type-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .type-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .type-name {
          flex: 1;
          color: var(--color-text);
          font-size: 0.875rem;
        }

        .type-count {
          color: var(--color-text-muted);
          font-size: 0.875rem;
          min-width: 40px;
          text-align: right;
        }

        .type-percent {
          color: var(--color-primary);
          font-size: 0.75rem;
          font-weight: 600;
          min-width: 40px;
          text-align: right;
        }

        /* Hourly Chart */
        .hourly-chart {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          height: 100%;
          overflow-y: auto;
        }

        .hour-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .hour-fill {
          height: 20px;
          background: linear-gradient(90deg, var(--color-primary), rgba(59, 130, 246, 0.3));
          border-radius: 0.25rem;
          min-width: 4px;
        }

        .hour-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          min-width: 50px;
        }

        .hour-count {
          font-size: 0.75rem;
          color: var(--color-text);
          margin-left: auto;
        }

        /* Data Table */
        .table-card {
          background: var(--color-surface);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .table-card .card-header {
          padding: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
          padding: 0.875rem 1.25rem;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .data-table th {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
        }

        .data-table td {
          color: var(--color-text);
        }

        .empty-row {
          text-align: center !important;
          color: var(--color-text-muted) !important;
          padding: 2rem !important;
        }

        /* Buttons */
        .btn {
          padding: 0.625rem 1.25rem;
          border-radius: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: var(--color-surface);
          color: var(--color-text);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

