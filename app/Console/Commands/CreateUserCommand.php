<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class CreateUserCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create 
                            {--role= : The user\'s role (admin, user)}
                            {--first-name= : The user\'s first name}
                            {--last-name= : The user\'s last name}
                            {--email= : The user\'s email address}
                            {--password= : The user\'s password}
                            {--interactive : Run in interactive mode}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new user with specified role or update existing admin user';

    /**
     * Available roles for user creation
     *
     * @var array<string>
     */
    protected array $availableRoles;

    /**
     * Create a new command instance.
     */
    public function __construct()
    {
        parent::__construct();
        $this->availableRoles = User::$availableRoles;
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🚀 User Creation Command');
        $this->newLine();

        // Get user input
        $userData = $this->getUserInput();

        if (! $userData) {
            $this->error('❌ User creation cancelled.');

            return Command::FAILURE;
        }

        // Validate role
        if (! in_array($userData['role'], $this->availableRoles)) {
            $this->error('❌ Invalid role. Available roles: '.implode(', ', $this->availableRoles));

            return Command::FAILURE;
        }

        // Check if this is an admin update
        if (isset($userData['update_admin']) && $userData['update_admin']) {
            return $this->updateAdminUser($userData['existing_admin'], $userData);
        }

        // Create new user
        return $this->createNewUser($userData);
    }

    /**
     * Get user input from command options or interactive prompts
     */
    protected function getUserInput(): ?array
    {
        $interactive = $this->option('interactive') ||
            (! $this->option('role') || ! $this->option('first-name') || ! $this->option('last-name') || ! $this->option('email') || ! $this->option('password'));

        if (! $interactive) {
            return [
                'role' => $this->option('role'),
                'first_name' => $this->option('first-name'),
                'last_name' => $this->option('last-name'),
                'email' => $this->option('email'),
                'password' => $this->option('password'),
            ];
        }

        $this->info('Please provide the following information:');
        $this->newLine();

        $role = $this->choice('Select Role', $this->availableRoles);
        if (! $role) {
            return null;
        }

        // Check if admin user already exists and ask for update
        if ($role === 'admin') {
            $existingAdmin = $this->getExistingAdminUser();
            if ($existingAdmin) {
                $this->warn("⚠️  Admin user already exists: {$existingAdmin->name} ({$existingAdmin->email})");

                if (! $this->confirm('Do you want to update the existing admin user?', false)) {
                    $this->info('❌ Admin user update cancelled.');

                    return null;
                }

                // Get update information
                $firstName = $this->ask('First Name', $existingAdmin->first_name);
                if (! $firstName) {
                    return null;
                }

                $lastName = $this->ask('Last Name', $existingAdmin->last_name);
                if (! $lastName) {
                    return null;
                }

                $email = $this->ask('Email Address', $existingAdmin->email);
                if (! $email || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $this->error('❌ Please provide a valid email address.');

                    return null;
                }

                $password = $this->secret('Password (leave blank to keep current)');
                if ($password) {
                    $confirmPassword = $this->secret('Confirm Password');
                    if ($password !== $confirmPassword) {
                        $this->error('❌ Passwords do not match.');

                        return null;
                    }
                } else {
                    $password = null; // Keep current password
                }

                return [
                    'role' => $role,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $email,
                    'password' => $password,
                    'update_admin' => true,
                    'existing_admin' => $existingAdmin,
                ];
            }
        }

        $firstName = $this->ask('First Name');
        if (! $firstName) {
            return null;
        }

        $lastName = $this->ask('Last Name');
        if (! $lastName) {
            return null;
        }

        $email = $this->ask('Email Address');
        if (! $email || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('❌ Please provide a valid email address.');

            return null;
        }

        $password = $this->secret('Password');
        if (! $password) {
            $this->error('❌ Password is required.');

            return null;
        }

        $confirmPassword = $this->secret('Confirm Password');
        if ($password !== $confirmPassword) {
            $this->error('❌ Passwords do not match.');

            return null;
        }

        return [
            'role' => $role,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password' => $password,
        ];
    }

    /**
     * Get existing admin user
     */
    protected function getExistingAdminUser(): ?User
    {
        return User::role('admin')->first();
    }

    /**
     * Update existing admin user
     */
    protected function updateAdminUser(User $admin, array $userData): int
    {
        // Prepare update data
        $updateData = [
            'first_name' => $userData['first_name'],
            'last_name' => $userData['last_name'],
            'email' => $userData['email'],
            'email_verified_at' => now(),
            'status' => User::STATUS_ACTIVE,
        ];

        // Only update password if provided
        if ($userData['password']) {
            $updateData['password'] = Hash::make($userData['password']);
        }

        // Update admin user
        $admin->update($updateData);

        $this->info('✅ Admin user updated successfully!');
        $this->displayUserInfo($admin, 'Updated');

        return Command::SUCCESS;
    }

    /**
     * Create a new user
     */
    protected function createNewUser(array $userData): int
    {
        // Check if email already exists
        $existingUser = User::where('email', $userData['email'])->first();

        if ($existingUser) {
            // If user exists and role is admin, make them admin
            if ($userData['role'] === 'admin') {
                $adminRole = Role::where('name', 'admin')->first();
                if ($adminRole && ! $existingUser->hasRole('admin')) {
                    $existingUser->assignRole($adminRole);
                    $this->info('✅ User found and assigned admin role!');
                    $this->displayUserInfo($existingUser, 'Role Updated');

                    return Command::SUCCESS;
                } elseif ($existingUser->hasRole('admin')) {
                    $this->warn("⚠️  User '{$existingUser->email}' is already an admin.");
                    $this->displayUserInfo($existingUser, 'Current Admin');

                    return Command::SUCCESS;
                }
            } else {
                $this->error("❌ User with email '{$userData['email']}' already exists.");

                return Command::FAILURE;
            }
        }

        // Create new user
        $user = User::create([
            'first_name' => $userData['first_name'],
            'last_name' => $userData['last_name'],
            'email' => $userData['email'],
            'password' => Hash::make($userData['password']),
            'email_verified_at' => null,
            'status' => User::STATUS_ACTIVE,
        ]);

        // Assign role
        $role = Role::where('name', $userData['role'])->first();
        if ($role) {
            $user->assignRole($role);
        }

        $user->update([
            'email_verified_at' => now(),
        ]);

        $this->info('✅ User created successfully!');
        $this->displayUserInfo($user, 'Created');

        return Command::SUCCESS;
    }

    /**
     * Display user information
     */
    protected function displayUserInfo(User $user, string $action): void
    {
        $this->newLine();
        $this->info("📋 User Information ({$action}):");
        $this->table(
            ['Field', 'Value'],
            [
                ['ID', $user->id],
                ['Name', $user->name],
                ['Email', $user->email],
                ['Role', $user->getRoleNames()->implode(', ')],
                ['Status', $user->status === User::STATUS_ACTIVE ? 'Active' : 'Inactive'],
                ['Email Verified', $user->email_verified_at ? 'Yes' : 'No'],
                ['Created At', $user->created_at->format('Y-m-d H:i:s')],
            ]
        );
    }
}
