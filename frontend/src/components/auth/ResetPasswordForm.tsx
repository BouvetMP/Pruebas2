// ¿Qué? Formulario para restablecer contraseña con token de recuperación.
// ¿Para qué? Verificar token, validar fortaleza y confirmar nueva contraseña.
// ¿Impacto? Usado en ResetPasswordPage. Errores con AlertCircle / AlertTriangle (sin emoji).

import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, CheckCircle, AlertTriangle, AlertCircle, ArrowLeft } from 'lucide-react';
import { verifyResetToken, resetPassword } from '@api/Auth';
import { Button } from '@components/ui/Button';
import { Spinner } from '@components/ui/Spinner';
import { PasswordInput } from './PasswordInput';
import { PasswordStrengthMeter, analyzePassword } from './PasswordStrengthMeter';
import { PUBLIC_ROUTES } from '@constants/Navigation';
import { ApiError } from '@api/Client';

type ResetPasswordState = 'verifying' | 'invalid-token' | 'ready' | 'success';

export interface ResetPasswordFormProps {
  onSuccess?: (email: string) => void;
  onError?: (error: Error) => void;
  redirectDelaySeconds?: number;
  className?: string;
}

export function ResetPasswordForm({
  onSuccess,
  onError,
  redirectDelaySeconds = 3,
  className = '',
}: ResetPasswordFormProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [state, setState] = useState<ResetPasswordState>('verifying');
  const [tokenEmail, setTokenEmail] = useState('');
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    if (!token) {
      setState('invalid-token');
      setTokenError('No se proporcionó un token de recuperación.');
      return;
    }

    let cancelled = false;

    const verify = async (): Promise<void> => {
      try {
        const result = await verifyResetToken(token);
        if (cancelled) return;

        if (result.valid && result.email) {
          setTokenEmail(result.email);
          setState('ready');
        } else {
          setState('invalid-token');
          setTokenError(result.error ?? 'El enlace de recuperación no es válido.');
        }
      } catch (err) {
        if (cancelled) return;
        setState('invalid-token');

        if (err instanceof ApiError) {
          if (err.status === 401 || err.status === 400) {
            setTokenError('El enlace ha expirado o ya fue utilizado.');
          } else {
            setTokenError(err.message || 'Error verificando el enlace.');
          }
        } else {
          setTokenError('Error de conexión. Intenta de nuevo.');
        }
      }
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const validate = (): boolean => {
    let isValid = true;
    setPasswordError('');
    setConfirmError('');
    setGlobalError('');

    const analysis = analyzePassword(password);
    if (!password) {
      setPasswordError('La contraseña es obligatoria.');
      isValid = false;
    } else if (!analysis.isValid) {
      setPasswordError('La contraseña no cumple con los requisitos de seguridad.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Debes confirmar la contraseña.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGlobalError('');

    try {
      await resetPassword({ token, nuevaContrasena: password });
      setState('success');
      onSuccess?.(tokenEmail);

      window.setTimeout(() => {
        navigate(PUBLIC_ROUTES.LOGIN, { replace: true });
      }, redirectDelaySeconds * 1000);
    } catch (err) {
      const error = err as Error;
      let errorMessage = 'No se pudo cambiar la contraseña. Intenta de nuevo.';

      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 400) {
          errorMessage = 'El enlace ha expirado. Solicita uno nuevo.';
        } else if (err.status >= 500) {
          errorMessage = 'Error del servidor. Intenta de nuevo en unos minutos.';
        } else {
          errorMessage = err.message || errorMessage;
        }
      }

      setGlobalError(errorMessage);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const backLinkClass =
    'inline-flex items-center justify-center gap-1 text-xs font-medium text-[var(--text-secondary)] no-underline transition-colors hover:text-indigo-light focus-visible:text-indigo-light';

  const formShell = `reset-password-form flex flex-col gap-4.5 font-sans ${className}`;

  if (state === 'verifying') {
    return (
      <div className={`${formShell} items-center px-5 py-10`}>
        <Spinner size="lg" label="Verificando enlace..." />
      </div>
    );
  }

  if (state === 'invalid-token') {
    return (
      <div className={formShell} style={{ gap: '18px' }}>
        <div
          className="flex flex-col items-center gap-4 rounded-xl border border-[rgba(255,107,107,0.25)] bg-[rgba(255,107,107,0.08)] p-6 text-center"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(255,107,107,0.15)] text-[var(--color-danger)]">
            <AlertTriangle size={28} strokeWidth={2} aria-hidden="true" />
          </div>
          <h3 className="m-0 text-base font-bold leading-snug text-[var(--text-primary)]">
            Enlace inválido
          </h3>
          <p className="m-0 text-[13px] leading-relaxed text-[var(--text-secondary)]">{tokenError}</p>
        </div>

        <Link to={PUBLIC_ROUTES.FORGOT_PASSWORD}>
          <Button variant="primary" fullWidth>
            Solicitar nuevo enlace
          </Button>
        </Link>

        <div className="flex justify-center">
          <Link to={PUBLIC_ROUTES.LOGIN} className={backLinkClass}>
            <ArrowLeft size={14} aria-hidden="true" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className={formShell} style={{ gap: '18px' }}>
        <div
          className="flex flex-col items-center gap-4 rounded-xl border border-[rgba(6,214,160,0.25)] bg-[rgba(6,214,160,0.08)] p-6 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(6,214,160,0.15)] text-neon-green">
            <CheckCircle size={28} strokeWidth={2} aria-hidden="true" />
          </div>
          <h3 className="m-0 text-base font-bold text-[var(--text-primary)]">
            ¡Contraseña actualizada!
          </h3>
          <p className="m-0 text-[13px] leading-relaxed text-[var(--text-secondary)]">
            Tu contraseña se cambió correctamente. Serás redirigido al inicio de sesión en unos
            segundos.
          </p>
        </div>

        <Link to={PUBLIC_ROUTES.LOGIN}>
          <Button variant="primary" fullWidth>
            Iniciar sesión ahora
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={formShell}
      style={{ gap: '18px' }}
      noValidate
      aria-label="Formulario de nueva contraseña"
    >
      {globalError && (
        <div
          className="flex items-start gap-2.5 rounded-lg border border-[rgba(255,107,107,0.25)] bg-[rgba(255,107,107,0.1)] px-3.5 py-3 text-xs font-medium leading-snug text-[var(--color-danger)]"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle size={14} strokeWidth={2.5} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{globalError}</span>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-tertiary)] px-3 py-2.5 text-xs text-[var(--text-secondary)]">
        <KeyRound size={14} className="shrink-0" aria-hidden="true" />
        <span>
          Cambiando contraseña para:{' '}
          <span className="break-all font-bold text-[var(--text-primary)]">{tokenEmail}</span>
        </span>
      </div>

      <div>
        <PasswordInput
          label="Nueva contraseña"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) setPasswordError('');
            if (globalError) setGlobalError('');
          }}
          error={passwordError}
          autoComplete="new-password"
          disabled={loading}
          autoFocus
          required
        />
        <PasswordStrengthMeter password={password} />
      </div>

      <PasswordInput
        label="Confirmar contraseña"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (confirmError) setConfirmError('');
          if (globalError) setGlobalError('');
        }}
        error={confirmError}
        autoComplete="new-password"
        disabled={loading}
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        leftIcon={!loading ? <KeyRound size={16} /> : undefined}
      >
        {loading ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
      </Button>

      <div className="flex justify-center">
        <Link to={PUBLIC_ROUTES.LOGIN} tabIndex={loading ? -1 : 0} className={backLinkClass}>
          <ArrowLeft size={14} aria-hidden="true" />
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}