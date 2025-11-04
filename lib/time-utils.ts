
// Time utility functions

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function getTimeRemaining(killTime: number): number {
  const maxRespawnMs = 120 * 60 * 1000; // 120 minutes
  const nextSpawn = killTime + maxRespawnMs;
  const now = Date.now();
  return Math.max(0, nextSpawn - now);
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function hasRespawned(killTime: number): boolean {
  const maxRespawnMs = 120 * 60 * 1000;
  return Date.now() >= (killTime + maxRespawnMs);
}

export function shouldAlert90(killTime: number, alert90Played: boolean): boolean {
  const alert90Ms = 90 * 60 * 1000;
  const timeSinceKill = Date.now() - killTime;
  return !alert90Played && timeSinceKill >= alert90Ms;
}

export function shouldAlert120(killTime: number, alert120Played: boolean): boolean {
  const alert120Ms = 120 * 60 * 1000;
  const timeSinceKill = Date.now() - killTime;
  return !alert120Played && timeSinceKill >= alert120Ms;
}

export function formatTimeWithZone(date: Date, isUTC: boolean = false, userTimezoneOffset: number): string {
  const hours = isUTC ? date.getUTCHours() : date.getHours();
  const minutes = isUTC ? date.getUTCMinutes() : date.getMinutes();
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  if (isUTC) {
    return `${timeStr} (UTC)`;
  } else {
    const offset = userTimezoneOffset;
    const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
    return `${timeStr} (UTC${offsetStr})`;
  }
}

// Play alert sound (browser notification sound)
export function playAlertSound() {
  if (typeof window !== 'undefined' && 'AudioContext' in window) {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.error('Error playing alert sound:', e);
    }
  }
}
