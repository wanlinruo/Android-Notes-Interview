# Android Knowledge Hub

A full-stack knowledge base for Android developers, featuring structured notes, interview questions, learning progress tracking, and content import from external sources.

Built with Next.js 15, TypeScript, Prisma, PostgreSQL, and Tailwind CSS.

## Features

### For Learners

- **Knowledge Notes & Interview Questions** — Browse articles organized by category and difficulty (beginner / intermediate / advanced)
- **Full-text Search** — Search across titles and content powered by PostgreSQL
- **Learning Progress** — Track articles as unread, reading, or completed; view progress stats by category
- **Favorites** — Bookmark articles for quick access later
- **Comments** — Leave feedback or corrections on any article
- **Dark Mode** — Automatic or manual theme switching

### For Admins

- **Dashboard** — Overview of article counts, user stats, total views, and top favorited articles
- **Article Management** — Create, edit, and publish articles with a Markdown editor; filter by type, status, and category
- **Category & Tag Management** — Organize content with hierarchical categories and difficulty/topic tags
- **Content Import** — Paste any URL to automatically extract the article content, convert to Markdown, and save as a draft
- **User & Comment Management** — View registered users and moderate comments

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Auth | NextAuth.js v5 (email + password) |
| Styling | Tailwind CSS |
| Deployment | Docker + Nginx |

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose

### Development

```bash
# Clone the repo
git clone https://github.com/wanlinruo/Android-Notes-Interview.git
cd Android-Notes-Interview

# Copy environment variables
cp .env.example .env

# Start dev environment (PostgreSQL + Next.js)
docker compose -f docker-compose.dev.yml up -d

# Run database migrations and seed data
docker compose -f docker-compose.dev.yml exec app npx prisma migrate dev
docker compose -f docker-compose.dev.yml exec app npx prisma db seed
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Default admin account:**
- Email: `admin@example.com`
- Password: `admin123`

### Production

```bash
# Set your environment variables
export NEXTAUTH_SECRET="your-production-secret"
export NEXTAUTH_URL="https://your-domain.com"

# Build and start (includes Nginx reverse proxy)
docker compose up -d

# Run migrations
docker compose exec app npx prisma migrate deploy
```

## Project Structure

```
src/
  app/
    (pages)          # Homepage, notes, interviews, article detail, profile
    admin/           # Dashboard, article/category/tag/user/comment management, content import
    api/             # RESTful API routes
    login/, register/ # Auth pages
  components/        # Reusable UI components
  lib/               # Prisma client, auth config, import logic
prisma/
  schema.prisma      # Database schema (7 models)
  seed.ts            # Seed data with categories, tags, admin user
```

## Content Organization

Articles are organized along two dimensions:

1. **Categories** — Hierarchical modules like Components, Jetpack, Performance, Networking, Custom Views, Design Patterns
2. **Tags** — Difficulty levels (beginner / intermediate / advanced) and topic tags for cross-cutting concerns

## License

MIT
