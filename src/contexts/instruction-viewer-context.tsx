/**
 * Instruction Viewer Context
 *
 * Provides a way to pass instructions to the program-view page.
 * Set instructions before navigating, then read them in the view page.
 */

import { Instruction } from '@/programs/instructions';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface InstructionViewerContextValue {
  instructions: Instruction[] | null;
  setInstructions: (instructions: Instruction[]) => void;
  clearInstructions: () => void;
}

const InstructionViewerContext = createContext<InstructionViewerContextValue | null>(null);

interface Props {
  children: ReactNode;
}

export function InstructionViewerProvider({ children }: Props) {
  const [instructions, setInstructionsState] = useState<Instruction[] | null>(null);

  const setInstructions = useCallback((newInstructions: Instruction[]) => {
    setInstructionsState(newInstructions);
  }, []);

  const clearInstructions = useCallback(() => {
    setInstructionsState(null);
  }, []);

  return (
    <InstructionViewerContext.Provider value={{ instructions, setInstructions, clearInstructions }}>
      {children}
    </InstructionViewerContext.Provider>
  );
}

export function useInstructionViewer(): InstructionViewerContextValue {
  const context = useContext(InstructionViewerContext);
  if (!context) {
    throw new Error('useInstructionViewer must be used within an InstructionViewerProvider');
  }
  return context;
}
