<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashierShift extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'starting_cash',
        'ending_cash_expected',
        'ending_cash_actual',
        'difference',
        'status',
        'notes',
        'opened_at',
        'closed_at',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mutations()
    {
        return $this->hasMany(CashMutation::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'cashier_shift_id');
    }
}