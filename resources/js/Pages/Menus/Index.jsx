import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DataTable from '@/Components/DataTable';
import ConfirmDialog from '@/Components/ConfirmDialog';

export default function Index({ menus, parentMenus, roles }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        url: '',
        icon: '',
        parent_id: '',
        order: 0,
        permissions: [], // Array of objects: { name: '', slug: '' }
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditMode(false);
        setIsFormOpen(true);
    };

    const openEditModal = (menu) => {
        clearErrors();
        setData({
            name: menu.name,
            url: menu.url || '',
            icon: menu.icon || '',
            parent_id: menu.parent_id || '',
            order: menu.order,
            permissions: menu.permissions ? menu.permissions.map(p => ({ id: p.id, name: p.name, slug: p.slug })) : [],
        });
        setSelectedMenu(menu);
        setEditMode(true);
        setIsFormOpen(true);
    };

    const openDeleteConfirm = (menu) => {
        setSelectedMenu(menu);
        setIsConfirmOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...data,
            parent_id: data.parent_id === '' ? null : data.parent_id,
        };

        if (editMode) {
            router.put(route('menus.update', selectedMenu.id), payload, {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                }
            });
        } else {
            router.post(route('menus.store'), payload, {
                onSuccess: () => {
                    setIsFormOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = () => {
        destroy(route('menus.destroy', selectedMenu.id), {
            onSuccess: () => {
                setIsConfirmOpen(false);
                setSelectedMenu(null);
            }
        });
    };

    const addPermissionRow = () => {
        setData('permissions', [...data.permissions, { id: null, name: '', slug: '' }]);
    };

    const updatePermissionField = (index, field, value) => {
        const updated = [...data.permissions];
        updated[index][field] = value;
        setData('permissions', updated);
    };

    const removePermissionRow = (index) => {
        const updated = [...data.permissions];
        updated.splice(index, 1);
        setData('permissions', updated);
    };

    const columns = [
        { key: 'id', label: 'ID', sortable: false },
        { key: 'name', label: 'Name', sortable: false },
        { key: 'url', label: 'URL', sortable: false },
        { key: 'icon', label: 'Icon', sortable: false },
        { 
            key: 'parent', 
            label: 'Parent Menu', 
            render: (menu) => menu.parent ? menu.parent.name : <span className="text-slate-400">-</span> 
        },
        { 
            key: 'permissions', 
            label: 'Owned Permissions', 
            render: (menu) => (
                <div className="flex flex-wrap gap-1 max-w-xs">
                    {menu.permissions && menu.permissions.map(p => (
                        <span key={p.id} className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                            {p.slug}
                        </span>
                    ))}
                    {(!menu.permissions || menu.permissions.length === 0) && (
                        <span className="text-slate-400 text-[10px]">-</span>
                    )}
                </div>
            ) 
        },
        { key: 'order', label: 'Order', sortable: false },
        {
            key: 'actions',
            label: 'Actions',
            render: (menu) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openEditModal(menu)}
                        className="text-xs font-semibold text-brand hover:text-brand-hover dark:text-brand transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => openDeleteConfirm(menu)}
                        className="text-xs font-semibold text-red-650 hover:text-red-700 dark:text-red-400 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            )
        }
    ];

    return (
        <AuthenticatedLayout header="Menu Management">
            <Head title="Menu Management" />

            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Menus</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage dynamic sidebar navigation links and define actions permission requirements for them.</p>
                </div>
                <div>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-xl hover:bg-brand-hover transition-all flex items-center gap-2 shadow-sm"
                    >
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Menu
                    </button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={menus}
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
                                    {editMode ? 'Edit Menu' : 'Create New Menu'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-355"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm dark:bg-slate-955 dark:border-slate-800 dark:text-white"
                                            required
                                        />
                                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">URL Path</label>
                                        <input
                                            type="text"
                                            value={data.url}
                                            onChange={e => setData('url', e.target.value)}
                                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm dark:bg-slate-955 dark:border-slate-800 dark:text-white"
                                            placeholder="/route-path"
                                        />
                                        {errors.url && <p className="text-xs text-red-500 mt-1">{errors.url}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Icon (Lucide name)</label>
                                        <input
                                            type="text"
                                            value={data.icon}
                                            onChange={e => setData('icon', e.target.value)}
                                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm dark:bg-slate-955 dark:border-slate-800 dark:text-white"
                                            placeholder="Users, Settings, Shield..."
                                        />
                                        {errors.icon && <p className="text-xs text-red-500 mt-1">{errors.icon}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Order Sequence</label>
                                        <input
                                            type="number"
                                            value={data.order}
                                            onChange={e => setData('order', parseInt(e.target.value))}
                                            className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm dark:bg-slate-955 dark:border-slate-800 dark:text-white"
                                            required
                                        />
                                        {errors.order && <p className="text-xs text-red-500 mt-1">{errors.order}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Parent Menu (Optional)</label>
                                    <select
                                        value={data.parent_id}
                                        onChange={e => setData('parent_id', e.target.value)}
                                        className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm dark:bg-slate-955 dark:border-slate-800 dark:text-white"
                                    >
                                        <option value="">None (Top-Level)</option>
                                        {parentMenus.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                    {errors.parent_id && <p className="text-xs text-red-500 mt-1">{errors.parent_id}</p>}
                                </div>

                                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-xs font-semibold text-slate-750 dark:text-slate-300 font-semibold">Define Pages Permissions</label>
                                        <button
                                            type="button"
                                            onClick={addPermissionRow}
                                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg dark:bg-blue-950/20 dark:text-blue-400 transition-colors"
                                        >
                                            + Add Row
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-2 max-h-36 overflow-y-auto p-1 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl">
                                        {data.permissions.map((perm, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <input
                                                    type="text"
                                                    value={perm.name}
                                                    onChange={e => updatePermissionField(idx, 'name', e.target.value)}
                                                    placeholder="Permission Name (e.g. View Users)"
                                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    value={perm.slug}
                                                    onChange={e => updatePermissionField(idx, 'slug', e.target.value)}
                                                    placeholder="Slug Key (e.g. users.view)"
                                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removePermissionRow(idx)}
                                                    className="p-1.5 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        {data.permissions.length === 0 && (
                                            <p className="text-center text-[10px] text-slate-400 py-3">No custom permissions added yet.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 text-sm font-medium transition-colors border rounded-xl text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200 dark:text-slate-350 dark:bg-slate-805 dark:hover:bg-slate-700 dark:border-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white transition-colors bg-brand rounded-xl hover:bg-brand-hover disabled:opacity-50"
                                >
                                    {editMode ? 'Save Changes' : 'Create Menu'}
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
                title="Delete Menu"
                message={`Are you sure you want to delete the "${selectedMenu?.name}" menu? This will permanently delete it and its submenus.`}
            />
        </AuthenticatedLayout>
    );
}
