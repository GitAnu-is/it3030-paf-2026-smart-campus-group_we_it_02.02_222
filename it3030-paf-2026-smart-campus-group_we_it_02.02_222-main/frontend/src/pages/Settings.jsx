import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getNotificationPreferences, updateNotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES, } from '../lib/api';
import { Bell, Shield, User, Smartphone } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
export function Settings() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATION_PREFERENCES);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null);

  const [profileForm, setProfileForm] = useState({
    displayName: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (activeTab !== 'profile' || !user) return;
    setProfileForm({
      displayName: user.displayName || user.name || '',
      avatarUrl: user.avatar || '',
    });
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab !== 'notifications' || !user) return;

    let isMounted = true;
    setNotificationMessage(null);
    getNotificationPreferences(user.id)
      .then((preferences) => {
        if (isMounted) {
          setNotifications(preferences);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNotificationMessage({
            type: 'error',
            text: 'Could not load notification preferences.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, user]);

  const toggleNotification = async (key) => {
    if (!user || isSavingNotifications) return;

    const nextPreferences = {
      ...notifications,
      [key]: !notifications[key],
    };

    setNotifications(nextPreferences);
    setIsSavingNotifications(true);
    setNotificationMessage(null);

    try {
      await updateNotificationPreferences(user.id, nextPreferences);
      setNotificationMessage({
        type: 'success',
        text: 'Notification preferences saved.',
      });
    } catch {
      setNotifications(notifications);
      setNotificationMessage({
        type: 'error',
        text: 'Could not save notification preferences.',
      });
    } finally {
      setIsSavingNotifications(false);
    }
  };

    const tabButtonClass = useMemo(() => {
        const base = 'w-full flex items-center px-4 py-3 rounded-lg font-medium transition-colors';
        return (isActive) =>
            isActive
                ? `${base} bg-white text-primary-600 shadow-sm border border-slate-200`
                : `${base} text-slate-600 hover:bg-slate-100`;
    }, []);

    const renderRightPanel = () => {
        if (activeTab === 'profile') {
            if (!user) {
                return (<EmptyState
          icon={User}
          title="No profile available"
          description="Sign in to view your profile details."
        />);
            }

            const initial = (user.name || user.email || '?').trim()?.[0]?.toUpperCase() || '?';

            const displayNameValue = profileForm.displayName;
            const avatarUrlValue = profileForm.avatarUrl;

            const handleChange = (key) => (e) => {
                setProfileMessage(null);
                setProfileForm((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                }));
            };

            const handleAvatarFile = (e) => {
              setProfileMessage(null);
              const file = e.target.files?.[0];
              if (!file) return;
              if (!file.type?.startsWith('image/')) {
                setProfileMessage({ type: 'error', text: 'Please select an image file.' });
                return;
              }

              const reader = new FileReader();
              reader.onload = () => {
                const result = typeof reader.result === 'string' ? reader.result : '';
                if (!result) {
                  setProfileMessage({ type: 'error', text: 'Could not read the selected image.' });
                  return;
                }
                setProfileForm((prev) => ({
                  ...prev,
                  avatarUrl: result,
                }));
              };
              reader.onerror = () => {
                setProfileMessage({ type: 'error', text: 'Could not read the selected image.' });
              };
              reader.readAsDataURL(file);
            };

            const handleSave = async () => {
                if (!updateProfile) {
                    setProfileMessage({ type: 'error', text: 'Profile updates are not available.' });
                    return;
                }
                setIsSavingProfile(true);
                setProfileMessage(null);
                const res = await updateProfile({
                    displayName: displayNameValue,
                    avatarUrl: avatarUrlValue,
                });
                if (res?.success) {
                    setProfileMessage({ type: 'success', text: 'Profile updated.' });
                }
                else {
                    setProfileMessage({ type: 'error', text: res?.error || 'Profile update failed.' });
                }
                setIsSavingProfile(false);
            };

            return (<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            <p className="text-sm text-slate-500 mt-1">Your account information.</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              {(avatarUrlValue || user.avatar) ? (<img
                  src={avatarUrlValue || user.avatar}
                  alt={user.name || 'User avatar'}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />) : (<div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-semibold border border-primary-100">
                  {initial}
                </div>)}

              <div>
                <div className="text-slate-900 font-semibold">{user.name || '—'}</div>
                <div className="text-sm text-slate-500">{user.email || '—'}</div>
              </div>
            </div>

            {profileMessage && (<div className={`text-sm px-4 py-3 rounded-lg border ${profileMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'}`}>
                {profileMessage.text}
              </div>)}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayNameValue}
                  onChange={handleChange('displayName')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Choose an image to use as your profile picture.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-xs font-medium text-slate-500">Username</div>
                <div className="text-sm font-semibold text-slate-900 mt-1">{user.username || '—'}</div>
              </div>
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-xs font-medium text-slate-500">Role</div>
                <div className="text-sm font-semibold text-slate-900 mt-1">{user.role || '—'}</div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSavingProfile}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isSavingProfile
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'text-primary-600 bg-primary-50 hover:bg-primary-100'}`}
              >
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>);
        }

        if (activeTab === 'security') {
            return (<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Security</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your account security.</p>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600">
            Security settings are not available yet.
          </p>
        </div>
      </div>);
        }

        // Notifications (default)
        return (<>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Notification Preferences
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Choose what you want to be notified about.
            </p>
          </div>

          {notificationMessage && (
            <div className={`mx-6 mt-6 text-sm px-4 py-3 rounded-lg border ${notificationMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'}`}>
              {notificationMessage.text}
            </div>
          )}

          <div className="divide-y divide-slate-100">
            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">
                  Booking Updates
                </h3>
                <p className="text-sm text-slate-500">
                  Approvals, rejections, and cancellations
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification('bookings')}
                disabled={isSavingNotifications}
                className={`w-11 h-6 rounded-full transition-colors relative ${notifications.bookings ? 'bg-primary-600' : 'bg-slate-200'}`}
                aria-pressed={notifications.bookings}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.bookings ? 'translate-x-5' : 'translate-x-0'}`}/>
              </button>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">
                  Ticket Status Changes
                </h3>
                <p className="text-sm text-slate-500">
                  When a maintenance ticket is updated
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification('tickets')}
                disabled={isSavingNotifications}
                className={`w-11 h-6 rounded-full transition-colors relative ${notifications.tickets ? 'bg-primary-600' : 'bg-slate-200'}`}
                aria-pressed={notifications.tickets}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.tickets ? 'translate-x-5' : 'translate-x-0'}`}/>
              </button>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">New Comments</h3>
                <p className="text-sm text-slate-500">
                  When someone comments on your ticket
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification('comments')}
                disabled={isSavingNotifications}
                className={`w-11 h-6 rounded-full transition-colors relative ${notifications.comments ? 'bg-primary-600' : 'bg-slate-200'}`}
                aria-pressed={notifications.comments}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.comments ? 'translate-x-5' : 'translate-x-0'}`}/>
              </button>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900">
                  System Announcements
                </h3>
                <p className="text-sm text-slate-500">
                  Platform updates and maintenance notices
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleNotification('system')}
                disabled={isSavingNotifications}
                className={`w-11 h-6 rounded-full transition-colors relative ${notifications.system ? 'bg-primary-600' : 'bg-slate-200'}`}
                aria-pressed={notifications.system}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.system ? 'translate-x-5' : 'translate-x-0'}`}/>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center">
            <Smartphone className="w-8 h-8 text-slate-400 mr-4"/>
            <div>
              <h3 className="font-medium text-slate-900">
                Push Notifications
              </h3>
              <p className="text-sm text-slate-500">
                Enable push notifications on this device
              </p>
            </div>
            <button
              type="button"
              className="ml-auto px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              Enable
            </button>
          </div>
        </div>
      </>);
    };
    return (<div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={tabButtonClass(activeTab === 'notifications')}
          >
            <Bell className="w-5 h-5 mr-3"/> Notifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={tabButtonClass(activeTab === 'profile')}
          >
            <User className="w-5 h-5 mr-3"/> Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={tabButtonClass(activeTab === 'security')}
          >
            <Shield className="w-5 h-5 mr-3"/> Security
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          {renderRightPanel()}
        </div>
      </div>
    </div>);
}
