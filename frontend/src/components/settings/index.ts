// ¿Qué? Barrel export de los componentes específicos de Settings.
// ¿Para qué? Simplificar imports desde @components/settings.
// ¿Impacto? Punto único de importación para componentes de Settings.

export { ProfileTab } from './ProfileTab';
export { UsersTab } from './UsersTab';
export { ModelTab } from './ModelTab';
export { NotificationsTab } from './NotificationsTab';
export { RolesTab } from './RolesTab';
export { SystemTab } from './SystemTab';
export { NewUserModal } from './NewUserModal';
export type { NewUserModalProps } from './NewUserModal';
export { ChangePasswordModal } from './ChangePasswordModal';
export type { ChangePasswordModalProps } from './ChangePasswordModal';