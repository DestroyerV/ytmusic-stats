'use client';

import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth/client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      className="flex items-center space-x-2"
    >
      <LogOut className="h-4 w-4" />
      <span>Sign Out</span>
    </Button>
  );
}