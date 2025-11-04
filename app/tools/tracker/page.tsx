'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Play, Pause, Square, Plus, Trash2, Timer, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Drop {
  itemName: string;
  quantity: number;
  price: number;
}

interface Session {
  id: string;
  startTime: number;
  endTime: number | null;
  pausedTime: number;
  drops: Drop[];
  totalValue: number;
}

export default function FarmTrackerPage() {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pausedTotal, setPausedTotal] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [drops, setDrops] = useState<Drop[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');

  const [sessions, setSessions] = useState<Session[]>([]);

  // Timer update
  useEffect(() => {
    if (isTracking && !isPaused) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTracking, isPaused]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getElapsedTime = () => {
    if (!isTracking) return 0;
    const now = currentTime;
    return now - startTime - pausedTotal;
  };

  const handleStart = () => {
    setStartTime(Date.now());
    setIsTracking(true);
    setIsPaused(false);
    setPausedTotal(0);
    setElapsedTime(0);
  };

  const handlePause = () => {
    if (isPaused) {
      setPausedTotal(pausedTotal + (Date.now() - elapsedTime));
      setIsPaused(false);
    } else {
      setElapsedTime(Date.now());
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (drops.length > 0) {
      const session: Session = {
        id: Date.now().toString(),
        startTime,
        endTime: Date.now(),
        pausedTime: pausedTotal,
        drops: [...drops],
        totalValue: drops.reduce((sum, drop) => sum + (drop.quantity * drop.price), 0)
      };
      setSessions([session, ...sessions]);
    }
    
    setIsTracking(false);
    setIsPaused(false);
    setDrops([]);
    setStartTime(0);
    setPausedTotal(0);
    setElapsedTime(0);
  };

  const handleAddDrop = () => {
    if (!newItemName.trim() || !newItemPrice) return;

    const existingDrop = drops.find(d => d.itemName === newItemName);
    if (existingDrop) {
      setDrops(drops.map(d => 
        d.itemName === newItemName 
          ? { ...d, quantity: d.quantity + Number(newItemQuantity) }
          : d
      ));
    } else {
      setDrops([...drops, {
        itemName: newItemName,
        quantity: Number(newItemQuantity),
        price: Number(newItemPrice)
      }]);
    }

    setNewItemName('');
    setNewItemQuantity('1');
    setNewItemPrice('');
  };

  const handleRemoveDrop = (itemName: string) => {
    setDrops(drops.filter(d => d.itemName !== itemName));
  };

  const totalValue = drops.reduce((sum, drop) => sum + (drop.quantity * drop.price), 0);
  const elapsed = getElapsedTime();
  const valuePerHour = elapsed > 0 ? (totalValue / elapsed) * 3600000 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <h1 className="text-2xl font-bold text-slate-900">Farm Tracker</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Description */}
        <Card className="p-6 mb-8 bg-white text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Track Your Farming Sessions
          </h2>
          <p className="text-slate-600">
            Record drops and calculate profits per hour
          </p>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Current Session */}
          <div className="space-y-6">
            <Card className="p-8 bg-white">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Timer className="h-6 w-6 mr-2 text-green-600" />
                Current Session
              </h3>

              {/* Timer Display */}
              <div className="text-center mb-6">
                <div className="text-5xl font-mono font-bold text-slate-900 mb-4">
                  {formatTime(elapsed)}
                </div>
                <div className="flex justify-center gap-4">
                  {!isTracking ? (
                    <Button onClick={handleStart} size="lg" className="bg-green-600 hover:bg-green-700">
                      <Play className="h-5 w-5 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handlePause} size="lg" variant="outline">
                        <Pause className="h-5 w-5 mr-2" />
                        {isPaused ? 'Resume' : 'Pause'}
                      </Button>
                      <Button onClick={handleStop} size="lg" variant="destructive">
                        <Square className="h-5 w-5 mr-2" />
                        Stop
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Add Drop */}
              {isTracking && (
                <div className="space-y-4 pt-6 border-t">
                  <h4 className="font-semibold text-slate-900">Add Drop</h4>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <Input
                        placeholder="Item name"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddDrop()}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddDrop()}
                      />
                    </div>
                    <div className="col-span-2">
                      <Button onClick={handleAddDrop} className="w-full">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Drops */}
              {drops.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="font-semibold text-slate-900">Drops</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {drops.map((drop, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{drop.itemName}</p>
                          <p className="text-sm text-slate-600">
                            {drop.quantity} × {drop.price.toLocaleString()} = {(drop.quantity * drop.price).toLocaleString()}z
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveDrop(drop.itemName)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              {isTracking && (
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Value</span>
                    <span className="font-bold text-lg text-green-600">
                      {totalValue.toLocaleString()}z
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Value per Hour</span>
                    <span className="font-bold text-lg text-blue-600">
                      {valuePerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Past Sessions */}
          <div>
            <Card className="p-8 bg-white">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Coins className="h-6 w-6 mr-2 text-yellow-600" />
                Past Sessions
              </h3>

              {sessions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>No completed sessions yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {sessions.map((session) => {
                    const sessionDuration = (session.endTime || Date.now()) - session.startTime - session.pausedTime;
                    const valuePerHour = (session.totalValue / sessionDuration) * 3600000;
                    
                    return (
                      <div key={session.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {new Date(session.startTime).toLocaleDateString()} {new Date(session.startTime).toLocaleTimeString()}
                            </p>
                            <p className="text-sm text-slate-600">
                              Duration: {formatTime(sessionDuration)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {session.totalValue.toLocaleString()}z
                            </p>
                            <p className="text-sm text-blue-600">
                              {valuePerHour.toLocaleString(undefined, { maximumFractionDigits: 0 })}z/h
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          {session.drops.map((drop, idx) => (
                            <div key={idx} className="text-sm text-slate-600 flex justify-between">
                              <span>{drop.itemName}</span>
                              <span>{drop.quantity} × {drop.price.toLocaleString()}z</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
