import { useEffect, useState } from 'react';
import { trackVisitor, getVisitorCount, generateFingerprint } from '../services/xano';

const VISITOR_TRACKED_KEY = 'portfolio_visitor_tracked';

/**
 * Hook to track visitors and get visitor count
 * Uses FingerprintJS for robust deduplication (consistent with likes)
 * Also uses sessionStorage to prevent duplicate API calls on page refresh
 */
export function useVisitorTracking() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [tracked, setTracked] = useState(() => {
    // Check if already tracked in this session
    return sessionStorage.getItem(VISITOR_TRACKED_KEY) === 'true';
  });

  useEffect(() => {
    // Track visitor only if not already tracked in this session
    if (!tracked) {
      // generateFingerprint is now async (uses FingerprintJS)
      generateFingerprint().then((fingerprint) => {
        trackVisitor(fingerprint).then((success) => {
        if (success) {
          sessionStorage.setItem(VISITOR_TRACKED_KEY, 'true');
          setTracked(true);
        }
        });
      });
    }

    // Get visitor count
    getVisitorCount().then((count) => {
      setVisitorCount(count);
    });
  }, [tracked]);

  return { visitorCount, tracked };
}

