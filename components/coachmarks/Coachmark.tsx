// components/coachmarks/Coachmark.tsx
// Wrapper component para marcar elementos que terão coachmark

import React, { useEffect, useRef, ReactNode } from 'react';
import { View, ViewProps, LayoutChangeEvent } from 'react-native';
import { useCoachmarks } from './CoachmarkSystem';

export interface CoachmarkProps extends ViewProps {
  id: string;
  title: string;
  description: string;
  order: number;
  children: ReactNode;
}

export function Coachmark({
  id,
  title,
  description,
  order,
  children,
  ...viewProps
}: CoachmarkProps) {
  const { registerElement, updateElementPosition } = useCoachmarks();
  const viewRef = useRef<View>(null);

  // Registrar elemento no Context
  useEffect(() => {
    registerElement(id, title, description, order);
  }, [id, title, description, order, registerElement]);

  // Capturar posição do elemento
  const handleLayout = (event: LayoutChangeEvent) => {
    if (viewRef.current) {
      viewRef.current.measureInWindow((x, y, width, height) => {
        updateElementPosition(id, x, y, width, height);
      });
    }

    // Chamar onLayout original se existir
    if (viewProps.onLayout) {
      viewProps.onLayout(event);
    }
  };

  return (
    <View ref={viewRef} {...viewProps} onLayout={handleLayout}>
      {children}
    </View>
  );
}

