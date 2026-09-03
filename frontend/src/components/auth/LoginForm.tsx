// ¿Qué? Formulario de inicio de sesión con validación y manejo de errores.
// ¿Para qué? Autenticar al usuario vía AuthContext y redirigir a la app.
// ¿Impacto? Usado en LoginPage. Errores con AlertCircle (sin emoji).

import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { PasswordInput } from './PasswordInput';
import { isValidEmail } from '@utils/User';
import { PUBLIC_ROUTES, DEFAULT_AUTHENTICATED_ROUTE } from '@constants/Navigation';
import { ApiError } from '@api/Client';

export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
  showForgotPasswordLink?: boolean;
  className?: string;
}

export function LoginForm({
  onSuccess,
  onError,
  redirectTo,
  showForgotPasswordLink = true,
  className = '',
}: LoginFormProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [globalError, setGlobalError] = useState('');

  const validate = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setGlobalError('');

    if (!email.trim()) {
      setEmailError('El email es obligatorio');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Ingresa un email válido');
      isValid = false;
    }

    if (!password) {
      setPasswordError('La contraseña es obligatoria');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
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
      await login(email.trim(), password);
      const from = (location.state as { from?: string })?.from;
      const destination = redirectTo ?? from ?? DEFAULT_AUTHENTICATED_ROUTE;
      onSuccess?.();
      navigate(destination, { replace: true });
    } catch (err) {
      const error = err as Error;
      let errorMessage = 'Error al iniciar sesión. Intenta de nuevo.';

      if (err instanceof ApiError) {
        if (err.status === 401) {
          errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (err.status === 403) {
          errorMessage = 'Tu cuenta está desactivada. Contacta al administrador.';
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

  const clearGlobalError = (): void => {
    if (globalError) setGlobalError('');
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={`login-form flex flex-col gap-4.5 font-sans ${className}`}
      style={{ gap: '18px' }}
      noValidate
      aria-label="Formulario de inicio de sesión"
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

      <Input
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError('');
          clearGlobalError();
        }}
        error={emailError}
        placeholder="tu@correo.com"
        leftIcon={<Mail size={16} />}
        autoComplete="email"
        autoFocus
        disabled={loading}
        required
      />

      <PasswordInput
        label="Contraseña"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (passwordError) setPasswordError('');
          clearGlobalError();
        }}
        error={passwordError}
        autoComplete="current-password"
        disabled={loading}
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        leftIcon={!loading ? <LogIn size={16} /> : undefined}
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </Button>

      {showForgotPasswordLink && (
        <div className="mt-1 flex justify-center">
          <Link
            to={PUBLIC_ROUTES.FORGOT_PASSWORD}
            tabIndex={loading ? -1 : 0}
            className="text-xs font-medium text-[var(--text-secondary)] no-underline transition-colors hover:text-indigo-light focus-visible:text-indigo-light"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      )}
    </form>
  );
}