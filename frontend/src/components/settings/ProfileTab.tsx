// ¿Qué? Tab de perfil del usuario actual en la página de Settings.
// ¿Para qué? Mostrar y permitir editar datos básicos del perfil (nombre, email).
// ¿Impacto? Actualiza la información en BD mediante PATCH /api/auth/me y muestra alertas de éxito/error reales.

import { useState } from 'react';
import { User, Mail, Phone, KeyRound, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { updateProfile } from '@api/Auth';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Toggle } from '@components/ui/Toggle';
import { UserAvatar } from '@components/shared/UserAvatar';
import { ChangePasswordModal } from './ChangePasswordModal';
import { getRoleMetadata } from '@constants/Roles';

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ProfileTab() {
  const { user } = useAuth();
  
  // Estados de modales y UI
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [twoFA, setTwoFA] = useState(true); // Solo visual en MVP

  // Estados del formulario
  const [name, setName] = useState(user?.nombre ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(''); // Visual (no guardado en BD MVP)

  // Estados de petición API
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const roleMeta = user?.rol ? getRoleMetadata(user.rol) : null;
  const roleColor = roleMeta?.color ?? '#6366F1';

  // ==============================================================================
  // HANDLER: Guardar Perfil (Día 3)
  // ==============================================================================
  const handleSaveProfile = async (): Promise<void> => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const result = await updateProfile({
        nombre_completo: name.trim(),
        email: email.trim(),
      });
      setSaveSuccess(result.message);
      
      // Ocultar el mensaje de éxito después de 4 segundos
      setTimeout(() => setSaveSuccess(''), 4000);
      
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5 font-sans">
      <Card>
        <CardHeader title="Mi Perfil" icon={<User size={16} />} />
        <CardBody>
          <div className="flex flex-col gap-6">
            {/* ============================================================
                1. IDENTIDAD — Avatar, nombre visible y rol
                ============================================================ */}
            <section
              className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4 sm:flex-row sm:items-center sm:gap-5"
              aria-label="Identidad del usuario"
            >
              <UserAvatar name={user?.nombre} role={user?.rol} size="xl" />

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h3 className="m-0 truncate text-base font-bold text-[var(--text-primary)]">
                  {user?.nombre ?? 'Usuario'}
                </h3>
                <p className="m-0 truncate text-[13px] text-[var(--text-secondary)]">
                  {user?.email ?? 'Sin correo'}
                </p>
                <span
                  className="inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold"
                  style={{
                    color: roleColor,
                    background: `${roleColor}18`,
                  }}
                >
                  <Shield size={12} aria-hidden="true" />
                  {roleMeta?.label ?? user?.rol ?? 'Sin rol'}
                </span>
              </div>
            </section>

            {/* ============================================================
                MENSAJES DE ESTADO (Feedback de la API)
                ============================================================ */}
            {saveError && (
              <div className="flex items-start gap-2 rounded-lg border border-[rgba(255,107,107,0.3)] bg-[rgba(255,107,107,0.1)] px-3.5 py-2.5 text-xs font-semibold text-[var(--color-danger)] animate-fade-in" role="alert">
                <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{saveError}</span>
              </div>
            )}
            
            {saveSuccess && (
              <div className="flex items-start gap-2 rounded-lg border border-[rgba(6,214,160,0.3)] bg-[rgba(6,214,160,0.1)] px-3.5 py-2.5 text-xs font-semibold text-[#06D6A0] animate-fade-in" role="status">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* ============================================================
                2. DATOS DE CONTACTO
                ============================================================ */}
            <section className="flex flex-col gap-4" aria-label="Datos de contacto">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-tertiary)]">
                  Datos de contacto
                </span>
              </div>

              <Input
                label="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User size={14} />}
                disabled={saving}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={14} />}
                  disabled={saving}
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 300 123 4567"
                  leftIcon={<Phone size={14} />}
                  disabled={saving}
                  helperText="Solo para fines de contacto interno"
                />
              </div>
            </section>

            {/* ============================================================
                3. SEGURIDAD
                ============================================================ */}
            <section className="flex flex-col gap-3" aria-label="Seguridad de la cuenta">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-tertiary)]">
                  Seguridad
                </span>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-3">
                <Toggle
                  label="Autenticación de dos factores (2FA)"
                  description="Requiere código adicional al iniciar sesión"
                  checked={twoFA}
                  onChange={setTwoFA}
                  icon={<KeyRound size={14} />}
                  variant="success"
                  disabled={saving}
                />
              </div>
            </section>

            {/* ============================================================
                4. ACCIONES
                ============================================================ */}
            <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <Button
                variant="ghost"
                leftIcon={<KeyRound size={14} />}
                onClick={() => setPasswordModalOpen(true)}
                disabled={saving}
              >
                Cambiar contraseña
              </Button>

              <Button 
                variant="primary" 
                onClick={() => void handleSaveProfile()} 
                loading={saving}
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <ChangePasswordModal 
        open={passwordModalOpen} 
        onClose={() => setPasswordModalOpen(false)}
        onSuccess={() => {
          setSaveSuccess('¡Contraseña actualizada exitosamente!');
          setTimeout(() => setSaveSuccess(''), 4000);
        }}
      />
    </div>
  );
}