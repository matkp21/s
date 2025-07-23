import React from 'react';

const OnboardingModal: React.FC = () => {
  return (
    <div className="onboarding-modal bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome to MediAssistant!</h2>
      <p className="text-gray-700 mb-4">Let us guide you through the features of our platform.</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Get Started</button>
    </div>
  );
};

export default OnboardingModal;
