import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, UserPlus, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

function usePasswordStrength(password: string) {
  return useMemo(() => {
    const checks = [
      { label: '8+ characters', met: password.length >= 8 },
      { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Number', met: /\d/.test(password) },
      { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
    ];
    const score = checks.filter((c) => c.met).length;
    return { checks, score };
  }, [password]);
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { checks, score } = usePasswordStrength(password);
  const passwordsMatch = password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    if (score < 3) {
      setError('Password is too weak — please meet at least 3 requirements');
      return;
    }

    setLoading(true);
    const { error: err, needsConfirmation } = await signUp(email, password);
    setLoading(false);

    if (err) {
      setError(err);
    } else if (needsConfirmation) {
      setSuccess('Check your email for a confirmation link, then sign in.');
    } else {
      navigate('/');
    }
  };

  const strengthColor =
    score <= 1 ? 'bg-destructive' : score === 2 ? 'bg-amber-400' : score === 3 ? 'bg-emerald-400' : 'bg-emerald-400';

  return (
    <div className="flex min-h-[calc(100vh-3.75rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl scale-150" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/20">
              <Shield size={28} className="text-primary" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Create account</h1>
            <p className="text-sm text-muted/70 mt-1">Get started with Virtual Data Room</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted/80 uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted/80 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
            </div>

            {/* Strength bar */}
            {password.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                        i < score ? strengthColor : 'bg-white/[0.06]'
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {checks.map((c) => (
                    <div key={c.label} className="flex items-center gap-1.5">
                      {c.met ? (
                        <Check size={12} className="text-emerald-400 shrink-0" />
                      ) : (
                        <X size={12} className="text-muted/30 shrink-0" />
                      )}
                      <span
                        className={`text-[11px] ${c.met ? 'text-muted/70' : 'text-muted/40'}`}
                      >
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted/80 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/40" />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:ring-2 transition-all ${
                  confirm && !passwordsMatch
                    ? 'border-destructive/30 focus:ring-destructive/30 focus:border-destructive/30'
                    : 'border-white/[0.06] focus:ring-primary/30 focus:border-primary/30'
                }`}
              />
            </div>
            {confirm && !passwordsMatch && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-emerald-400/10 border border-emerald-400/20 px-3 py-2 text-sm text-emerald-400">
              {success}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-xl font-medium"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <UserPlus size={16} />
                Create Account
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-muted/60 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
