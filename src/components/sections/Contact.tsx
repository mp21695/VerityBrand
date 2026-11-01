"use client";

import React, { useState } from "react";
import { RevealText } from "@/components/motion/RevealText";
import { SITE_DATA } from "@/data/siteData";

export function Contact() {
  const { contact } = SITE_DATA;
  const [formSent, setFormSent] = useState(false);

  return (
    <div className="relative bg-[#1c1a18] text-[#eee8db] overflow-hidden">
      {/* Background Spectral Rainbow Light Leak sweeping across */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1c1a18] via-transparent to-[#1c1a18]" />
      </div>

      {/* CONTACT FORM & FACTS SECTION */}
      <section id="contact" className="relative z-10 pt-24 sm:pt-36 pb-28 sm:pb-36">
        <div className="container-x">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Heading, Facts, Socials */}
            <div className="lg:col-span-5 space-y-8">
              <RevealText
                label={contact.sectionLabel}
                text={contact.headline}
                as="h2"
                className="t-h2 font-medium tracking-tight text-[#eee8db] leading-[1.12]"
              />

              <div className="space-y-3 pt-4">
                {contact.facts.map((fact, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-[#eee8db]/85">
                    <span className="text-xs text-[#c26043]">✱</span>
                    <span>{fact}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 text-sm text-[#eee8db]/70 space-y-2">
                <p>{contact.subtext}</p>
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-block text-white underline underline-offset-4 font-mono text-xs hover:text-[#c26043]"
                >
                  {contact.email}
                </a>
              </div>
            </div>

            {/* Right Column: Clean Underlined Minimal Form */}
            <div className="lg:col-span-7">
              {formSent ? (
                <div className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
                  <h4 className="font-serif italic text-2xl text-white mb-2">
                    Inquiry Received
                  </h4>
                  <p className="text-sm text-white/70">
                    A governance specialist will review your compliance parameters and connect within 24 hours.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFormSent(true);
                  }}
                  className="space-y-6"
                >
                  <div>
                    <label className="text-xs text-white/60 block mb-1 font-mono uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/60 block mb-1 font-mono uppercase tracking-wider">
                      Work Email *
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors"
                      placeholder="jane@company.com"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/60 block mb-1 font-mono uppercase tracking-wider">
                      Brand or Fund Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors"
                      placeholder="e.g. Arthaa Finserv"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/60 block mb-1 font-mono uppercase tracking-wider">
                      Regulatory Scope or Channel Focus
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-transparent border-b border-white/20 pb-2 text-white focus:outline-none focus:border-white transition-colors resize-none"
                      placeholder="Describe your promotional review challenges..."
                    />
                  </div>

                  <p className="text-xs text-white/50 pt-2">
                    Your details are confidential and securely stored in workspace-isolated tenants.
                  </p>

                  <button
                    type="submit"
                    className="group/btn relative inline-flex items-center gap-2 rounded-pill bg-[#eee8db] text-[#1c1a18] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.08em] hover:bg-white transition-all shadow-md active:scale-95"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c26043]" />
                    <span>REQUEST GOVERNANCE BRIEFING</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
