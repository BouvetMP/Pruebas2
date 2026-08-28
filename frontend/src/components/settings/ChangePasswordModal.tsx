// ¿Qué? Modal para cambiar la contraseña del usuario actual.
// ¿Para qué? Validar contraseña actual/nueva y llamar al backend real (Día 3).
// ¿Impacto? Se usa en ProfileTab de Settings. Sin setTimeout simulado.

import { useState, type FormEvent } from 'react';
import { KeyRound, AlertCircle } from 'lucide-react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { PasswordInput } from '@components/auth/PasswordInput';
import { PasswordStrengthMeter, analyzePassword } from '@components/auth/PasswordStrengthMeter';
import { changePassword } from '@api/Auth';

// ==============================================================================
// TYPES
// ==============================================================================

export interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ChangePasswordModal({ open, onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [currentError, setCurrentError] = useState('');
  const [newError, setNewError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [globalError, setGlobalError] = useState('');

  const validate = (): boolean => {
    let isValid = true;
    setCurrentError('');
    setNewError('');
    setConfirmError('');
    setGlobalError('');

    if (!currentPassword) {
      setCurrentError('La contraseña actual es obligatoria');
      isValid = false;
    }

    const analysis = analyzePassword(newPassword);
    if (!newPassword) {
      setNewError('La nueva contraseña es obligatoria');
      isValid = false;
    } else if (!analysis.isValid) {
      setNewError('La contraseña no cumple los requisitos de seguridad');
      isValid = false;
    } else if (newPassword === currentPassword) {
      setNewError('La nueva contraseña debe ser diferente a la actual');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Debes confirmar la nueva contraseña');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden');
      isValid = false;
    }

    return isValid;
  };

  const handleClose = (): void => {
    if (saving) return;
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setCurrentError('');
    setNewError('');
    setConfirmError('');
    setGlobalError('');
    onClose();
  };

  const handleSubmit = async (e?: FormEvent): Promise<void> => {
    e?.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setGlobalError('');

    try {
      await changePassword({
        contrasenaActual: currentPassword,
        nuevaContrasena: newPassword,
      });

      onSuccess?.();
      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cambiar la contraseña';
      setGlobalError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Cambiar contraseña"
      size="sm"
      disableClose={saving}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => void handleSubmit()}
            loading={saving}
            leftIcon={!saving ? <KeyRound size={14} /> : undefined}
          >
            Cambiar contraseña
          </Button>
        </>
      }
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4 font-sans" noValidate>
        {globalError && (
          <div
            className="flex items-start gap-2 rounded-lg border border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.1)] px-3.5 py-2.5 text-xs font-semibold text-[var(--color-danger)]"
            role="alert"
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{globalError}</span>
          </div>
        )}

        <PasswordInput
          label="Contraseña actual"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (currentError) setCurrentError('');
          }}
          error={currentError}
          autoComplete="current-password"
          disabled={saving}
          required
        />

        <div>
          <PasswordInput
            label="Nueva contraseña"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (newError) setNewError('');
            }}
            error={newError}
            autoComplete="new-password"
            disabled={saving}
            required
          />
          <PasswordStrengthMeter password={newPassword} />
        </div>

        <PasswordInput
          label="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (confirmError) setConfirmError('');
          }}
          error={confirmError}
          autoComplete="new-password"
          disabled={saving}
          required
        />
      </form>
    </Modal>
  );
}