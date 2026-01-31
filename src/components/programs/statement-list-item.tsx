import { MoveStatement, SubroutineStatement } from '@/services/programs/statements';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { NumberInput } from '@/components/ui/number-input';

interface StatementItemLayoutProps {
  repetitions: number;
  onRepetitionChange: (value: number) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onInsertBefore: () => void;
  onInsertAfter: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
  onChangeProgram?: () => void;
  children: ReactNode;
}

function StatementItemLayout({
  repetitions,
  onRepetitionChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onInsertBefore,
  onInsertAfter,
  canMoveUp,
  canMoveDown,
  canDelete,
  onChangeProgram,
  children,
}: StatementItemLayoutProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <View style={styles.container}>
        {/* Repetition Count */}
        <NumberInput
          value={repetitions}
          onValueChange={onRepetitionChange}
          min={1}
          max={99}
          unit="×"
          containerStyle={styles.repetitionBox}
        />

        {/* Statement Content */}
        {children}

        {/* Menu Button */}
        <Pressable onPress={() => setShowMenu(true)} hitSlop={8}>
          <Text style={styles.menuIcon}>⋯</Text>
        </Pressable>
      </View>

      {/* Statement Options Menu */}
      <StatementOptionsMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onDelete={onDelete}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onInsertBefore={onInsertBefore}
        onInsertAfter={onInsertAfter}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        canDelete={canDelete}
        onChangeProgram={onChangeProgram}
      />
    </>
  );
}

interface MoveStatementProps {
  statement: MoveStatement;
  index: number;
  onChange: (statement: MoveStatement) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onInsertBefore: (index: number) => void;
  onInsertAfter: (index: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
}

export function MoveStatementItem({
  statement,
  index,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onInsertBefore,
  onInsertAfter,
  canMoveUp,
  canMoveDown,
  canDelete,
}: MoveStatementProps) {
  const handleRepetitionChange = (value: number) => {
    onChange({
      ...statement,
      repetitions: value,
    });
  };

  const handleLeftMotorChange = (value: number) => {
    onChange({
      ...statement,
      leftMotorSpeed: value,
    });
  };

  const handleRightMotorChange = (value: number) => {
    onChange({
      ...statement,
      rightMotorSpeed: value,
    });
  };

  const handleDelete = () => {
    onDelete(index);
  };

  const handleMoveUp = () => {
    onMoveUp(index);
  };

  const handleMoveDown = () => {
    onMoveDown(index);
  };

  const handleInsertBefore = () => {
    onInsertBefore(index);
  };

  const handleInsertAfter = () => {
    onInsertAfter(index);
  };

  // Calculate visualization based on motor speeds
  const leftSpeed = statement.leftMotorSpeed;
  const rightSpeed = statement.rightMotorSpeed;

  return (
    <StatementItemLayout
      repetitions={statement.repetitions}
      onRepetitionChange={handleRepetitionChange}
      onDelete={handleDelete}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      onInsertBefore={handleInsertBefore}
      onInsertAfter={handleInsertAfter}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      canDelete={canDelete}
    >
      {/* Left Motor Speed */}
      <NumberInput
        value={leftSpeed}
        onValueChange={handleLeftMotorChange}
        min={0}
        max={100}
        containerStyle={styles.motorSpeedBox}
      />

      {/* Movement Visualization Bar */}
      <View style={styles.visualizationBar}>
        <View style={styles.visualizationColumn}>
          <View style={[styles.visualizationLeft, { width: `${leftSpeed}%` }]} />
        </View>
        <View style={styles.visualizationColumn}>
          <View style={[styles.visualizationRight, { width: `${rightSpeed}%` }]} />
        </View>
      </View>

      {/* Right Motor Speed */}
      <NumberInput
        value={rightSpeed}
        onValueChange={handleRightMotorChange}
        min={0}
        max={100}
        containerStyle={styles.motorSpeedBox}
      />
    </StatementItemLayout>
  );
}

interface StatementOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onInsertBefore: () => void;
  onInsertAfter: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
  onChangeProgram?: () => void;
}

function StatementOptionsMenu({
  visible,
  onClose,
  onDelete,
  onMoveUp,
  onMoveDown,
  onInsertBefore,
  onInsertAfter,
  canMoveUp,
  canMoveDown,
  canDelete,
  onChangeProgram,
}: StatementOptionsMenuProps) {
  const { t } = useTranslation();

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text style={styles.title}>{t('statementOptionsMenu.title')}</Text>

            <View style={styles.optionsContainer}>
              {/* Change Program (only for subroutines) */}
              {onChangeProgram && (
                <Pressable
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  onPress={() => handleAction(onChangeProgram)}
                >
                  <Text style={styles.optionIcon}>🔁</Text>
                  <Text style={styles.optionText}>{t('statementOptionsMenu.changeProgram')}</Text>
                </Pressable>
              )}

              {/* Move Up */}
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  !canMoveUp && styles.optionDisabled,
                  pressed && canMoveUp && styles.optionPressed,
                ]}
                onPress={() => canMoveUp && handleAction(onMoveUp)}
                disabled={!canMoveUp}
              >
                <Text style={styles.optionIcon}>⬆️</Text>
                <Text style={[styles.optionText, !canMoveUp && styles.optionTextDisabled]}>
                  {t('statementOptionsMenu.moveUp')}
                </Text>
              </Pressable>

              {/* Move Down */}
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  !canMoveDown && styles.optionDisabled,
                  pressed && canMoveDown && styles.optionPressed,
                ]}
                onPress={() => canMoveDown && handleAction(onMoveDown)}
                disabled={!canMoveDown}
              >
                <Text style={styles.optionIcon}>⬇️</Text>
                <Text style={[styles.optionText, !canMoveDown && styles.optionTextDisabled]}>
                  {t('statementOptionsMenu.moveDown')}
                </Text>
              </Pressable>

              {/* Insert Before */}
              <Pressable
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                onPress={() => handleAction(onInsertBefore)}
              >
                <Text style={styles.optionIcon}>⤴️</Text>
                <Text style={styles.optionText}>{t('statementOptionsMenu.insertBefore')}</Text>
              </Pressable>

              {/* Insert After */}
              <Pressable
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                onPress={() => handleAction(onInsertAfter)}
              >
                <Text style={styles.optionIcon}>⤵️</Text>
                <Text style={styles.optionText}>{t('statementOptionsMenu.insertAfter')}</Text>
              </Pressable>

              {/* Delete */}
              {canDelete && (
                <Pressable
                  style={({ pressed }) => [
                    styles.option,
                    styles.deleteOption,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => handleAction(onDelete)}
                >
                  <Text style={styles.optionIcon}>🗑️</Text>
                  <Text style={[styles.optionText, styles.deleteText]}>
                    {t('statementOptionsMenu.delete')}
                  </Text>
                </Pressable>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

interface SubroutineStatementProps {
  statement: SubroutineStatement;
  index: number;
  onChange: (statement: SubroutineStatement) => void;
  onProgramSelect: () => void;
  onOpenProgram: () => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onInsertBefore: (index: number) => void;
  onInsertAfter: (index: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
  hasError: boolean;
}

export function SubroutineStatementItem({
  statement,
  index,
  onChange,
  onProgramSelect,
  onOpenProgram,
  onDelete,
  onMoveUp,
  onMoveDown,
  onInsertBefore,
  onInsertAfter,
  canMoveUp,
  canMoveDown,
  canDelete,
  hasError,
}: SubroutineStatementProps) {
  const handleRepetitionChange = (value: number) => {
    onChange({
      ...statement,
      repetitions: value,
    });
  };

  const handleDelete = () => {
    onDelete(index);
  };

  const handleMoveUp = () => {
    onMoveUp(index);
  };

  const handleMoveDown = () => {
    onMoveDown(index);
  };

  const handleInsertBefore = () => {
    onInsertBefore(index);
  };

  const handleInsertAfter = () => {
    onInsertAfter(index);
  };

  return (
    <StatementItemLayout
      repetitions={statement.repetitions}
      onRepetitionChange={handleRepetitionChange}
      onDelete={handleDelete}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      onInsertBefore={handleInsertBefore}
      onInsertAfter={handleInsertAfter}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      canDelete={canDelete}
      onChangeProgram={onProgramSelect}
    >
      <Pressable
        style={[styles.subroutineContent, hasError && styles.subroutineContentError]}
        onPress={onOpenProgram}
      >
        <Text style={[styles.subroutineName, hasError && styles.subroutineNameError]}>
          {statement.programReference}
        </Text>
      </Pressable>
    </StatementItemLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: SPACING.SM,
    paddingRight: SPACING.SM,
    paddingLeft: 0,
    gap: SPACING.XS,
  },
  repetitionBox: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.XS,
  },
  motorSpeedBox: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
  },
  visualizationBar: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  visualizationColumn: {
    flex: 1,
    flexDirection: 'row',
  },
  visualizationLeft: {
    backgroundColor: '#A2E2BD',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    alignSelf: 'stretch',
    marginLeft: 'auto',
  },
  visualizationRight: {
    backgroundColor: '#B8D4E8',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    alignSelf: 'stretch',
  },
  menuIcon: {
    fontSize: 24,
    color: COLORS.TEXT_SECONDARY,
    paddingHorizontal: SPACING.XS,
  },
  subroutineContent: {
    flex: 1,
    backgroundColor: '#EAF8F5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.GRAY_LIGHT,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    justifyContent: 'center',
    minHeight: 40,
  },
  subroutineContentError: {
    backgroundColor: '#FFF5F5',
    borderColor: COLORS.ERROR_CORAL,
  },
  subroutineName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  subroutineNameError: {
    color: COLORS.ERROR_CORAL,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modal: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.XL,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.LG,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: SPACING.SM,
    marginBottom: SPACING.LG,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.LG,
    backgroundColor: COLORS.BEIGE_SOFT,
    borderRadius: 8,
    gap: SPACING.MD,
  },
  optionPressed: {
    backgroundColor: '#F0EDE6',
  },
  optionDisabled: {
    opacity: 0.4,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  optionTextDisabled: {
    color: COLORS.TEXT_SECONDARY,
  },
  deleteOption: {
    backgroundColor: '#FFE5E5',
  },
  deleteText: {
    color: COLORS.ERROR_CORAL,
  },
  cancelButton: {
    padding: SPACING.MD,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonPressed: {
    backgroundColor: COLORS.BEIGE_SOFT,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
});
