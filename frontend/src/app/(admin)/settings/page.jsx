'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { changePassword, createStaffUser, getStaffUsers } from '@/lib/api';
import { KeyRound, ShieldCheck, UserPlus, Users, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/components/AuthContext';

const inputClass = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-600 dark:border-gray-700 dark:bg-gray-900 dark:text-white';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [staffForm, setStaffForm] = useState({ fullName: '', email: '', password: '', role: 'moderator' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [creatingStaff, setCreatingStaff] = useState(false);

  const loadStaff = async () => {
    setLoadingStaff(true);
    try {
      const response = await getStaffUsers();
      setStaff(Array.isArray(response) ? response : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load staff accounts');
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    let active = true;
    getStaffUsers()
      .then((response) => {
        if (active) setStaff(Array.isArray(response) ? response : []);
      })
      .catch((error) => {
        if (active) toast.error(error.message || 'Failed to load staff accounts');
      })
      .finally(() => {
        if (active) setLoadingStaff(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCreateStaff = async (event) => {
    event.preventDefault();
    setCreatingStaff(true);
    try {
      const created = await createStaffUser(staffForm);
      setStaff((current) => [created, ...current]);
      setStaffForm({ fullName: '', email: '', password: '', role: 'moderator' });
      toast.success(`${created.role === 'admin' ? 'Admin' : 'Moderator'} account created`);
    } catch (error) {
      toast.error(error.message || 'Failed to create staff account');
    } finally {
      setCreatingStaff(false);
    }
  };

  return (
    <AdminLayout activeSection="Settings" searchPlaceholder="Search settings...">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your password and panel access.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#161623]">
          <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950"><KeyRound className="h-5 w-5" /></div><div><h2 className="font-bold text-gray-900 dark:text-white">Change password</h2><p className="text-xs text-gray-500">Signed in as {user?.email}</p></div></div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input type="password" required minLength={6} placeholder="Current password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} className={inputClass} />
            <input type="password" required minLength={6} placeholder="New password (6+ characters)" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} className={inputClass} />
            <input type="password" required minLength={6} placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} className={inputClass} />
            <button disabled={savingPassword} className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 dark:bg-white dark:text-black">{savingPassword && <Loader2 className="h-4 w-4 animate-spin" />} Update password</button>
          </form>
        </section>

        {user?.role === 'admin' ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#161623]">
            <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950"><UserPlus className="h-5 w-5" /></div><div><h2 className="font-bold text-gray-900 dark:text-white">Add panel user</h2><p className="text-xs text-gray-500">Create an admin or moderator account.</p></div></div>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <input required placeholder="Full name" value={staffForm.fullName} onChange={(event) => setStaffForm({ ...staffForm, fullName: event.target.value })} className={inputClass} />
              <input required type="email" placeholder="Email address" value={staffForm.email} onChange={(event) => setStaffForm({ ...staffForm, email: event.target.value })} className={inputClass} />
              <div className="grid gap-4 sm:grid-cols-2"><input required minLength={6} type="password" placeholder="Temporary password" value={staffForm.password} onChange={(event) => setStaffForm({ ...staffForm, password: event.target.value })} className={inputClass} /><select value={staffForm.role} onChange={(event) => setStaffForm({ ...staffForm, role: event.target.value })} className={inputClass}><option value="moderator">Moderator</option><option value="admin">Admin</option></select></div>
              <button disabled={creatingStaff} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">{creatingStaff && <Loader2 className="h-4 w-4 animate-spin" />} Create account</button>
            </form>
          </section>
        ) : (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#161623]"><ShieldCheck className="h-7 w-7 text-indigo-600" /><h2 className="mt-3 font-bold text-gray-900 dark:text-white">Moderator access</h2><p className="mt-1 text-sm text-gray-500">You can manage the panel, but only an admin can create or manage staff accounts.</p></section>
        )}
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#161623]">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4 dark:border-gray-800"><Users className="h-5 w-5 text-indigo-600" /><div><h2 className="font-bold text-gray-900 dark:text-white">Panel users</h2><p className="text-xs text-gray-500">Accounts with access to the admin panel.</p></div></div>
        {loadingStaff ? <div className="p-8 text-center text-sm text-gray-500">Loading staff accounts...</div> : <div className="divide-y divide-gray-100 dark:divide-gray-800">{staff.map((member) => <div key={member._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"><div><p className="font-semibold text-gray-900 dark:text-white">{member.fullName}</p><p className="text-sm text-gray-500">{member.email}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${member.role === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>{member.role}</span></div>)}</div>}
      </section>
    </AdminLayout>
  );
}
