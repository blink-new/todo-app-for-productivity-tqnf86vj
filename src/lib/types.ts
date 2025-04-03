
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  category?: string;
  focusMinutes?: number;
  focusHistory?: {
    startTime: string;
    duration: number;
  }[];
}

export interface TodoStore {
  todos: Todo[];
  focusMode: boolean;
  currentTodo: Todo | null;
  timer: {
    isRunning: boolean;
    timeLeft: number;
    duration: number;
  };
}