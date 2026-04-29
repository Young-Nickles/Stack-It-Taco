/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { ArrowRight, Flame, Leaf, Utensils } from "lucide-react";
import { useTruckConfig } from "../hooks/useTruckConfig";

export function Hero() {
  const { config } = useTruckConfig();

  return (
    <section className="relative overflow-hidden bg-white pt-20 pb-0 border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
        <div className="pb-20 space-y-8 z-10">
          <div className="inline-block bg-black text-neon-yellow px-4 py-1 font-mono text-xs uppercase tracking-[0.2em] brutal-shadow -rotate-2">
            Warning: Highly Addictive
          </div>
          
          <h1 className="font-display text-7xl md:text-9xl uppercase tracking-tighter leading-[0.85]">
            {config.heroTitle1} <br /> 
            <span className="text-neon-orange">{config.heroTitle2}</span>
          </h1>
          
          <p className="font-mono text-xl md:text-2xl max-w-md leading-relaxed">
            {config.heroDescription}
          </p>

          <div className="flex flex-wrap gap-4">
            <a href="#menu-builder" className="brutal-btn flex items-center gap-2 group text-black">
              Start Your Stack <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#full-menu" className="font-mono uppercase font-bold py-3 px-6 hover:underline underline-offset-8">
              View Full Menu
            </a>
          </div>
        </div>

        <div className="relative h-[400px] md:h-[600px] bg-neon-yellow border-x-2 border-t-2 border-black flex items-center justify-center overflow-hidden">
          {/* Abstract Taco Stack Visual */}
          <div className="absolute inset-4 border-2 border-black/10 flex flex-col gap-2 p-4 opacity-50 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-4 bg-black/5" />
            ))}
          </div>
          
          <motion.div 
            initial={{ y: 100, rotate: -5 }}
            animate={{ y: 0, rotate: 2 }}
            className="w-4/5 h-[80%] bg-white border-4 border-black brutal-shadow flex flex-col items-center justify-center p-8 text-center"
          >
            <Utensils size={64} className="mb-4 text-neon-orange" />
            <h2 className="font-display text-4xl uppercase mb-2">The Assembly Line</h2>
            <p className="font-mono text-sm">Choose. Stack. Conquer.</p>
          </motion.div>
          
          <div className="absolute top-8 right-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 border-2 border-black rounded-full flex items-center justify-center border-dashed"
            >
              <p className="font-mono text-[10px] uppercase font-bold text-center">Fresh Daily • Local Stuff •</p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Marquee() {
  const items = ["ORDER IN FRONT", "STACK THE TACO", "FRESH TOPPINGS", "SPICY SALSA", "CORN OR FLOUR", "BRAISED BRISKET", "PICKLED ONIONS"];
  
  return (
    <div className="bg-black py-4 border-y-2 border-black overflow-hidden select-none">
      <div className="marquee-track">
        {[...items, ...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-4 px-8 border-r border-white/20">
            <span className="font-display text-4xl text-white uppercase tracking-wider">{item}</span>
            <Flame className="text-neon-orange" size={24} />
          </div>
        ))}
      </div>
    </div>
  );
}
