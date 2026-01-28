"use client";

/**
 * Animated rainbow gradient overlay for the footer.
 * Opacity: 0.2 in light mode, 0.05 in dark mode.
 * Uses CSS animation from globals.css
 */
const FooterRainbowGradient: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full footer-rainbow-gradient"
    />
  );
};

export default FooterRainbowGradient;