"use client";

import React, { useEffect, useState } from "react";
import FooterRainbowGradient from "@/components/FooterRainbowGradient";

/**
 * Professional, visually polished footer with animated rainbow overlay.
 * Dynamically adjusts padding based on its actual height.
 */
const Footer: React.FC = () => {
  const [footerHeight, setFooterHeight] = useState(0);

  useEffect(() => {
    const updateFooterHeight = () => {
      const footer = document.getElementById("main-footer");
      if (footer) {
        const height = footer.offsetHeight;
        setFooterHeight(height);
        // Update CSS variable for body padding
        document.documentElement.style.setProperty(
          "--footer-height",
          `${height}px`
        );
      }
    };

    // Initial measurement
    updateFooterHeight();

    // Update on window resize
    window.addEventListener("resize", updateFooterHeight);

    // Use ResizeObserver for more accurate tracking
    const footer = document.getElementById("main-footer");
    if (footer) {
      const resizeObserver = new ResizeObserver(updateFooterHeight);
      resizeObserver.observe(footer);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", updateFooterHeight);
      };
    }

    return () => {
      window.removeEventListener("resize", updateFooterHeight);
    };
  }, []);

  return (
    <footer
      id="main-footer"
      suppressHydrationWarning
      className="fixed left-0 right-0 bottom-0 z-40 flex flex-col items-center justify-center opacity-100 transition-all duration-500 px-8 py-5 sm:py-6 shadow-lg bg-[#f5f6fa]/85 dark:bg-[#23242a]/90 overflow-visible group"
      style={{
        filter: "brightness(1.15) saturate(1.05)",
        backdropFilter: "blur(2px)",
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: "80px",
        height: "auto",
      }}
    >
      <FooterRainbowGradient />
      <div className="relative z-10 flex flex-col items-center w-full">
        <span className="text-base sm:text-lg md:text-xl font-bold tracking-wide text-gray-800 dark:text-gray-100 transition-colors duration-300 drop-shadow-sm mb-1">
          YouTube Analytics Suite
        </span>
        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300 mb-0.5">
          Unlocking insights from YouTube videos with advanced AI and data
          science.
        </span>
        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal transition-colors duration-300 mb-0.5">
          Built for creators, analysts, and marketers to understand audience
          engagement and content performance.
        </span>
        <span className="mt-1 text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-light transition-colors duration-300">
          © {new Date().getFullYear()} YouTube Analytics Suite. Crafted with
          care and innovation.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
