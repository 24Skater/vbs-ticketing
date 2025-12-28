/**
 * Branding & Theming Admin Page
 * Configure logos, colors, fonts, and visual appearance
 */

import { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../lib/api';
import { Button, Input, Card, Alert, Spinner } from '../../components/ui';

// Theme presets matching backend
const THEME_PRESETS = {
  dark: { name: 'Dark', colors: { primary: '#3b82f6', bg: '#0f172a' } },
  light: { name: 'Light', colors: { primary: '#2563eb', bg: '#ffffff' } },
  midnight: { name: 'Midnight', colors: { primary: '#8b5cf6', bg: '#0c0a1d' } },
  forest: { name: 'Forest', colors: { primary: '#22c55e', bg: '#052e16' } },
  ocean: { name: 'Ocean', colors: { primary: '#06b6d4', bg: '#0c4a6e' } },
  sunset: { name: 'Sunset', colors: { primary: '#f97316', bg: '#431407' } },
};

const FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Merriweather',
  'Raleway',
  'Nunito',
  'Source Sans Pro',
  'Oswald',
];

const BORDER_RADIUS_OPTIONS = [
  { value: 'none', label: 'Sharp (0px)' },
  { value: 'sm', label: 'Small (4px)' },
  { value: 'md', label: 'Medium (8px)' },
  { value: 'lg', label: 'Large (16px)' },
  { value: 'full', label: 'Pill (9999px)' },
];

export default function Branding() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('colors');
  
  const [branding, setBranding] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#1e293b',
    accentColor: '#10b981',
    backgroundColor: '#0f172a',
    surfaceColor: '#1e293b',
    textColor: '#f8fafc',
    textMutedColor: '#94a3b8',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    borderRadius: 'md',
    logoUrl: null,
    logoDarkUrl: null,
    faviconUrl: null,
    heroImageUrl: null,
    customCss: '',
  });
  
  const [uploads, setUploads] = useState({
    logo: null,
    logoDark: null,
    favicon: null,
    hero: null,
  });

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/config/admin');
      const config = response.data.data;
      
      setBranding({
        primaryColor: config.primaryColor || '#3b82f6',
        secondaryColor: config.secondaryColor || '#1e293b',
        accentColor: config.accentColor || '#10b981',
        backgroundColor: config.backgroundColor || '#0f172a',
        surfaceColor: config.surfaceColor || '#1e293b',
        textColor: config.textColor || '#f8fafc',
        textMutedColor: config.textMutedColor || '#94a3b8',
        headingFont: config.headingFont || 'Inter',
        bodyFont: config.bodyFont || 'Inter',
        borderRadius: config.borderRadius || 'md',
        logoUrl: config.logoUrl,
        logoDarkUrl: config.logoDarkUrl,
        faviconUrl: config.faviconUrl,
        heroImageUrl: config.heroImageUrl,
        customCss: config.customCss || '',
      });
    } catch (err) {
      setError('Failed to load branding settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      await adminApi.patch('/config/admin', branding);
      
      setSuccess('Branding settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePresetApply = async (presetKey) => {
    try {
      setSaving(true);
      setError(null);
      
      // Apply preset via API
      const response = await adminApi.post('/config/admin/theme-preset', {
        preset: presetKey,
      });
      
      if (response.data.success) {
        await loadBranding();
        setSuccess(`Applied ${THEME_PRESETS[presetKey].name} theme!`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      // If endpoint doesn't exist, apply locally
      const preset = THEME_PRESETS[presetKey];
      if (preset) {
        const presetColors = {
          dark: {
            primaryColor: '#3b82f6',
            secondaryColor: '#1e293b',
            accentColor: '#10b981',
            backgroundColor: '#0f172a',
            surfaceColor: '#1e293b',
            textColor: '#f8fafc',
            textMutedColor: '#94a3b8',
          },
          light: {
            primaryColor: '#2563eb',
            secondaryColor: '#f1f5f9',
            accentColor: '#059669',
            backgroundColor: '#ffffff',
            surfaceColor: '#f8fafc',
            textColor: '#0f172a',
            textMutedColor: '#64748b',
          },
          midnight: {
            primaryColor: '#8b5cf6',
            secondaryColor: '#1e1b4b',
            accentColor: '#f472b6',
            backgroundColor: '#0c0a1d',
            surfaceColor: '#1e1b4b',
            textColor: '#e2e8f0',
            textMutedColor: '#a78bfa',
          },
          forest: {
            primaryColor: '#22c55e',
            secondaryColor: '#14532d',
            accentColor: '#84cc16',
            backgroundColor: '#052e16',
            surfaceColor: '#14532d',
            textColor: '#f0fdf4',
            textMutedColor: '#86efac',
          },
          ocean: {
            primaryColor: '#06b6d4',
            secondaryColor: '#164e63',
            accentColor: '#0ea5e9',
            backgroundColor: '#0c4a6e',
            surfaceColor: '#155e75',
            textColor: '#ecfeff',
            textMutedColor: '#67e8f9',
          },
          sunset: {
            primaryColor: '#f97316',
            secondaryColor: '#7c2d12',
            accentColor: '#fbbf24',
            backgroundColor: '#431407',
            surfaceColor: '#7c2d12',
            textColor: '#fff7ed',
            textMutedColor: '#fdba74',
          },
        };
        
        setBranding(prev => ({
          ...prev,
          ...presetColors[presetKey],
        }));
        setSuccess(`Applied ${preset.name} theme (save to persist)!`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (type, file) => {
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const endpoint = type === 'logo' || type === 'logoDark' 
        ? '/uploads/logo'
        : type === 'favicon'
        ? '/uploads/favicon'
        : '/uploads/hero';
      
      const response = await adminApi.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (response.data.success) {
        const url = response.data.data.url;
        
        // Update branding with new URL
        const fieldMap = {
          logo: 'logoUrl',
          logoDark: 'logoDarkUrl',
          favicon: 'faviconUrl',
          hero: 'heroImageUrl',
        };
        
        setBranding(prev => ({
          ...prev,
          [fieldMap[type]]: url,
        }));
        
        setSuccess(`${type} uploaded successfully!`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(`Failed to upload ${type}: ${err.response?.data?.error || err.message}`);
    }
  };

  const updateColor = (field, value) => {
    setBranding(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="branding-page">
        <div className="loading-container">
          <Spinner size="lg" />
          <p>Loading branding settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="branding-page">
      <header className="page-header">
        <h1>Branding & Theming</h1>
        <p>Customize the look and feel of your ticketing platform</p>
      </header>

      {error && <Alert variant="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Tabs */}
      <div className="branding-tabs">
        {['colors', 'typography', 'logos', 'presets', 'custom'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="branding-content">
        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="tab-panel">
            <Card>
              <h3>Color Palette</h3>
              <div className="color-grid">
                <ColorPicker
                  label="Primary Color"
                  value={branding.primaryColor}
                  onChange={(v) => updateColor('primaryColor', v)}
                  description="Main brand color for buttons, links, and accents"
                />
                <ColorPicker
                  label="Secondary Color"
                  value={branding.secondaryColor}
                  onChange={(v) => updateColor('secondaryColor', v)}
                  description="Used for cards, panels, and secondary elements"
                />
                <ColorPicker
                  label="Accent Color"
                  value={branding.accentColor}
                  onChange={(v) => updateColor('accentColor', v)}
                  description="Highlight color for success states and CTAs"
                />
                <ColorPicker
                  label="Background Color"
                  value={branding.backgroundColor}
                  onChange={(v) => updateColor('backgroundColor', v)}
                  description="Main page background"
                />
                <ColorPicker
                  label="Surface Color"
                  value={branding.surfaceColor}
                  onChange={(v) => updateColor('surfaceColor', v)}
                  description="Cards and elevated surfaces"
                />
                <ColorPicker
                  label="Text Color"
                  value={branding.textColor}
                  onChange={(v) => updateColor('textColor', v)}
                  description="Primary text color"
                />
                <ColorPicker
                  label="Muted Text Color"
                  value={branding.textMutedColor}
                  onChange={(v) => updateColor('textMutedColor', v)}
                  description="Secondary/helper text"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <div className="tab-panel">
            <Card>
              <h3>Typography Settings</h3>
              <div className="typography-grid">
                <div className="form-group">
                  <label>Heading Font</label>
                  <select
                    value={branding.headingFont}
                    onChange={(e) => setBranding(prev => ({ ...prev, headingFont: e.target.value }))}
                    className="select-input"
                  >
                    {FONTS.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                  <p className="help-text">Used for page titles and section headers</p>
                </div>
                
                <div className="form-group">
                  <label>Body Font</label>
                  <select
                    value={branding.bodyFont}
                    onChange={(e) => setBranding(prev => ({ ...prev, bodyFont: e.target.value }))}
                    className="select-input"
                  >
                    {FONTS.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                  <p className="help-text">Used for body text and UI elements</p>
                </div>
                
                <div className="form-group">
                  <label>Border Radius</label>
                  <select
                    value={branding.borderRadius}
                    onChange={(e) => setBranding(prev => ({ ...prev, borderRadius: e.target.value }))}
                    className="select-input"
                  >
                    {BORDER_RADIUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <p className="help-text">Corner rounding for buttons, cards, inputs</p>
                </div>
              </div>
              
              <div className="typography-preview" style={{
                fontFamily: branding.bodyFont,
                backgroundColor: branding.surfaceColor,
                color: branding.textColor,
                borderRadius: branding.borderRadius === 'none' ? '0' : branding.borderRadius === 'sm' ? '4px' : branding.borderRadius === 'lg' ? '16px' : '8px',
              }}>
                <h2 style={{ fontFamily: branding.headingFont }}>Typography Preview</h2>
                <p>This is how your body text will look with the selected font settings.</p>
                <button style={{
                  backgroundColor: branding.primaryColor,
                  color: '#fff',
                  borderRadius: branding.borderRadius === 'none' ? '0' : branding.borderRadius === 'sm' ? '4px' : branding.borderRadius === 'lg' ? '16px' : branding.borderRadius === 'full' ? '9999px' : '8px',
                }}>
                  Sample Button
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Logos Tab */}
        {activeTab === 'logos' && (
          <div className="tab-panel">
            <Card>
              <h3>Logo & Images</h3>
              <div className="logos-grid">
                <FileUpload
                  label="Main Logo"
                  description="Light mode logo (recommended: PNG, max 500x200px)"
                  currentUrl={branding.logoUrl}
                  onUpload={(file) => handleFileUpload('logo', file)}
                  onRemove={() => setBranding(prev => ({ ...prev, logoUrl: null }))}
                />
                
                <FileUpload
                  label="Dark Mode Logo"
                  description="Logo for dark backgrounds (optional)"
                  currentUrl={branding.logoDarkUrl}
                  onUpload={(file) => handleFileUpload('logoDark', file)}
                  onRemove={() => setBranding(prev => ({ ...prev, logoDarkUrl: null }))}
                />
                
                <FileUpload
                  label="Favicon"
                  description="Browser tab icon (recommended: 64x64px PNG)"
                  currentUrl={branding.faviconUrl}
                  onUpload={(file) => handleFileUpload('favicon', file)}
                  onRemove={() => setBranding(prev => ({ ...prev, faviconUrl: null }))}
                />
                
                <FileUpload
                  label="Hero Background"
                  description="Home page hero image (recommended: 1920x1080px)"
                  currentUrl={branding.heroImageUrl}
                  onUpload={(file) => handleFileUpload('hero', file)}
                  onRemove={() => setBranding(prev => ({ ...prev, heroImageUrl: null }))}
                />
              </div>
            </Card>
          </div>
        )}

        {/* Presets Tab */}
        {activeTab === 'presets' && (
          <div className="tab-panel">
            <Card>
              <h3>Theme Presets</h3>
              <p className="help-text">Quick-start with a pre-designed color scheme</p>
              <div className="presets-grid">
                {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                  <div
                    key={key}
                    className="preset-card"
                    onClick={() => handlePresetApply(key)}
                    style={{
                      '--preset-bg': preset.colors.bg,
                      '--preset-primary': preset.colors.primary,
                    }}
                  >
                    <div className="preset-preview">
                      <div className="preset-bg" />
                      <div className="preset-primary" />
                    </div>
                    <span className="preset-name">{preset.name}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Custom CSS Tab */}
        {activeTab === 'custom' && (
          <div className="tab-panel">
            <Card>
              <h3>Custom CSS</h3>
              <p className="help-text">Advanced: Add custom CSS for fine-grained control</p>
              <textarea
                className="custom-css-editor"
                value={branding.customCss}
                onChange={(e) => setBranding(prev => ({ ...prev, customCss: e.target.value }))}
                placeholder={`/* Example: */
.ticket-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.hero-section {
  background-image: linear-gradient(135deg, var(--color-primary), var(--color-accent));
}`}
                rows={15}
              />
              <p className="warning-text">⚠️ Custom CSS can break the layout if not used carefully</p>
            </Card>
          </div>
        )}
      </div>

      {/* Live Preview */}
      <div className="live-preview">
        <h4>Live Preview</h4>
        <div 
          className="preview-box"
          style={{
            backgroundColor: branding.backgroundColor,
            color: branding.textColor,
            fontFamily: branding.bodyFont,
          }}
        >
          <div 
            className="preview-header"
            style={{ backgroundColor: branding.surfaceColor }}
          >
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="preview-logo" />
            ) : (
              <div className="preview-logo-placeholder" style={{ backgroundColor: branding.primaryColor }}>
                LOGO
              </div>
            )}
          </div>
          <div className="preview-content">
            <h3 style={{ fontFamily: branding.headingFont, color: branding.textColor }}>
              Event Tickets
            </h3>
            <p style={{ color: branding.textMutedColor }}>
              Get your tickets for upcoming events
            </p>
            <button 
              className="preview-btn"
              style={{ 
                backgroundColor: branding.primaryColor,
                borderRadius: branding.borderRadius === 'full' ? '9999px' : branding.borderRadius === 'lg' ? '16px' : branding.borderRadius === 'sm' ? '4px' : branding.borderRadius === 'none' ? '0' : '8px',
              }}
            >
              Get Tickets
            </button>
            <span 
              className="preview-accent" 
              style={{ color: branding.accentColor }}
            >
              ✓ Available Now
            </span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="branding-actions">
        <Button variant="secondary" onClick={loadBranding} disabled={saving}>
          Reset
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? <><Spinner size="sm" /> Saving...</> : 'Save Changes'}
        </Button>
      </div>

      <style>{`
        .branding-page {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .page-header {
          margin-bottom: 24px;
        }
        
        .page-header h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
        }
        
        .page-header p {
          color: var(--color-text-muted);
          margin: 0;
        }
        
        .branding-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          background: var(--color-surface);
          padding: 4px;
          border-radius: 8px;
          width: fit-content;
        }
        
        .tab-btn {
          padding: 10px 20px;
          border: none;
          background: transparent;
          color: var(--color-text-muted);
          cursor: pointer;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .tab-btn:hover {
          color: var(--color-text);
        }
        
        .tab-btn.active {
          background: var(--color-primary);
          color: white;
        }
        
        .branding-content {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
        }
        
        .tab-panel {
          min-width: 0;
        }
        
        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 16px;
        }
        
        .typography-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 16px;
        }
        
        .typography-preview {
          margin-top: 24px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        .typography-preview h2 {
          margin: 0 0 12px 0;
        }
        
        .typography-preview p {
          margin: 0 0 16px 0;
          opacity: 0.8;
        }
        
        .typography-preview button {
          padding: 10px 24px;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }
        
        .logos-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 16px;
        }
        
        .presets-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 16px;
        }
        
        .preset-card {
          cursor: pointer;
          padding: 16px;
          background: var(--color-surface);
          border-radius: 12px;
          border: 2px solid transparent;
          transition: all 0.2s;
          text-align: center;
        }
        
        .preset-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }
        
        .preset-preview {
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          margin-bottom: 8px;
        }
        
        .preset-bg {
          flex: 1;
          background: var(--preset-bg);
        }
        
        .preset-primary {
          width: 40%;
          background: var(--preset-primary);
        }
        
        .preset-name {
          font-weight: 500;
          font-size: 14px;
        }
        
        .custom-css-editor {
          width: 100%;
          font-family: 'Monaco', 'Consolas', monospace;
          font-size: 13px;
          padding: 16px;
          background: #0d1117;
          color: #e6edf3;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          resize: vertical;
          margin-top: 16px;
        }
        
        .warning-text {
          color: #f97316;
          font-size: 13px;
          margin-top: 8px;
        }
        
        .live-preview {
          position: sticky;
          top: 24px;
        }
        
        .live-preview h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-text-muted);
        }
        
        .preview-box {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        .preview-header {
          padding: 12px 16px;
          display: flex;
          align-items: center;
        }
        
        .preview-logo {
          height: 32px;
          width: auto;
        }
        
        .preview-logo-placeholder {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }
        
        .preview-content {
          padding: 24px;
          text-align: center;
        }
        
        .preview-content h3 {
          margin: 0 0 8px 0;
        }
        
        .preview-content p {
          margin: 0 0 16px 0;
          font-size: 14px;
        }
        
        .preview-btn {
          padding: 10px 24px;
          border: none;
          color: white;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 12px;
        }
        
        .preview-accent {
          display: block;
          font-size: 13px;
          font-weight: 500;
        }
        
        .branding-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .form-group label {
          font-weight: 500;
          font-size: 14px;
        }
        
        .select-input {
          padding: 10px 12px;
          background: var(--color-surface);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          color: var(--color-text);
          font-size: 14px;
        }
        
        .help-text {
          font-size: 13px;
          color: var(--color-text-muted);
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          gap: 16px;
        }
        
        @media (max-width: 1024px) {
          .branding-content {
            grid-template-columns: 1fr;
          }
          
          .live-preview {
            position: static;
            order: -1;
          }
          
          .typography-grid {
            grid-template-columns: 1fr;
          }
          
          .logos-grid {
            grid-template-columns: 1fr;
          }
          
          .presets-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

// Color Picker Component
function ColorPicker({ label, value, onChange, description }) {
  const inputRef = useRef(null);
  
  return (
    <div className="color-picker">
      <label>{label}</label>
      <div className="color-input-row">
        <div 
          className="color-swatch"
          style={{ backgroundColor: value }}
          onClick={() => inputRef.current?.click()}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-hex-input"
        />
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-native-input"
        />
      </div>
      {description && <p className="color-description">{description}</p>}
      
      <style>{`
        .color-picker {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .color-picker label {
          font-weight: 500;
          font-size: 14px;
        }
        
        .color-input-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .color-swatch {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.2);
          transition: transform 0.2s;
        }
        
        .color-swatch:hover {
          transform: scale(1.05);
        }
        
        .color-hex-input {
          flex: 1;
          padding: 10px 12px;
          background: var(--color-surface);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          color: var(--color-text);
          font-family: monospace;
          font-size: 14px;
        }
        
        .color-native-input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }
        
        .color-description {
          font-size: 12px;
          color: var(--color-text-muted);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

// File Upload Component  
function FileUpload({ label, description, currentUrl, onUpload, onRemove }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };
  
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };
  
  return (
    <div className="file-upload">
      <label>{label}</label>
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''} ${currentUrl ? 'has-file' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !currentUrl && inputRef.current?.click()}
      >
        {currentUrl ? (
          <div className="uploaded-preview">
            <img src={currentUrl} alt={label} />
            <div className="upload-actions">
              <button 
                type="button" 
                className="change-btn"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              >
                Change
              </button>
              <button 
                type="button" 
                className="remove-btn"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-prompt">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Drop image here or click to upload</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>
      {description && <p className="upload-description">{description}</p>}
      
      <style>{`
        .file-upload {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .file-upload label {
          font-weight: 500;
          font-size: 14px;
        }
        
        .upload-zone {
          border: 2px dashed rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .upload-zone:hover {
          border-color: var(--color-primary);
          background: rgba(59, 130, 246, 0.05);
        }
        
        .upload-zone.drag-over {
          border-color: var(--color-primary);
          background: rgba(59, 130, 246, 0.1);
        }
        
        .upload-zone.has-file {
          cursor: default;
          padding: 12px;
        }
        
        .upload-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: var(--color-text-muted);
        }
        
        .upload-prompt span {
          font-size: 14px;
        }
        
        .uploaded-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
        }
        
        .uploaded-preview img {
          max-width: 100%;
          max-height: 100px;
          object-fit: contain;
          border-radius: 4px;
        }
        
        .upload-actions {
          display: flex;
          gap: 8px;
        }
        
        .change-btn, .remove-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .change-btn {
          background: var(--color-primary);
          color: white;
        }
        
        .remove-btn {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        
        .change-btn:hover {
          opacity: 0.9;
        }
        
        .remove-btn:hover {
          background: rgba(239, 68, 68, 0.3);
        }
        
        .upload-description {
          font-size: 12px;
          color: var(--color-text-muted);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

