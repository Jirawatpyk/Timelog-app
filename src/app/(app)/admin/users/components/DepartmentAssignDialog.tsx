'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getActiveDepartments,
  getManagerDepartments,
  updateManagerDepartments,
} from '@/actions/user';
import type { DepartmentOption } from '@/types/domain';
import { DepartmentMultiSelect } from './DepartmentMultiSelect';

interface DepartmentAssignDialogProps {
  managerId: string;
  managerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Callback when departments are successfully updated */
  onSuccess?: () => void;
}

/**
 * Standalone dialog for assigning departments to a manager
 * Story 7.6: Assign Manager Departments (Task 3)
 *
 * Can be opened from:
 * - Story 7.5 ManagerDeptPrompt "Assign Now" action
 * - Direct "Assign Departments" button in user list (AC 6)
 */
export function DepartmentAssignDialog({
  managerId,
  managerName,
  open,
  onOpenChange,
  onSuccess,
}: DepartmentAssignDialogProps) {
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && managerId) {
      setLoading(true);
      Promise.all([getActiveDepartments(), getManagerDepartments(managerId)])
        .then(([allDepts, managerDepts]) => {
          if (allDepts.success) {
            setDepartments(allDepts.data);
          }
          if (managerDepts.success) {
            setSelectedIds(managerDepts.data.map((d) => d.id));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, managerId]);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateManagerDepartments(managerId, selectedIds);
    setSaving(false);

    if (result.success) {
      toast.success('Departments updated successfully');
      onOpenChange(false);
      onSuccess?.();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Departments</DialogTitle>
          <DialogDescription>
            Select departments for {managerName} to manage.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DepartmentMultiSelect
            value={selectedIds}
            onChange={setSelectedIds}
            departments={departments}
          />
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
