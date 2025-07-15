'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { resourcesApi, authApi } from '@/lib/api';
import { LogOut, Plus, Shield, User, Edit, Trash2 } from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  isActive: boolean;
}

export default function DashboardPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [publicResources, setPublicResources] = useState<any[]>([]);
  const [adminResources, setAdminResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newResource, setNewResource] = useState({ title: '', content: '' });
  const { user, logout, isAuthenticated, refreshProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [isAuthenticated, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch public resources
      const publicResponse = await resourcesApi.getPublic();
      setPublicResources(publicResponse.data.data);

      // Fetch user's private resources
      const privateResponse = await resourcesApi.getAll();
      setResources(privateResponse.data);

      // Fetch admin resources if user is admin
      if (user?.roles?.some((role) => role.name === 'ADMIN')) {
        const adminResponse = await resourcesApi.getAllForAdmin();
        setAdminResources(adminResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResource = async () => {
    if (!newResource.title || !newResource.content) return;

    setCreating(true);
    try {
      await resourcesApi.create(newResource);
      setNewResource({ title: '', content: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating resource:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteResource = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      await resourcesApi.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const toggleTwoFactor = async () => {
    try {
      if (user?.isTwoFactorEnabled) {
        await authApi.disableTwoFactor();
      } else {
        await authApi.enableTwoFactor();
      }
      // Refresh user profile to get updated 2FA status
      await refreshProfile();
    } catch (error) {
      console.error('Error toggling 2FA:', error);
    }
  };

  const isAdmin = user?.roles?.some((role) => role.name === 'ADMIN');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm text-gray-600">{user?.email}</span>
                {isAdmin && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                    Admin
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTwoFactor}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                  user?.isTwoFactorEnabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>2FA: {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Public Resources */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Public Resources</h2>
            <div className="space-y-3">
              {publicResources.map((resource) => (
                <div key={resource.id} className="p-3 bg-gray-50 rounded">
                  <h3 className="font-medium">{resource.title}</h3>
                  <p className="text-sm text-gray-600">{resource.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Private Resources */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">My Resources</h2>
              <button
                onClick={() => setCreating(!creating)}
                className="flex items-center space-x-2 px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {creating && (
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <input
                  type="text"
                  placeholder="Resource title"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                />
                <textarea
                  placeholder="Resource content"
                  value={newResource.content}
                  onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateResource}
                    disabled={!newResource.title || !newResource.content}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setCreating(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {resources.map((resource) => (
                <div key={resource.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{resource.title}</h3>
                      <p className="text-sm text-gray-600">{resource.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Resources */}
          {isAdmin && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">All Resources (Admin)</h2>
              <div className="space-y-3">
                {adminResources.map((resource) => (
                  <div key={resource.id} className="p-3 bg-red-50 rounded">
                    <h3 className="font-medium">{resource.title}</h3>
                    <p className="text-sm text-gray-600">{resource.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 