
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TodoStore, Todo } from './types';

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      todos: [],
      focusMode: false,
      currentTodo: null,
      timer: {
        isRunning: false,
        timeLeft: 25 * 60,
        duration: 25 * 60,
      },
    }),
    {
      name: 'todo-storage',
    }
  )
);

export const todoActions = {
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => {
    const newTodo = {
      ...todo,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      focusHistory: [],
    };
    
    useTodoStore.setState((state) => ({
      todos: [...state.todos, newTodo],
    }));
  },
  
  toggleTodo: (id: string) => {
    const state = useTodoStore.getState();
    const todo = state.todos.find(t => t.id === id);
    if (!todo) return;

    const newTodos = state.todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );

    const updates: Partial<TodoStore> = {
      todos: newTodos,
    };

    // Only update focus mode if the completed todo is the current focus
    if (state.currentTodo?.id === id && !todo.completed) {
      updates.focusMode = false;
      updates.currentTodo = null;
      updates.timer = {
        isRunning: false,
        timeLeft: 25 * 60,
        duration: 25 * 60,
      };
    }

    useTodoStore.setState(updates);
  },

  deleteTodo: (id: string) => {
    const state = useTodoStore.getState();
    const updates: Partial<TodoStore> = {
      todos: state.todos.filter((todo) => todo.id !== id),
    };

    if (state.currentTodo?.id === id) {
      updates.focusMode = false;
      updates.currentTodo = null;
      updates.timer = {
        isRunning: false,
        timeLeft: 25 * 60,
        duration: 25 * 60,
      };
    }

    useTodoStore.setState(updates);
  },

  toggleFocusMode: (todoId?: string) => {
    const state = useTodoStore.getState();
    
    if (!state.focusMode) {
      const targetTodo = todoId 
        ? state.todos.find(t => t.id === todoId && !t.completed)
        : state.todos.find(t => !t.completed);
      
      if (!targetTodo) return;
      
      useTodoStore.setState({
        focusMode: true,
        currentTodo: targetTodo,
        timer: {
          isRunning: false,
          timeLeft: 25 * 60,
          duration: 25 * 60,
        },
      });
    } else {
      useTodoStore.setState({
        focusMode: false,
        currentTodo: null,
        timer: {
          isRunning: false,
          timeLeft: 25 * 60,
          duration: 25 * 60,
        },
      });
    }
  },

  startTimer: () => {
    const state = useTodoStore.getState();
    if (!state.currentTodo || state.timer.isRunning || state.timer.timeLeft === 0) return;
    
    useTodoStore.setState({
      timer: {
        ...state.timer,
        isRunning: true,
      },
    });
  },

  pauseTimer: () => {
    const state = useTodoStore.getState();
    if (!state.timer.isRunning) return;
    
    useTodoStore.setState({
      timer: {
        ...state.timer,
        isRunning: false,
      },
    });
  },

  resetTimer: () => {
    const state = useTodoStore.getState();
    if (state.timer.timeLeft === state.timer.duration) return;
    
    useTodoStore.setState({
      timer: {
        ...state.timer,
        isRunning: false,
        timeLeft: state.timer.duration,
      },
    });
  },

  setTimerDuration: (minutes: number) => {
    useTodoStore.setState({
      timer: {
        isRunning: false,
        timeLeft: minutes * 60,
        duration: minutes * 60,
      },
    });
  },

  tickTimer: () => {
    const state = useTodoStore.getState();
    if (!state.timer.isRunning || state.timer.timeLeft <= 0) return;
    
    const newTimeLeft = state.timer.timeLeft - 1;
    const updates: Partial<TodoStore> = {
      timer: {
        ...state.timer,
        timeLeft: newTimeLeft,
      },
    };

    if (newTimeLeft === 0 && state.currentTodo) {
      const updatedTodos = state.todos.map(todo => {
        if (todo.id === state.currentTodo?.id) {
          return {
            ...todo,
            focusHistory: [
              ...(todo.focusHistory || []),
              {
                startTime: new Date(Date.now() - state.timer.duration * 1000).toISOString(),
                duration: state.timer.duration / 60,
              },
            ],
          };
        }
        return todo;
      });
      
      updates.todos = updatedTodos;
      updates.timer = {
        ...state.timer,
        isRunning: false,
        timeLeft: newTimeLeft,
      };
    }
    
    useTodoStore.setState(updates);
  },
};