<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\SavingsAccount;

class SearchController extends Controller
{
    /**
     * Cari nasabah berdasarkan nama atau CIF.
     */
    public function searchCustomers(Request $request)
    {
        $query = $request->input('q');
        
        if (empty($query)) {
            return response()->json([]);
        }

        $user = auth()->user();

        $customers = Customer::where('tenant_id', $user->tenant_id)
            ->when($user->branch_id, function ($q) use ($user) {
                return $q->where('branch_id', $user->branch_id);
            })
            ->where(function ($q) use ($query) {
                $q->where('full_name', 'like', "%{$query}%")
                  ->orWhere('cif_number', 'like', "%{$query}%");
            })
            ->select('id', 'cif_number', 'full_name')
            ->limit(10)
            ->get();

        return response()->json($customers);
    }

    /**
     * Cari rekening tabungan berdasarkan nomor rekening atau nama nasabah.
     */
    public function searchSavingsAccounts(Request $request)
    {
        $query = $request->input('q');
        
        if (empty($query)) {
            return response()->json([]);
        }

        $user = auth()->user();

        $accounts = SavingsAccount::where('tenant_id', $user->tenant_id)
            ->whereHas('customer', function ($q) use ($user, $query) {
                $q->when($user->branch_id, function ($q3) use ($user) {
                      return $q3->where('branch_id', $user->branch_id);
                  })
                  ->where(function ($q2) use ($query) {
                      $q2->where('full_name', 'like', "%{$query}%")
                         ->orWhere('cif_number', 'like', "%{$query}%");
                  });
            })
            ->orWhere(function ($q) use ($user, $query) {
                $q->where('tenant_id', $user->tenant_id)
                  ->where('account_number', 'like', "%{$query}%")
                  ->whereHas('customer', function ($q2) use ($user) {
                      $q2->when($user->branch_id, function ($q3) use ($user) {
                          return $q3->where('branch_id', $user->branch_id);
                      });
                  });
            })
            ->with('customer:id,full_name,cif_number')
            ->limit(15)
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'account_number' => $account->account_number,
                    'balance' => $account->balance,
                    'customer_name' => $account->customer->full_name,
                    'cif_number' => $account->customer->cif_number,
                ];
            });

        return response()->json($accounts);
    }
}
