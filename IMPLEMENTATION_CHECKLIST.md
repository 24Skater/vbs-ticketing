# VBS Ticketing - Implementation Checklist

> **Quick Reference for AI Agents and Developers**
> 
> This is a condensed version of `MODERNIZATION_PLAN.md` for quick progress tracking.

---

## 🚦 Current Status

| Phase | Status | Progress |
|-------|--------|----------|
| 0. Preparation | ⬜ | 0% |
| 1. Security | ⬜ | 0% |
| 2. Structure | ⬜ | 0% |
| 3. Database | ⬜ | 0% |
| 4. Backend | ⬜ | 0% |
| 5. Frontend | ⬜ | 0% |
| 6. Testing | ⬜ | 0% |
| 7. DevOps | ⬜ | 0% |
| 8. Features | ⬜ | 0% |

**Legend:** ⬜ Not Started | 🔄 In Progress | ✅ Completed | ❌ Blocked

---

## ⚠️ AI AGENT RULES

```
1. NEVER skip steps
2. ALWAYS validate before proceeding
3. CREATE backups before destructive operations
4. RUN tests after each step
5. UPDATE this checklist as you complete items
6. STOP and ASK if unclear
7. ROLLBACK if validation fails
```

---

## Phase 0: Preparation

- [ ] 0.1.1 Document current state
- [ ] 0.1.2 Create git backup with tag `v1.0.0-legacy`
- [ ] 0.1.3 Verify dev environment (Node 20+, Docker, PostgreSQL)
- [ ] 0.2.1 Create directory structure
- [ ] 0.2.2 Configure TypeScript (`tsconfig.json`)
- [ ] 0.2.3 Update `package.json` with new scripts
- [ ] 0.2.4 Install all new dependencies

**Validation:** `npm run typecheck` passes

---

## Phase 1: Security

- [ ] 1.1.1 Create `src/config/env.ts` with Zod validation
- [ ] 1.1.2 Create `.env.example` with all variables
- [ ] 1.2.1 Create `src/utils/password.ts` (bcrypt)
- [ ] 1.2.2 Create `src/utils/jwt.ts` (JWT tokens)
- [ ] 1.2.3 Create `src/middleware/auth.middleware.ts`
- [ ] 1.3.1 Create `src/validators/*.ts` (Zod schemas)
- [ ] 1.3.2 Create `src/middleware/validate.middleware.ts`
- [ ] 1.4.1 Create `src/middleware/rateLimit.middleware.ts`
- [ ] 1.4.2 Create `src/middleware/security.middleware.ts` (Helmet, CORS)
- [ ] 1.4.3 Create `src/middleware/errorHandler.middleware.ts`
- [ ] 1.5.1 Create `src/utils/logger.ts` (Winston)

**Validation:** All middleware working, security headers present

---

## Phase 2: Code Structure

- [ ] 2.1.1 Create `src/utils/prisma.ts`
- [ ] 2.1.2 Create `src/utils/generators.ts`
- [ ] 2.1.3 Create `src/utils/phone.ts`
- [ ] 2.2.1 Create `src/services/ticket.service.ts`
- [ ] 2.2.2 Create `src/services/auth.service.ts`
- [ ] 2.3.1 Create `src/controllers/ticket.controller.ts`
- [ ] 2.3.2 Create `src/controllers/auth.controller.ts`
- [ ] 2.4.1 Create `src/routes/ticket.routes.ts`
- [ ] 2.4.2 Create `src/routes/auth.routes.ts`

**Validation:** TypeScript compiles, all imports resolve

---

## Phase 3: Database

- [ ] 3.1.1 Backup current database
- [ ] 3.1.2 Create new Prisma schema with proper models
- [ ] 3.1.3 Run `prisma migrate dev`
- [ ] 3.1.4 Create and run data migration script

**Validation:** Data migrated, new schema working

---

## Phase 4: Backend

- [ ] 4.1.1 Create `src/server.ts` with all middleware
- [ ] 4.1.2 Connect all routes
- [ ] 4.1.3 Test all API endpoints
- [ ] 4.1.4 Verify frontend still served

**Validation:** All endpoints responding correctly

---

## Phase 5: Frontend

- [ ] 5.1.1 Update dependencies (TanStack Query, etc.)
- [ ] 5.1.2 Create type-safe API client
- [ ] 5.1.3 Add loading/error states
- [ ] 5.1.4 Improve accessibility

**Validation:** Frontend builds and works correctly

---

## Phase 6: Testing

- [ ] 6.1.1 Configure Vitest
- [ ] 6.1.2 Write unit tests (utilities, validators)
- [ ] 6.1.3 Write integration tests (API endpoints)
- [ ] 6.1.4 Achieve >80% code coverage

**Validation:** All tests passing

---

## Phase 7: DevOps

- [ ] 7.1.1 Create Dockerfile
- [ ] 7.1.2 Create docker-compose.yml
- [ ] 7.1.3 Create GitHub Actions CI/CD workflow
- [ ] 7.1.4 Test deployment pipeline

**Validation:** Container builds, CI passes

---

## Phase 8: Features

- [ ] 8.1.1 Multi-event support
- [ ] 8.1.2 Email notifications
- [ ] 8.1.3 Real-time dashboard (WebSocket)
- [ ] 8.1.4 Analytics & reporting

**Validation:** All new features working

---

## 🏁 Final Validation

- [ ] All tests passing
- [ ] No security vulnerabilities
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Old code removed
- [ ] Production deployment tested

---

## 📁 Files to Create (Reference)

```
src/
├── config/
│   └── env.ts                    # Phase 1
├── controllers/
│   ├── auth.controller.ts        # Phase 2
│   ├── ticket.controller.ts      # Phase 2
│   ├── payment.controller.ts     # Phase 4
│   └── webhook.controller.ts     # Phase 4
├── middleware/
│   ├── auth.middleware.ts        # Phase 1
│   ├── errorHandler.middleware.ts # Phase 1
│   ├── rateLimit.middleware.ts   # Phase 1
│   ├── security.middleware.ts    # Phase 1
│   └── validate.middleware.ts    # Phase 1
├── routes/
│   ├── auth.routes.ts            # Phase 2
│   ├── ticket.routes.ts          # Phase 2
│   ├── payment.routes.ts         # Phase 4
│   └── webhook.routes.ts         # Phase 4
├── services/
│   ├── auth.service.ts           # Phase 2
│   ├── ticket.service.ts         # Phase 2
│   ├── hubtel.service.ts         # Phase 4
│   └── pdf.service.ts            # Phase 4
├── utils/
│   ├── generators.ts             # Phase 2
│   ├── jwt.ts                    # Phase 1
│   ├── logger.ts                 # Phase 1
│   ├── password.ts               # Phase 1
│   ├── phone.ts                  # Phase 2
│   └── prisma.ts                 # Phase 2
├── validators/
│   ├── auth.validator.ts         # Phase 1
│   ├── ticket.validator.ts       # Phase 1
│   └── payment.validator.ts      # Phase 4
├── types/
│   └── index.ts                  # Phase 2
└── server.ts                     # Phase 4
```

---

## 🆘 Emergency Commands

```bash
# Rollback to legacy version
git checkout v1.0.0-legacy

# Restore database backup
psql -U vbs -d vbs_ticketing < backup_YYYYMMDD.sql

# Kill all node processes
pkill -f node

# Restart PostgreSQL container
docker restart vbs-postgres
```

---

**Last Updated:** _Update this when making changes_

