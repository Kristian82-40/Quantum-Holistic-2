import { redirect } from 'next/navigation';

// Selector Cliente/Terapeuta consolidado en /registro (magic-link).
export default function RegistroTerapeutaRedirect() {
  redirect('/registro');
}
