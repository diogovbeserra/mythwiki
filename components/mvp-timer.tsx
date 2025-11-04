
'use client';

import { useEffect, useState } from 'react';
import { formatDuration } from '@/lib/time-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

type TimerStatus = 'idle' | 'running' | 'paused';

interface TimerSession {
  startTime: number | null;
  totalTime: number;
  pausedTime: number;
  lastPauseStart: number | null;
  status: TimerStatus;
}

export function MvpTimer() {
  const [session, setSession] = useState<TimerSession>({
    startTime: null,
    totalTime: 0,
    pausedTime: 0,
    lastPauseStart: null,
    status: 'idle'
  });

  const [displayTime, setDisplayTime] = useState(0);

  // Load saved session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mythwiki_mvp_timer');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSession(data);
        if (data.status === 'running') {
          const elapsed = Date.now() - data.startTime;
          setDisplayTime(elapsed - data.pausedTime);
        } else {
          setDisplayTime(data.totalTime - data.pausedTime);
        }
      } catch (e) {
        console.error('Error loading timer session:', e);
      }
    }
  }, []);

  // Save session to localStorage
  useEffect(() => {
    if (session.status !== 'idle') {
      localStorage.setItem('mythwiki_mvp_timer', JSON.stringify(session));
    }
  }, [session]);

  // Update display time when running
  useEffect(() => {
    if (session.status === 'running' && session.startTime) {
      const interval = setInterval(() => {
        const startTime = session.startTime;
        if (startTime) {
          const elapsed = Date.now() - startTime;
          setDisplayTime(elapsed - session.pausedTime);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [session.status, session.startTime, session.pausedTime]);

  const handleStart = () => {
    const now = Date.now();
    setSession({
      startTime: now,
      totalTime: 0,
      pausedTime: 0,
      lastPauseStart: null,
      status: 'running'
    });
  };

  const handlePause = () => {
    setSession(prev => ({
      ...prev,
      lastPauseStart: Date.now(),
      status: 'paused'
    }));
  };

  const handleResume = () => {
    setSession(prev => {
      if (prev.lastPauseStart) {
        const pauseDuration = Date.now() - prev.lastPauseStart;
        return {
          ...prev,
          pausedTime: prev.pausedTime + pauseDuration,
          lastPauseStart: null,
          status: 'running'
        };
      }
      return { ...prev, status: 'running' };
    });
  };

  const handleStop = () => {
    if (session.startTime) {
      const totalTime = Date.now() - session.startTime;
      setSession(prev => ({
        ...prev,
        totalTime,
        status: 'idle'
      }));
    }
  };

  const handleReset = () => {
    setSession({
      startTime: null,
      totalTime: 0,
      pausedTime: 0,
      lastPauseStart: null,
      status: 'idle'
    });
    setDisplayTime(0);
    localStorage.removeItem('mythwiki_mvp_timer');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">MVP Farm Session Timer</CardTitle>
          <CardDescription>
            Track your MVP farming sessions with precision
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-6xl font-bold font-mono text-primary mb-4">
              {formatDuration(displayTime)}
            </div>

            {/* Status Badge */}
            <div className="flex justify-center gap-2 items-center text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className={`font-medium px-3 py-1 rounded-full ${
                session.status === 'running' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : session.status === 'paused'
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {session.status === 'running' ? '🟢 Active' : session.status === 'paused' ? '🟡 Paused' : '⚪ Idle'}
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 justify-center flex-wrap">
            {session.status === 'idle' && (
              <Button onClick={handleStart} size="lg" className="gap-2">
                <Play className="h-5 w-5" />
                Start Session
              </Button>
            )}

            {session.status === 'running' && (
              <>
                <Button onClick={handlePause} size="lg" variant="outline" className="gap-2">
                  <Pause className="h-5 w-5" />
                  Pause
                </Button>
                <Button onClick={handleStop} size="lg" variant="destructive" className="gap-2">
                  <Square className="h-5 w-5" />
                  Stop
                </Button>
              </>
            )}

            {session.status === 'paused' && (
              <>
                <Button onClick={handleResume} size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Resume
                </Button>
                <Button onClick={handleStop} size="lg" variant="destructive" className="gap-2">
                  <Square className="h-5 w-5" />
                  Stop
                </Button>
              </>
            )}

            {session.status !== 'idle' && (
              <Button onClick={handleReset} size="lg" variant="outline" className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Reset
              </Button>
            )}
          </div>

          {/* Session Stats */}
          {session.status !== 'idle' && (
            <div className="pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Elapsed Time:</span>
                <span className="font-mono font-medium">
                  {session.startTime ? formatDuration(Date.now() - session.startTime) : '00:00:00'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paused Time:</span>
                <span className="font-mono font-medium">
                  {formatDuration(session.pausedTime + (session.lastPauseStart ? Date.now() - session.lastPauseStart : 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Time:</span>
                <span className="font-mono font-medium text-primary">
                  {formatDuration(displayTime)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
            <div>
              <strong className="text-foreground">Start Session:</strong> Click "Start Session" when you begin farming MVPs.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
            <div>
              <strong className="text-foreground">Pause/Resume:</strong> Take breaks without affecting your active time tracking.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
            <div>
              <strong className="text-foreground">Stop:</strong> End your session when you're done farming.
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">4</div>
            <div>
              <strong className="text-foreground">Reset:</strong> Clear the timer to start a fresh session.
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-md">
            <strong className="text-foreground">💡 Tip:</strong> Your session is automatically saved, so you can close the browser and come back to it later!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
