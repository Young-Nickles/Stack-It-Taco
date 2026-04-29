/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Menu, X, Instagram, Twitter, MapPin } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <a href="#" className="font-display text-4xl uppercase tracking-tighter hover:text-neon-orange transition-colors">
          Stack It Taco
        </a>

          <nav className="hidden md:flex gap-8 items-center">
            <a href="#about" className="font-mono text-sm uppercase font-bold hover:underline underline-offset-4">Inside the Truck</a>
            <a href="#menu-builder" className="font-mono text-sm uppercase font-bold hover:underline underline-offset-4">The Menu</a>
            <a href="#reviews" className="font-mono text-sm uppercase font-bold hover:underline underline-offset-4">Reviews</a>
            <a href="#location" className="font-mono text-sm uppercase font-bold hover:underline underline-offset-4">Find Us</a>
          </nav>

        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 left-0 w-full bg-white border-b-2 border-black p-8 flex flex-col gap-6 md:hidden z-40"
          >
            <a href="#about" className="font-display text-3xl uppercase" onClick={() => setIsOpen(false)}>Inside the Truck</a>
            <a href="#menu-builder" className="font-display text-3xl uppercase" onClick={() => setIsOpen(false)}>The Menu</a>
            <a href="#reviews" className="font-display text-3xl uppercase" onClick={() => setIsOpen(false)}>Reviews</a>
            <a href="#location" className="font-display text-3xl uppercase" onClick={() => setIsOpen(false)}>Find Us</a>
          </motion.div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-black text-white py-20 px-4 border-t-2 border-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-6">
          <h2 className="font-display text-5xl uppercase tracking-tighter leading-none">
            Stack <br /> It <br /> Taco
          </h2>
          <p className="font-mono text-zinc-400 max-w-xs">
            Freshness you can see. Flavor you can't forget. Locally sourced, stacked in front of you.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-mono text-sm uppercase font-bold text-neon-yellow">Contact</h3>
          <p className="font-mono text-lg">hola@stackittaco.com</p>
          <p className="font-mono text-lg">(555) TACO-STACK</p>
          <div className="flex gap-4 pt-4">
            <a href="#" className="hover:text-neon-yellow transition-colors"><Instagram size={24} /></a>
            <a href="#" className="hover:text-neon-yellow transition-colors"><Twitter size={24} /></a>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-mono text-sm uppercase font-bold text-neon-yellow">Location</h3>
          <div className="flex items-start gap-2">
            <MapPin className="shrink-0 mt-1" size={20} />
            <p className="font-mono italic">Currently parked at:<br />Arts District Central Square</p>
          </div>
          <div className="pt-4">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">© 2026 Stack It Taco. Feed the stack.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
