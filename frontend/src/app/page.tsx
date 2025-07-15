'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Welcome to NestJS & NextJS Authentication App
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            A full-stack authentication system built with NestJS backend and NextJS frontend,
            featuring email verification, two-factor authentication, role-based access control,
            and secure resource management.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Email Verification
              </h3>
              <p className="text-gray-600">
                Secure registration process with email verification to ensure account authenticity.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Two-Factor Authentication
              </h3>
              <p className="text-gray-600">
                Enhanced security with 2FA support using email-based verification codes.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Role-Based Access Control
              </h3>
              <p className="text-gray-600">
                Fine-grained permission system with user roles and protected endpoints.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Public & Private Resources
              </h3>
              <p className="text-gray-600">
                Differentiated access to public resources and user-specific private content.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Admin Dashboard
              </h3>
              <p className="text-gray-600">
                Administrative interface for managing users and viewing all resources.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Modern Tech Stack
              </h3>
              <p className="text-gray-600">
                Built with NestJS, NextJS, TypeORM, PostgreSQL, and TailwindCSS.
              </p>
            </div>
          </div>

          <div className="space-x-4">
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-6 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
