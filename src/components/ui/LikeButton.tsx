import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'overlay'; // overlay for Gallery images
  justLiked?: boolean;
}

const TOOLTIP_KEY = 'like_tooltip_shown';

export function LikeButton({
  isLiked,
  likesCount,
  onLike,
  disabled = false,
  size = 'sm',
  variant = 'default',
  justLiked = false,
}: LikeButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<number[]>([]);
  const [isNear, setIsNear] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const heartIdRef = useRef(0);

  // Sizes config
  const sizeConfig = {
    sm: { icon: 13, padding: 'px-2.5 py-1', text: 'text-xs', heartSize: 10 },
    md: { icon: 16, padding: 'px-4 py-2', text: 'text-sm', heartSize: 12 },
    lg: { icon: 20, padding: 'px-6 py-3', text: 'text-lg', heartSize: 14 },
  };

  const config = sizeConfig[size];

  // Show tooltip on first visit (only once ever)
  useEffect(() => {
    if (!isLiked && !localStorage.getItem(TOOLTIP_KEY)) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        localStorage.setItem(TOOLTIP_KEY, 'true');
        setTimeout(() => setShowTooltip(false), 4000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLiked]);

  // Staggered entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Floating hearts effect (occasional)
  useEffect(() => {
    if (isLiked) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        const id = heartIdRef.current++;
        setFloatingHearts(prev => [...prev, id]);
        setTimeout(() => {
          setFloatingHearts(prev => prev.filter(h => h !== id));
        }, 2000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiked]);

  // Magnetic cursor effect
  useEffect(() => {
    const button = buttonRef.current;
    if (!button || isLiked) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );

      if (distance < 100) {
        setIsNear(true);
        const moveX = (e.clientX - centerX) * 0.15;
        const moveY = (e.clientY - centerY) * 0.15;
        button.style.transform = `translate(${moveX}px, ${moveY}px)`;
      } else {
        setIsNear(false);
        button.style.transform = 'translate(0, 0)';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (button) button.style.transform = 'translate(0, 0)';
    };
  }, [isLiked]);

  // Social proof text
  const getSocialText = () => {
    if (likesCount === 0) return 'Be first!';
    if (likesCount === 1) return '1 like';
    return `${likesCount}`;
  };

  const baseClasses = variant === 'overlay'
    ? 'backdrop-blur-sm bg-black/30'
    : '';

  if (isLiked) {
    // Liked state - elegant gold badge
    return (
      <motion.span
        initial={justLiked ? { scale: 1.4 } : { scale: 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className={`inline-flex items-center gap-1.5 ${config.padding} rounded-full text-amber-500 bg-amber-500/10 border border-amber-500/20 ${baseClasses}`}
      >
        <Heart size={config.icon - 1} className="fill-current" />
        <span className={`${config.text} font-medium`}>{likesCount}</span>
      </motion.span>
    );
  }

  // Not liked - interactive button with all effects
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: hasEntered ? 1 : 0, y: hasEntered ? 0 : 10 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative inline-flex"
    >
      {/* Floating hearts */}
      <AnimatePresence>
        {floatingHearts.map((id) => (
          <motion.span
            key={id}
            initial={{ opacity: 0.8, y: 0, x: 0 }}
            animate={{ 
              opacity: 0, 
              y: -25,
              x: (Math.random() - 0.5) * 20,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute -top-1 left-1/2 text-amber-400 pointer-events-none z-10"
          >
            <Heart size={config.heartSize} className="fill-current" />
          </motion.span>
        ))}
      </AnimatePresence>

      {/* First-visit tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-medium whitespace-nowrap shadow-lg z-20"
          >
            Show some love! 💛
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-amber-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration particles when just liked */}
      <AnimatePresence>
        {justLiked && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1.2,
                  x: Math.cos((i / 8) * Math.PI * 2) * 35,
                  y: Math.sin((i / 8) * Math.PI * 2) * 35,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-400 pointer-events-none z-10"
              >
                <Heart size={config.heartSize} className="fill-current" />
              </motion.span>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        ref={buttonRef}
        onClick={onLike}
        disabled={disabled}
        whileTap={{ scale: 0.9 }}
        animate={isNear ? { scale: 1.1 } : { scale: 1 }}
        className={`
          relative inline-flex items-center gap-1.5 ${config.padding} rounded-full cursor-pointer
          border border-amber-500/30 text-amber-600 dark:text-amber-400
          hover:bg-amber-500/10 hover:border-amber-500/50
          transition-colors duration-200
          ${baseClasses}
          overflow-hidden
        `}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 like-shimmer rounded-full" />
        
        {/* Pulse ring animation */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-amber-500/30"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
        />

        {/* Heart icon */}
        <Heart size={config.icon} className="relative z-10" />
        
        {/* Social proof text */}
        <span className={`${config.text} font-medium relative z-10`}>
          {getSocialText()}
        </span>
      </motion.button>
    </motion.div>
  );
}
