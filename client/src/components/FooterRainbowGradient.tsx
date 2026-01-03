import React from "react";

/**
 * Animated rainbow gradient overlay for the footer.
 * Opacity: 0.25 in light mode, 0.05 in dark mode.
 * Uses Tailwind and custom CSS animation with faster speed.
 */
const FooterRainbowGradient: React.FC = () => (
    <>
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 w-full h-full footer-rainbow-gradient"
            style={{
                zIndex: 1,
                background: 'linear-gradient(270deg, #ff6ec4, #7873f5, #42e695,rgb(202, 179, 80), #ff6ec4)',
                backgroundSize: '400% 400%',
                opacity: 0.2,
                transition: 'opacity 0.3s',
                animation: 'rainbow-shift 4s ease infinite',
            }}
        />
        <style>{`
      @keyframes rainbow-shift {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      
      html.dark .footer-rainbow-gradient {
        opacity: 0.05 !important;
      }
    `}</style>
    </>
);

export default FooterRainbowGradient;