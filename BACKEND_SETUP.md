# PostgreSQL Backend Setup Guide

Complete guide to set up the PostgreSQL backend for the Corporate Travel Admin Portal.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Step-by-Step Setup

### 1. Install PostgreSQL

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run installer and remember your postgres user password
- Default port: 5432

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Windows: Open SQL Shell (psql) from Start Menu
# Mac/Linux: Open terminal

# Login as postgres user
psql -U postgres

# Create database
CREATE DATABASE travel_admin;

# Create user (optional)
CREATE USER travel_admin_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE travel_admin TO travel_admin_user;

# Exit
\q
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env file with your credentials
```

Example `.env`:
```
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/travel_admin
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
```

### 5. Run Database Migrations

```bash
# From server directory
psql -U postgres -d travel_admin -f migrations/schema.sql
```

Or on Windows:
```bash
# Open SQL Shell (psql)
# Connect to travel_admin database
\c travel_admin

# Run schema file
\i C:/path/to/ADMIN-employee/server/migrations/schema.sql
```

### 6. Start Backend Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
🚀 Server running on port 5000
📊 Environment: development
🔗 API: http://localhost:5000/api
✅ Connected to PostgreSQL database
```

### 7. Test API

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test trips endpoint
curl http://localhost:5000/api/trips
```

### 8. Configure Frontend

```bash
# In ADMIN-employee root directory
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 9. Update Frontend Code

The API client is ready at `src/api/client.js`. Example usage:

```javascript
import api from './api/client';

// Get all trips
const trips = await api.getTrips();

// Create new trip
const newTrip = await api.createTrip({
  requester: 'John Doe',
  requesterEmail: 'john@example.com',
  department: 'Sales',
  destination: 'New York',
  start: '2025-11-01',
  end: '2025-11-05',
  purpose: 'Client meeting',
  costEstimate: 3000,
  riskLevel: 'Low'
});

// Approve trip
await api.approveTrip(tripId, 'Manager', 'Approved for conference');
```

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
- Check if PostgreSQL is running: `pg_isready`
- Start PostgreSQL service
- Verify DATABASE_URL in .env

### Authentication Failed

```
Error: password authentication failed for user "postgres"
```

**Solution:**
- Check password in DATABASE_URL
- Reset postgres password if needed

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
- Change PORT in .env to different port (e.g., 5001)
- Or kill process using port 5000

### Schema Migration Errors

**Solution:**
- Drop and recreate database:
```sql
DROP DATABASE travel_admin;
CREATE DATABASE travel_admin;
```
- Run migrations again

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Trips
- `GET /trips` - List all trips
- `GET /trips/:id` - Get trip details
- `POST /trips` - Create trip
- `PUT /trips/:id` - Update trip
- `POST /trips/:id/approve` - Approve trip
- `POST /trips/:id/reject` - Reject trip
- `DELETE /trips/:id` - Delete trip

#### Analytics
- `GET /analytics/summary` - Get dashboard analytics

#### Policies
- `GET /policies` - List policies
- `POST /policies` - Create policy

#### Expenses
- `GET /expenses` - List expenses
- `POST /expenses` - Create expense

#### Advisories
- `GET /advisories` - List advisories
- `POST /advisories` - Create advisory

#### Destinations
- `GET /destinations` - List destinations
- `POST /destinations` - Create destination

#### Travelers
- `GET /travelers` - List travelers
- `POST /travelers` - Create traveler
- `PUT /travelers/:id/checkin` - Check-in

#### Notifications
- `GET /notifications` - List notifications
- `POST /notifications` - Create notification

## Next Steps

1. **Migrate Frontend Components**: Update each component to use API instead of localStorage
2. **Add Authentication**: Implement JWT-based auth
3. **Add Validation**: Add input validation on backend
4. **Error Handling**: Improve error handling in frontend
5. **Loading States**: Add loading indicators
6. **Caching**: Implement data caching strategy
7. **Real-time Updates**: Add WebSocket support for live updates

## Production Deployment

1. Use environment variables for all secrets
2. Enable SSL for database connection
3. Set up proper CORS configuration
4. Add rate limiting
5. Implement authentication middleware
6. Use PM2 or similar for process management
7. Set up database backups
8. Monitor with logging service

## Support

For issues or questions, check:
- Server logs in terminal
- PostgreSQL logs
- Browser console for frontend errors
- Network tab for API requests
