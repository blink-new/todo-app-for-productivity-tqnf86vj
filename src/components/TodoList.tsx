
import { useTodoStore } from '@/lib/store';
import { TodoItem } from './TodoItem';
import { FocusMode } from './FocusMode';

export function TodoList() {
  const todos = useTodoStore((state) => state.todos);
  const focusMode = useTodoStore((state) => state.focusMode);
  const currentTodo = useTodoStore((state) => state.currentTodo);

  const incompleteTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  if (focusMode && currentTodo) {
    return (
      <div className="space-y-6">
        <FocusMode />
        <div className="space-y-2 opacity-50">
          <h2 className="text-lg font-semibold">Other Tasks</h2>
          {incompleteTodos
            .filter(todo => todo.id !== currentTodo.id)
            .map((todo) => (
              <TodoItem key={todo.id} todo={todo} showFocusButton={false} />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Tasks ({incompleteTodos.length})</h2>
        {incompleteTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
        {incompleteTodos.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            No tasks yet. Add one above!
          </p>
        )}
      </div>

      {completedTodos.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Completed ({completedTodos.length})
          </h2>
          {completedTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  );
}