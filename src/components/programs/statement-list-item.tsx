import { MoveStatement, SubroutineStatement } from '@/programs/statements';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { NumberInput } from '@/components/ui/number-input';

interface MoveStatementProps {
  statement: MoveStatement;
  index: number;
  onChange: (statement: MoveStatement) => void;
  onDelete: (index: number) => void;
}

export function MoveStatementItem({ statement, index, onChange, onDelete }: MoveStatementProps) {
  const [showMenu, setShowMenu] = useState(false);

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
    console.log('Move statement up');
  };

  const handleMoveDown = () => {
    console.log('Move statement down');
  };

  const handleInsertBefore = () => {
    console.log('Insert statement before');
  };

  const handleInsertAfter = () => {
    console.log('Insert statement after');
  };

  // Calculate visualization based on motor speeds
  const leftSpeed = statement.leftMotorSpeed;
  const rightSpeed = statement.rightMotorSpeed;
  const total = leftSpeed + rightSpeed;
  const leftRatio = total > 0 ? leftSpeed / total : 0.5;

  return (
    <>
      <View style={styles.container}>
        {/* Repetition Count */}
        <NumberInput
          value={statement.repetitions}
          onValueChange={handleRepetitionChange}
          min={1}
          max={99}
          unit="×"
          containerStyle={styles.repetitionBox}
        />

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
          <View style={[styles.visualizationLeft, { flex: leftRatio }]} />
          <View style={[styles.visualizationRight, { flex: 1 - leftRatio }]} />
        </View>

        {/* Right Motor Speed */}
        <NumberInput
          value={rightSpeed}
          onValueChange={handleRightMotorChange}
          min={0}
          max={100}
          containerStyle={styles.motorSpeedBox}
        />

        {/* Menu Button */}
        <Pressable onPress={() => setShowMenu(true)} hitSlop={8}>
          <Text style={styles.menuIcon}>⋯</Text>
        </Pressable>
      </View>

      {/* Statement Options Menu */}
      <StatementOptionsMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onDelete={handleDelete}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onInsertBefore={handleInsertBefore}
        onInsertAfter={handleInsertAfter}
      />
    </>
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
}

function StatementOptionsMenu({
  visible,
  onClose,
  onDelete,
  onMoveUp,
  onMoveDown,
  onInsertBefore,
  onInsertAfter,
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
              {/* Move Up */}
              <Pressable
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                onPress={() => handleAction(onMoveUp)}
              >
                <Text style={styles.optionIcon}>⬆️</Text>
                <Text style={styles.optionText}>{t('statementOptionsMenu.moveUp')}</Text>
              </Pressable>

              {/* Move Down */}
              <Pressable
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                onPress={() => handleAction(onMoveDown)}
              >
                <Text style={styles.optionIcon}>⬇️</Text>
                <Text style={styles.optionText}>{t('statementOptionsMenu.moveDown')}</Text>
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
}

export function SubroutineStatementItem({ statement }: SubroutineStatementProps) {
  return <Text>Placeholder</Text>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: SPACING.SM,
    gap: SPACING.SM,
  },
  repetitionBox: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.SM,
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
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  visualizationLeft: {
    backgroundColor: '#A8DADC',
  },
  visualizationRight: {
    backgroundColor: '#B8D4E8',
  },
  menuIcon: {
    fontSize: 24,
    color: COLORS.TEXT_SECONDARY,
    paddingHorizontal: SPACING.XS,
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
  optionIcon: {
    fontSize: 20,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
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
