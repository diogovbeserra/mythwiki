'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Boss, getBossList, getMVPList, getMiniList } from '@/lib/boss-data';
import {
  getTimeRemaining,
  formatCountdown,
  hasRespawned,
  shouldAlert90,
  shouldAlert120,
  formatTimeWithZone,
  playAlertSound,
} from '@/lib/time-utils';

const STORAGE_KEY = 'mythwiki_boss_timers';

type TimerStatus = 'active' | 'warning' | 'respawned';

interface BossTimerEntry {
  id: string;
  bossId: number;
  bossName: string;
  killTime: number;
  killTimeUTC: string;
  killTimeLocal: string;
  respawnMinutes: number;
  nextSpawnTime: number;
  playerName?: string;
  alert90Played: boolean;
  alert120Played: boolean;
  createdAt: number;
}

export function BossTimer() {
  const [bosses] = useState<Boss[]>(() => getBossList());
  const [mvps] = useState<Boss[]>(() => getMVPList());
  const [minis] = useState<Boss[]>(() => getMiniList());
  const [timers, setTimers] = useState<BossTimerEntry[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<'all' | 'mvp' | 'mini'>('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [killTimeInput, setKillTimeInput] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [timerBeingReset, setTimerBeingReset] = useState<string | null>(null);

  // Confirmation modal for remove
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [timerToRemove, setTimerToRemove] = useState<BossTimerEntry | null>(null);

  // Get user's timezone offset in hours
  const userTimezoneOffset = new Date().getTimezoneOffset() / -60;

  // Load timers from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved) as BossTimerEntry[];
        setTimers(data);
      } catch (e) {
        console.error('Error loading boss timers from localStorage:', e);
      }
    }
  }, []);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  }, [timers]);

  // Update current time every second for countdown display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check for alerts and remove expired timers every second
  useEffect(() => {
    const checkAlerts = () => {
      setTimers(prevTimers => {
        let updated = false;
        const newTimers = prevTimers
          .filter(timer => {
            const remaining = getTimeRemaining(timer.killTime);
            if (remaining === 0) {
              console.log('Auto-removing expired timer:', timer.bossName);
              updated = true;
              return false;
            }
            return true;
          })
          .map(timer => {
            let updatedTimer = { ...timer };

            if (shouldAlert90(timer.killTime, timer.alert90Played)) {
              playAlertSound();
              updatedTimer.alert90Played = true;
              updated = true;
            }

            if (shouldAlert120(timer.killTime, timer.alert120Played)) {
              playAlertSound();
              updatedTimer.alert120Played = true;
              updated = true;
            }

            return updatedTimer;
          });
        return updated ? newTimers : prevTimers;
      });
    };

    const interval = setInterval(checkAlerts, 1000);
    return () => clearInterval(interval);
  }, []);

  const openModal = (boss: Boss) => {
    setSelectedBoss(boss);
    const now = new Date();
    const hours = now.getUTCHours().toString().padStart(2, '0');
    const minutes = now.getUTCMinutes().toString().padStart(2, '0');
    setKillTimeInput(`${hours}:${minutes}`);
    setPlayerName('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBoss(null);
    setKillTimeInput('');
    setPlayerName('');
    setTimerBeingReset(null);
  };

  const handleConfirmTimer = () => {
    if (!selectedBoss || !killTimeInput) {
      alert('Please enter the kill time.');
      return;
    }

    try {
      const [hours, minutes] = killTimeInput.split(':').map(Number);
      const now = new Date();
      const killDate = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hours,
        minutes,
        0,
        0
      ));

      if (killDate.getTime() > now.getTime()) {
        killDate.setUTCDate(killDate.getUTCDate() - 1);
      }

      const killTime = killDate.getTime();

      const newTimer: BossTimerEntry = {
        id: `${Date.now()}-${selectedBoss.id}`,
        bossId: selectedBoss.id,
        bossName: selectedBoss.name,
        killTime,
        killTimeUTC: formatTimeWithZone(new Date(killTime), true, userTimezoneOffset),
        killTimeLocal: formatTimeWithZone(new Date(killTime), false, userTimezoneOffset),
        respawnMinutes: selectedBoss.respawnTime,
        nextSpawnTime: killTime + 120 * 60 * 1000,
        playerName: playerName.trim() || undefined,
        alert90Played: false,
        alert120Played: false,
        createdAt: Date.now(),
      };

      if (timerBeingReset) {
        setTimers(prev => [...prev.filter(t => t.id !== timerBeingReset), newTimer]);
      } else {
        setTimers(prev => [...prev, newTimer]);
      }

      closeModal();
    } catch (error) {
      alert('Invalid time format. Use HH:MM (e.g., 20:30)');
    }
  };

  const handleResetTimer = (timer: BossTimerEntry) => {
    const boss = bosses.find(b => b.id === timer.bossId);
    if (boss) {
      setTimerBeingReset(timer.id);
      openModal(boss);
    }
  };

  const handleRemoveTimer = (timer: BossTimerEntry) => {
    setTimerToRemove(timer);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveTimer = () => {
    if (timerToRemove) {
      console.log('Removing timer:', timerToRemove.id, timerToRemove.bossName);
      setTimers(prev => prev.filter(t => t.id !== timerToRemove.id));
      setShowRemoveConfirm(false);
      setTimerToRemove(null);
    }
  };

  const cancelRemoveTimer = () => {
    setShowRemoveConfirm(false);
    setTimerToRemove(null);
  };

  const getTimerForBoss = (bossId: number): BossTimerEntry | undefined => {
    return timers.find(t => t.bossId === bossId);
  };

  const getTimerStatus = (timer: BossTimerEntry): TimerStatus => {
    const timeElapsed = Date.now() - timer.killTime;
    const alert90Time = 90 * 60 * 1000;

    if (hasRespawned(timer.killTime)) {
      return 'respawned';
    } else if (timeElapsed >= alert90Time) {
      return 'warning';
    }
    return 'active';
  };

  const getStatusText = (status: TimerStatus): string => {
    switch (status) {
      case 'active':
        return 'Waiting';
      case 'warning':
        return 'ALERT';
      case 'respawned':
        return 'RESPAWNED';
    }
  };

  const getBossesToDisplay = () => {
    if (filterType === 'mvp') return mvps;
    if (filterType === 'mini') return minis;
    return bosses;
  };

  const getSortedTimers = () => {
    return [...timers]
      .map(timer => ({
        timer,
        boss: bosses.find(b => b.id === timer.bossId),
        remaining: getTimeRemaining(timer.killTime),
        status: getTimerStatus(timer),
      }))
      .sort((a, b) => a.remaining - b.remaining);
  };

  const displayBosses = getBossesToDisplay();
  const sortedTimers = getSortedTimers();

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-[1800px] h-full mx-auto px-4 py-4 flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>

          <h1 className="text-2xl font-bold mb-1 text-slate-900">⏱️ Boss Time Tracker</h1>
          <p className="text-sm text-slate-600">
            Local Time: {formatTimeWithZone(currentTime, false, userTimezoneOffset)} | Server: {formatTimeWithZone(currentTime, true, userTimezoneOffset)}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 overflow-hidden">
          {/* LEFT COLUMN - Boss List (3/4 width) */}
          <div className="lg:col-span-3 flex flex-col overflow-hidden">
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg flex flex-col h-full overflow-hidden">
              <h2 className="text-lg font-bold mb-3 text-slate-900">📋 Boss List</h2>

              {/* Filter Buttons */}
              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                    filterType === 'all'
                      ? 'bg-purple-600 text-slate-900'
                      : 'bg-gray-800/50 text-slate-600 hover:bg-gray-700/50'
                  }`}
                >
                  All ({bosses.length})
                </button>
                <button
                  onClick={() => setFilterType('mvp')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                    filterType === 'mvp'
                      ? 'bg-red-600 text-slate-900'
                      : 'bg-gray-800/50 text-slate-600 hover:bg-gray-700/50'
                  }`}
                >
                  👑 MVPs ({mvps.length})
                </button>
                <button
                  onClick={() => setFilterType('mini')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                    filterType === 'mini'
                      ? 'bg-yellow-600 text-slate-900'
                      : 'bg-gray-800/50 text-slate-600 hover:bg-gray-700/50'
                  }`}
                >
                  ⭐ Mini ({minis.filter(m => !m.isMVP).length})
                </button>
              </div>

              {/* Boss Cards Grid - 4 columns */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto pr-2 flex-1">
                {displayBosses.map(boss => {
                  const timer = getTimerForBoss(boss.id);
                  const hasTimer = !!timer;

                  return (
                    <div
                      key={boss.id}
                      className={`bg-gradient-to-br ${
                        hasTimer
                          ? 'from-slate-100 to-slate-200 border-slate-300'
                          : 'from-slate-50 to-slate-100 border-slate-200'
                      } backdrop-blur-sm border rounded-lg p-2 transition-all hover:scale-[1.02]`}
                    >
                      {/* Boss Header */}
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-lg">{boss.isMVP ? '👑' : '⭐'}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold truncate">{boss.name}</h3>
                        </div>
                      </div>

                      {/* Boss Details */}
                      <div className="space-y-0.5 mb-2 text-[10px] text-slate-600">
                        <p className="truncate">📍 {boss.mapLocation || 'Unknown'}</p>
                        <p>⏱️ 90-120m</p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => openModal(boss)}
                        disabled={hasTimer}
                        className={`w-full px-2 py-1.5 rounded text-[10px] font-bold transition-colors ${
                          hasTimer
                            ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-slate-900'
                        }`}
                      >
                        {hasTimer ? '✓' : '⚔️'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Active Timers History (1/4 width) */}
          <div className="lg:col-span-1 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-br from-red-50 to-red-100 backdrop-blur-sm border border-red-300 rounded-2xl p-4 shadow-2xl flex flex-col h-full overflow-hidden">
              <h2 className="text-lg font-bold mb-3 text-slate-900">
                🔥 Next Boss(es) ({timers.length})
              </h2>

              {sortedTimers.length === 0 ? (
                <div className="text-center py-8 text-slate-600">
                  <p className="text-sm">No bosses tracked</p>
                  <p className="text-xs mt-1">Register kills</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto pr-2 flex-1">
                  {sortedTimers.map(({ timer, boss, remaining, status }) => {
                    let bgClass = 'from-green-50 to-green-100';
                    let borderClass = 'border-green-300';
                    let badgeClass = 'bg-green-500/20 text-green-300';

                    if (status === 'warning') {
                      bgClass = 'from-yellow-50 to-yellow-100';
                      borderClass = 'border-yellow-300';
                      badgeClass = 'bg-yellow-500/20 text-yellow-300';
                    } else if (status === 'respawned') {
                      bgClass = 'from-red-50 to-red-100';
                      borderClass = 'border-red-300';
                      badgeClass = 'bg-red-500/20 text-red-300';
                    }

                    return (
                      <div
                        key={timer.id}
                        className={`bg-gradient-to-r ${bgClass} border ${borderClass} rounded-lg p-2 transition-all`}
                      >
                        <div className="flex gap-2">
                          {/* LEFT: Timer and Complete Button */}
                          <div className="flex flex-col items-center gap-1.5 min-w-[95px]">
                            <div className="bg-slate-100 rounded px-2 py-3 w-full">
                              <div className="text-center text-sm font-mono font-bold tracking-wide">
                                {formatCountdown(remaining)}
                              </div>
                            </div>

                            {status !== 'active' && (
                              <span className={`px-2 py-0.5 ${badgeClass} text-[9px] font-bold rounded whitespace-nowrap w-full text-center`}>
                                {getStatusText(status)}
                              </span>
                            )}

                            <div className="flex gap-1 w-full">
                              <button
                                onClick={() => handleResetTimer(timer)}
                                className="flex-1 px-2 py-1 bg-blue-600/40 hover:bg-blue-600/70 rounded text-xs transition-colors font-medium"
                                title="Reset timer - register new kill"
                              >
                                ↻
                              </button>
                              <button
                                onClick={() => handleRemoveTimer(timer)}
                                className="flex-1 px-2 py-1 bg-red-600/40 hover:bg-red-600/70 rounded text-xs transition-colors font-medium"
                                title="Remove timer"
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {/* RIGHT: Boss Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-base">{boss?.isMVP ? '👑' : '⭐'}</span>
                              <h3 className="text-sm font-bold truncate">{timer.bossName}</h3>
                            </div>

                            <div className="space-y-0.5 text-xs text-slate-700">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Local:</span>
                                <span className="font-medium">{timer.killTimeLocal}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Server:</span>
                                <span className="font-medium">{timer.killTimeUTC}</span>
                              </div>
                              {timer.playerName && (
                                <div className="flex justify-between">
                                  <span className="text-slate-600">Player:</span>
                                  <span className="font-medium truncate ml-1">👤 {timer.playerName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedBoss && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-3xl">{selectedBoss.isMVP ? '👑' : '⭐'}</span>
              {selectedBoss.name}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Kill Time (Server/UTC) <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  value={killTimeInput}
                  onChange={(e) => setKillTimeInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors text-slate-900"
                />
                <p className="text-xs text-slate-600 mt-1">
                  Current server: {formatTimeWithZone(currentTime, true, userTimezoneOffset)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Player Name (Optional)
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Who killed the boss?"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-400 text-slate-900"
                />
              </div>

              <div className="text-sm text-slate-600 bg-gray-900/30 rounded-lg p-3">
                <p>📍 {selectedBoss.mapLocation || 'Unknown location'}</p>
                <p>⏱️ Respawn: {selectedBoss.respawnTime} minutes</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTimer}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors"
              >
                ✓ Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && timerToRemove && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-red-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-red-400 flex items-center gap-2">
              <span className="text-3xl">⚠️</span>
              Confirm Removal
            </h2>

            <p className="text-slate-900 mb-6">
              Are you sure you want to remove the timer for{' '}
              <span className="font-bold text-red-400">{timerToRemove.bossName}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelRemoveTimer}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveTimer}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
              >
                ✓ Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
