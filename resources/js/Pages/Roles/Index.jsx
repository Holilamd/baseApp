import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import ConfirmDialog from '@/Components/ConfirmDialog';

export default function Index({ roles, permissions, menus }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        permissions: [],
        menus: [],
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditMode(false);
        setIsFormOpen(true);
    };

    const openEditModal = (role) => {
        clearErrors();
        setData({
            name: role.name,
            permissions: role.permissions ? role.permissions.map(p => p.id) : [],
            menus: role.menus ? role.menus.map(m => m.id) : [],
        });
        setSelectedRole(role);
        setEditMode(true);
        setIsFormOpen(true);
    };

    const openDeleteConfirm = (role) => {
        setSelectedRole(role);
        setIsConfirmOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            put(route('roles.update', selectedRole.id), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                }
            });
        } else {
            post(route('roles.store'), {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = () => {
        destroy(route('roles.destroy', selectedRole.id), {
            onSuccess: () => {
                setIsConfirmOpen(false);
                setSelectedRole(null);
            }
        });
    };

    const togglePermission = (permId) => {
        const currentPerms = [...data.permissions];
        const index = currentPerms.indexOf(permId);
        if (index > -1) {
            currentPerms.splice(index, 1);
        } else {
            currentPerms.push(permId);
        }
        setData('permissions', currentPerms);
    };

    const toggleMenu = (menuId) => {
        const currentMenus = [...data.menus];
        const index = currentMenus.indexOf(menuId);
        if (index > -1) {
            currentMenus.splice(index, 1);
        } else {
            currentMenus.push(menuId);
        }
        setData('menus', currentMenus);
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        { key: 'name', label: 'Role Name', sortable: false },
        { 
            key: 'permissions', 
            label: 'Permissions', 
            render: (role) => (
                <div className="flex flex-wrap gap-1 max-w-sm">
                    {role.permissions.map(p => (
                        <span key={p.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                            {p.slug}
                        </span>
                    ))}
                    {role.permissions.length === 0 && (
                        <span className="text-slate-400 dark:text-slate-600 text-xs">No permissions</span>
                    )}
                </div>
            )
        },
        { 
            key: 'menus', 
            label: 'Sidebar Menus', 
            render: (role) => (
                <div className="flex flex-wrap gap-1 max-w-xs">
                    {role.menus.map(m => (
                        <span key={m.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-brand-glow text-brand dark:bg-blue-950/20 dark:text-blue-400">
                            {m.name}
                        </span>
                    ))}
                    {role.menus.length === 0 && (
                        <span className="text-slate-400 dark:text-slate-600 text-xs">No menus</span>
                    )}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (role) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openEditModal(role)}
                        className="text-xs font-semibold text-brand hover:text-brand-hover dark:text-brand transition-colors"
                    >
                        Edit
                    </button>
                    {role.name !== 'Super Admin' && (
                        <button
                            onClick={() => openDeleteConfirm(role)}
                            className="text-xs font-semibold text-red-650 hover:text-red-700 dark:text-red-400 transition-colors"
                        >
                            Delete
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <AuthenticatedLayout header="Role Management">
            <Head title="Role Management" />

            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Roles</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure system Roles and map system access permissions.</p>
                </div>
                <div>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-xl hover:bg-brand-hover transition-all flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Role
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={roles}
                loading={processing}
            />

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto outline-none focus:outline-none">
                    <div className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsFormOpen(false)}></div>
                    <div className="relative w-full max-w-lg mx-auto my-6 transition-all transform bg-white border border-slate-100 rounded-2xl shadow-2xl dark:bg-slate-900 dark:border-slate-800">
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {editMode ? 'Edit Role' : 'Create New Role'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="text-slate-400 hover:text-slate-505 dark:hover:text-slate-300"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5">Role Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                                        required
                                        disabled={editMode && selectedRole?.name === 'Super Admin'}
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-750 dark:text-slate-300 mb-2 font-semibold">Check Allowed Sidebar Menus</label>
                                    <div className="grid grid-cols-2 gap-2.5 max-h-36 overflow-y-auto p-1.5 border border-slate-100 dark:border-slate-800/60 rounded-xl mb-4">
                                        {menus.map(menu => (
                                            <label key={menu.id} className="flex items-center gap-2.5 p-2 border border-slate-50/50 rounded-lg cursor-pointer hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-800/40">
                                                <input
                                                    type="checkbox"
                                                    checked={data.menus.includes(menu.id)}
                                                    onChange={() => toggleMenu(menu.id)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 dark:bg-slate-955 dark:border-slate-800"
                                                />
                                                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{menu.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.menus && <p className="text-xs text-red-500 mt-1">{errors.menus}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-750 dark:text-slate-300 mb-2 font-semibold">Check Allowed Permissions (Grouped by Menu)</label>
                                    <div className="max-h-60 overflow-y-auto p-3 border border-slate-105 dark:border-slate-800/60 rounded-xl space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
                                        {/* Group by menus */}
                                        {menus.map(menu => {
                                            const menuPermissions = permissions.filter(p => p.menu_id === menu.id);
                                            if (menuPermissions.length === 0) return null;
                                            return (
                                                <div key={menu.id} className="space-y-1.5">
                                                    <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/40 pb-1">
                                                        {menu.name}
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {menuPermissions.map(perm => (
                                                            <label key={perm.id} className="flex items-center gap-2 p-1.5 bg-white border border-slate-100/50 rounded-lg cursor-pointer hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-850 dark:hover:bg-slate-800/45">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={data.permissions.includes(perm.id)}
                                                                    onChange={() => togglePermission(perm.id)}
                                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 dark:bg-slate-955 dark:border-slate-800"
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] font-semibold text-slate-850 dark:text-slate-200">{perm.name}</span>
                                                                    <span className="text-[8px] text-slate-400 dark:text-slate-500">{perm.slug}</span>
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Orphan permissions */}
                                        {permissions.filter(p => !p.menu_id).length > 0 && (
                                            <div className="space-y-1.5">
                                                <h4 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/40 pb-1">
                                                    General / Miscellaneous
                                                </h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {permissions.filter(p => !p.menu_id).map(perm => (
                                                        <label key={perm.id} className="flex items-center gap-2 p-1.5 bg-white border border-slate-100/50 rounded-lg cursor-pointer hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-850 dark:hover:bg-slate-800/45">
                                                            <input
                                                                type="checkbox"
                                                                checked={data.permissions.includes(perm.id)}
                                                                onChange={() => togglePermission(perm.id)}
                                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 dark:bg-slate-955 dark:border-slate-800"
                                                            />
                                                            <div className="flex flex-col">
                                                                    <span className="text-[10px] font-semibold text-slate-855 dark:text-slate-200">{perm.name}</span>
                                                                    <span className="text-[8px] text-slate-400 dark:text-slate-500">{perm.slug}</span>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {errors.permissions && <p className="text-xs text-red-500 mt-1">{errors.permissions}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 text-sm font-medium transition-colors border rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-850 dark:hover:bg-slate-700 dark:border-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white transition-colors bg-brand rounded-xl hover:bg-brand-hover disabled:opacity-50"
                                >
                                    {editMode ? 'Save Changes' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                loading={processing}
                title="Delete Role"
                message={`Are you sure you want to delete the "${selectedRole?.name}" role? Users assigned to this role will lose their mapped permission privileges.`}
            />
        </AuthenticatedLayout>
    );
}
