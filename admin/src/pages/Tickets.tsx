import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { formatDate, formatCurrency } from '../lib/utils';
import {
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500',
  PAID: 'bg-green-500/10 text-green-500',
  USED: 'bg-blue-500/10 text-blue-500',
  CANCELLED: 'bg-red-500/10 text-red-500',
  REFUNDED: 'bg-purple-500/10 text-purple-500',
};

export function TicketsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', { search, status: statusFilter, page }],
    queryFn: () =>
      ticketsApi.list({
        query: search || undefined,
        status: statusFilter || undefined,
        page,
        limit: 20,
      }),
  });

  const verifyMutation = useMutation({
    mutationFn: ticketsApi.verify,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ticketsApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  const tickets = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">
            {pagination.total} total tickets
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or ticket ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="USED">Used</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreate && (
        <TicketForm
          onClose={() => setShowCreate(false)}
          onSubmit={async (data) => {
            await ticketsApi.create(data);
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            setShowCreate(false);
          }}
        />
      )}

      {/* Tickets Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left text-sm font-medium">Ticket ID</th>
                <th className="h-12 px-4 text-left text-sm font-medium">Name</th>
                <th className="h-12 px-4 text-left text-sm font-medium">Phone</th>
                <th className="h-12 px-4 text-left text-sm font-medium">Status</th>
                <th className="h-12 px-4 text-left text-sm font-medium">Amount</th>
                <th className="h-12 px-4 text-left text-sm font-medium">Created</th>
                <th className="h-12 px-4 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-muted-foreground">
                    No tickets found
                  </td>
                </tr>
              ) : (
                tickets.map((ticket: any) => (
                  <tr key={ticket.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <span className="font-mono text-sm">{ticket.ticketId}</span>
                    </td>
                    <td className="p-4">{ticket.name}</td>
                    <td className="p-4 font-mono text-sm">{ticket.phone}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4">{formatCurrency(ticket.amount)}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {ticket.status === 'PAID' && !ticket.used && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => verifyMutation.mutate(ticket.ticketId)}
                            title="Check In"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        {ticket.status === 'PAID' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Cancel this ticket?')) {
                                cancelMutation.mutate(ticket.ticketId);
                              }
                            }}
                            title="Cancel"
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function TicketForm({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    amount: '',
    status: 'PAID',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        amount: formData.amount ? parseInt(formData.amount) * 100 : 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Ticket</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email (optional)</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="50.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </CardContent>
          <div className="flex justify-end gap-2 p-6 pt-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

