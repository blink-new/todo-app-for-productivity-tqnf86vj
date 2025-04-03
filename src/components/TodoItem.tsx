
import { Todo } from '@/lib/types';
import { todoActions } from '@/lib/store';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Trash2, Focus, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodoItemProps {
  todo: Todo;
  showFocusButton?: boolean;
}

export function TodoItem({ todo, showFocusButton = true }: TodoItemProps) {
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const totalFocusTime = todo.focusHistory?.reduce((acc, session) => acc + session.duration, 0) || 0;

  return (
    <div className={cn(
      "flex items-center gap-2 p-4 rounded-lg border transition-all todo-item",
      todo.completed ? "opacity-50" : "hover:border-primary",
    )}>
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => todoActions.toggleTodo(todo.id)}
      />
      <div className="flex-1 min-w-0">
        <p className={cn(
          "truncate",
          todo.completed && "line-through text-muted-foreground"
        )}>
          {todo.title}
        </p>
        {totalFocusTime > 0 && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Timer className="w-3 h-3" />
            {totalFocusTime.toFixed(1)} minutes focused
          </p>
        )}
      </div>
      <span className={cn(
        "px-2 py-1 rounded-full text-xs font-medium shrink-0",
        priorityColors[todo.priority]
      )}>
        {todo.priority}
      </span>
      {showFocusButton && !todo.completed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => todoActions.toggleFocusMode(todo.id)}
        >
          <Focus className="w-4 h-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => todoActions.deleteTodo(todo.id)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}