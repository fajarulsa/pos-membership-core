<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        return Inertia::render('owner/customers/index', [
            'customers' => Customer::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        Customer::create($validated);

        return redirect()->back()->with('success', 'Member berhasil ditambahkan!');
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'total_points' => 'required|integer|min:0',
        ]);

        $customer->update($validated);

        return redirect()->back()->with('success', 'Data member berhasil diperbarui!');
    }
}