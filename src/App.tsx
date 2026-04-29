/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Header, Footer } from "./components/Layout";
import { Hero, Marquee } from "./components/HomeSections";
import TacoBuilder from "./components/TacoBuilder";
import { MenuSection } from "./components/MenuSection";
import { TruckLocation } from "./components/TruckLocation";
import { ReviewsSection } from "./components/ReviewsSection";
import { motion, useScroll, useSpring } from "motion/react";
import { useTruckConfig } from "./hooks/useTruckConfig";

export default function App() {
  const { scrollYProgress } = useScroll();
  const { config } = useTruckConfig();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen selection:bg-neon-yellow flex flex-col">
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-neon-orange z-[60] origin-left"
        style={{ scaleX }}
      />

      <Header />
      
      <main className="flex-grow">
        <Hero />
        <Marquee />
        
        {/* About / Process Section */}
        <section id="about" className="py-24 px-4 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="flex-1 space-y-6">
                <h2 className="font-display text-5xl md:text-7xl uppercase leading-none">
                  {config.aboutTitle.split(' ').map((word, i) => (
                    word.toLowerCase() === 'magic' || word.toLowerCase() === 'happen' ? (
                      <span key={i} className="text-neon-orange">{word} </span>
                    ) : word + ' '
                  ))}
                </h2>
                <p className="font-mono text-xl leading-relaxed text-zinc-600">
                  {config.aboutText}
                </p>
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="space-y-2">
                    <p className="font-display text-4xl uppercase">100%</p>
                    <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Corn Tortillas</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-display text-4xl uppercase">Zero</p>
                    <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Wait-in-dark</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full relative">
                <div className="aspect-video bg-black brutal-shadow overflow-hidden group rotate-1">
                  <div className="absolute inset-0 bg-neon-yellow opacity-10 group-hover:opacity-0 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center p-12 text-center text-white">
                    <p className="font-display text-2xl uppercase tracking-widest border-2 border-white p-4">Live Prep Station</p>
                  </div>
                </div>
                {/* Floating "Stamp" */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-neon-yellow rounded-full border-2 border-black flex items-center justify-center -rotate-12 brutal-shadow">
                  <p className="font-mono text-[10px] font-black uppercase text-center p-2">Freshness <br /> Guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <TacoBuilder />
        <MenuSection />
        <ReviewsSection />
        <TruckLocation />
      </main>

      <Footer />
    </div>
  );
}

