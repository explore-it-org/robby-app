/**
 * ProgramListItem Component
 *
 * Displays a single program entry in the program list.
 * Shows program name, last modified date, and instruction count.
 */

import { ProgramInfo } from '@/services/programs';
import { ProgramEntryView } from './program-entry-view';

interface Props {
  program: ProgramInfo;
  onSelected: (name: string) => void;
  isSelected: boolean;
}

export function ProgramListItem({ program, onSelected, isSelected }: Props) {
  return (
    <ProgramEntryView
      program={program}
      onPress={() => onSelected(program.name)}
      isSelected={isSelected}
    />
  );
}
