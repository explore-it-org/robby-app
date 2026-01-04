/**
 * Add Instruction Button Component
 *
 * Split button to add a new instruction at a specific position in the program.
 * Main button adds a Move instruction directly.
 * Secondary button (dropdown arrow) opens menu to select other instruction types.
 */

import { useTranslation } from 'react-i18next';
import { MultiOptionButton } from '@/components/ui/multi-option-button';

interface AddInstructionButtonProps {
  onAddMove: () => void;
  onOpenMenu: () => void;
}

export function AddInstructionButton({ onAddMove, onOpenMenu }: AddInstructionButtonProps) {
  const { t } = useTranslation();

  return (
    <MultiOptionButton
      icon="+"
      label={t('instructionPicker.addMove')}
      onMainPress={onAddMove}
      onMenuPress={onOpenMenu}
    />
  );
}
