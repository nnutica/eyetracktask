'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseProfile } from '@/hooks/useSupabaseProfile';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, updateProfile, updateProfilePicture, logout } = useSupabaseProfile();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setMounted(true);
    if (profile) {
      setFormData({
        username: profile.username,
        email: profile.email,
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
      await updateProfile({
        username: formData.username,
        email: formData.email,
      });
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username,
        email: profile.email,
      });
    }
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }

    setError('');
    setSuccess('');
    setIsUploading(true);
    try {
      await updateProfilePicture(file);
      setSuccess('Profile picture updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        router.push('/login');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to logout');
      }
    }
  };

  if (!mounted || !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F1115]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="mt-2 text-gray-400">Manage your account information</p>
          </div>
          <Button variant="ghost" onClick={() => router.back()}>
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-950 border border-red-800 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-lg bg-green-950 border border-green-800 p-4">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="rounded-lg border border-gray-800 bg-[#1E2128] p-8">
          {/* Profile Picture Section */}
          <div className="mb-8 border-b border-gray-700 pb-8">
            <h2 className="mb-4 text-lg font-semibold text-white">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-blue-600">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-800 text-4xl font-bold text-gray-400">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer">
                  <div className="rounded-lg border-2 border-dashed border-gray-700 bg-[#0F1115] px-6 py-3 text-sm text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-300">
                    <svg className="mr-2 inline-block h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {isUploading ? 'Uploading...' : 'Change Picture'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">JPG, PNG or GIF. Max 10MB (auto-compressed to 400x400)</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Personal Information</h2>
              {!isEditing && (
                <Button variant="primary" onClick={() => setIsEditing(true)}>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter your username"
                  />
                ) : (
                  <div className="rounded-lg bg-[#0F1115] px-4 py-2.5 text-white">{profile.username}</div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg bg-[#0F1115] px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="rounded-lg bg-[#0F1115] px-4 py-2.5 text-white">{profile.email}</div>
                )}
              </div>

              {/* Account Created */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Member Since</label>
                <div className="rounded-lg bg-[#0F1115] px-4 py-2.5 text-gray-400">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="ghost" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Logout Section */}
          <div className="mt-8 border-t border-gray-700 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Logout</h3>
                <p className="mt-1 text-sm text-gray-400">Sign out from your account</p>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="bg-red-950 text-red-400 hover:bg-red-900"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
