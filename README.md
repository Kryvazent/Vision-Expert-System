# Vision Expert System

A comprehensive, role-based web application for managing vision care services, patient information, inventory, clinics, and business operations. Built with modern technologies including React, GraphQL, Supabase, and Ant Design.

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [User Roles & Permissions](#user-roles--permissions)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Development Guidelines](#development-guidelines)
- [Design System](#design-system)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

Vision Expert System is an enterprise-grade platform designed to streamline vision care operations across multiple branches. The system manages the complete lifecycle from patient registration and eye examinations to order processing, lab tracking, delivery, and financial management. With role-based access control, different stakeholders can access relevant features based on their responsibilities.

## Key Features

### Patient & Clinical Management
- **Patient Registration**: Comprehensive customer profiles with contact information, NIC, and date of birth
- **Clinic Management**: Schedule and manage vision clinics across different locations
- **Prescription Management**: Record detailed eye prescriptions with SPH, CYL, AXIS, and PD measurements
- **Optometrist Dashboard**: Specialized interface for eye care professionals

### Order Management
- **Order Processing**: Complete order lifecycle from placement to delivery
- **Frame & Lens Management**: Track frames by color, serial number, type, and status
- **Batch Processing**: Group orders into batches for efficient lab processing
- **Order Status Tracking**: Real-time status updates (Pending, Confirmed, In Lab, Ready, Delivered)
- **Reminder Calls**: Automated reminder system for customer follow-ups

### Inventory Management
- **Stock Control**: Multi-branch inventory tracking with real-time updates
- **Supplier Management**: Manage supplier relationships and product sourcing
- **Brand & Product Catalog**: Organized product database with types, brands, and SKUs
- **Stock Movement**: Track stock transfers between branches
- **Damaged Stock**: Report and manage damaged inventory with approval workflows

### Financial Management
- **Cash Handling**: Multi-level cash management with approval workflows
- **Petty Cash**: Branch-level petty cash allocation and expense tracking
- **Payment Processing**: Handle payments, advances, discounts, and balance amounts
- **Cash Transfers**: Secure cash transfer system between branches and administration
- **Revenue Tracking**: Monitor branch performance against targets

### Reporting & Analytics
- **Sales Reports**: Comprehensive sales analytics and filtering
- **Cash Flow Views**: Financial flow monitoring
- **Order Flow Tracking**: Visual order lifecycle tracking
- **System Activity**: Login tracking and user activity monitoring
- **Branch Performance**: Revenue and order target comparisons

### Complaint & Warranty Management
- **Complaint Tracking**: Centralized complaint management system
- **Warranty Claims**: Handle warranty claims with approval workflows
- **Resolution Tracking**: Track complaint resolution progress
- **Assignment System**: Assign complaints to specific staff members

## User Roles & Permissions

The system implements role-based access control with seven distinct user roles:

### Owner
- **Access Level**: Full system access
- **Key Features**: Project management, branch management, user management, main stock handling, petty cash allocation, payment monitoring, comprehensive reports
- **Dashboard**: `/owner`

### Manager
- **Access Level**: Branch-level management
- **Key Features**: Branch stock management, incoming stock approval, cash handling, petty cash, pending payments, pending lab orders, complaint handling, clinic management
- **Dashboard**: `/manager-dashboard`

### Administrative Officer (Admin)
- **Access Level**: Operational administration
- **Key Features**: Inventory management, customer lookup, batch tracking, lab follow-up, reminder calls, complaint management, petty cash handling, cash transfer approval
- **Dashboard**: `/admin-dashboard`

### Accountant
- **Access Level**: Financial operations
- **Key Features**: Recovery details, recovery filtering, order filtering, daily sales, cash flow views, order flow views, financial reports
- **Dashboard**: `/accountant`

### Sales Executive
- **Access Level**: Sales operations
- **Key Features**: New order creation, order management, order status changes, cash transfers, complaint viewing
- **Dashboard**: `/sales-executive-dashboard`

### Recovery Officer
- **Access Level**: Delivery and recovery
- **Key Features**: Recovery sheet, delivery management, cash transfers, recovery follow-up, customer lookup, warranty claims
- **Dashboard**: `/recovery-dashboard`

### Optometrist
- **Access Level**: Clinical operations
- **Key Features**: Prescription creation, patient management, clinical dashboard
- **Dashboard**: `/optometrist-dashboard`

## Tech Stack

### Frontend Framework
- **React 19.2** - Modern UI library with concurrent features
- **Vite 7.2** - Lightning-fast build tool and development server
- **React Router 7.13** - Client-side routing with nested routes

### Styling & UI Components
- **TailwindCSS 4.1** - Utility-first CSS framework with Vite plugin
- **Ant Design (antd) 6.2** - Enterprise-class UI component library
- **@ant-design/icons 6.1** - Comprehensive icon set
- **Recharts 3.8** - Charting library for data visualization

### Backend & Data Layer
- **Supabase 2.93** - Backend-as-a-Service providing:
  - PostgreSQL database
  - Authentication system
  - GraphQL API
  - Real-time subscriptions
- **Apollo Client 4.1** - GraphQL client with caching and state management
- **GraphQL 16.12** - Query language for efficient data fetching

### Utilities & Libraries
- **Day.js 1.11** - Lightweight date manipulation library
- **ExcelJS 4.4** - Excel file generation and manipulation
- **File-saver 2.0** - Client-side file saving
- **XLSX 0.18** - Spreadsheet file format support
- **RxJS 7.8** - Reactive programming for complex state management

### Development Tools
- **ESLint 9.39** - Code quality and linting
- **@vitejs/plugin-react 5.1** - React support for Vite
- **TypeScript types** - Type definitions for React components

## Architecture

### Application Architecture
The application follows a modern React architecture with:

1. **Component-Based Structure**: Functional components with hooks
2. **Role-Based Routing**: Protected routes based on user roles
3. **Centralized State Management**: React Context for auth, Apollo Client for data
4. **Design System**: Centralized design tokens for consistent UI
5. **GraphQL API Layer**: Efficient data fetching with Apollo Client

### Authentication Flow
1. User logs in via Supabase Auth
2. Session token stored and managed by Supabase client
3. User role fetched from staff table via GraphQL
4. Menu and routes dynamically generated based on role
5. Protected routes enforce role-based access

### Data Flow
1. **Read Operations**: GraphQL queries via Apollo Client
2. **Write Operations**: GraphQL mutations with optimistic updates
3. **Real-time Updates**: Supabase subscriptions for live data
4. **Caching**: Apollo Client cache for performance optimization

### Key Architectural Patterns
- **Protected Routes**: Route-level access control
- **Context Providers**: Auth context for global user state
- **Custom Hooks**: Reusable business logic extraction
- **Component Composition**: Complex UIs built from simple components
- **Design Tokens**: Centralized styling constants

## Database Schema

The application uses PostgreSQL with a custom schema named `vision_expert`. The database consists of 40+ tables organized into logical groups:

### Core Tables
- **branch**: Branch locations with revenue and order targets
- **staff**: Staff members linked to branches and roles
- **role**: User role definitions (Admin, Manager, etc.)
- **customer**: Customer profiles with personal information
- **customer_has_branch**: Customer-branch relationship mapping

### Clinical Tables
- **clinic**: Vision clinic scheduling and management
- **clinic_staff**: Staff assignment to clinics
- **clinic_expenses**: Clinic expense tracking
- **clinic_has_equipment**: Equipment allocation to clinics
- **clinic_attend_customer**: Customer attendance records
- **clinic_status**: Clinic status definitions
- **prescription**: Eye examination prescriptions with measurements

### Product & Inventory Tables
- **product**: Product catalog with pricing and warranty
- **product_type**: Product type classifications
- **brand**: Brand information
- **product_type_brand**: Product-type-brand relationships
- **stock**: Inventory levels by branch
- **stock_movement_history**: Stock transfer tracking
- **frame**: Frame inventory with serial numbers
- **frame_type**: Frame type classifications
- **lense_type**: Lens type definitions with pricing

### Order Management Tables
- **order**: Order records with complete lifecycle tracking
- **order_status**: Order status definitions
- **order_status_history**: Order status change history
- **order_payment**: Payment records for orders
- **payment**: Payment information with discounts and fees
- **delivery_order**: Delivery management

### Lab & Batch Tables
- **batch**: Order batching for lab processing
- **batch_order**: Order-to-batch relationships
- **batch_timeline**: Batch processing timeline
- **lab_follow_up**: Lab order tracking
- **lab_follow_up_status**: Lab status definitions

### Financial Tables
- **petty_cash**: Branch petty cash transactions
- **petty_cash_allocation**: Petty cash allocation to branches
- **petty_cash_request**: Petty cash request workflow
- **cash_transfers_to_admin**: Cash transfer management
- **cash_transfer_status**: Cash transfer status definitions
- **cash_type**: Cash type classifications

### Complaint & Warranty Tables
- **complaint**: Customer complaint records
- **complaint_status**: Complaint status definitions
- **warranty**: Warranty claim management

### System Tables
- **supplier**: Supplier information
- **equipment**: Equipment inventory
- **branch_expenses**: Branch expense tracking
- **damaged_stock**: Damaged inventory reporting
- **damage_history**: Damage event tracking
- **re_order**: Reorder requests
- **reminder_call**: Customer reminder call tracking
- **login_activity**: User login tracking

### Schema Features
- **Foreign Key Relationships**: Maintained data integrity
- **Timestamp Tracking**: Created_at and updated_at fields
- **Status Enums**: Standardized status fields
- **Check Constraints**: Data validation at database level
- **Identity Columns**: Auto-incrementing primary keys
- **UUID References**: Integration with Supabase Auth

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher recommended) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Create Account](https://supabase.com/)
- **Docker** (optional, for containerized development) - [Download](https://www.docker.com/)

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/Vision-Expert-System-v2.git
cd Vision-Expert-System-v2
```

### Step 2: Install Dependencies

```bash
npm install
```

Or if you prefer using yarn:

```bash
yarn install
```

### Step 3: Verify Installation

```bash
npm run lint
```

This will check for any linting errors in your code.

## Environment Configuration

### Step 1: Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

### Step 2: Configure Supabase Credentials

Add your Supabase credentials to `.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### Step 3: Get Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select an existing one
3. Navigate to **Settings > API**
4. Copy the following values:
   - **Project URL**: Your Supabase project URL
   - **anon/public key**: The public API key

## Database Setup

### Step 1: Create Database Schema

The application uses a custom PostgreSQL schema. Execute the schema setup:

1. Go to your Supabase project's SQL Editor
2. Execute the schema from `db/complete_schema.sql`
3. Execute sample data from `db/sample_data.sql` (optional)

### Step 2: Configure GraphQL

Supabase provides GraphQL API automatically. Ensure:

1. GraphQL is enabled in your Supabase project
2. The GraphQL endpoint is accessible at: `https://your-project.supabase.co/graphql/v1`
3. Proper RLS (Row Level Security) policies are configured

### Step 3: Set Up Authentication

Configure Supabase Authentication:

1. Enable Email/Password authentication in Supabase
2. Configure any additional OAuth providers if needed
3. Set up user roles in the `role` table
4. Create staff accounts and link them to auth users

### Step 4: Seed Initial Data

Run the sample data script to populate reference tables:

```sql
-- Execute in db/sample_data.sql
-- This will populate: roles, branches, product types, brands, order statuses, etc.
```

## Running the Application

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Docker Development

Using Docker for containerized development:

```bash
docker-compose up
```

This will:
- Pull the Node.js 22 image
- Install dependencies
- Start the development server on port 5173
- Enable host access for external connections

### Build for Production

Create an optimized production build:

```bash
npm run build
```

The output will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
Vision-Expert-System-v2/
├── public/                          # Static assets
│   └── sample.txt
├── src/
│   ├── assets/                      # Images, icons, and media
│   │   ├── icons/
│   │   └── images/
│   ├── auth/                        # Authentication context and providers
│   │   ├── AuthContext.jsx
│   │   └── AuthProvider.jsx
│   ├── client/                      # API clients and configuration
│   │   ├── supabase.js              # Supabase client configuration
│   │   └── supabase-grphql-apollo.client.js  # Apollo GraphQL client
│   ├── component/                   # Reusable React components
│   │   ├── Admin/                   # Admin-specific components
│   │   ├── Manager/                 # Manager-specific components
│   │   ├── optimetrist/             # Optometrist-specific components
│   │   ├── owner/                   # Owner-specific components
│   │   ├── recoveryOfficer/         # Recovery officer components
│   │   ├── sales-executive/         # Sales executive components
│   │   ├── shared/                  # Shared components
│   │   ├── LogOut.jsx
│   │   ├── SideMenu.jsx
│   │   ├── Sidebar.jsx
│   │   └── TopHeader.jsx
│   ├── const/                       # Constants and configuration
│   │   ├── branch.js
│   │   ├── designSystem.js          # Design system tokens
│   │   ├── functions.js             # Utility functions
│   │   ├── menu.jsx                 # Role-based menu configuration
│   │   └── text.js
│   ├── pages/                       # Page components
│   │   ├── Accountant/              # Accountant pages (9 pages)
│   │   ├── AdministrativeOfficer/   # Admin pages (17 pages)
│   │   ├── Manager/                 # Manager pages (11 pages)
│   │   ├── optimetrist/             # Optometrist pages (3 pages)
│   │   ├── owner/                   # Owner pages (11 pages)
│   │   ├── recovery-officer/        # Recovery officer pages (9 pages)
│   │   ├── sales-executive/         # Sales executive pages (6 pages)
│   │   ├── track/                   # Public order tracking
│   │   ├── login/                   # Login page
│   │   ├── CommonPageStructure.jsx  # Page layout wrapper
│   │   ├── ForgetPassword.page.jsx
│   │   └── OrderLookup.jsx          # Shared order lookup
│   ├── routes/                      # Routing configuration
│   │   ├── App.jsx                  # Main route definitions
│   │   └── protectedRoutes.jsx      # Route protection logic
│   ├── main.css                     # Global styles
│   └── main.jsx                     # Application entry point
├── db/                              # Database schema and data
│   ├── complete_schema.sql          # Full database schema
│   ├── sample_data.sql              # Sample/reference data
│   └── migrations/                  # Database migration files
├── .agents/                         # AI agent configurations
├── .git/                            # Git repository
├── index.html                       # HTML entry point
├── package.json                     # Project dependencies
├── vite.config.js                   # Vite configuration
├── eslint.config.js                 # ESLint configuration
├── docker-compose.yml               # Docker configuration
├── vercel.json                      # Vercel deployment config
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

## Available Scripts

### `npm run dev`
Starts the Vite development server with hot module replacement. Access at `http://localhost:5173`.

### `npm run build`
Creates an optimized production build in the `dist/` directory using Vite.

### `npm run preview`
Previews the production build locally using Vite's preview server.

### `npm run lint`
Runs ESLint to check code quality and consistency across the project.

## Development Guidelines

### Code Style Standards

- **ESLint Configuration**: Follow rules defined in `eslint.config.js`
- **Naming Conventions**: Use camelCase for variables/functions, PascalCase for components
- **Component Structure**: Keep components focused and single-responsibility
- **Functional Components**: Use functional components with React hooks
- **No Unused Variables**: The linter enforces no unused variables (uppercase constants exempted)

### File Organization

- **Pages**: Store in `src/pages/[role]/` directories
- **Components**: Reusable components in `src/component/` with role subdirectories
- **Constants**: Centralized in `src/const/`
- **Utilities**: Shared functions in `src/const/functions.js`
- **Types**: Use TypeScript types from `@types/react` packages

### State Management Guidelines

1. **Global State**: Use React Context API for auth and user state
2. **Server State**: Use Apollo Client for GraphQL data with caching
3. **Local State**: Use React hooks (useState, useReducer) for UI-specific state
4. **Form State**: Use Ant Design Form components for form management

### Styling Guidelines

1. **TailwindCSS**: Use utility classes for most styling
2. **Ant Design**: Use Ant Design components for complex UI elements
3. **Design Tokens**: Import from `src/const/designSystem.js` for consistency
4. **Custom CSS**: Add to `src/main.css` only when necessary
5. **Responsive**: Use Tailwind's responsive prefixes (md:, lg:, etc.)

### GraphQL Usage

1. **Queries**: Define in component files using `gql` tag
2. **Mutations**: Use optimistic updates for better UX
3. **Fragments**: Use fragments for reusable field selections
4. **Error Handling**: Implement proper error boundaries and handling
5. **Loading States**: Show loading indicators during data fetches

### Git Workflow

1. **Branch Naming**: Use `feature/`, `bugfix/`, `hotfix/` prefixes
2. **Commit Messages**: Use conventional commit format
   - `feat: add new feature`
   - `fix: resolve bug`
   - `docs: update documentation`
3. **Pull Requests**: Provide detailed descriptions and testing steps
4. **Code Review**: All changes require review before merging

## Design System

The application uses a centralized design system defined in `src/const/designSystem.js`:

### Color Palette
- **Primary**: Blue (#1890ff) - Main actions and branding
- **Secondary**: Purple (#722ed1) - Secondary actions
- **Success**: Green (#52c41a) - Success states
- **Warning**: Orange (#faad14) - Warning states
- **Error**: Red (#ff4d4f) - Error states
- **Role-Specific Colors**: Each role has a distinct color for identification

### Typography
- **Font Family**: System font stack for optimal performance
- **Font Sizes**: Range from 12px (xs) to 32px (xxxl)
- **Font Weights**: Normal (400), Medium (500), Semibold (600), Bold (700)
- **Line Heights**: Tight (1.25), Normal (1.5), Relaxed (1.75)

### Spacing Scale
- **XS**: 4px, **SM**: 8px, **MD**: 12px, **LG**: 16px
- **XL**: 20px, **XXL**: 24px, **XXXL**: 32px

### Border Radius
- **SM**: 4px, **MD**: 8px, **LG**: 12px, **XL**: 16px, **Round**: 50px

### Component Styles
Pre-defined styles for:
- Buttons (primary, secondary, danger, default)
- Cards (default, compact, elevated)
- Tables (default, compact)
- Forms (labels, inputs, selects, date pickers)
- Modals (default, large, small)
- Headers and stat cards

### Status Colors
Standardized color mapping for status tags:
- Pending: default, In Progress: processing, Resolved: success
- Active: success, Inactive: error, Hold: warning
- Various order statuses with appropriate colors

## Deployment

### Vercel Deployment

The project includes `vercel.json` for single-page application routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Deploy to Vercel:**

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker Deployment

Using the provided `docker-compose.yml`:

```bash
docker-compose up -d
```

This creates a containerized environment with Node.js 22.

### Manual Deployment

1. Build the project: `npm run build`
2. Upload `dist/` directory to your server
3. Configure your web server (Nginx, Apache) to serve the files
4. Set up environment variables on the server
5. Configure SSL/TLS for production

### Environment Variables for Production

Ensure these are set in your production environment:

```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_production_anon_key
```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will automatically use the next available port. To specify a different port:

```bash
npm run dev -- --port 3000
```

### Module Not Found Errors

Ensure all dependencies are installed:

```bash
npm install
```

Clear cache and reinstall if issues persist:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Issues

- Verify your `.env.local` credentials are correct
- Check that your Supabase project is active
- Ensure your API keys have the correct permissions
- Verify GraphQL is enabled in your Supabase project
- Check RLS policies allow necessary operations

### GraphQL Errors

- Verify your GraphQL endpoint is accessible
- Check that your schema matches the database
- Ensure authentication tokens are valid
- Review Apollo Client network errors in browser console

### Build Errors

- Clear Vite cache: `rm -rf node_modules/.vite`
- Check for TypeScript errors in components
- Verify all imports are correct
- Ensure environment variables are set

### Authentication Issues

- Check Supabase Auth configuration
- Verify email confirmation settings
- Ensure staff records exist in database
- Check role assignments in staff table
- Review auth context provider logic

### Performance Issues

- Check Apollo Client cache configuration
- Implement pagination for large datasets
- Use React.memo for expensive components
- Optimize GraphQL queries to fetch only needed fields
- Consider implementing loading skeletons

## Contributing

Contributions are welcome! Please follow these guidelines:

### Contribution Guidelines

1. **Fork the Repository**: Create your fork of the project
2. **Create a Branch**: Use descriptive branch names
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make Changes**: Follow the development guidelines
4. **Test Thoroughly**: Ensure all features work correctly
5. **Commit Changes**: Use conventional commit messages
   ```bash
   git commit -m 'feat: add new feature description'
   ```
6. **Push to Fork**: Push your changes to your fork
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create Pull Request**: Provide detailed description of changes

### Code Review Process

- All pull requests require review before merging
- Ensure code passes all linting checks
- Include tests for new features
- Update documentation as needed
- Respond to review feedback promptly

### Issue Reporting

When reporting issues, include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, browser)
- Screenshots if applicable
- Relevant error messages or logs

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:

- **GitHub Issues**: Open an issue on the repository
- **Documentation**: Refer to this README and inline code comments
- **Team Contact**: Contact the development team directly

---

**Version**: 2.0  
**Last Updated**: July 2026  
**Maintained By**: Vision Expert System Development Team

---

**Acknowledgments**

Built with modern web technologies and best practices to provide a comprehensive solution for vision care management. Special thanks to the open-source community for the amazing tools and libraries that make this project possible.
