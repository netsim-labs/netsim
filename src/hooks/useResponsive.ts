import { useState, useEffect, useCallback } from 'react';

interface Breakpoints {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function useResponsive(customBreakpoints?: Partial<Breakpoints>): ResponsiveState {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };

  const getState = useCallback((): ResponsiveState => {
    if (typeof window === 'undefined') {
      return {
        width: 1920,
        height: 1080,
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isLargeDesktop: true,
        breakpoint: '2xl'
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    let breakpoint: ResponsiveState['breakpoint'] = 'xs';
    if (width >= breakpoints['2xl']) breakpoint = '2xl';
    else if (width >= breakpoints.xl) breakpoint = 'xl';
    else if (width >= breakpoints.lg) breakpoint = 'lg';
    else if (width >= breakpoints.md) breakpoint = 'md';
    else if (width >= breakpoints.sm) breakpoint = 'sm';

    return {
      width,
      height,
      isMobile: width < breakpoints.md,
      isTablet: width >= breakpoints.md && width < breakpoints.lg,
      isDesktop: width >= breakpoints.lg,
      isLargeDesktop: width >= breakpoints.xl,
      breakpoint
    };
  }, [breakpoints]);

  const [state, setState] = useState<ResponsiveState>(getState);

  useEffect(() => {
    const handleResize = () => {
      setState(getState());
    };

    // Debounce resize handler
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [getState]);

  return state;
}

// Hook for specific breakpoint checks
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Initial check
    setMatches(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Preset media query hooks
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// Hook for sidebar collapse state based on screen size
export function useSidebarCollapse(defaultCollapsed = false): [boolean, (collapsed: boolean) => void] {
  const { isMobile, isTablet } = useResponsive();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // On mobile/tablet, default to collapsed
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return true;
    }
    return defaultCollapsed;
  });

  // Auto-collapse on mobile/tablet
  useEffect(() => {
    if (isMobile || isTablet) {
      setIsCollapsed(true);
    }
  }, [isMobile, isTablet]);

  return [isCollapsed, setIsCollapsed];
}

// Hook for responsive panel widths
export function useResponsivePanelWidth(
  defaultWidth: number,
  minWidth: number,
  maxWidth: number
): [number, (width: number) => void] {
  const { width: windowWidth, isMobile } = useResponsive();
  const [panelWidth, setPanelWidth] = useState(defaultWidth);

  // Adjust panel width based on window size
  useEffect(() => {
    if (isMobile) {
      setPanelWidth(windowWidth); // Full width on mobile
    } else {
      // Ensure panel doesn't exceed available space
      const maxAllowed = Math.min(maxWidth, windowWidth * 0.5);
      if (panelWidth > maxAllowed) {
        setPanelWidth(maxAllowed);
      }
    }
  }, [windowWidth, isMobile, maxWidth, panelWidth]);

  const setWidth = useCallback((width: number) => {
    setPanelWidth(Math.max(minWidth, Math.min(maxWidth, width)));
  }, [minWidth, maxWidth]);

  return [panelWidth, setWidth];
}
