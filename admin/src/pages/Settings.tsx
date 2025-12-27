import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Save, Globe, DollarSign, Bell } from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'GHS', name: 'Ghana Cedi', symbol: '₵' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Africa/Accra',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'general' | 'localization' | 'features'>('general');

  const { data, isLoading } = useQuery({
    queryKey: ['config'],
    queryFn: configApi.getFull,
  });

  const updateMutation = useMutation({
    mutationFn: configApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });

  const config = data?.data || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your platform settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'general', label: 'General', icon: Globe },
          { id: 'localization', label: 'Localization', icon: DollarSign },
          { id: 'features', label: 'Features', icon: Bell },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <GeneralSettings config={config} onUpdate={updateMutation.mutate} isLoading={updateMutation.isPending} />
      )}

      {/* Localization Settings */}
      {activeTab === 'localization' && (
        <LocalizationSettings config={config} onUpdate={updateMutation.mutate} isLoading={updateMutation.isPending} />
      )}

      {/* Feature Settings */}
      {activeTab === 'features' && (
        <FeatureSettings config={config} onUpdate={updateMutation.mutate} isLoading={updateMutation.isPending} />
      )}
    </div>
  );
}

function GeneralSettings({
  config,
  onUpdate,
  isLoading,
}: {
  config: any;
  onUpdate: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    orgName: config.orgName || '',
    orgSlug: config.orgSlug || '',
    orgDescription: config.orgDescription || '',
    orgWebsite: config.orgWebsite || '',
    orgEmail: config.orgEmail || '',
    orgPhone: config.orgPhone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Information</CardTitle>
        <CardDescription>Basic information about your organization</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Name</label>
              <Input
                value={formData.orgName}
                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                placeholder="My Church"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={formData.orgSlug}
                onChange={(e) => setFormData({ ...formData, orgSlug: e.target.value })}
                placeholder="my-church"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={formData.orgDescription}
              onChange={(e) => setFormData({ ...formData, orgDescription: e.target.value })}
              placeholder="A brief description of your organization..."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Website</label>
              <Input
                type="url"
                value={formData.orgWebsite}
                onChange={(e) => setFormData({ ...formData, orgWebsite: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.orgEmail}
                onChange={(e) => setFormData({ ...formData, orgEmail: e.target.value })}
                placeholder="info@example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input
              value={formData.orgPhone}
              onChange={(e) => setFormData({ ...formData, orgPhone: e.target.value })}
              placeholder="+1 234 567 8900"
            />
          </div>
        </CardContent>
        <div className="flex justify-end p-6 pt-0">
          <Button type="submit" isLoading={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function LocalizationSettings({
  config,
  onUpdate,
  isLoading,
}: {
  config: any;
  onUpdate: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    currency: config.currency || 'USD',
    currencySymbol: config.currencySymbol || '$',
    timezone: config.timezone || 'UTC',
    dateFormat: config.dateFormat || 'MM/DD/YYYY',
    timeFormat: config.timeFormat || '12h',
  });

  const handleCurrencyChange = (code: string) => {
    const currency = CURRENCIES.find((c) => c.code === code);
    setFormData({
      ...formData,
      currency: code,
      currencySymbol: currency?.symbol || code,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Localization</CardTitle>
        <CardDescription>Configure currency, timezone, and date formats</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} - {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Format</label>
              <select
                value={formData.dateFormat}
                onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Format</label>
              <select
                value={formData.timeFormat}
                onChange={(e) => setFormData({ ...formData, timeFormat: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="12h">12 Hour (AM/PM)</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>
          </div>
        </CardContent>
        <div className="flex justify-end p-6 pt-0">
          <Button type="submit" isLoading={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function FeatureSettings({
  config,
  onUpdate,
  isLoading,
}: {
  config: any;
  onUpdate: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    enablePayments: config.enablePayments ?? true,
    enableQrCodes: config.enableQrCodes ?? true,
    enablePdfTickets: config.enablePdfTickets ?? true,
    enablePublicEventList: config.enablePublicEventList ?? true,
    enableTicketLookup: config.enableTicketLookup ?? true,
    maintenanceMode: config.maintenanceMode ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const toggles = [
    { key: 'enablePayments', label: 'Enable Payments', description: 'Allow online payment processing' },
    { key: 'enableQrCodes', label: 'QR Codes', description: 'Generate QR codes on tickets' },
    { key: 'enablePdfTickets', label: 'PDF Tickets', description: 'Allow PDF ticket downloads' },
    { key: 'enablePublicEventList', label: 'Public Event List', description: 'Show events on public pages' },
    { key: 'enableTicketLookup', label: 'Ticket Lookup', description: 'Allow public ticket lookup' },
    { key: 'maintenanceMode', label: 'Maintenance Mode', description: 'Disable public access temporarily', destructive: true },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Toggles</CardTitle>
        <CardDescription>Enable or disable platform features</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {toggles.map((toggle) => (
            <div key={toggle.key} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <p className={`font-medium ${toggle.destructive ? 'text-destructive' : ''}`}>
                  {toggle.label}
                </p>
                <p className="text-sm text-muted-foreground">{toggle.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, [toggle.key]: !formData[toggle.key as keyof typeof formData] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData[toggle.key as keyof typeof formData]
                    ? toggle.destructive
                      ? 'bg-destructive'
                      : 'bg-primary'
                    : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData[toggle.key as keyof typeof formData] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
        <div className="flex justify-end p-6 pt-0">
          <Button type="submit" isLoading={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

