
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
    useTodoStore.setState((state) => {
      const newTodos = state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      
      // If the toggled todo is the current focus todo and it's being completed,
      // exit focus mode
      const shouldExitFocus = state.currentTodo?.id === id && 
        newTodos.find(t => t.id === id)?.completed;
      
      return {
        todos: newTodos,
        ...(shouldExitFocus ? {
          focusMode: false,
          currentTodo: null,
        } : {}),
      };
    });
  },

  deleteTodo: (id: string) => {
    useTodoStore.setState((state) => {
      const shouldExitFocus = state.currentTodo?.id === id;
      
      return {
        todos: state.todos.filter((todo) => todo.id !== id),
        ...(shouldExitFocus ? {
          focusMode: false,
          currentTodo: null,
        } : {}),
      };
    });
  },

  toggleFocusMode: (todoId?: string) => {
    useTodoStore.setState((state) => {
      if (!state.focusMode) {
        const targetTodo = todoId 
          ? state.todos.find(t => t.id === todoId)
          : state.todos.find(t => !t.completed);
        
        if (!targetTodo) return state;
        
        return {
          focusMode: true,
          currentTodo: targetTodo,
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
    const state = useTodoStore.getState();
    if (!state.currentTodo || state.timer.isRunning) return;
    
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
    useTodoStore.setState((state) => {
      if (!state.timer.isRunning || state.timer.timeLeft <= 0) return state;
      
      const newTimeLeft = state.timer.timeLeft - 1;
      
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
        
        return {
          todos: updatedTodos,
          timer: {
            ...state.timer,
            isRunning: false,
            timeLeft: newTimeLeft,
          },
        };
      }
      
      return {
        timer: {
          ...state.timer,
          timeLeft: newTimeLeft,
        },
      };
    });
  },
};