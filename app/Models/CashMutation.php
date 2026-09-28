<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashMutation extends Model
{
    use HasFactory;

    protected $fillable = [
        'cashier_shift_id',
        'type',
        'amount',
        'notes',
    ];

    public function shift()
    {
        return $this->belongsTo(CashierShift::class, 'cashier_shift_id');
    }
}