
import { Button } from './ui/button';
import { useTodoStore, todoActions } from '@/lib/store';
import { Focus } from 'lucide-react';

export function Header() {
  const focusMode = useTodoStore((state) => state.focusMode);
  const todos = useTodoStore((state) => state.todos);
  const completedCount = todos.filter(t => t.completed).length;

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">Focus Todo</h1>
        <p className="text-muted-foreground">
          {completedCount} of {todos.length} tasks completed
        </p>
      </div>
      <Button
        onClick={todoActions.toggleFocusMode}
        variant={focusMode ? "default" : "outline"}
        className="gap-2"
      >
        <Focus className="w-4 h-4" />
        {focusMode ? "Exit Focus" : "Focus Mode"}
      </Button>
    </header>
  );
}