<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Customer extends Model
{
    protected $guarded = ['id'];

    protected static function booted()
    {
        static::creating(function ($customer) {
            if (empty($customer->qr_code_token)) {
                $customer->qr_code_token = (string) Str::uuid();
            }
        });
    }
}
