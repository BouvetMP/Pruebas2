// ¿Qué? Formulario para solicitar recuperación de contraseña por email.
// ¿Para qué? Enviar enlace de reset y mostrar estado de éxito.
// ¿Impacto? Usado en ForgotPasswordPage. Errores con AlertCircle (sin emoji).

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, CheckCircle, ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { forgotPassword } from '@api/Auth';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { isValidEmail } from '@utils/User';
import { PUBLIC_ROUTES } from '@constants/Navigation';
import { ApiError } from '@api/Client';

export interface ForgotPasswordFormProps {
  onSuccess?: (email: string) => void;
  onError?: (error: Error) => void;
  expirationMinutes?: number;
  className?: string;
}

export function ForgotPasswordForm({
  onSuccess,
  onError,
  expirationMinutes = 15,
  className = '',
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [globalError, setGlobalError] = useState('');

  const validate = (): boolean => {
    setEmailError('');
    setGlobalError('');

    if (!email.trim()) {
      setEmailError('El correo es obligatorio');
      return false;
    }
    if (!isValidEmail(email)) {
      setEmailError('Ingresa un correo válido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGlobalError('');

    try {
      const trimmedEmail = email.trim();
      await forgotPassword({ correo: trimmedEmail });
      setSentToEmail(trimmedEmail);
      setSent(true);
      onSuccess?.(trimmedEmail);
    } catch (err) {
      const error = err as Error;
      let errorMessage = 'No se pudo procesar la solicitud. Intenta de nuevo.';

      if (err instanceof ApiError) {
        if (err.status >= 500) {
          errorMessage = 'Error del servidor. Intenta de nuevo en unos minutos.';
        } else if (err.status === 429) {
          errorMessage = 'Demasiadas solicitudes. Espera unos minutos antes de intentar de nuevo.';
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

  const handleTryAgain = (): void => {
    setSent(false);
    setEmail('');
    setSentToEmail('');
    setEmailError('');
    setGlobalError('');
  };

  const backLinkClass =
    'inline-flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] no-underline transition-colors hover:text-indigo-light focus-visible:text-indigo-light';

  if (sent) {
    return (
      <div className={`forgot-password-form-sent flex flex-col gap-5 font-sans ${className}`}>
        <div
          className="flex flex-col items-center gap-4 rounded-xl border border-[rgba(6,214,160,0.25)] bg-[rgba(6,214,160,0.08)] p-6 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(6,214,160,0.15)] text-neon-green">
            <CheckCircle size={28} strokeWidth={2} aria-hidden="true" />
          </div>

          <h3 className="m-0 text-base font-bold leading-snug text-[var(--text-primary)]">
            Correo enviado
          </h3>

          <p className="m-0 text-[13px] leading-relaxed text-[var(--text-secondary)]">
            Si{' '}
            <span className="break-all font-bold text-neon-green">{sentToEmail}</span> está
            registrado en el sistema, recibirás un enlace para restablecer tu contraseña.
          </p>

          <div className="flex w-full items-start gap-2 rounded-lg border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.08)] px-3 py-2.5 text-left text-[11px] leading-relaxed text-[var(--text-secondary)]">
            <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              El enlace expira en <strong>{expirationMinutes} minutos</strong>. Revisa tu bandeja de
              entrada y la carpeta de spam.
            </span>
          </div>
        </div>

        <Button variant="ghost" onClick={handleTryAgain} fullWidth>
          Enviar a otro correo
        </Button>

        <div className="flex justify-center">
          <Link to={PUBLIC_ROUTES.LOGIN} className={backLinkClass}>
            <ArrowLeft size={14} aria-hidden="true" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={`forgot-password-form flex flex-col gap-5 font-sans ${className}`}
      noValidate
      aria-label="Formulario de recuperación de contraseña"
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

      <p className="m-0 text-[13px] leading-relaxed text-[var(--text-secondary)]">
        Ingresa el correo asociado a tu cuenta y te enviaremos un enlace para restablecer tu
        contraseña.
      </p>

      <Input
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError('');
          if (globalError) setGlobalError('');
        }}
        error={emailError}
        placeholder="tu@correo.com"
        leftIcon={<Mail size={16} />}
        autoComplete="email"
        autoFocus
        disabled={loading}
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        leftIcon={!loading ? <Send size={16} /> : undefined}
      >
        {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
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