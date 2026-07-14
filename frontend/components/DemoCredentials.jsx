import { Copy, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';

function DemoCredentials({ account, onFillCredentials }) {
  const copyValue = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error('Unable to copy');
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{account.role}</p>
          <p className="text-sm text-slate-300">{account.email}</p>
        </div>
        <button
          type="button"
          onClick={() => onFillCredentials(account)}
          className="rounded-full border border-white/20 px-3 py-1 text-sm text-white transition hover:bg-white/10"
        >
          Fill Credentials
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => copyValue(account.email, 'Email')}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-slate-100 transition hover:bg-white/20"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Email
        </button>
        <button
          type="button"
          onClick={() => copyValue(account.password, 'Password')}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-slate-100 transition hover:bg-white/20"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Copy Password
        </button>
      </div>
    </div>
  );
}

export default DemoCredentials;
