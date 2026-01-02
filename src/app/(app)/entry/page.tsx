import { TimeEntryForm } from './components/TimeEntryForm';
import { RecentEntries } from './components/RecentEntries';

/**
 * Entry Page
 * Story 4.2: Time Entry Form with Cascading Selectors
 * Story 4.5: Edit/Delete entries with bottom sheet
 *
 * Staff member can log time by selecting Client → Project → Job
 */
export default function EntryPage() {
  return (
    <div className="container max-w-2xl py-6 space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-6">Log Time</h1>
        <TimeEntryForm />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
        <RecentEntries />
      </section>
    </div>
  );
}
