import RadioBrowser from 'radio-browser';
import { notFound } from 'next/navigation';

async function getStation(stationuuid: string) {
  try {
    const stations = await RadioBrowser.getStations({
      by: 'uuid',
      searchterm: stationuuid,
    });
    return stations[0];
  } catch (error) {
    console.error('Error fetching station:', error);
    return null;
  }
}

export default async function LivePlayer({ params }: { params: { stationuuid: string } }) {
  const station = await getStation(params.stationuuid);

  if (!station) {
    notFound();
  }

  return (
    <body className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white h-screen w-full flex flex-col overflow-hidden relative selection:bg-primary selection:text-black">
      {/* Top Section: Immersive Video Stream */}
      <div className="relative w-full h-[48vh] shrink-0 bg-black">
        {/* Video Feed Background */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${station.favicon || 'https://lh3.googleusercontent.com/aida-public/AB6AXuChSxyUlpZz5FUu0Z9Hm9iZ1SrwjLLqnVxOA2KAxEVdqFra2kkqOitX6l7HQqpgDn-wjN4GXJIuRu809hanQD9e7KZLM3P5un85F_ZoxyyVq6gRyrigCdQZJZ0lFBv2HUZQghOBxHENL-9S7bwKpER3iU9Ebbsi8AXpBwmRJ6o2BlYDiqIzyMmxN6T2L_g6JnIeHcOm8OukDiAwl8qx6azALPnpwRM2UDJwuUyrnOkqAakRKX2uDpP_sYmTfQrPAZGhQvt9yfuqD24'}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background-dark"></div>
        </div>
        {/* Header: TopAppBar elements */}
        {/* ... (Header buttons can be added here) ... */}
      </div>

      {/* Bottom Section: Controls & Interactive Layer */}
      <div className="flex-1 flex flex-col bg-background-dark relative z-10 px-5 pb-6 pt-2">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-white/10 shadow-[0_0_20px_-5px_rgba(0,189,199,0.4)]">
              <img alt="Album Art" className="w-full h-full object-cover" src={station.favicon || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7otmQYqsLnBttntk-RVlvzfy6MnmcRdR18CubAgdCLd4k2gfNn6UQvYZfD-rXcYxGJLtYmW2EHtf3wEwoH4clKoL_3QsVQh4TjTk75Q-mVA5H1OGVWJ_YhxmnTvDmBTzYRyOmj-DaPQgKvSH2c0cOwGO8GgrYUesI_5EWrouBHYsBKUGvMBkMqModhkDZ4ILxdCWGPldr3TVhRPbJ-0Pf-gNLr2Ot5UMlweUzfU3gWJtoK1zgwS5i8aecLmuIwsBNrhy-W-4NCc8'} />
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-white text-lg font-bold leading-tight truncate">{station.name}</h2>
              <p className="text-primary text-sm font-medium truncate">{station.country}</p>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        <div className="py-4">
          <audio controls src={station.url_resolved} className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </body>
  );
}
