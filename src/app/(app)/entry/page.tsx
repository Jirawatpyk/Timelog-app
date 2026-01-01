import { TimeEntryForm } from './components/TimeEntryForm';

/**
 * Entry Page
 * Story 4.2: Time Entry Form with Cascading Selectors
 *
 * Staff member can log time by selecting Client → Project → Job
 */
export default function EntryPage() {
  return (
    <div className="container max-w-2xl py-6">
      <h1 className="text-2xl font-bold mb-6">Log Time</h1>
      <TimeEntryForm />
    </div>
  );
}
