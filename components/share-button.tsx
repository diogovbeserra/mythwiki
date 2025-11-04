
'use client';

import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  title: string;
  url?: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const handleShare = () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    
    if (navigator.share) {
      navigator.share({
        title,
        url: shareUrl
      }).catch(() => {
        // Fallback to clipboard if share fails
        navigator.clipboard.writeText(shareUrl);
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <Button variant="outline" onClick={handleShare}>
      Share
    </Button>
  );
}
