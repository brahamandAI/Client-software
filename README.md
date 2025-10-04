# Railway Passenger Amenities Software

A comprehensive web application for managing railway station amenities, inspections, and issue tracking. Built with Next.js 14, TypeScript, MongoDB, and modern web technologies.

## 🚀 Features

### Core Functionality
- **Station Management**: Manage multiple railway stations with geographic locations
- **Amenity Management**: Track various passenger amenities (water booths, toilets, seating, lighting, fans, dustbins)
- **Inspections**: Daily inspection system with photo documentation and status reporting
- **Issue Tracking**: Comprehensive issue reporting and resolution workflow with priority levels
- **MIS Reports**: Generate daily/weekly/monthly metrics and analytics
- **Role-Based Access**: Secure access control with different user roles

### User Roles
- **SuperAdmin**: Full system access, can manage all stations and users
- **StationManager**: Manage assigned station, amenities, and staff
- **Staff**: Conduct inspections, report issues, manage assigned station
- **Public**: Read-only access to view station information

### Technical Features
- **Authentication**: NextAuth.js with JWT tokens and 24-hour expiration
- **File Upload**: Local file storage with Sharp image processing and thumbnails
- **Email Notifications**: Automated alerts for high-priority issues and overdue items
- **Real-time Updates**: React Query for efficient data fetching and caching
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation with Zod validation

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **React Hook Form** with Zod validation
- **TanStack Query** for data fetching
- **React Hot Toast** for notifications

### Backend
- **Next.js API Routes** (TypeScript)
- **MongoDB Atlas** with Mongoose ODM
- **NextAuth.js** for authentication
- **Sharp** for image processing
- **Nodemailer** for email notifications

### Development
- **Jest** and **React Testing Library** for testing
- **ESLint** and **Prettier** for code quality
- **TypeScript** for type checking

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd railway-amenities
npm install
```

### 2. Environment Setup

Copy the environment example file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/railway_amenities?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# App Configuration
NODE_ENV=development
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp
```

### 3. Seed Database

Populate the database with sample data:

```bash
npm run seed
```

This creates:
- 3 sample stations (Central, East Junction, West Terminal)
- 6 amenity types
- 10 station amenities across stations
- 6 sample users with different roles
- 5 sample issues with various statuses
- System configuration

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👥 Sample Accounts

After seeding, you can log in with these accounts:

| Role | Email | Password | Access |
|------|-------|----------|---------|
| SuperAdmin | admin@railway.com | password123 | Full system access |
| StationManager (CST) | manager.cst@railway.com | password123 | Central Station management |
| StationManager (EJS) | manager.ejs@railway.com | password123 | East Junction management |
| Staff (CST) | staff.cst@railway.com | password123 | Central Station operations |
| Staff (EJS) | staff.ejs@railway.com | password123 | East Junction operations |
| Public | public@example.com | password123 | Read-only access |

## 📁 Project Structure

```
railway-amenities/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   └── login/page.tsx
│   ├── (dashboard)/              # Dashboard pages
│   │   ├── admin/page.tsx        # SuperAdmin dashboard
│   │   └── manager/page.tsx      # Manager/Staff dashboard
│   ├── (public)/                 # Public pages
│   │   └── page.tsx              # Homepage
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── stations/             # Station management
│   │   ├── inspections/          # Inspection endpoints
│   │   ├── issues/               # Issue management
│   │   ├── reports/              # MIS reports
│   │   ├── config/               # Configuration
│   │   └── media/                # File upload
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── providers.tsx             # Context providers
├── components/                    # Reusable components
│   └── ui/                       # UI components
├── lib/                          # Utility libraries
│   ├── db.ts                     # Database connection
│   ├── auth.ts                   # NextAuth configuration
│   ├── mailer.ts                 # Email utilities
│   ├── calcReports.ts            # MIS calculations
│   └── utils.ts                  # General utilities
├── models/                       # Mongoose models
│   ├── User.ts
│   ├── Station.ts
│   ├── AmenityType.ts
│   ├── StationAmenity.ts
│   ├── Inspection.ts
│   ├── Issue.ts
│   ├── Report.ts
│   └── Config.ts
├── scripts/                      # Utility scripts
│   └── seed.ts                   # Database seeding
├── __tests__/                    # Test files
├── public/uploads/               # File uploads (created at runtime)
├── types/                        # TypeScript type definitions
└── README.md
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run seed         # Seed database with sample data

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run lint         # Run ESLint
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login (via NextAuth)
- `GET /api/auth/me` - Get current user

### Stations
- `GET /api/stations` - List all stations
- `POST /api/stations` - Create new station (SuperAdmin only)
- `GET /api/stations/:id/amenities` - Get station amenities
- `POST /api/stations/:id/amenities` - Add amenity to station

### Issues
- `GET /api/issues` - List issues (with filters)
- `POST /api/issues` - Create new issue
- `PATCH /api/issues/:id/assign` - Assign issue to user
- `PATCH /api/issues/:id/status` - Update issue status

### Inspections
- `GET /api/inspections` - List inspections (with filters)
- `POST /api/inspections` - Create new inspection

### Reports
- `GET /api/reports/mis` - Get MIS metrics

### Media
- `POST /api/media/upload` - Upload files with thumbnails

### Configuration
- `GET /api/config` - Get system configuration
- `POST /api/config` - Update configuration (SuperAdmin only)

## 🧪 Testing

The project includes comprehensive testing setup:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- __tests__/api/issues.test.ts
```

### Test Coverage
- API route testing with mocked dependencies
- Component testing with React Testing Library
- Database operations testing
- Authentication flow testing

## 📧 Email Configuration

The system supports email notifications for:
- High priority issue alerts
- Overdue issue notifications
- System maintenance alerts

Configure SMTP settings in your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

## 📁 File Upload

Files are stored locally in `public/uploads/` with the following structure:
- Original files: `public/uploads/YYYY/MM/uuid.jpg`
- Thumbnails: `public/uploads/thumbs/uuid.jpg`

Supported formats: JPEG, PNG, WebP
Maximum size: 5MB per file

## 🔒 Security Features

- JWT-based authentication with 24-hour expiration
- Role-based access control
- Input validation with Zod schemas
- File upload security (type and size validation)
- Password hashing with bcrypt
- CORS protection
- Rate limiting (configurable)

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in your production environment.

### Database
The application uses MongoDB Atlas. Ensure your cluster is accessible from your deployment environment.

### File Storage
Currently uses local file storage. For production, consider migrating to:
- AWS S3
- Google Cloud Storage
- Azure Blob Storage

### Build and Deploy
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed description

## 🔄 Future Enhancements

- [ ] Push notifications integration
- [ ] Cloud storage migration (S3/MinIO)
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Real-time notifications
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Integration with external systems

---

**Note**: This is a development-ready application. For production deployment, ensure proper security configurations, environment variables, and database optimization.
