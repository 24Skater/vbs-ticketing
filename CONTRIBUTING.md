# Contributing to VBS Ticketing

Thank you for your interest in contributing to VBS Ticketing! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for everyone. We expect all contributors to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or insults
- Publishing private information without consent
- Any conduct inappropriate in a professional setting

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Git

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/vbs-ticketing.git
   cd vbs-ticketing
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original/vbs-ticketing.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

5. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

6. **Setup database**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

7. **Start development**
   ```bash
   npm run dev
   ```

---

## Development Workflow

### Branching Strategy

We use a simplified Git Flow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation changes

### Creating a Branch

```bash
# Sync with upstream
git fetch upstream
git checkout develop
git merge upstream/develop

# Create your branch
git checkout -b feature/your-feature-name
```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

Examples:
```bash
feat(tickets): add bulk import from CSV
fix(auth): resolve token refresh issue
docs(api): update payment endpoints
```

---

## Pull Request Process

### Before Submitting

1. **Ensure tests pass**
   ```bash
   npm test
   ```

2. **Run linting**
   ```bash
   npm run lint
   ```

3. **Type check**
   ```bash
   npm run typecheck
   ```

4. **Update documentation** if needed

### Submitting a PR

1. Push your branch to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request against the `develop` branch

3. Fill out the PR template with:
   - Description of changes
   - Related issues
   - Screenshots (if UI changes)
   - Testing steps

4. Wait for review

### Review Process

- At least one maintainer must approve
- All CI checks must pass
- Address any requested changes
- Squash commits if requested

---

## Coding Standards

### TypeScript

```typescript
// Use explicit types
function processTicket(ticket: Ticket): TicketResult {
  // ...
}

// Use interfaces for objects
interface TicketData {
  id: string;
  name: string;
  amount: number;
}

// Use enums for fixed values
enum TicketStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  USED = 'USED',
}
```

### JavaScript (React)

```jsx
// Use functional components
export default function TicketCard({ ticket }) {
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="ticket-card">
      {/* ... */}
    </div>
  );
}

// Destructure props
function Button({ variant = 'primary', children, ...props }) {
  // ...
}
```

### CSS

```css
/* Use CSS variables */
.component {
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius);
}

/* BEM-like naming */
.ticket-card { }
.ticket-card__header { }
.ticket-card--highlighted { }
```

### File Organization

```
src/
├── controllers/     # HTTP handlers
├── services/        # Business logic
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── validators/      # Zod schemas
├── utils/           # Helpers
└── types/           # TypeScript types
```

---

## Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber } from '../phone';

describe('normalizePhoneNumber', () => {
  it('should normalize US phone numbers', () => {
    expect(normalizePhoneNumber('212-555-1234', 'US')).toBe('+12125551234');
  });

  it('should return null for invalid numbers', () => {
    expect(normalizePhoneNumber('123')).toBeNull();
  });
});
```

### Test Categories

- **Unit tests**: Test individual functions/modules
- **Integration tests**: Test API endpoints
- **E2E tests**: Test user workflows (Playwright)

---

## Documentation

### Code Comments

```typescript
/**
 * Process a payment through the specified provider
 * 
 * @param request - Payment request details
 * @returns Payment result with status and transaction ID
 * @throws PaymentError if provider is unavailable
 * 
 * @example
 * const result = await processPayment({
 *   amount: 5000,
 *   currency: 'USD',
 *   provider: 'stripe'
 * });
 */
async function processPayment(request: PaymentRequest): Promise<PaymentResult> {
  // ...
}
```

### API Documentation

Update `docs/API.md` for any API changes:

```markdown
### POST /api/tickets

Create a new ticket.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Attendee name |
| phone | string | Yes | Phone number |

**Response:**
```json
{
  "success": true,
  "data": { "ticketId": "VBS-ABC123" }
}
```
```

---

## Questions?

- Open a [GitHub Discussion](https://github.com/yourusername/vbs-ticketing/discussions)
- Check [existing issues](https://github.com/yourusername/vbs-ticketing/issues)
- Read the [documentation](docs/)

Thank you for contributing! 🎉

