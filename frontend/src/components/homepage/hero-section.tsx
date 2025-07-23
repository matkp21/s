import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="hero-section bg-gradient-to-r from-blue-500 to-purple-500 text-white py-10 text-center">
      <h1 className="text-4xl font-bold">Welcome to MediAssistant</h1>
      <p className="mt-4 text-lg">Your trusted companion for healthcare solutions.</p>
    </section>
  );
};
