// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="mt-14 border-t border-slate-200/70 dark:border-slate-800/70">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-500">
        <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
          <p>© {new Date().getFullYear()} Disclaimer: This website is not the official Sunflower Land website. It is an independent community project developed for informational and entertainment purposes.</p>
          <div className="flex gap-4">
            <a href="https://github.com/sunflower-land" target="_blank" className="hover:text-amber-600">Sunflower Land GitHub</a>
            <a href="https://discord.gg/sunflowerland" target="_blank" className="hover:text-amber-600">Sunflower Land Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
