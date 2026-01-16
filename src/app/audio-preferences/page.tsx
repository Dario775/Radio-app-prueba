export default function AudioPreferences() {
  return (
    <body className="bg-background-light dark:bg-background-dark font-display antialiased text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 px-6 pt-12 pb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Audio Preferences</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 space-y-6 pb-24">
          {/* Quality Section */}
          <section className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5">
            <div className="px-5 pt-5 pb-2 flex justify-between items-center border-b border-gray-100 dark:border-white/5">
              <h2 className="text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Audio Quality</h2>
            </div>
            <div className="p-3 space-y-2">
              {/* Add radio button options here */}
            </div>
          </section>

          {/* Buffer Section */}
          <section className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5">
            <div className="px-5 pt-5 pb-2 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Streaming Buffer</h2>
            </div>
            <div className="p-3 space-y-2">
              {/* Add radio button options here */}
            </div>
          </section>

          {/* Power Management Section */}
          <section className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5">
            <div className="px-5 pt-5 pb-2 border-b border-gray-100 dark:border-white/5">
              <h2 className="text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Power Management</h2>
            </div>
            <div className="p-3 space-y-2">
              {/* Add radio button options here */}
            </div>
          </section>
        </main>
      </div>
    </body>
  );
}
