
import { useMemo, useCallback } from 'react';
import { useTodoStore, todoActions } from '@/lib/store';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Play, Pause, RotateCcw, CheckCircle2, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FocusMode() {
  const { currentTodo, timer, focusMode } = useTodoStore((state) => ({
    currentTodo: state.currentTodo,
    timer: state.timer,
    focusMode: state.focusMode,
  }));

  const progress = useMemo(() => {
    return ((timer.duration - timer.timeLeft) / timer.duration) * 100;
  }, [timer.timeLeft, timer.duration]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  if (!currentTodo || !focusMode) return null;

  const totalFocusTime = currentTodo.focusHistory?.reduce((acc, session) => acc + session.duration, 0) || 0;

  return (
    <div className="animate-in slide-in-from-bottom duration-500 ease-out">
      <Card className="p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold">{currentTodo.title}</h2>
          <p className="text-muted-foreground">
            Total focus time: {totalFocusTime.toFixed(1)} minutes
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center items-center gap-4">
            <Select
              value={String(timer.duration / 60)}
              onValueChange={(value) => {
                const minutes = parseInt(value, 10);
                if (!isNaN(minutes)) {
                  todoActions.setTimerDuration(minutes);
                }
              }}
              disabled={timer.isRunning}
            >
              <SelectTrigger className="w-[180px]">
                <Timer className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-mono font-bold">
                {formatTime(timer.timeLeft)}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex justify-center gap-2">
            {!timer.isRunning ? (
              <Button
                onClick={() => todoActions.startTimer()}
                className="gap-2"
                size="lg"
                disabled={timer.timeLeft === 0}
              >
                <Play className="w-4 h-4" />
                Start Focus
              </Button>
            ) : (
              <Button
                onClick={() => todoActions.pauseTimer()}
                variant="outline"
                className="gap-2"
                size="lg"
              >
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            )}
            <Button
              onClick={() => todoActions.resetTimer()}
              variant="outline"
              size="icon"
              className={cn(
                "transition-opacity",
                timer.timeLeft === timer.duration && "opacity-50"
              )}
              disabled={timer.timeLeft === timer.duration}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={() => todoActions.toggleTodo(currentTodo.id)}
            variant="outline"
            className="w-full gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark as Complete
          </Button>
        </div>
      </Card>
    </div>
  );
}