import FooterRainbowGradient from "./FooterRainbowGradient";

const Footer: React.FC = () => {
  return (
    <footer
      id="main-footer"
      className="relative w-full overflow-hidden flex flex-col items-center justify-center p-8 sm:py-12 bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-white/5 transition-all duration-500"
    >
      <FooterRainbowGradient />
      <div className="max-w-7xl mx-auto flex flex-col items-center w-full text-center">
        <span className="text-lg sm:text-xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
          YouTube Analytics Suite
        </span>
        <p className="text-sm text-gray-500 dark:text-zinc-500 max-w-xl mb-6">
          Unlocking insights from YouTube videos with advanced AI and data science.
          Built for creators, analysts, and marketers to understand audience engagement and content performance.
        </p>
        <span className="text-xs font-medium text-gray-400 dark:text-zinc-600 uppercase tracking-widest">
          © {new Date().getFullYear()} YouTube Analytics Suite. Crafted with care and innovation.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
