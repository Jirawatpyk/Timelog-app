// src/components/team/TeamErrorState.tsx
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TeamErrorStateProps {
  message?: string;
}

export function TeamErrorState({
  message = 'Unable to load data',
}: TeamErrorStateProps) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-3" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
