# Corporate Travel Admin Portal - Backend API

PostgreSQL-backed REST API for the Corporate Travel Admin Portal.

## Setup Instructions

### 1. Install PostgreSQL

Download and install PostgreSQL from https://www.postgresql.org/download/

### 2. Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE travel_admin;

# Exit psql
\q
```

### 3. Install Dependencies

```bash
cd server
npm install
```

### 4. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/travel_admin
```

### 5. Run Database Migrations

```bash
# Run the schema SQL file
psql -U postgres -d travel_admin -f migrations/schema.sql
```

### 6. Start Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run on http://localhost:5000

## API Endpoints

### Trips
- `GET /api/trips` - Get all trips (with filters)
- `GET /api/trips/:id` - Get single trip
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `POST /api/trips/:id/approve` - Approve trip
- `POST /api/trips/:id/reject` - Reject trip
- `POST /api/trips/:id/comments` - Add comment
- `DELETE /api/trips/:id` - Delete trip

### Analytics
- `GET /api/analytics/summary` - Get analytics summary

### Policies
- `GET /api/policies` - Get all policies
- `GET /api/policies/:id` - Get single policy
- `POST /api/policies` - Create policy

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense

### Advisories
- `GET /api/advisories` - Get all advisories
- `POST /api/advisories` - Create advisory

### Destinations
- `GET /api/destinations` - Get all destinations
- `POST /api/destinations` - Create destination

### Travelers
- `GET /api/travelers` - Get all travelers
- `POST /api/travelers` - Create traveler
- `PUT /api/travelers/:id/checkin` - Check-in traveler

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification

## Database Schema

See `migrations/schema.sql` for complete database schema including:
- Users
- Trips (with timeline, comments, attachments)
- Policies
- Expenses
- Advisories
- Destinations
- Travelers
- Notifications
- Insurance Policies
- Alerts

## Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test trips endpoint
curl http://localhost:5000/api/trips
```

## Frontend Integration

Update frontend to use API instead of localStorage. Example:

```javascript
// Before (localStorage)
const trips = JSON.parse(localStorage.getItem('trips'));

// After (API)
const response = await fetch('http://localhost:5000/api/trips');
const trips = await response.json();
```

## Production Deployment

1. Set `NODE_ENV=production` in .env
2. Use environment variables for sensitive data
3. Enable SSL for database connection
4. Set up proper CORS origins
5. Add rate limiting and authentication
6. Use a process manager like PM2

## Security Notes

- Change JWT_SECRET in production
- Use HTTPS in production
- Implement proper authentication
- Add input validation
- Use prepared statements (already implemented)
- Enable database SSL in production
