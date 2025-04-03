
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TodoStore, Todo } from './types';

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      focusMode: false,
      currentTodo: null,
      timer: {
        isRunning: false,
        timeLeft: 25 * 60, // 25 minutes in seconds
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
    useTodoStore.setState((state) => ({
      todos: [
        ...state.todos,
        {
          ...todo,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          focusHistory: [],
        },
      ],
    }));
  },
  
  toggleTodo: (id: string) => {
    useTodoStore.setState((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
      focusMode: state.focusMode && state.currentTodo?.id === id ? false : state.focusMode,
      currentTodo: state.focusMode && state.currentTodo?.id === id ? null : state.currentTodo,
    }));
  },

  deleteTodo: (id: string) => {
    useTodoStore.setState((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
      focusMode: state.currentTodo?.id === id ? false : state.focusMode,
      currentTodo: state.currentTodo?.id === id ? null : state.currentTodo,
    }));
  },

  toggleFocusMode: (todoId?: string) => {
    useTodoStore.setState((state) => {
      if (!state.focusMode) {
        const targetTodo = todoId 
          ? state.todos.find(t => t.id === todoId)
          : state.todos.find(t => !t.completed);
        
        return {
          focusMode: true,
          currentTodo: targetTodo || null,
          timer: {
            isRunning: false,
            timeLeft: 25 * 60,
            duration: 25 * 60,
          },
        };
      }
      return {
        focusMode: false,
        currentTodo: null,
        timer: {
          isRunning: false,
          timeLeft: 25 * 60,
          duration: 25 * 60,
        },
      };
    });
  },

  startTimer: () => {
    useTodoStore.setState((state) => ({
      timer: {
        ...state.timer,
        isRunning: true,
      },
    }));
  },

  pauseTimer: () => {
    useTodoStore.setState((state) => ({
      timer: {
        ...state.timer,
        isRunning: false,
      },
    }));
  },

  resetTimer: () => {
    useTodoStore.setState((state) => ({
      timer: {
        ...state.timer,
        isRunning: false,
        timeLeft: state.timer.duration,
      },
    }));
  },

  setTimerDuration: (minutes: number) => {
    useTodoStore.setState((state) => ({
      timer: {
        isRunning: false,
        timeLeft: minutes * 60,
        duration: minutes * 60,
      },
    }));
  },

  tickTimer: () => {
    useTodoStore.setState((state) => {
      if (!state.timer.isRunning || state.timer.timeLeft <= 0) return state;
      
      const newTimeLeft = state.timer.timeLeft - 1;
      
      if (newTimeLeft === 0 && state.currentTodo) {
        // Record focus session
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
        
        return {
          ...state,
          todos: updatedTodos,
          timer: {
            ...state.timer,
            isRunning: false,
            timeLeft: newTimeLeft,
          },
        };
      }
      
      return {
        ...state,
        timer: {
          ...state.timer,
          timeLeft: newTimeLeft,
        },
      };
    });
  },
};