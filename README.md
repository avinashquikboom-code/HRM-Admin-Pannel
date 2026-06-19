# QuickBoom HRM Admin Panel

A comprehensive HR Management System admin panel built with Next.js, TypeScript, Tailwind CSS, and Redux Toolkit.

## Features

- **Dashboard**: Real-time analytics and statistics
- **Employee Management**: Create, view, and manage employee profiles
- **Attendance Management**: Track and manage employee attendance
- **Leave Management**: Approve/reject leave requests and manage leave balances
- **Payroll Management**: Generate and manage salary slips
- **Shift Management**: Create and assign shifts to employees
- **Notifications**: Send notifications to departments and roles
- **Settings**: Configure company-wide settings
- **Multi-Portal Support**: Super Admin, Admin, HR, and Employee portals
- **Theme Support**: Light and dark mode with persistence
- **Responsive Design**: Mobile-friendly UI

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **UI Components**: shadcn/ui, Lucide Icons
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Date Handling**: date-fns

## Prerequisites

- Node.js >= 18.x
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd HRM-Admin-Pannel
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` file with your API URL and other settings.

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=QuickBoom HRM
```

## Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin portal routes
│   ├── super-admin/       # Super Admin portal routes
│   └── employee/          # Employee portal routes
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── Header.tsx        # Application header
│   └── Sidebar.tsx       # Application sidebar
├── features/             # Feature-specific components
│   ├── employees/        # Employee management
│   ├── attendance/       # Attendance tracking
│   ├── leave/           # Leave management
│   ├── payroll/         # Payroll management
│   ├── shift/           # Shift management
│   └── notifications/   # Notification management
├── lib/                  # Utility libraries
│   ├── api.ts           # API client
│   ├── authStorage.ts   # Authentication storage
│   └── portals.ts       # Portal configuration
├── store/                # Redux store
│   ├── slices/          # Redux slices
│   │   ├── authSlice.ts
│   │   ├── themeSlice.ts
│   │   └── sidebarSlice.ts
│   └── hooks.ts         # Redux hooks
└── services/            # API services
    ├── notificationService.ts
    ├── settingsService.ts
    └── analyticsService.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Portals

The admin panel supports multiple user portals:

1. **Super Admin Portal** (`/super-admin/*`)
   - Platform-wide management
   - Company management
   - System settings

2. **Admin Portal** (`/admin/*`)
   - Employee management
   - Attendance tracking
   - Leave approval
   - Payroll management

3. **HR Portal** (`/hr/*`)
   - HR-specific tasks
   - Leave management
   - Employee supervision

4. **Employee Portal** (`/employee/*`)
   - Self-service features
   - View attendance
   - Apply for leave
   - View payslips

## Authentication

The admin panel uses JWT-based authentication with role-based access control. Tokens are stored in cookies and localStorage for different portals to prevent session conflicts.

## Theme

The application supports light and dark themes. Theme preference is persisted in localStorage and automatically applied on page load.

## API Integration

The admin panel connects to the QuickBoom HRM backend API. All API calls are made through the centralized API client in `src/lib/api.ts`.

## Docker Support

### Build Docker Image
```bash
docker build -t quickboom-admin .
```

### Run with Docker Compose
```bash
docker-compose up
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Support

For support, email support@quickboom.com
