import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { AUTH_COOKIE_NAME, hasAuthCookie } from '@/lib/auth';

export default function Home() {
  const isLoggedIn = hasAuthCookie(cookies().get(AUTH_COOKIE_NAME)?.value);

  if (isLoggedIn) {
    redirect('/pricing');
  }

  redirect('/login');
}
