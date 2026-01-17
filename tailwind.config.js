/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ===== TYPOGRAPHY =====
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'sans-serif'],
      },

      // ===== BORDER RADIUS =====
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'premium': '18px',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // ===== COLORS =====
      colors: {
        // shadcn/ui base
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ===== NETSIM BRAND COLORS =====
        'netsim': {
          primary: '#29d9ff',
          'primary-light': '#7ae7ff',
          'primary-dark': '#00b8e6',
          cyan: '#29d9ff',
          purple: '#8b5cf6',
          violet: '#a855f7',
          pink: '#ec4899',
          indigo: '#6366f1',
        },

        // ===== BACKGROUND SCALE =====
        'bg': {
          deepest: '#030303',
          primary: '#050505',
          elevated: '#0a0a0b',
          surface: '#0f1115',
          card: '#141820',
          hover: 'rgba(255,255,255,0.03)',
          active: 'rgba(255,255,255,0.06)',
        },

        // ===== GLASS COLORS =====
        'glass': {
          bg: 'rgba(13, 17, 28, 0.7)',
          'bg-dark': 'rgba(8, 10, 18, 0.85)',
          'bg-light': 'rgba(20, 25, 40, 0.6)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-light': 'rgba(255, 255, 255, 0.12)',
          surface: 'rgba(255, 255, 255, 0.03)',
          highlight: 'rgba(255, 255, 255, 0.1)',
        },

        // ===== NEON COLORS =====
        'neon': {
          blue: '#29d9ff',
          purple: '#bd5fff',
          pink: '#ff4d94',
          green: '#00ff9d',
          orange: '#ff9100',
          cyan: '#06b6d4',
          violet: '#8b5cf6',
        },

        // ===== STATUS COLORS =====
        'status': {
          up: '#22c55e',
          down: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
          success: '#10b981',
          error: '#dc2626',
        },

        // Legacy support
        'network-bg': '#030508',
        'panel-bg': 'rgba(13, 17, 28, 0.6)',
        'card-bg': 'rgba(20, 25, 40, 0.4)',
      },

      // ===== BACKGROUND IMAGES =====
      backgroundImage: {
        // Mesh Gradients
        'mesh-gradient': 'linear-gradient(-45deg, #030303, #0d1f3c, #1a0a2e, #030303)',
        'mesh-gradient-subtle': 'radial-gradient(circle at 50% -20%, rgba(120, 119, 198, 0.1), transparent)',
        'mesh-gradient-hero': 'linear-gradient(-45deg, #030303 0%, #0d1f3c 25%, #1a0a2e 50%, #0d1f3c 75%, #030303 100%)',

        // Glass Gradients
        'glass-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.00) 100%)',
        'glass-shine': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, transparent 100%)',

        // Button Gradients
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #06b6d4 0%, #29d9ff 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
        'gradient-danger': 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',

        // Premium Effects
        'radial-glow-cyan': 'radial-gradient(circle at center, rgba(41, 217, 255, 0.15), transparent 70%)',
        'radial-glow-purple': 'radial-gradient(circle at center, rgba(139, 92, 246, 0.15), transparent 70%)',
        'radial-glow-pink': 'radial-gradient(circle at center, rgba(236, 72, 153, 0.15), transparent 70%)',

        // Particle Field
        'particles': 'radial-gradient(circle, rgba(41,217,255,0.15) 1px, transparent 1px)',
        'particles-subtle': 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',

        // Noise Texture
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },

      // ===== BOX SHADOWS =====
      boxShadow: {
        // Neon Glows
        'neon-blue': '0 0 20px rgba(41, 217, 255, 0.3), 0 0 40px rgba(41, 217, 255, 0.1)',
        'neon-blue-lg': '0 0 30px rgba(41, 217, 255, 0.4), 0 0 60px rgba(41, 217, 255, 0.2)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
        'neon-purple-lg': '0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)',
        'neon-pink': '0 0 20px rgba(236, 72, 153, 0.3), 0 0 40px rgba(236, 72, 153, 0.1)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(6, 182, 212, 0.1)',
        'neon-green': '0 0 20px rgba(34, 197, 94, 0.3), 0 0 40px rgba(34, 197, 94, 0.1)',

        // Glass Shadows
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-lg': '0 12px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-sm': '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)',

        // Elevation
        'elevation-1': '0 2px 4px rgba(0, 0, 0, 0.3)',
        'elevation-2': '0 4px 8px rgba(0, 0, 0, 0.3)',
        'elevation-3': '0 8px 16px rgba(0, 0, 0, 0.4)',
        'elevation-4': '0 16px 32px rgba(0, 0, 0, 0.5)',
        'elevation-5': '0 24px 48px rgba(0, 0, 0, 0.6)',

        // Inner shadows
        'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.1)',
        'inner-highlight': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',

        // Button shadows
        'btn-primary': '0 4px 14px rgba(99, 102, 241, 0.4)',
        'btn-primary-hover': '0 6px 20px rgba(99, 102, 241, 0.5)',
        'btn-glow': '0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.2)',
      },

      // ===== KEYFRAMES =====
      keyframes: {
        // shadcn/ui accordion
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },

        // ===== MESH GRADIENT ANIMATION =====
        meshGradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        meshGradientSlow: {
          '0%': { backgroundPosition: '0% 0%' },
          '50%': { backgroundPosition: '100% 100%' },
          '100%': { backgroundPosition: '0% 0%' },
        },

        // ===== FLOATING ORB ANIMATIONS =====
        floatOrb: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        floatOrb2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-40px, 30px) scale(1.15)' },
          '66%': { transform: 'translate(25px, -35px) scale(0.85)' },
        },
        floatOrb3: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(20px, -40px) scale(1.05)' },
          '50%': { transform: 'translate(-30px, -20px) scale(0.95)' },
          '75%': { transform: 'translate(15px, 30px) scale(1.1)' },
        },

        // ===== PARTICLE ANIMATIONS =====
        particleFloat: {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '100%': { transform: 'translateY(-100vh) rotate(360deg)' },
        },
        particlePulse: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.2)' },
        },

        // ===== GLOW PULSES =====
        glowPulse: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
        },
        neonPulse: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(41, 217, 255, 0.3), 0 0 40px rgba(41, 217, 255, 0.1)'
          },
          '50%': {
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.4), 0 0 80px rgba(139, 92, 246, 0.2)'
          },
        },
        neonPulseSubtle: {
          '0%, 100%': {
            boxShadow: '0 0 10px rgba(99, 102, 241, 0.2)'
          },
          '50%': {
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)'
          },
        },

        // ===== BORDER ANIMATIONS =====
        borderGradient: {
          '0%': { borderColor: 'rgba(99, 102, 241, 0.5)' },
          '33%': { borderColor: 'rgba(168, 85, 247, 0.5)' },
          '66%': { borderColor: 'rgba(6, 182, 212, 0.5)' },
          '100%': { borderColor: 'rgba(99, 102, 241, 0.5)' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(99,102,241,0.3)' },
          '50%': { borderColor: 'rgba(168,85,247,0.5)' },
        },

        // ===== CARD 3D HOVER =====
        card3DHover: {
          '0%': { transform: 'perspective(1000px) rotateX(0) rotateY(0)' },
          '100%': { transform: 'perspective(1000px) rotateX(5deg) rotateY(-5deg)' },
        },

        // ===== TRAFFIC FLOW (cables) =====
        trafficFlow: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
        trafficFlowReverse: {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '20' },
        },

        // ===== CONNECTION PULSE =====
        connectionPulse: {
          '0%, 100%': { strokeOpacity: '1' },
          '50%': { strokeOpacity: '0.5' },
        },

        // ===== SHIMMER =====
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        shimmerPremium: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },

        // ===== FLOAT ANIMATIONS =====
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        subtleFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },

        // ===== GRADIENT SHIFT =====
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },

        // ===== FADE ANIMATIONS =====
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },

        // ===== SLIDE ANIMATIONS =====
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInDown: {
          '0%': { opacity: '0', transform: 'translateY(-100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },

        // ===== BOUNCE =====
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },

        // ===== PULSE =====
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        pulseDot: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.5' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },

        // ===== SPIN =====
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },

        // ===== SHAKE =====
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },

        // ===== TYPING CURSOR =====
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },

        // ===== WAVEFORM =====
        waveform: {
          '0%, 100%': { height: '4px' },
          '50%': { height: '20px' },
        },
        waveformAlt: {
          '0%, 100%': { height: '8px' },
          '25%': { height: '16px' },
          '50%': { height: '4px' },
          '75%': { height: '24px' },
        },

        // ===== SCANLINE (CRT effect) =====
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },

        // ===== RIPPLE =====
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },

      // ===== ANIMATIONS =====
      animation: {
        // shadcn/ui
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",

        // Mesh Gradients
        'mesh-gradient': 'meshGradient 15s ease infinite',
        'mesh-gradient-fast': 'meshGradient 8s ease infinite',
        'mesh-gradient-slow': 'meshGradientSlow 25s ease infinite',

        // Floating Orbs
        'float-orb': 'floatOrb 20s ease-in-out infinite',
        'float-orb-2': 'floatOrb2 25s ease-in-out infinite',
        'float-orb-3': 'floatOrb3 22s ease-in-out infinite',

        // Particles
        'particle-float': 'particleFloat 20s linear infinite',
        'particle-pulse': 'particlePulse 3s ease-in-out infinite',

        // Glows
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'neon-pulse': 'neonPulse 3s ease-in-out infinite',
        'neon-pulse-subtle': 'neonPulseSubtle 4s ease-in-out infinite',

        // Borders
        'border-gradient': 'borderGradient 4s ease infinite',
        'border-glow': 'borderGlow 2s ease-in-out infinite',

        // Traffic
        'traffic-flow': 'trafficFlow 1s linear infinite',
        'traffic-flow-slow': 'trafficFlow 2s linear infinite',
        'connection-pulse': 'connectionPulse 2s ease-in-out infinite',

        // Shimmer
        'shimmer': 'shimmer 2s linear infinite',
        'shimmer-slow': 'shimmer 3s linear infinite',
        'shimmer-premium': 'shimmerPremium 2s ease-in-out infinite',

        // Float
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'floatSlow 5s ease-in-out infinite',
        'subtle-float': 'subtleFloat 3s ease-in-out infinite',

        // Gradient
        'gradient-shift': 'gradientShift 3s ease infinite',
        'gradient-shift-slow': 'gradientShift 6s ease infinite',

        // Fade
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'fade-in-down': 'fadeInDown 0.4s ease-out',
        'fade-in-scale': 'fadeInScale 0.3s ease-out',

        // Slide
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',

        // Bounce
        'bounce-in': 'bounceIn 0.5s ease-out',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',

        // Pulse
        'pulse': 'pulse 2s ease-in-out infinite',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',

        // Spin
        'spin': 'spin 1s linear infinite',
        'spin-slow': 'spinSlow 3s linear infinite',

        // Shake
        'shake': 'shake 0.5s ease-in-out',

        // Cursor
        'blink': 'blink 1s step-end infinite',

        // Waveform
        'waveform': 'waveform 0.5s ease-in-out infinite',
        'waveform-alt': 'waveformAlt 0.8s ease-in-out infinite',

        // Scanline
        'scanline': 'scanline 8s linear infinite',

        // Ripple
        'ripple': 'ripple 0.6s linear',
      },

      // ===== BACKDROP BLUR =====
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '20px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },

      // ===== TRANSITION TIMING =====
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'snap': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      // ===== Z-INDEX =====
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        'modal': '1000',
        'tooltip': '1100',
        'dropdown': '1200',
        'overlay': '1300',
        'max': '9999',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
