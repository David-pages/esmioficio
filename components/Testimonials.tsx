import React from 'react';
import { TESTIMONIALS } from '../constants';

const Testimonials: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-surface to-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-surface-light/50 border border-border">
              <span className="material-symbols-outlined text-4xl text-primary/20 absolute top-4 left-4">format_quote</span>
              <p className="text-gray-300 italic mb-4 mt-6 text-sm leading-relaxed">"{t.text}"</p>
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm">{t.author}</span>
                <span className="text-primary text-xs">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
