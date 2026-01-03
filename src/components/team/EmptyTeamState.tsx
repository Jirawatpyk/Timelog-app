// src/components/team/EmptyTeamState.tsx
import { Users } from 'lucide-react';

export function EmptyTeamState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-medium mb-2">No Team Members</h3>

      <p className="text-sm text-muted-foreground max-w-[250px]">
        No members found in your managed departments. Please contact Admin.
      </p>
    </div>
  );
}
