import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Users, X } from 'lucide-react';
import { Icon } from '@iconify/react';
import { portfolioData } from '../../data/portfolio';
import { LinkButton, LikeButton } from '../ui';
import { useVisitorTracking } from '../../hooks/useVisitorTracking';
import { getThoughts, likeThought, getLikeStatus, generateFingerprint } from '../../services/xano';
import { getXanoFileUrl } from '../../config/xano';
import type { Thought } from '../../types';

// Social icon mappings with brand colors
const socialIcons: Record<string, { icon: string; color: string }> = {
  'linkedin': { icon: 'simple-icons:linkedin', color: '#0a66c2' },
  'github': { icon: 'simple-icons:github', color: '#181717' },
  'graduation-cap': { icon: 'simple-icons:googlescholar', color: '#4285f4' },
  'mail': { icon: 'mdi:email', color: '#ea4335' },
};

// Format time - relative for recent, exact for older
const formatTime = (date: Date): { primary: string; secondary?: string } => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // For posts less than 24 hours old, show relative time
  if (diffMins < 1) return { primary: 'just now' };
  if (diffMins < 60) return { primary: `${diffMins} min ago` };
  if (diffHours < 24) return { primary: `${diffHours} hour${diffHours > 1 ? 's' : ''} ago` };
  
  // For posts older than 24 hours, show exact date/time
  const dateStr = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  // For posts 1-7 days old, also show relative
  if (diffDays < 7) {
    return { 
      primary: `${diffDays} day${diffDays > 1 ? 's' : ''} ago`,
      secondary: `${dateStr} at ${timeStr}`
    };
  }
  
  return { primary: `${dateStr}`, secondary: timeStr };
};

/**
 * Hero section with animated introduction and thoughts feed
 * Modern, theme-aware design with like functionality
 */
export function Hero() {
  const { personalInfo } = portfolioData;
  const { visitorCount } = useVisitorTracking();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loadingThoughts, setLoadingThoughts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [likedThoughts, setLikedThoughts] = useState<Set<number>>(new Set());
  const [likingId, setLikingId] = useState<number | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [justLiked, setJustLiked] = useState<number | null>(null); // For celebration animation
  
  // Scroll state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const [isManualScrollMode, setIsManualScrollMode] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const manualScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollTopRef = useRef(0);

  const THOUGHTS_PER_PAGE = 20;

  // Filter function - only show thoughts with text content (image-only posts go to Gallery)
  const filterThoughts = useCallback((data: Thought[]) => data.filter(t => 
    t.content && t.content.trim() !== ''
  ), []);

  // Initialize fingerprint (async with FingerprintJS)
  useEffect(() => {
    generateFingerprint().then(setFingerprint);
  }, []);

  // Fetch thoughts with pagination
  const fetchThoughts = useCallback(async (page: number, append = false) => {
    if (page === 1) {
      setLoadingThoughts(true);
    } else {
      setLoadingMore(true);
    }
    
    const data = await getThoughts(page, THOUGHTS_PER_PAGE);
    const filteredData = filterThoughts(data);
    
    if (append) {
      setThoughts(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const newThoughts = filteredData.filter(t => !existingIds.has(t.id));
        return [...prev, ...newThoughts];
      });
    } else {
      setThoughts(filteredData);
    }
    
    setHasMore(data.length === THOUGHTS_PER_PAGE);
    setCurrentPage(page);
    setLoadingThoughts(false);
    setLoadingMore(false);
  }, [filterThoughts]);

  // Load more thoughts (for manual scroll)
  const loadMoreThoughts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    await fetchThoughts(currentPage + 1, true);
  }, [currentPage, loadingMore, hasMore, fetchThoughts]);

  const fetchLikeStatus = useCallback(async () => {
    if (!fingerprint) return;
    const likedIds = await getLikeStatus(fingerprint);
    setLikedThoughts(new Set(likedIds));
  }, [fingerprint]);

  // Initial fetch
  useEffect(() => {
    fetchThoughts(1, false);
  }, [fetchThoughts]);

  useEffect(() => {
    if (fingerprint) {
    fetchLikeStatus();
    }
  }, [fingerprint, fetchLikeStatus]);

  // Periodic refresh (only page 1, to get new thoughts)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isManualScrollMode) {
        fetchThoughts(1, false);
      }
    }, 1 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchThoughts, isManualScrollMode]);

  // Track if user is actively touching (for mobile)
  const isTouchingRef = useRef(false);

  // Detect manual scroll (only when not touching - to avoid conflicts on mobile)
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isTouchingRef.current) return;
    
    const scrollDiff = Math.abs(container.scrollTop - lastScrollTopRef.current);
    
    // If scroll difference is larger than auto-scroll speed, user is scrolling manually
    if (scrollDiff > 2) {
      setIsManualScrollMode(true);
      
      // Clear existing timeout
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
      
      // After 5 seconds of no manual scrolling, return to auto mode
      manualScrollTimeoutRef.current = setTimeout(() => {
        if (!isHovering && !isTouchingRef.current) {
          setIsManualScrollMode(false);
          // Reset scroll to top for smooth auto-scroll restart
          if (container) {
            container.scrollTop = 0;
          }
        }
      }, 5000);
    }
    
    lastScrollTopRef.current = container.scrollTop;
  }, [isHovering]);

  // Handle lightbox keyboard events and body scroll
  useEffect(() => {
    if (selectedThought) {
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedThought(null);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedThought]);

  // Infinite auto-scroll (only when NOT in manual mode and NOT hovering)
  useEffect(() => {
    const container = scrollContainerRef.current;
    const content = contentRef.current;
    if (!container || !content || isManualScrollMode || isHovering || loadingThoughts || thoughts.length === 0) return;

    const scrollSpeed = 0.5;
    let animationId: number;
    const singleContentHeight = content.scrollHeight / 2;

    const scroll = () => {
      container.scrollTop += scrollSpeed;
      lastScrollTopRef.current = container.scrollTop;
      
      // Seamless loop: when we reach the duplicate content, jump back
      if (container.scrollTop >= singleContentHeight) {
        container.scrollTop = container.scrollTop - singleContentHeight;
        lastScrollTopRef.current = container.scrollTop;
      }
      
      animationId = requestAnimationFrame(scroll);
    };

    // Start after delay
    const startTimeout = setTimeout(() => {
      animationId = requestAnimationFrame(scroll);
    }, 2000);

    return () => {
      clearTimeout(startTimeout);
      cancelAnimationFrame(animationId);
    };
  }, [isManualScrollMode, isHovering, loadingThoughts, thoughts]);

  // Intersection observer for lazy loading (only in manual mode)
  useEffect(() => {
    if (!isManualScrollMode || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadMoreThoughts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreTriggerRef.current) {
      observer.observe(loadMoreTriggerRef.current);
    }

    return () => observer.disconnect();
  }, [isManualScrollMode, hasMore, loadingMore, loadMoreThoughts]);

  // Hover handlers (desktop)
  const handleMouseEnter = () => {
    setIsHovering(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // If in manual mode, reset after delay
    if (isManualScrollMode) {
      resumeTimeoutRef.current = setTimeout(() => {
        setIsManualScrollMode(false);
        const container = scrollContainerRef.current;
        if (container) {
          container.scrollTop = 0;
        }
      }, 3000);
    }
  };

  // Touch handlers (mobile)
  const handleTouchStart = () => {
    isTouchingRef.current = true;
    setIsHovering(true);
    setIsManualScrollMode(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);
  };

  const handleTouchEnd = () => {
    isTouchingRef.current = false;
    // Resume auto-scroll after 3 seconds of no touch
    resumeTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      setIsManualScrollMode(false);
      const container = scrollContainerRef.current;
      if (container) {
        container.scrollTop = 0;
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);
    };
  }, []);

  // Handle like
  const handleLike = async (thoughtId: number) => {
    if (!fingerprint || likedThoughts.has(thoughtId) || likingId !== null) return;
    
    setLikingId(thoughtId);
    
    // Optimistic update
    setLikedThoughts(prev => new Set(prev).add(thoughtId));
    setThoughts(prev => 
      prev.map(t => t.id === thoughtId ? { ...t, likes_count: (t.likes_count || 0) + 1 } : t)
    );
    
    // Trigger celebration animation
    setJustLiked(thoughtId);
    setTimeout(() => setJustLiked(null), 1500);
    
    const result = await likeThought(thoughtId, fingerprint);
    
    if (!result) {
      // Revert on failure
      setLikedThoughts(prev => {
        const next = new Set(prev);
        next.delete(thoughtId);
        return next;
      });
      setThoughts(prev => 
        prev.map(t => t.id === thoughtId ? { ...t, likes_count: Math.max(0, (t.likes_count || 0) - 1) } : t)
      );
      setJustLiked(null);
    }
    
    setLikingId(null);
  };

  return (
    <section
      id="about"
      className="relative min-h-screen overflow-hidden pt-20"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 grid-bg" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 lg:py-12 min-h-[calc(100vh-5rem)] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_minmax(360px,420px)] xl:grid-cols-[1fr_minmax(400px,480px)] 2xl:grid-cols-[1fr_500px] gap-6 lg:gap-10 items-center">
          {/* Left Side - Introduction */}
          <div className="flex flex-col items-start text-left">
            {/* Status Badge & Visitor Count */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 flex flex-wrap items-center justify-center lg:justify-start gap-3"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-accent-400 font-mono text-sm">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                Available for opportunities
              </span>
              {visitorCount !== null && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-midnight-300 dark:text-midnight-300 font-mono text-sm">
                  <Users size={14} />
                  {visitorCount.toLocaleString()} visitors
                </span>
              )}
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4"
            >
              <span className="text-midnight-900 dark:text-midnight-100">Hi, I'm </span>
              <span className="gradient-text">{personalInfo.name}</span>
            </motion.h1>

            {/* Title */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-midnight-600 dark:text-midnight-300 font-medium mb-6"
            >
              {personalInfo.title}
            </motion.p>

            {/* Summary - Highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative max-w-xl mb-8"
            >
              {/* Subtle highlight background */}
              <div className="absolute -inset-4 bg-gradient-to-r from-accent-500/10 via-teal-500/10 to-coral-500/10 rounded-2xl blur-sm" />
              <p className="relative text-lg md:text-xl text-midnight-600 dark:text-midnight-300 leading-relaxed font-medium">
              Building production ML systems. Specialized in conversational AI & recommendations. Published researcher.
              </p>
            </motion.div>

            {/* CTAs + Social in one row */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              <LinkButton href="#experience" variant="primary" size="md">
                View My Work
              </LinkButton>
              <LinkButton href="#contact" variant="outline" size="md">
                Get In Touch
              </LinkButton>
              
              {/* Social Icons */}
              <div className="flex items-center gap-1 ml-2">
                {personalInfo.socialLinks.map((link) => {
                  const iconData = socialIcons[link.icon] || { icon: 'mdi:link', color: '#6b7280' };
                  return (
                    <motion.a
                      key={link.name}
                      href={link.url}
                      target={link.url.startsWith('mailto') ? undefined : '_blank'}
                      rel={link.url.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="p-2.5 rounded-lg text-midnight-400 hover:bg-midnight-100 dark:hover:bg-white/10 transition-all"
                      aria-label={link.name}
                      title={link.name}
                    >
                      <Icon 
                        icon={iconData.icon} 
                        width={22} 
                        height={22}
                        className="transition-colors"
                        style={{ color: iconData.color }}
                      />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Side - Thoughts Feed */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="relative w-full"
          >
            {/* Seamless Thoughts Feed */}
            <div className="relative h-[380px] lg:h-[420px] xl:h-[480px] flex flex-col">
              {/* Header - Floating label style */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-semibold text-themed-primary">Thoughts</h3>
                  <span className="text-xs text-themed-muted">· what's on my mind</span>
                      </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10">
                    <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">live</span>
                  </div>
                </div>

                {loadingThoughts ? (
                  <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-themed-muted">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading...</span>
                    </div>
                  </div>
                ) : thoughts.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-themed-muted text-sm italic">No thoughts shared yet</p>
                </div>
              )               : (
                <div 
                  ref={scrollContainerRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div ref={contentRef} className="space-y-3">
                    {/* Original content */}
                    {thoughts.map((thought) => {
                      const timeInfo = formatTime(new Date(thought.created_at));
                      const isLiked = likedThoughts.has(thought.id);
                      const isLiking = likingId === thought.id;
                      
                      return (
                        <article key={thought.id} className="group">
                          <div className="relative pl-5 border-l-4 border-accent-500 hover:border-accent-400 transition-colors">
                            {thought.image_url && (
                              <div 
                                className="mb-3 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedThought(thought)}
                              >
                                <img src={getXanoFileUrl(thought.image_url)} alt="" className="w-full max-h-64 object-contain rounded-lg bg-midnight-100/50 dark:bg-midnight-800/50" loading="lazy" />
                  </div>
                            )}
                            {thought.content && (
                              <p className="text-themed-primary leading-relaxed mb-3 whitespace-pre-wrap">{thought.content}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-themed-muted">
                              <time>{timeInfo.primary}</time>
                              <LikeButton
                                isLiked={isLiked}
                                likesCount={thought.likes_count || 0}
                                onLike={() => handleLike(thought.id)}
                                disabled={isLiking}
                                size="sm"
                                justLiked={justLiked === thought.id}
                              />
                            </div>
                          </div>
                        </article>
                      );
                    })}
                    
                    {/* Duplicated content for seamless infinite loop (only in auto mode) */}
                    {!isManualScrollMode && thoughts.map((thought) => {
                      const timeInfo = formatTime(new Date(thought.created_at));
                      const isLiked = likedThoughts.has(thought.id);
                      const isLiking = likingId === thought.id;
                      
                      return (
                        <article key={`dup-${thought.id}`} className="group">
                          <div className="relative pl-5 border-l-4 border-accent-500 hover:border-accent-400 transition-colors">
                            {thought.image_url && (
                              <div 
                                className="mb-3 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedThought(thought)}
                              >
                                <img src={getXanoFileUrl(thought.image_url)} alt="" className="w-full max-h-64 object-contain rounded-lg bg-midnight-100/50 dark:bg-midnight-800/50" loading="lazy" />
                              </div>
                            )}
                            {thought.content && (
                              <p className="text-themed-primary leading-relaxed mb-3 whitespace-pre-wrap">{thought.content}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-themed-muted">
                              <time>{timeInfo.primary}</time>
                              <LikeButton
                                isLiked={isLiked}
                                likesCount={thought.likes_count || 0}
                                onLike={() => handleLike(thought.id)}
                                disabled={isLiking}
                                size="sm"
                                justLiked={justLiked === thought.id}
                              />
                            </div>
                          </div>
                        </article>
                      );
                    })}
                    
                    {/* Load more trigger and end indicator (only in manual mode) */}
                    {isManualScrollMode && (
                      <div ref={loadMoreTriggerRef} className="py-4 flex justify-center">
                        {loadingMore ? (
                          <div className="flex items-center gap-2 text-themed-muted">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs">Loading more...</span>
                          </div>
                        ) : !hasMore ? (
                          <div className="flex flex-col items-center gap-1 text-themed-muted">
                            <div className="w-8 h-px bg-themed-muted/30" />
                            <span className="text-xs">You've seen all thoughts!</span>
                          </div>
                        ) : null}
                  </div>
                )}
              </div>
                </div>
              )}
            </div>
            
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-midnight-400 dark:text-midnight-500"
          >
            <ArrowDown size={24} />
          </motion.div>
        </motion.div>
      </div>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {selectedThought && selectedThought.image_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedThought(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedThought(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            {/* Image container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative max-w-5xl max-h-[90vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getXanoFileUrl(selectedThought.image_url)}
                alt=""
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              
              {/* Info bar below image */}
              <div className="mt-4 flex items-center justify-between px-2">
                <div className="text-white/70 text-sm">
                  {selectedThought.content && (
                    <p className="text-white mb-2 max-w-lg whitespace-pre-wrap">{selectedThought.content}</p>
                  )}
                  <p>
                    {new Date(selectedThought.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                
                {/* Like button */}
                <LikeButton
                  isLiked={likedThoughts.has(selectedThought.id)}
                  likesCount={selectedThought.likes_count || 0}
                  onLike={() => handleLike(selectedThought.id)}
                  disabled={likingId === selectedThought.id}
                  size="lg"
                  justLiked={justLiked === selectedThought.id}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
