"use client";

import React, { useState } from "react";
import { SITE_DATA } from "@/data/siteData";

export function Footer() {
  const { footer } = SITE_DATA;
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="bg-[#141008] text-[#eee8db]/70 pt-20 sm:pt-28 pb-12 border-t border-white/10">
      <div className="container-x">
        {/* Main Footer Row: 3 Links Columns on Left, Newsletter on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-20 border-b border-white/10">
          {/* Columns 1-3: Links */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footer.columns.map((col, idx) => (
              <div key={idx} className="space-y-4">
                <h4 className="font-serif italic text-xl text-[#eee8db]">
                  {col.title}
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm font-sans">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a
                        href={link.href}
                        className="hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Column 4: Newsletter */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="font-serif italic text-xl text-[#eee8db]">
              {footer.newsletter.title}
            </h4>
            <p className="text-xs sm:text-sm text-[#eee8db]/70 leading-relaxed font-sans">
              {footer.newsletter.description}
            </p>

            {subscribed ? (
              <p className="text-xs font-mono text-[#c26043] pt-2">
                Thank you for subscribing.
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubscribed(true);
                }}
                className="pt-2 flex items-center border-b border-white/20 pb-2"
              >
                <input
                  required
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="text-white hover:text-[#c26043] transition-colors px-2 text-lg"
                >
                  →
                </button>
              </form>
            )}

            <p className="text-[11px] text-white/40 font-mono">
              {footer.newsletter.note}
            </p>
          </div>
        </div>

        {/* Massive Signature Brand Watermark mirroring 'Alma Hartwell' */}
        <div className="pt-12 sm:pt-16 pb-8 text-center select-none pointer-events-none overflow-hidden">
          <span className="font-serif italic text-[14vw] leading-none text-[#eee8db]/85 inline-block whitespace-nowrap drop-shadow-sm">
            {footer.brand}
          </span>
        </div>

        {/* Bottom Legal bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-sans border-t border-white/10">
          <p>{footer.copyright}</p>
          <div className="flex items-center gap-6">
            {footer.legalLinks.map((l, i) => (
              <a key={i} href={l.href} className="hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
