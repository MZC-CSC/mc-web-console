// app/(dashboard)/settings/accountnaccess/organizations/users/page.tsx

import { Metadata } from 'next';
import { UsersClient } from './UsersClient';

export const metadata: Metadata = {
  title: 'Users Management',
  description: 'Manage users and their roles',
};

export default function UsersPage() {
  return <UsersClient />;
}
