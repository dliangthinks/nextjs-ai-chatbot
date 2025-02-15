import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import React from 'react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify admin user
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    // Redirect non-admin users to the home page
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 bg-card shadow">
        <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
      </header>
      <main className="p-4">
        {children}
      </main>
    </div>
  );
} 