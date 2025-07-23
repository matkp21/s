import React, { useState } from 'react';

export type ActiveMode = 'SymptomAnalysis' | 'ImageProcessing' | 'EducationalSupport';

interface ModeSwitcherProps {
  onModeChange: (mode: ActiveMode) => void;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ onModeChange }) => {
  const [activeMode, setActiveMode] = useState<ActiveMode>('SymptomAnalysis');

  const handleModeChange = (mode: ActiveMode) => {
    setActiveMode(mode);
    onModeChange(mode);
  };

  return (
    <div className="mode-switcher">
      <button onClick={() => handleModeChange('SymptomAnalysis')} className={activeMode === 'SymptomAnalysis' ? 'active' : ''}>Symptom Analysis</button>
      <button onClick={() => handleModeChange('ImageProcessing')} className={activeMode === 'ImageProcessing' ? 'active' : ''}>Image Processing</button>
      <button onClick={() => handleModeChange('EducationalSupport')} className={activeMode === 'EducationalSupport' ? 'active' : ''}>Educational Support</button>
    </div>
  );
};

export default ModeSwitcher;
