<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Export the active user list as a PDF report.
     * Demonstrates custom logo configuration (e.g. using a base64 encoded png).
     */
    public function exportPdf(Request $request)
    {
        $users = User::with('roles')->take(30)->get();

        // Build data rows for PDF layout
        $rows = [];
        foreach ($users as $user) {
            $rolesList = $user->roles->pluck('name')->implode(', ');
            $rows[] = [
                $user->id,
                $user->name,
                $user->email,
                '<span class="badge badge-info">' . ($rolesList ?: 'No Role') . '</span>',
                $user->created_at->format('Y-m-d')
            ];
        }

        // Custom base64 logo (a simple blue square placeholder to showcase base64 logo uploading)
        // Developers can replace this with their actual base64 logo string from tenant settings.
        $logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gcKDA0FNDeUvQAAADtJREFUaN7t0EERAAAIA6BJ/55WwRccyCAdtJuJSYmIiYiJiImIiYiJiImIiYiJiImIiYiJiImIiYjJBzssDq9l9m3nAAAAAElFTkSuQmCC';

        $data = [
            'title' => 'System Active Users Report',
            'tenantName' => 'MainApp Administration',
            'exporter' => auth()->user() ? auth()->user()->name : 'System Automator',
            'date' => now()->format('d M Y, H:i'),
            'logoUrl' => $logoBase64, // Pass base64 image logo directly
            'headers' => ['ID', 'Full Name', 'Email Address', 'Roles', 'Joined Date'],
            'rows' => $rows
        ];

        return ReportService::generatePdf(
            'reports.template', 
            $data, 
            'users_report_' . now()->format('Ymd') . '.pdf',
            [
                'paper' => 'a4',
                'orientation' => 'portrait'
            ]
        );
    }

    /**
     * Export users list as an Excel spreadsheet.
     */
    public function exportExcel(Request $request)
    {
        $users = User::with('roles')->take(100)->get();

        $headers = ['User ID', 'Name', 'Email Address', 'Assigned Roles', 'Created At'];
        
        $rows = [];
        foreach ($users as $user) {
            $rows[] = [
                $user->id,
                $user->name,
                $user->email,
                $user->roles->pluck('name')->implode(', '),
                $user->created_at->format('Y-m-d H:i:s')
            ];
        }

        return ReportService::generateExcel(
            $headers, 
            $rows, 
            'users_list_' . now()->format('Ymd') . '.xlsx', 
            'User Accounts'
        );
    }

    /**
     * Export roles & permissions list as a Word document.
     */
    public function exportWord(Request $request)
    {
        $roles = Role::with('permissions')->take(20)->get();

        $title = "Roles and Permissions Policy Report";

        // Build structured sections for PHPWord
        $sections = [
            [
                'type' => 'text',
                'text' => 'This document lists the active security access roles registered in the MainApp system along with their permission policy parameters.',
                'style' => ['italic' => true, 'color' => '475569', 'spaceAfter' => 200]
            ],
            [
                'type' => 'text',
                'text' => 'System Policy Details',
                'style' => ['bold' => true, 'size' => 14, 'color' => '0F172A', 'spaceAfter' => 120]
            ]
        ];

        // Format a data table for Word document
        $tableHeaders = ['Role Name', 'Associated Permission Slugs'];
        $tableRows = [];

        foreach ($roles as $role) {
            $tableRows[] = [
                $role->name,
                $role->permissions->pluck('slug')->implode(', ') ?: 'No Permissions Assigned'
            ];
        }

        $sections[] = [
            'type' => 'table',
            'headers' => $tableHeaders,
            'rows' => $tableRows
        ];

        $sections[] = [
            'type' => 'text',
            'text' => 'End of Security Policy Audit Report. Generated automatically by MainApp Boilerplate.',
            'style' => ['bold' => true, 'size' => 9, 'color' => '94A3B8', 'spaceAfter' => 100]
        ];

        return ReportService::generateWord(
            $title,
            $sections,
            'roles_policy_' . now()->format('Ymd') . '.docx'
        );
    }
}
