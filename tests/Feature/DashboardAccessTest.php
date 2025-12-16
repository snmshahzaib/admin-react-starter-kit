<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DashboardAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create the admin role
        Role::create(['name' => 'admin']);
    }

    public function test_guest_cannot_access_dashboard(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_user_without_admin_role_cannot_access_dashboard(): void
    {
        // Create a user without any role
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(403); // Forbidden
    }

    public function test_user_with_admin_role_can_access_dashboard(): void
    {
        // Create admin user
        $admin = User::factory()->create([
            'email' => 'admin@herd.com',
            'password' => bcrypt('herd1234'),
            'email_verified_at' => now(),
        ]);

        // Assign admin role
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('dashboard'));
    }

    public function test_user_with_different_role_cannot_access_dashboard(): void
    {
        // Create a different role
        $userRole = Role::create(['name' => 'user']);

        // Create user with 'user' role
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        $user->assignRole('user');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(403); // Forbidden
    }

    public function test_settings_routes_require_admin_role(): void
    {
        // Create user without admin role
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        // Test settings/profile route
        $response = $this->actingAs($user)->get('/settings/profile');
        $response->assertStatus(403);

        // Test settings/password route
        $response = $this->actingAs($user)->get('/settings/password');
        $response->assertStatus(403);
    }

    public function test_admin_can_access_settings_routes(): void
    {
        // Create admin user
        $admin = User::factory()->create([
            'email' => 'admin@herd.com',
            'password' => bcrypt('herd1234'),
            'email_verified_at' => now(),
        ]);

        $admin->assignRole('admin');

        // Test settings/profile route
        $response = $this->actingAs($admin)->get('/settings/profile');
        $response->assertStatus(200);

        // Test settings/password route
        $response = $this->actingAs($admin)->get('/settings/password');
        $response->assertStatus(200);
    }

    public function test_auth_routes_require_admin_role(): void
    {
        // Create user without admin role
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        // Test logout route (should be accessible to authenticated users)
        $response = $this->actingAs($user)->post('/logout');
        $response->assertStatus(403);
    }

    public function test_admin_can_access_auth_routes(): void
    {
        // Create admin user
        $admin = User::factory()->create([
            'email' => 'admin@herd.com',
            'password' => bcrypt('herd1234'),
            'email_verified_at' => now(),
        ]);

        $admin->assignRole('admin');

        // Test logout route
        $response = $this->actingAs($admin)->post('/logout');
        $response->assertRedirect('/');
    }

    public function test_login_and_register_are_accessible_to_guests(): void
    {
        // Test login page
        $response = $this->get('/login');
        $response->assertStatus(200);

        // Test register page
        $response = $this->get('/register');
        $response->assertStatus(200);
    }
}
