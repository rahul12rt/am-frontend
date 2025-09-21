"use client";
import React from 'react';
import { useUser } from '@/contexts/UserContext';

/**
 * Test component to verify UserContext functionality
 * This component demonstrates the improved loading states and centralized profile management
 */
const UserContextTest = () => {
  const { 
    user, 
    profile, 
    isInitializing, 
    isLoadingProfile, 
    isAuthenticated, 
    isReady 
  } = useUser();

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg">
      <h3 className="text-lg font-bold mb-4">User Context Status</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Initializing:</strong> {isInitializing ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Loading Profile:</strong> {isLoadingProfile ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Ready:</strong> {isReady ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>User ID:</strong> {user?.id || 'None'}
        </div>
        <div>
          <strong>Profile Name:</strong> {profile?.first_name || 'None'}
        </div>
        
        {/* Loading State Indicator */}
        {(isInitializing || isLoadingProfile) && (
          <div className="mt-4 p-2 bg-blue-900/20 border border-blue-600/30 rounded">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <span className="text-blue-300">
                {isInitializing ? 'Checking authentication...' : 'Loading profile...'}
              </span>
            </div>
          </div>
        )}
        
        {/* Ready State */}
        {isReady && (
          <div className="mt-4 p-2 bg-green-900/20 border border-green-600/30 rounded">
            <span className="text-green-300">✓ User context ready!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserContextTest;
