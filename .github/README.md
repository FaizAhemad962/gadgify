# .github Documentation

This directory contains AI-focused documentation that helps developers (and AI assistants) understand and work with the Gadgify project effectively.

## 📚 Documentation Files

### 1. **AI_INSTRUCTIONS.md** (Start Here!)
Comprehensive guidelines for coding and development standards.
- Project overview and tech stack details
- Directory structure explanation
- Naming conventions for files, functions, and database models
- Code organization patterns
- Database schema patterns
- Authentication & security guidelines
- React Query patterns
- API response formats
- Common tasks and solutions
- Important rules (MUST DO & MUST NOT DO)

**Read when**: Starting a new feature or needing coding standards.

### 2. **AI_SKILLS.md** (Automation Capabilities)
Detailed breakdown of what AI can automate for this project.
- 10 skill categories with examples
- High-value automation tasks (quick wins to complex)
- How to request AI automation
- Limitations and when NOT to automate
- Performance and security considerations
- Continuous improvement tips

**Read when**: You want to request AI automation or understand AI capabilities.

### 3. **PROJECT_CONTEXT.md** (Architecture & Design)
Deep dive into project architecture and design decisions.
- Executive summary and vision
- Business requirements
- Complete technical architecture with diagrams
- Data flow examples (registration, purchase, product management)
- Database schema overview
- API endpoints listing
- Security architecture
- State management strategy
- Error handling strategy
- Performance considerations
- Scalability plan
- Key decision records (ADRs)

**Read when**: Understanding the big picture or making architectural decisions.

### 4. **CODE_PATTERNS.md** (Implementation Guide)
Ready-to-use code patterns and examples.
- Frontend patterns (hooks, API calls, components, tables)
- Backend patterns (controllers, services, validators, routes, middleware, error handling)
- Database patterns (Prisma models, migrations, queries)
- i18n patterns (setup and translation files)
- Testing patterns

**Read when**: Implementing a specific feature or unsure about the code structure.

### 5. **QUICK_REFERENCE.md** (Cheat Sheet)
Fast lookup for common questions and commands.
- Quick commands (npm, bash, database)
- 15+ FAQ with answers
- Tech stack lookup table
- Common patterns checklist
- File location reference
- Environment variables
- Common error solutions
- Debugging checklist
- Performance tips
- Security checklist

**Read when**: You need a quick answer or forgot a command.

### 6. **expert-fullstack-dev.agent.md** (AI Agent Instructions)
Describes the AI agent personality and capabilities for this project.
- Existing agent configuration for Gadgify development
- Baseline AI instructions for the project

**Read when**: Understanding how AI agents should approach this project.

## 🎯 How to Use These Files

### For New Features
1. Read **QUICK_REFERENCE.md** for file locations
2. Check **CODE_PATTERNS.md** for similar examples
3. Follow **AI_INSTRUCTIONS.md** for coding standards
4. Add i18n from **CODE_PATTERNS.md** → i18n section

### For Bug Fixes
1. Check **QUICK_REFERENCE.md** → Debugging Checklist
2. Review **PROJECT_CONTEXT.md** → Data Flow section
3. Look up error in **QUICK_REFERENCE.md** → Common Error Solutions

### For Architecture Decisions
1. Read **PROJECT_CONTEXT.md** → entire document
2. Review **AI_INSTRUCTIONS.md** → Important Rules section
3. Check **AI_SKILLS.md** → Limitations section

### For AI Automation
1. Read **AI_SKILLS.md** entirely
2. Check **QUICK_REFERENCE.md** → How to Request AI Automation
3. Provide clear requirements with context

### For Performance Optimization
1. **PROJECT_CONTEXT.md** → Performance Considerations
2. **AI_INSTRUCTIONS.md** → Common Tasks → Performance Optimization
3. **QUICK_REFERENCE.md** → Performance Quick Tips

### For Security Concerns
1. **AI_INSTRUCTIONS.md** → Authentication & Security section
2. **PROJECT_CONTEXT.md** → Security Architecture section
3. **QUICK_REFERENCE.md** → Security Quick Checklist

## 📊 Quick Navigation

| Need | File | Section |
|------|------|---------|
| Coding standards | AI_INSTRUCTIONS.md | Coding Conventions |
| Add new feature | CODE_PATTERNS.md | All sections |
| API endpoint details | PROJECT_CONTEXT.md | API Endpoints Overview |
| Form validation | CODE_PATTERNS.md | Frontend Patterns |
| Database model | CODE_PATTERNS.md | Database Patterns |
| Fix a bug | QUICK_REFERENCE.md | Common Error Solutions |
| Fast command | QUICK_REFERENCE.md | Quick Commands |
| Ask AI to automate | AI_SKILLS.md | All sections |
| Understand architecture | PROJECT_CONTEXT.md | Technical Architecture |

## 🔑 Key Principles

All documentation emphasizes:
- ✅ Type safety (TypeScript everywhere)
- ✅ Backend validation (never trust frontend)
- ✅ Maharashtra state validation (business requirement)
- ✅ Error handling (user-friendly messages)
- ✅ Security first (JWT, bcrypt, CORS, rate limiting)
- ✅ Code organization (consistent patterns)
- ✅ Internationalization (multi-language support)
- ✅ Performance (React.memo, database indexes, caching)

## 📝 Important Files

- Tech Stack: See **AI_INSTRUCTIONS.md** → Tech Stack
- Database: `../backend/prisma/schema.prisma`
- Frontend Root: `../frontend/src/App.tsx`
- Backend Root: `../backend/src/server.ts`
- Environment: `../backend/.env` (create from `.env.example`)

## 🚀 Get Started

### First Time?
1. Read this file completely
2. Skim **AI_INSTRUCTIONS.md**
3. Bookmark **QUICK_REFERENCE.md** for later
4. Read **CODE_PATTERNS.md** as you implement features

### Need to Automate Something?
1. Read **AI_SKILLS.md**
2. Describe clearly what you want to automate
3. Provide context and examples
4. Let AI reference these docs automatically

### Got an Error?
1. Check **QUICK_REFERENCE.md** → Common Error Solutions
2. Review **Debugging Checklist**
3. Trace through relevant **DATA_FLOW** in **PROJECT_CONTEXT.md**

## 📞 Questions About Documentation?

All documentation is designed to be self-contained. If you find:
- Missing information → Check QUICK_REFERENCE.md → "Need Help?" section
- Contradictions → Report in git issues
- Outdated content → Update timestamp and version at bottom of file

## 🔄 Keeping Documentation Updated

When you:
- **Add new features** → Update relevant `.md` file with new patterns
- **Change tech stack** → Update AI_INSTRUCTIONS.md and QUICK_REFERENCE.md
- **Discover new patterns** → Add to CODE_PATTERNS.md
- **Fix important bugs** → Document in QUICK_REFERENCE.md → Common Error Solutions
- **Make architectural decisions** → Document in PROJECT_CONTEXT.md → Key Decision Records

Update the version and last updated date at the bottom of each file.

---

**Documentation Version**: 1.0
**Created**: 2026-02-28
**Maintained By**: Gadgify Development Team

**Navigation**: Start with [AI_INSTRUCTIONS.md](AI_INSTRUCTIONS.md) or [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
