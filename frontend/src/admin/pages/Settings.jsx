/**
 * Settings Page
 * Site configuration, branding, and payment providers
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';

const TABS = [
  { id: 'general', label: 'General', icon: '⚙️' },
  { id: 'branding', label: 'Branding', icon: '🎨' },
  { id: 'payments', label: 'Payments', icon: '💳' },
  { id: 'features', label: 'Features', icon: '🔧' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const queryClient = useQueryClient();

  // Fetch config
  const { data: config, isLoading } = useQuery({
    queryKey: ['admin-config'],
    queryFn: async () => {
      const response = await adminApi.getConfig();
      return response.data;
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => adminApi.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-config']);
      queryClient.invalidateQueries(['site-config']);
    },
  });

  if (isLoading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="page-header">
        <h1>Settings</h1>
        {updateMutation.isPending && (
          <span className="saving-indicator">Saving...</span>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'general' && (
          <GeneralSettings config={config} onSave={updateMutation.mutate} />
        )}
        {activeTab === 'branding' && (
          <BrandingSettings config={config} onSave={updateMutation.mutate} />
        )}
        {activeTab === 'payments' && (
          <PaymentSettings />
        )}
        {activeTab === 'features' && (
          <FeatureSettings config={config} onSave={updateMutation.mutate} />
        )}
      </div>

      <style>{`
        .settings-page {
          max-width: 900px;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
        }

        .saving-indicator {
          font-size: 0.875rem;
          color: var(--color-primary);
        }

        .loading {
          padding: 4rem;
          text-align: center;
          color: var(--color-text-muted);
        }

        /* Tabs */
        .tabs {
          display: flex;
          gap: 0.25rem;
          background: var(--color-surface);
          padding: 0.25rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          font-weight: 500;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab:hover {
          color: var(--color-text);
        }

        .tab.active {
          background: var(--color-primary);
          color: white;
        }

        .tab-icon {
          font-size: 1.125rem;
        }

        /* Content */
        .tab-content {
          background: var(--color-surface);
          border-radius: 0.75rem;
          padding: 1.5rem;
        }

        @media (max-width: 640px) {
          .tabs {
            flex-wrap: wrap;
          }

          .tab {
            flex: 1 1 45%;
          }

          .tab-label {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

// General Settings Tab
function GeneralSettings({ config, onSave }) {
  const [form, setForm] = useState({
    orgName: config?.orgName || '',
    orgDescription: config?.orgDescription || '',
    orgEmail: config?.orgEmail || '',
    orgPhone: config?.orgPhone || '',
    orgWebsite: config?.orgWebsite || '',
    timezone: config?.timezone || 'UTC',
    locale: config?.locale || 'en-US',
    currency: config?.currency || 'USD',
    dateFormat: config?.dateFormat || 'MM/DD/YYYY',
    timeFormat: config?.timeFormat || '12h',
  });

  const handleSave = () => {
    onSave(form);
  };

  return (
    <div className="settings-form">
      <h3>Organization</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label>Organization Name</label>
          <input
            type="text"
            value={form.orgName}
            onChange={(e) => setForm({ ...form, orgName: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            value={form.orgWebsite}
            onChange={(e) => setForm({ ...form, orgWebsite: e.target.value })}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={form.orgDescription}
          onChange={(e) => setForm({ ...form, orgDescription: e.target.value })}
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={form.orgEmail}
            onChange={(e) => setForm({ ...form, orgEmail: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={form.orgPhone}
            onChange={(e) => setForm({ ...form, orgPhone: e.target.value })}
          />
        </div>
      </div>

      <h3>Localization</h3>

      <div className="form-row">
        <div className="form-group">
          <label>Currency</label>
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="GHS">GHS - Ghana Cedi</option>
            <option value="NGN">NGN - Nigerian Naira</option>
            <option value="KES">KES - Kenyan Shilling</option>
          </select>
        </div>
        <div className="form-group">
          <label>Timezone</label>
          <select
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Africa/Accra">Accra</option>
            <option value="Africa/Lagos">Lagos</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Date Format</label>
          <select
            value={form.dateFormat}
            onChange={(e) => setForm({ ...form, dateFormat: e.target.value })}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div className="form-group">
          <label>Time Format</label>
          <select
            value={form.timeFormat}
            onChange={(e) => setForm({ ...form, timeFormat: e.target.value })}
          >
            <option value="12h">12 Hour (AM/PM)</option>
            <option value="24h">24 Hour</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      <style>{`
        .settings-form h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text);
          margin: 0 0 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .settings-form h3:first-child {
          padding-top: 0;
          border-top: none;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.375rem;
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.375rem;
          color: var(--color-text);
          font-size: 0.875rem;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .form-actions {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .btn {
          padding: 0.625rem 1.5rem;
          border-radius: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }
      `}</style>
    </div>
  );
}

// Branding Settings Tab
function BrandingSettings({ config, onSave }) {
  const [form, setForm] = useState({
    primaryColor: config?.primaryColor || '#3b82f6',
    secondaryColor: config?.secondaryColor || '#1e293b',
    accentColor: config?.accentColor || '#10b981',
    backgroundColor: config?.backgroundColor || '#0f172a',
    surfaceColor: config?.surfaceColor || '#1e293b',
    textColor: config?.textColor || '#f8fafc',
    headingFont: config?.headingFont || 'Inter',
    bodyFont: config?.bodyFont || 'Inter',
    borderRadius: config?.borderRadius || 'md',
    homePageTitle: config?.homePageTitle || 'Welcome',
    homePageSubtitle: config?.homePageSubtitle || '',
    footerText: config?.footerText || '',
  });

  const handleSave = () => {
    onSave(form);
  };

  const presets = [
    { name: 'Default', primary: '#3b82f6', accent: '#10b981', bg: '#0f172a' },
    { name: 'Purple', primary: '#8b5cf6', accent: '#ec4899', bg: '#0f0a1e' },
    { name: 'Green', primary: '#10b981', accent: '#3b82f6', bg: '#0a1e0f' },
    { name: 'Orange', primary: '#f59e0b', accent: '#ef4444', bg: '#1e0f0a' },
  ];

  const applyPreset = (preset) => {
    setForm({
      ...form,
      primaryColor: preset.primary,
      accentColor: preset.accent,
      backgroundColor: preset.bg,
    });
  };

  return (
    <div className="settings-form">
      <h3>Color Presets</h3>
      <div className="preset-grid">
        {presets.map((preset) => (
          <button
            key={preset.name}
            className="preset-btn"
            onClick={() => applyPreset(preset)}
          >
            <div 
              className="preset-preview"
              style={{ 
                background: preset.bg,
                borderColor: preset.primary,
              }}
            >
              <div 
                className="preset-accent"
                style={{ background: preset.primary }}
              />
            </div>
            <span>{preset.name}</span>
          </button>
        ))}
      </div>

      <h3>Colors</h3>
      <div className="color-grid">
        {[
          { key: 'primaryColor', label: 'Primary' },
          { key: 'secondaryColor', label: 'Secondary' },
          { key: 'accentColor', label: 'Accent' },
          { key: 'backgroundColor', label: 'Background' },
          { key: 'surfaceColor', label: 'Surface' },
          { key: 'textColor', label: 'Text' },
        ].map((color) => (
          <div key={color.key} className="color-item">
            <input
              type="color"
              value={form[color.key]}
              onChange={(e) => setForm({ ...form, [color.key]: e.target.value })}
            />
            <span>{color.label}</span>
          </div>
        ))}
      </div>

      <h3>Typography</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Heading Font</label>
          <select
            value={form.headingFont}
            onChange={(e) => setForm({ ...form, headingFont: e.target.value })}
          >
            <option value="Inter">Inter</option>
            <option value="Poppins">Poppins</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Playfair Display">Playfair Display</option>
          </select>
        </div>
        <div className="form-group">
          <label>Border Radius</label>
          <select
            value={form.borderRadius}
            onChange={(e) => setForm({ ...form, borderRadius: e.target.value })}
          >
            <option value="none">None</option>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="full">Full</option>
          </select>
        </div>
      </div>

      <h3>Content</h3>
      <div className="form-group">
        <label>Home Page Title</label>
        <input
          type="text"
          value={form.homePageTitle}
          onChange={(e) => setForm({ ...form, homePageTitle: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Home Page Subtitle</label>
        <input
          type="text"
          value={form.homePageSubtitle}
          onChange={(e) => setForm({ ...form, homePageSubtitle: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Footer Text</label>
        <input
          type="text"
          value={form.footerText}
          onChange={(e) => setForm({ ...form, footerText: e.target.value })}
        />
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      <style>{`
        .preset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .preset-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          cursor: pointer;
          color: var(--color-text);
          font-size: 0.75rem;
        }

        .preset-btn:hover {
          border-color: var(--color-primary);
        }

        .preset-preview {
          width: 60px;
          height: 40px;
          border-radius: 0.25rem;
          border: 2px solid;
          display: flex;
          align-items: flex-end;
          padding: 0.25rem;
        }

        .preset-accent {
          width: 100%;
          height: 8px;
          border-radius: 0.125rem;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .color-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .color-item input[type="color"] {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          background: none;
        }

        .color-item span {
          font-size: 0.875rem;
          color: var(--color-text);
        }
      `}</style>
    </div>
  );
}

// Payment Settings Tab
function PaymentSettings() {
  const queryClient = useQueryClient();

  const { data: providers, isLoading } = useQuery({
    queryKey: ['payment-providers'],
    queryFn: async () => {
      const response = await adminApi.getPaymentProviders();
      return response.data || [];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ provider, enabled }) => adminApi.togglePaymentProvider(provider, enabled),
    onSuccess: () => queryClient.invalidateQueries(['payment-providers']),
  });

  if (isLoading) {
    return <div>Loading payment providers...</div>;
  }

  return (
    <div className="payment-settings">
      <h3>Payment Providers</h3>
      <p className="description">Enable and configure payment gateways</p>

      <div className="providers-list">
        {providers?.map((provider) => (
          <div key={provider.provider} className="provider-card">
            <div className="provider-header">
              <span className="provider-icon">
                {provider.provider === 'STRIPE' ? '💳' : 
                 provider.provider === 'PAYPAL' ? '🅿️' : 
                 provider.provider === 'HUBTEL' ? '📱' : '💵'}
              </span>
              <div className="provider-info">
                <span className="provider-name">{provider.displayName}</span>
                <span className="provider-currencies">
                  {provider.currencies?.join(', ') || 'All currencies'}
                </span>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={provider.enabled}
                  onChange={(e) => toggleMutation.mutate({
                    provider: provider.provider,
                    enabled: e.target.checked,
                  })}
                />
                <span className="toggle-slider" />
              </label>
            </div>
            {provider.enabled && provider.provider !== 'MANUAL' && (
              <div className="provider-config">
                <span className="config-status">
                  {provider.config ? '✓ Configured' : '⚠️ Needs configuration'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .payment-settings h3 {
          margin: 0 0 0.25rem;
        }

        .description {
          color: var(--color-text-muted);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .providers-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .provider-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .provider-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .provider-icon {
          font-size: 1.5rem;
        }

        .provider-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .provider-name {
          font-weight: 500;
          color: var(--color-text);
        }

        .provider-currencies {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .toggle {
          position: relative;
          width: 48px;
          height: 24px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          transition: 0.3s;
        }

        .toggle-slider::before {
          content: '';
          position: absolute;
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.3s;
        }

        .toggle input:checked + .toggle-slider {
          background: var(--color-primary);
        }

        .toggle input:checked + .toggle-slider::before {
          transform: translateX(24px);
        }

        .provider-config {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .config-status {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
}

// Feature Settings Tab
function FeatureSettings({ config, onSave }) {
  const [form, setForm] = useState({
    enablePayments: config?.enablePayments ?? true,
    enableQrCodes: config?.enableQrCodes ?? true,
    enablePdfTickets: config?.enablePdfTickets ?? true,
    enablePublicEventList: config?.enablePublicEventList ?? true,
    enableTicketLookup: config?.enableTicketLookup ?? true,
    maintenanceMode: config?.maintenanceMode ?? false,
  });

  const handleSave = () => {
    onSave(form);
  };

  const features = [
    { key: 'enablePayments', label: 'Online Payments', desc: 'Allow online payment processing' },
    { key: 'enableQrCodes', label: 'QR Codes', desc: 'Generate QR codes for tickets' },
    { key: 'enablePdfTickets', label: 'PDF Tickets', desc: 'Allow PDF ticket downloads' },
    { key: 'enablePublicEventList', label: 'Public Event List', desc: 'Show events to public visitors' },
    { key: 'enableTicketLookup', label: 'Ticket Lookup', desc: 'Allow users to look up their tickets' },
    { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Show maintenance page to visitors' },
  ];

  return (
    <div className="settings-form">
      <h3>Feature Toggles</h3>
      <p className="description">Enable or disable platform features</p>

      <div className="features-list">
        {features.map((feature) => (
          <div key={feature.key} className="feature-item">
            <div className="feature-info">
              <span className="feature-label">{feature.label}</span>
              <span className="feature-desc">{feature.desc}</span>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={form[feature.key]}
                onChange={(e) => setForm({ ...form, [feature.key]: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>

      <style>{`
        .description {
          color: var(--color-text-muted);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 0.5rem;
        }

        .feature-info {
          display: flex;
          flex-direction: column;
        }

        .feature-label {
          font-weight: 500;
          color: var(--color-text);
        }

        .feature-desc {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .toggle {
          position: relative;
          width: 48px;
          height: 24px;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          transition: 0.3s;
        }

        .toggle-slider::before {
          content: '';
          position: absolute;
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.3s;
        }

        .toggle input:checked + .toggle-slider {
          background: var(--color-primary);
        }

        .toggle input:checked + .toggle-slider::before {
          transform: translateX(24px);
        }
      `}</style>
    </div>
  );
}

