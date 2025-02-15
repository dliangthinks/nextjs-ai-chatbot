'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type User = {
  id: string;
  email: string;
  password?: string;
  name: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users');
    if (response.ok) {
      const data = await response.json();
      setUsers(data);
    } else {
      const errorText = await response.text();
      console.error("Failed to fetch users:", errorText);
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    const response = await fetch(`/api/admin/users?id=${userId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      toast.success("User deleted");
      fetchUsers();
    } else {
      toast.error("Failed to delete user");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const response = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: editingUser.id,
        email: editingUser.email,
        password: editingUser.password,
      }),
    });
    if (response.ok) {
      toast.success("User updated");
      setEditingUser(null);
      fetchUsers();
    } else {
      toast.error("Failed to update user");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">User List</h2>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded">
              {editingUser?.id === user.id ? (
                <form onSubmit={handleUpdateUser} className="flex gap-4 flex-1">
                  <Input
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, email: e.target.value })
                    }
                  />
                  <Input
                    type="password"
                    placeholder="New password (optional)"
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, password: e.target.value })
                    }
                  />
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                    Cancel
                  </Button>
                </form>
              ) : (
                <>
                  <span>{user.name} – {user.email}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link href={`/admin/users/${user.id}/activity`} target="_blank">
                        Activity
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => setEditingUser(user)}>
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 