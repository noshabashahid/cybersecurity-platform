import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api, { extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg(''); setProfileErr('');
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', { name });
      setUser(res.data.user);
      localStorage.setItem('cs_user', JSON.stringify(res.data.user));
      setProfileMsg('Profile updated successfully.');
    } catch (err) {
      setProfileErr(extractErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg(''); setPwErr('');
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwErr('New passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg('Password changed successfully.');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setPwErr(extractErrorMessage(err));
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">👤 Profile Settings</h1>
      <p className="text-slate-500 text-sm mt-1">Manage your account details and security settings.</p>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <form onSubmit={handleProfileSave} className="card p-6 space-y-4">
          <h2 className="font-semibold">Account Information</h2>
          <div>
            <label className="label">Full name</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Email address</label>
            <input className="input-field opacity-60" value={user?.email} disabled />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input-field opacity-60 capitalize" value={user?.role} disabled />
          </div>
          {profileMsg && <p className="text-sm text-accent-green">{profileMsg}</p>}
          {profileErr && <p className="text-sm text-accent-red">{profileErr}</p>}
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        <form onSubmit={handlePasswordChange} className="card p-6 space-y-4">
          <h2 className="font-semibold">Change Password</h2>
          <div>
            <label className="label">Current password</label>
            <input type="password" required className="input-field" value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="label">New password</label>
            <input type="password" required className="input-field" value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input type="password" required className="input-field" value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
          </div>
          {pwMsg && <p className="text-sm text-accent-green">{pwMsg}</p>}
          {pwErr && <p className="text-sm text-accent-red">{pwErr}</p>}
          <button type="submit" disabled={savingPw} className="btn-primary">
            {savingPw ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
