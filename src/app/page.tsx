// src/app/page.tsx
"use client";

import { useState } from 'react';
import { HeroSection } from '@/components/homepage/hero-section'; 
import { ModeSwitcher, type ActiveMode } from '@/components/homepage/mode-switcher';
import { SymptomAnalysisMode } from '@/components/homepage/symptom-analysis-mode';
import { ImageProcessingMode } from '@/components/homepage/image-processing-mode';
import { EducationalSupportMode } from '@/components/homepage/educational-support-mode';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useProMode } from '@/contexts/pro-mode-context';
import { PersonalizedClinicalDashboard } from '@/components/pro/personalized-clinical-dashboard';
import { AppLayout } from '@/components/layout/app-layout';

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<ActiveMode>('symptom'); 
  const { userRole } = useProMode();

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        <HeroSection />
        <PageWrapper className="py-8 sm:py-12 flex-grow">
          <ModeSwitcher activeMode={activeMode} setActiveMode={setActiveMode} />
          <div className="mt-8 md:mt-12 content-area">
            <div className={activeMode === 'symptom' ? 'active-mode' : 'inactive-mode'}>
              {activeMode === 'symptom' && <SymptomAnalysisMode />}
            </div>
            <div className={activeMode === 'image' ? 'active-mode' : 'inactive-mode'}>
              {activeMode === 'image' && <ImageProcessingMode />}
            </div>
            <div className={activeMode === 'education' ? 'active-mode' : 'inactive-mode'}>
              {activeMode === 'education' && <EducationalSupportMode />}
            </div>
            <div className={activeMode === 'dashboard' ? 'active-mode' : 'inactive-mode'}>
              {activeMode === 'dashboard' && <PersonalizedClinicalDashboard />}
            </div>
          </div>
        </PageWrapper>
      </div>
    </AppLayout>
  );
}
