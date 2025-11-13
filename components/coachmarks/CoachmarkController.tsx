// components/coachmarks/CoachmarkController.tsx
// Controller que gerencia a exibição do CoachmarkOverlay

import React, { useEffect, useMemo } from 'react';
import { useCoachmarks } from './CoachmarkSystem';
import { CoachmarkOverlay } from './CoachmarkOverlay';

export function CoachmarkController() {
  const {
    currentCoachmark,
    isShowingTour,
    registeredElements,
    nextCoachmark,
    prevCoachmark,
    skipTour,
    completeCoachmark,
  } = useCoachmarks();

  // Calcular total de coachmarks e índice atual
  const totalCoachmarks = useMemo(() => {
    return registeredElements.size;
  }, [registeredElements]);

  const currentIndex = useMemo(() => {
    if (!currentCoachmark) return 0;
    const elements = Array.from(registeredElements.values()).sort(
      (a, b) => a.order - b.order
    );
    return elements.findIndex((el) => el.id === currentCoachmark.id);
  }, [currentCoachmark, registeredElements]);

  const handleNext = () => {
    if (currentCoachmark) {
      completeCoachmark(currentCoachmark.id);
    }
  };

  return (
    <CoachmarkOverlay
      visible={isShowingTour}
      coachmark={currentCoachmark}
      totalCoachmarks={totalCoachmarks}
      currentIndex={currentIndex}
      onNext={handleNext}
      onPrev={prevCoachmark}
      onSkip={skipTour}
    />
  );
}

