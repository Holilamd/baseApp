import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import ConfirmDialog from '@/Components/ConfirmDialog';

export default function Index({ users, roles, branches, filters, auth }) {
    const [search, setSearch] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'id');
    const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');
    
    // Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form logic
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        roles: [],
        branch_id: '',
    });

    // Handle search query changes with debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                route('users.index'),
                { search, sort_by: sortBy, sort_dir: sortDir },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handleSort = (key, dir) => {
        setSortBy(key);
        setSortDir(dir);
        router.get(
            route('users.index'),
            { search, sort_by: key, sort_dir: dir },
            { preserveState: true }
        );
    };

    const handlePageChange = (page) => {
        router.get(
            route('users.index'),
            { page, search, sort_by: sortBy, sort_dir: sortDir },
            { preserveState: true }
        );
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditMode(false);
        setIsFormOpen(true);
    };

    const openEditModal = (user) => {
        clearErrors();
        setData({
            name: user.name,
            email: user.email,
            password: '',
            roles: user.roles.map(r => r.id),
            branch_id: user.branch_id || '',
        });
        setSelectedUser(user);
        setEditMode(true);
        setIsFormOpen(true);
    };

    const openDeleteConfirm = (user) => {
        setSelectedUser(user);
        setIsConfirmOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            put(route('users.update', selectedUser.id), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                }
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = () => {
        destroy(route('users.destroy', selectedUser.id), {
            onSuccess: () => {
                setIsConfirmOpen(false);
                setSelectedUser(null);
            }
        });
    };

    const toggleRole = (roleId) => {
        const currentRoles = [...data.roles];
        const index = currentRoles.indexOf(roleId);
        if (index > -1) {
            currentRoles.splice(index, 1);
        } else {
            currentRoles.push(roleId);
        }
        setData('roles', currentRoles);
    };

    // Columns config for DataTable
    const columns = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { 
            key: 'roles', 
            label: 'Roles', 
            render: (user) => (
                <div className="flex flex-wrap gap-1">
                    {user.roles.map(role => (
                        <span key={role.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-glow text-brand dark:bg-blue-900/30 dark:text-blue-400">
                            {role.name}
                        </span>
                    ))}
                    {user.roles.length === 0 && (
                        <span className="text-slate-400 dark:text-slate-600 text-xs">No role assigned</span>
                    )}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openEditModal(user)}
                        className="text-xs font-semibold text-brand hover:text-brand-hover dark:text-blue-450 dark:hover:text-blue-300 transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => openDeleteConfirm(user)}
                        className="text-xs font-semibold text-red-655 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            )
        }
    ];

    return (
        <AuthenticatedLayout header="User Management">
            <Head title="User Management" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Users</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-405 mt-1">Manage users, roles and tenant membership settings.</p>
                </div>
                <div>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-xl hover:bg-brand-hover transition-all flex items-center gap-2 shadow-sm shadow-brand/10"
                    >
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add User
                    </button>
                </div>
            </div>

            {/* DataTable Component */}
            <DataTable
                columns={columns}
                data={users.data}
                meta={users}
                onPageChange={handlePageChange}
                onSearch={setSearch}
                searchValue={search}
                searchPlaceholder="Search by name or email..."
                onSort={handleSort}
                sortBy={sortBy}
                sortDir={sortDir}
                loading={processing}
            />

            {/* Create/Edit Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto outline-none focus:outline-none">
                    <div className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
                    <div className="relative w-full max-w-lg mx-auto my-6 transition-all transform bg-white border border-slate-100 rounded-2xl shadow-2xl dark:bg-slate-900 dark:border-slate-800">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {editMode ? 'Edit User' : 'Create New User'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                                        required
                                    />
                                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Password {editMode && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                                        required={!editMode}
                                    />
                                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                                </div>

                                {!auth.user.branch_id && (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Branch</label>
                                        <select
                                            value={data.branch_id}
                                            onChange={e => setData('branch_id', e.target.value)}
                                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                                        >
                                            <option value="">Pusat (Super Admin)</option>
                                            {branches.map(branch => (
                                                <option key={branch.id} value={branch.id}>{branch.code} - {branch.name}</option>
                                            ))}
                                        </select>
                                        {errors.branch_id && <p className="text-xs text-red-500 mt-1">{errors.branch_id}</p>}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Assign Roles</label>
                                    <div className="grid grid-cols-2 gap-3 max-h-36 overflow-y-auto p-1">
                                        {roles.map(role => (
                                            <label key={role.id} className="flex items-center gap-2.5 p-2.5 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40">
                                                <input
                                                    type="checkbox"
                                                    checked={data.roles.includes(role.id)}
                                                    onChange={() => toggleRole(role.id)}
                                                    className="rounded border-slate-300 text-brand focus:ring-brand focus:ring-offset-0 dark:bg-slate-950 dark:border-slate-800"
                                                />
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{role.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.roles && <p className="text-xs text-red-500 mt-1">{errors.roles}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-850 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 text-sm font-medium transition-colors border rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white transition-colors bg-brand rounded-xl hover:bg-brand-hover disabled:opacity-50"
                                >
                                    {editMode ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                loading={processing}
                title="Delete User"
                message={`Are you sure you want to delete ${selectedUser?.name}'s account? This will remove all their role assignments permanently.`}
            />
        </AuthenticatedLayout>
    );
}
