import { redirect } from 'next/navigation';

/**
 * Admin Landing Page
 * Redirects to the default admin page (Master Data Management)
 *
 * This allows:
 * - Clean URL for navigation (/admin)
 * - Future admin pages can be added easily
 * - Default admin page can be changed by updating this redirect
 */
export default function AdminPage() {
  redirect('/admin/master-data');
}
