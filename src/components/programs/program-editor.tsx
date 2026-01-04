import { ThemedText } from '@/components/themed-text';
import { useTranslation } from 'react-i18next';

interface Props {
  programName: string;
}

export function ProgramEditor({ programName }: Props) {
  const { t } = useTranslation();

  return (
    <ThemedText>
      {t('program_editor.title')} {programName}
    </ThemedText>
  );
}
