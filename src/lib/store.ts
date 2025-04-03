
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TodoStore, Todo } from './types';

let globalInterval: number | null = null;

const clearGlobalInterval = () => {
  if (globalInterval) {
    clearInterval(globalInterval);
    globalInterval = null;
  }
};

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

    if (state.currentTodo?.id === id && !todo.completed) {
      clearGlobalInterval();
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
      clearGlobalInterval();
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
    clearGlobalInterval();
    
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
    
    clearGlobalInterval();
    
    globalInterval = window.setInterval(() => {
      const currentState = useTodoStore.getState();
      if (!currentState.timer.isRunning || currentState.timer.timeLeft <= 0) {
        clearGlobalInterval();
        return;
      }

      const newTimeLeft = currentState.timer.timeLeft - 1;
      
      if (newTimeLeft === 0) {
        const updatedTodos = currentState.todos.map(todo => {
          if (todo.id === currentState.currentTodo?.id) {
            return {
              ...todo,
              focusHistory: [
                ...(todo.focusHistory || []),
                {
                  startTime: new Date(Date.now() - currentState.timer.duration * 1000).toISOString(),
                  duration: currentState.timer.duration / 60,
                },
              ],
            };
          }
          return todo;
        });
        
        clearGlobalInterval();
        useTodoStore.setState({
          todos: updatedTodos,
          timer: {
            ...currentState.timer,
            isRunning: false,
            timeLeft: 0,
          },
        });
      } else {
        useTodoStore.setState({
          timer: {
            ...currentState.timer,
            timeLeft: newTimeLeft,
          },
        });
      }
    }, 1000);

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
    
    clearGlobalInterval();
    
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
    
    clearGlobalInterval();
    
    useTodoStore.setState({
      timer: {
        ...state.timer,
        isRunning: false,
        timeLeft: state.timer.duration,
      },
    });
  },

  setTimerDuration: (minutes: number) => {
    clearGlobalInterval();
    
    useTodoStore.setState({
      timer: {
        isRunning: false,
        timeLeft: minutes * 60,
        duration: minutes * 60,
      },
    });
  },
};