<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @method \Illuminate\Database\Eloquent\Collection getAllPermissions()
 * @method \Illuminate\Database\Eloquent\Collection getPermissionsViaRoles()
 * @method \Illuminate\Database\Eloquent\Collection getDirectPermissions()
 * @method bool hasPermissionTo(string|Permission $permission, string $guardName = null)
 * @method bool hasAnyPermission(array $permissions)
 * @method bool hasAllPermissions(array $permissions)
 * @method \Illuminate\Database\Eloquent\Collection getRoleNames()
 * @method bool hasRole(string|Role $role)
 * @method bool hasAnyRole(array $roles)
 * @method bool hasAllRoles(array $roles)
 * @method \Illuminate\Database\Eloquent\Collection getRoles()
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, Notifiable, TwoFactorAuthenticatable;

    const STATUS_ACTIVE = 1;

    const STATUS_INACTIVE = 0;

    const SOCIAL_PROVIDER_GOOGLE = 'google';

    const SOCIAL_PROVIDER_APPLE = 'apple';

    const ROLE_ADMIN = 'admin';

    const ROLE_USER = 'user';

    /**
     * Available roles for users
     *
     * @var array<string>
     */
    public static array $availableRoles = [
        self::ROLE_ADMIN,
        self::ROLE_USER,
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'pending_email',
        'password',
        'avatar',
        'google_id',
        'apple_id',
        'social_provider',
        'status',
        'otp',
        'remember_token',
        'otp_expires_at',
        'email_verified_at',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'name',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'otp_expires_at' => 'datetime',
            'two_factor_recovery_codes' => 'array',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Find user by Google ID
     */
    public static function findByGoogleId(string $googleId): ?User
    {
        return static::where('google_id', $googleId)->first();
    }

    /**
     * Find user by Apple ID
     */
    public static function findByAppleId(string $appleId): ?User
    {
        return static::where('apple_id', $appleId)->first();
    }

    /**
     * Find user by email for social login
     */
    public static function findByEmailForSocial(string $email): ?User
    {
        return static::where('email', $email)->first();
    }

    /**
     * Get the user's full name.
     */
    public function getNameAttribute(): string
    {
        return trim($this->first_name.' '.$this->last_name);
    }
}
