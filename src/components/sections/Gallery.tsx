import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Heart } from 'lucide-react';
import type { Thought } from '../../types';
import { getThoughts, likeThought, getLikeStatus, generateFingerprint } from '../../services/xano';
import { getXanoFileUrl } from '../../config/xano';

/**
 * Gallery section displaying photos from thoughts
 * Shows all thoughts that have images in horizontal scroll
 * Includes lightbox for full-size viewing with auto-scroll
 */
export function Gallery() {
  const [thoughtsWithImages, setThoughtsWithImages] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [likedPhotos, setLikedPhotos] = useState<Set<number>>(new Set());
  const [likingId, setLikingId] = useState<number | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  
  // Scroll state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isManualScrollMode, setIsManualScrollMode] = useState(false);
  const manualScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollLeftRef = useRef(0);

  // Get fingerprint on mount
  useEffect(() => {
    generateFingerprint().then(setFingerprint);
  }, []);

  const fetchThoughtsWithImages = useCallback(async () => {
    setLoading(true);
    // Fetch more to find all posts with images
    const data = await getThoughts(1, 50);
    // Gallery shows ALL posts that have images (from thoughts + direct gallery uploads)
    const postsWithImages = data.filter(t => t.image_url && t.image_url.length > 0);
    setThoughtsWithImages(postsWithImages);
    setLoading(false);
  }, []);

  // Fetch like status for all photos
  const fetchLikeStatus = useCallback(async () => {
    if (!fingerprint) return;
    const likedIds = await getLikeStatus(fingerprint);
    setLikedPhotos(new Set(likedIds));
  }, [fingerprint]);

  useEffect(() => {
    if (fingerprint) {
      fetchLikeStatus();
    }
  }, [fingerprint, fetchLikeStatus]);

  const handleLike = async (photoId: number) => {
    if (!fingerprint || likedPhotos.has(photoId) || likingId) return;
    
    setLikingId(photoId);
    const success = await likeThought(photoId, fingerprint);
    
    if (success) {
      setLikedPhotos(prev => new Set([...prev, photoId]));
      setThoughtsWithImages(prev => 
        prev.map(t => t.id === photoId ? { ...t, likes_count: (t.likes_count || 0) + 1 } : t)
      );
    }
    
    setTimeout(() => setLikingId(null), 300);
  };

  useEffect(() => {
    fetchThoughtsWithImages();
  }, [fetchThoughtsWithImages]);

  // Track if user is actively touching (for mobile)
  const isTouchingRef = useRef(false);

  // Detect manual scroll (only when not touching - to avoid conflicts on mobile)
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isTouchingRef.current) return;
    
    const scrollDiff = Math.abs(container.scrollLeft - lastScrollLeftRef.current);
    
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
          // Reset scroll to start for smooth auto-scroll restart
          if (container) {
            container.scrollLeft = 0;
          }
        }
      }, 5000);
    }
    
    lastScrollLeftRef.current = container.scrollLeft;
  }, [isHovering]);

  // Horizontal auto-scroll (only when enough images, NOT in manual mode and NOT hovering)
  useEffect(() => {
    const container = scrollContainerRef.current;
    const content = contentRef.current;
    
    // Only auto-scroll if we have 4+ images for infinite scroll
    const shouldAutoScroll = thoughtsWithImages.length >= 4;
    
    if (!container || !content || isManualScrollMode || isHovering || loading || !shouldAutoScroll) return;
    
    const scrollSpeed = 0.5; // pixels per frame
    let animationFrameId: number;
    
    const scroll = () => {
      if (!container || !content) return;
      
      const maxScroll = content.scrollWidth / 2; // Half because content is duplicated
      
      if (container.scrollLeft >= maxScroll) {
        // Reset to beginning seamlessly
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += scrollSpeed;
      }
      
      lastScrollLeftRef.current = container.scrollLeft;
      animationFrameId = requestAnimationFrame(scroll);
    };
    
    animationFrameId = requestAnimationFrame(scroll);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isManualScrollMode, isHovering, loading, thoughtsWithImages]);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    // If we were in manual mode, start a timer to return to auto mode
    if (isManualScrollMode) {
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
      manualScrollTimeoutRef.current = setTimeout(() => {
        setIsManualScrollMode(false);
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = 0;
        }
      }, 3000);
    }
  };

  // Touch handlers (mobile)
  const handleTouchStart = () => {
    isTouchingRef.current = true;
    setIsHovering(true);
    setIsManualScrollMode(true);
    if (manualScrollTimeoutRef.current) {
      clearTimeout(manualScrollTimeoutRef.current);
    }
  };
  
  const handleTouchEnd = () => {
    isTouchingRef.current = false;
    // Resume auto-scroll after 3 seconds of no touch
    if (manualScrollTimeoutRef.current) {
      clearTimeout(manualScrollTimeoutRef.current);
    }
    manualScrollTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      setIsManualScrollMode(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = 0;
      }
    }, 3000);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex(prev => 
          prev !== null && prev > 0 ? prev - 1 : thoughtsWithImages.length - 1
        );
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex(prev => 
          prev !== null && prev < thoughtsWithImages.length - 1 ? prev + 1 : 0
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, thoughtsWithImages.length]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedIndex]);

  if (loading) {
    return (
      <section id="gallery" className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 border-3 border-themed rounded-full relative">
              <div className="absolute inset-0 w-10 h-10 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <span className="text-themed-muted text-sm">Loading gallery...</span>
          </div>
        </div>
      </section>
    );
  }

  // Don't show section if no images
  if (thoughtsWithImages.length === 0) {
    return null;
  }

  const selectedThought = selectedIndex !== null ? thoughtsWithImages[selectedIndex] : null;
  
  // Only enable infinite scroll if there are enough images (4+)
  const enableInfiniteScroll = thoughtsWithImages.length >= 4;

  return (
    <section id="gallery" className="py-12 md:py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-coral-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl xl:max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center shadow-lg shadow-coral-500/30">
              <ImageIcon size={20} className="text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-themed-primary">
              Gallery
            </h2>
          </div>
          <p className="text-themed-muted text-lg">Photos and moments captured</p>
        </motion.div>

        {/* Horizontal Scrolling Gallery */}
        <div 
          ref={scrollContainerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onScroll={handleScroll}
          className="overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div ref={contentRef} className="flex gap-4 pb-4">
            {/* Original content */}
            {thoughtsWithImages.map((thought, index) => (
              <motion.div
                key={thought.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative flex-shrink-0 w-64 h-64 md:w-72 md:h-72 cursor-pointer"
                onClick={() => setSelectedIndex(index)}
              >
                <img
                  src={getXanoFileUrl(thought.image_url)}
                  alt="Gallery image"
                  className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-900/80 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {/* Like button with count */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(thought.id);
                    }}
                    disabled={likedPhotos.has(thought.id) || likingId === thought.id}
                    whileTap={{ scale: 0.9 }}
                    animate={!likedPhotos.has(thought.id) ? { 
                      scale: [1, 1.2, 1, 1.15, 1],
                      rotate: [0, -5, 5, -3, 0],
                    } : {}}
                    transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.8 }}
                    className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm transition-all cursor-pointer ${
                      likedPhotos.has(thought.id)
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                        : 'bg-red-500/30 text-white border border-red-500/50 hover:bg-red-500'
                    }`}
                  >
                    <Heart size={14} className={likedPhotos.has(thought.id) ? 'fill-current' : 'animate-pulse'} />
                    <span className="text-sm font-medium">{thought.likes_count || 0}</span>
                  </motion.button>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex-1">
                      {thought.content && thought.content.trim() && (
                        <p className="text-white text-xs line-clamp-2 mb-1">
                          {thought.content}
                        </p>
                      )}
                      <p className="text-white/70 text-xs">
                        {new Date(thought.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Duplicated content for seamless infinite loop (only when enough images and in auto mode) */}
            {enableInfiniteScroll && !isManualScrollMode && thoughtsWithImages.map((thought, index) => (
              <motion.div
                key={`dup-${thought.id}`}
                className="group relative flex-shrink-0 w-64 h-64 md:w-72 md:h-72 cursor-pointer"
                onClick={() => setSelectedIndex(index)}
              >
                <img
                  src={getXanoFileUrl(thought.image_url)}
                  alt="Gallery image"
                  className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-900/80 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {/* Like button with count */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(thought.id);
                    }}
                    disabled={likedPhotos.has(thought.id) || likingId === thought.id}
                    whileTap={{ scale: 0.9 }}
                    className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm transition-all cursor-pointer ${
                      likedPhotos.has(thought.id)
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                        : 'bg-red-500/30 text-white border border-red-500/50 hover:bg-red-500'
                    }`}
                  >
                    <Heart size={14} className={likedPhotos.has(thought.id) ? 'fill-current' : 'animate-pulse'} />
                    <span className="text-sm font-medium">{thought.likes_count || 0}</span>
                  </motion.button>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex-1">
                      {thought.content && thought.content.trim() && (
                        <p className="text-white text-xs line-clamp-2 mb-1">
                          {thought.content}
                        </p>
                      )}
                      <p className="text-white/70 text-xs">
                        {new Date(thought.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedThought && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-midnight-950/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <X size={24} />
            </button>

            {/* Navigation buttons */}
            {thoughtsWithImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(prev => 
                      prev !== null && prev > 0 ? prev - 1 : thoughtsWithImages.length - 1
                    );
                  }}
                  className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(prev => 
                      prev !== null && prev < thoughtsWithImages.length - 1 ? prev + 1 : 0
                    );
                  }}
                  className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            {/* Image and caption */}
            <motion.div
              key={selectedThought.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="max-w-5xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getXanoFileUrl(selectedThought.image_url)}
                alt={selectedThought.content || 'Gallery image'}
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
              <div className="mt-4 text-center">
                {selectedThought.content && selectedThought.content.trim() && (
                  <p className="text-white/90 text-sm md:text-base max-w-2xl mx-auto mb-2 whitespace-pre-wrap">
                    {selectedThought.content}
                  </p>
                )}
                <div className="flex items-center justify-center gap-4">
                  <p className="text-white/50 text-xs">
                    {new Date(selectedThought.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {/* Like button in lightbox */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(selectedThought.id);
                    }}
                    disabled={likedPhotos.has(selectedThought.id) || likingId === selectedThought.id}
                    whileTap={{ scale: 0.9 }}
                    animate={!likedPhotos.has(selectedThought.id) ? { 
                      scale: [1, 1.2, 1, 1.15, 1],
                      rotate: [0, -5, 5, -3, 0],
                      boxShadow: [
                        '0 0 0 0 rgba(239, 68, 68, 0)', 
                        '0 0 20px 5px rgba(239, 68, 68, 0.4)', 
                        '0 0 0 0 rgba(239, 68, 68, 0)'
                      ]
                    } : {}}
                    transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.8 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all cursor-pointer ${
                      likedPhotos.has(selectedThought.id)
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/50'
                        : 'bg-red-500/20 text-white border-2 border-red-500/50 hover:bg-red-500 hover:border-red-500'
                    }`}
                  >
                    <Heart size={20} className={likedPhotos.has(selectedThought.id) ? 'fill-current' : 'animate-pulse'} />
                    <span className="text-lg font-bold">{selectedThought.likes_count || 0}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
              {selectedIndex !== null ? selectedIndex + 1 : 0} / {thoughtsWithImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
