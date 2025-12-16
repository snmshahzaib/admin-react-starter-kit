# Admin React Starter Kit

A modern, full-featured admin panel starter kit built with Laravel 12, Inertia.js v2, and React 19. This project provides a solid foundation for building admin dashboards with authentication, role-based access control, user management, and more.

## 🚀 Features

### Authentication & Security
- ✅ User login
- ✅ Email verification
- ✅ Password reset functionality
- ✅ Two-factor authentication (2FA) with QR codes
- ✅ OTP-based authentication
- ✅ Session management
- ✅ Rate limiting for authentication attempts

### User Management
- ✅ Complete CRUD operations for users
- ✅ User profile management
- ✅ Avatar support
- ✅ User status management (active/inactive)
- ✅ Advanced DataTables integration with server-side processing

### Role & Permission System
- ✅ Role-based access control (RBAC) using Spatie Laravel Permission
- ✅ Permission management
- ✅ Role assignment to users
- ✅ Middleware-based route protection
- ✅ Granular permission checks

### UI/UX Features
- ✅ Modern, responsive design with Tailwind CSS v4
- ✅ Dark mode support
- ✅ Beautiful component library (Radix UI)
- ✅ Loading states and progress indicators
- ✅ Toast notifications (SweetAlert2)
- ✅ DataTables with advanced filtering and pagination
- ✅ Customizable sidebar navigation
- ✅ Breadcrumb navigation

### Developer Experience
- ✅ TypeScript support
- ✅ ESLint & Prettier configuration
- ✅ Laravel Pint for code formatting
- ✅ Pest PHP testing framework
- ✅ Laravel Telescope for debugging
- ✅ Server-side rendering (SSR) support
- ✅ Hot module replacement (HMR) with Vite

## 📦 Tech Stack

### Backend
- **Laravel 12** - PHP framework
- **PHP 8.2+** - Programming language
- **Inertia.js v2** - Modern monolith approach
- **Laravel Fortify** - Authentication scaffolding
- **Spatie Laravel Permission** - Role & permission management
- **Laravel DataTables** - Server-side data processing
- **Laravel Telescope** - Debugging and monitoring
- **Laravel Wayfinder** - Route helpers
- **Pest** - Testing framework

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Inertia.js React v2** - Full-stack framework
- **Tailwind CSS v4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **NProgress** - Progress bar for navigation
- **SweetAlert2** - Beautiful alerts
- **DataTables** - Advanced table functionality
- **Vite** - Build tool and dev server

## 📋 Requirements

Before you begin, ensure you have the following installed:

- **PHP 8.2** or higher
- **Composer** - PHP dependency manager
- **Node.js 18+** and **npm** - JavaScript runtime and package manager
- **Database** - MySQL, PostgreSQL, or SQLite
- **Git** - Version control

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd laravel-api-admin-starter-main
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install JavaScript Dependencies

```bash
npm install
```

### 4. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

### 5. Configure Database

Edit the `.env` file and set your database configuration:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
```

Or use SQLite (default):

```env
DB_CONNECTION=sqlite
```

If using SQLite, create the database file:

```bash
touch database/database.sqlite
```

### 6. Run Migrations

Run the database migrations and seeders:

```bash
php artisan migrate --seed
```

This will:
- Create all necessary database tables
- Create default roles (admin, user)
- Create default permissions
- Create a default admin user

### 7. Build Frontend Assets

For development:

```bash
npm run dev
```

For production:

```bash
npm run build
```

### 8. Start the Development Server

You can start the development server using one of these methods:

**Option 1: Using Composer (Recommended)**
```bash
composer run dev
```

This will start:
- Laravel development server
- Queue worker
- Log viewer (Pail)
- Vite dev server

**Option 2: Manual Start**
```bash
# Terminal 1: Start Laravel server
php artisan serve

# Terminal 2: Start Vite dev server
npm run dev
```

### 9. Access the Application

Open your browser and navigate to:

```
http://localhost:8000
```

## 👤 Default Credentials

After running migrations and seeders, you can log in with:

- **Email**: `admin@example.com`
- **Password**: `password`

> ⚠️ **Important**: Change these credentials in production!

## 🎨 Configuration

### Application Settings

Edit `.env` file to configure:

- `APP_NAME` - Application name
- `APP_URL` - Application URL
- `APP_ENV` - Environment (local, production)
- `APP_DEBUG` - Debug mode

### Mail Configuration

Configure mail settings in `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Two-Factor Authentication

Two-factor authentication is enabled by default. Users can enable it from their settings page.

## 📁 Project Structure

```
laravel-api-admin-starter-main/
├── app/
│   ├── Console/Commands/      # Artisan commands
│   ├── Http/
│   │   ├── Controllers/       # Application controllers
│   │   ├── Middleware/        # Custom middleware
│   │   └── Requests/          # Form request validation
│   ├── Mail/                  # Mail classes
│   ├── Models/                # Eloquent models
│   ├── Providers/             # Service providers
│   ├── Services/              # Business logic services
│   └── Traits/                # Reusable traits
├── bootstrap/                 # Application bootstrap
├── config/                    # Configuration files
├── database/
│   ├── factories/             # Model factories
│   ├── migrations/             # Database migrations
│   └── seeders/               # Database seeders
├── public/                    # Public assets
├── resources/
│   ├── css/                   # Stylesheets
│   ├── js/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── layouts/           # Layout components
│   │   └── pages/             # Inertia pages
│   └── views/                 # Blade templates
├── routes/                    # Route definitions
├── storage/                   # Storage files
├── tests/                     # Test files
└── vite.config.ts             # Vite configuration
```

## 🛠️ Development Commands

### PHP Commands

```bash
# Run migrations
php artisan migrate

# Run migrations with seeders
php artisan migrate --seed

# Create a new migration
php artisan make:migration create_example_table

# Create a new model
php artisan make:model Example

# Create a new controller
php artisan make:controller ExampleController

# Run tests
php artisan test

# Format code with Pint
vendor/bin/pint

# Clear all caches
php artisan optimize:clear
```

### JavaScript Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build with SSR
npm run build:ssr

# Run TypeScript type checking
npm run types

# Format code with Prettier
npm run format

# Lint code with ESLint
npm run lint
```

### Composer Scripts

```bash
# Start all development services
composer run dev

# Start with SSR
composer run dev:ssr

# Run tests
composer test
```

## 🧪 Testing

This project uses Pest PHP for testing. Run tests with:

```bash
php artisan test
```

Or use the composer script:

```bash
composer test
```

Run specific test files:

```bash
php artisan test tests/Feature/Auth/AuthenticationTest.php
```

## 🔐 Permissions & Roles

### Default Roles

- **admin** - Full access to all features
- **user** - Basic user access

### Default Permissions

The seeder creates permissions for:
- Dashboard access
- User management (view, create, edit, delete)
- Role management (view, create, edit, delete)
- Permission management (view, create, edit, delete)

### Using Permissions in Routes

```php
Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->can('dashboard.view');
```

### Using Permissions in Controllers

```php
if (!auth()->user()->can('users.create')) {
    abort(403);
}
```

## 🎯 Key Features Explained

### DataTables Integration

The project includes a powerful DataTable component with:
- Server-side processing
- Advanced filtering
- Custom pagination
- Search functionality
- Loading states
- Dark mode support

### Two-Factor Authentication

Users can enable 2FA from their settings:
1. Scan QR code with authenticator app
2. Enter verification code
3. Save recovery codes

### Role-Based Access Control

- Assign roles to users
- Create custom permissions
- Protect routes with middleware
- Check permissions in controllers

## 🐛 Debugging

### Laravel Telescope

Telescope is included for debugging. Access it at:

```
http://localhost:8000/telescope
```

### Laravel Debugbar

Debugbar is available in development mode for debugging queries, views, and more.

### Log Viewer

View application logs using Pail:

```bash
php artisan pail
```

## 📝 Code Style

This project follows Laravel and React best practices:

- **PHP**: Laravel Pint for formatting
- **JavaScript/TypeScript**: ESLint + Prettier
- **React**: Functional components with hooks
- **TypeScript**: Strict type checking enabled

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🙏 Acknowledgments

- [Laravel](https://laravel.com) - The PHP Framework
- [Inertia.js](https://inertiajs.com) - Modern monolith approach
- [React](https://react.dev) - UI library
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Spatie](https://spatie.be) - Laravel packages
- [Radix UI](https://www.radix-ui.com) - Component primitives

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ using Laravel, React, and Inertia.js**
