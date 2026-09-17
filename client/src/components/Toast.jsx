import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ message, tone = 'success' }) {
  if (!message) return null;
  const Icon = tone === 'error' ? AlertCircle : CheckCircle2;

  return (
    <div className={`toast${tone === 'error' ? ' toast--error' : ''}`} role="status">
      <Icon size={18} strokeWidth={2} />
      <span>{message}</span>
    </div>
  );
}
