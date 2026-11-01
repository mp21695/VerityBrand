"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { RollText } from "@/components/ui/Button";
import { SITE_DATA } from "@/data/siteData";

interface HeaderProps {
  onOpenWorkspace?: () => void;
}

export function Header({ onOpenWorkspace }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { nav, promoBanner } = SITE_DATA;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Countdown / Promo Banner (Alma's top bar) */}
      <div className="bg-[#b3593b] text-[#f7f1e7] text-[11px] sm:text-xs font-medium py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 relative z-50">
        <span>{promoBanner.message}</span>
        <span className="font-semibold underline uppercase ml-1 cursor-pointer">
          {promoBanner.tag}
        </span>
      </div>

      <header
        className={`fixed top-[28px] left-0 right-0 z-40 transition-all duration-300 ease-(--ease-out-soft) ${
          scrolled
            ? "bg-[#1c1a18]/85 backdrop-blur-md py-3.5 border-b border-[#eee8db]/10"
            : "bg-transparent py-5 sm:py-6"
        }`}
      >
        <div className="container-x flex items-center justify-between">
          {/* Logo brand serif italic */}
          <Link
            href="/"
            className="group flex items-center gap-2 text-on-dark focus-visible:outline-none"
          >
            <span className="font-serif italic text-2xl sm:text-[1.85rem] tracking-tight transition-transform duration-300 group-hover:scale-[1.02]">
              {nav.brand}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8 text-[13px] font-semibold tracking-[0.08em] uppercase text-on-dark">
            {nav.links.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="group/btn relative py-1 transition-colors duration-200 hover:text-on-dark focus-visible:outline-none"
              >
                <RollText>{item.label}</RollText>
              </a>
            ))}
          </nav>

          {/* Action Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenWorkspace}
              className="group/btn hidden sm:inline-flex items-center gap-2 rounded-pill bg-[#eee8db] text-[#1c1a18] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-300 hover:bg-white active:scale-95 shadow-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#c26043] group-hover/btn:scale-125 transition-transform" />
              <RollText>{nav.cta.label}</RollText>
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-full border border-on-dark/20 text-on-dark focus-visible:outline-none"
            >
              <span
                className={`block h-0.5 w-5 bg-on-dark transition-all duration-300 ${
                  mobileMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-1"
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-on-dark transition-all duration-300 ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-0.5" : "translate-y-1"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-[#141008]/95 flex flex-col justify-center items-center px-6 md:hidden"
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-3 text-on-dark text-xl font-light focus-visible:outline-none"
              aria-label="Close menu"
            >
              ✕
            </button>

            <span className="font-serif italic text-3xl text-on-dark mb-10">
              {nav.brand}
            </span>

            <nav className="flex flex-col items-center gap-6 text-center">
              {nav.links.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-serif italic text-on-dark hover:text-brand-pink transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mt-12 w-full max-w-xs">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWorkspace?.();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-pill bg-[#eee8db] text-[#1c1a18] py-3.5 text-xs font-semibold uppercase tracking-[0.08em]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#c26043]" />
                {nav.cta.label}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
