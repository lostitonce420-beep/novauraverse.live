import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Chrome, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  const { addToast } = useUIStore();
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (password !== confirmPassword) {
      // Show error
      return;
    }

    if (!agreeTerms) {
      // Show error
      return;
    }
    
    try {
      await signup(email, password, username);
      addToast({
        type: 'success',
        title: 'Welcome to NovAura!',
        message: 'Your account has been created successfully.',
      });
      navigate('/');
    } catch (err) {
      // Error handled in store
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
      addToast({
        type: 'success',
        title: 'Welcome!',
        message: 'Your account has been created with Google.',
      });
      navigate('/');
    } catch (err) {
      // Error handled in store
    }
  };

  const passwordStrength = (pass: string): number => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = passwordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-neon-red', 'bg-yellow-400', 'bg-neon-cyan', 'bg-neon-lime'];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 0, 110, 0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div 
          className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-neon-cyan" />
            <span className="font-heading text-2xl font-bold text-gradient-rgb">
              NovAura
            </span>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
            Create Account
          </h1>
          <p className="text-text-secondary">
            Join the ethical creator marketplace
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-void-light border border-white/5 rounded-2xl p-8">
          {/* Google Signup */}
          <Button
            variant="outline"
            className="w-full border-white/20 text-text-primary hover:bg-white/5 mb-4"
            onClick={handleGoogleSignup}
            disabled={isLoading}
          >
            <Chrome className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-void-light text-text-muted">Or sign up with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm text-text-muted mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  className="pl-12 py-6 bg-void border-white/10 text-text-primary placeholder:text-text-muted"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-text-muted mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-12 py-6 bg-void border-white/10 text-text-primary placeholder:text-text-muted"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-text-muted mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-12 pr-12 py-6 bg-void border-white/10 text-text-primary placeholder:text-text-muted"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-white/10'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${strength > 0 ? 'text-' + strengthColors[strength - 1].replace('bg-', '') : 'text-text-muted'}`}>
                    {strengthLabels[strength - 1] || 'Too weak'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-text-muted mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-12 py-6 bg-void border-white/10 text-text-primary placeholder:text-text-muted"
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-neon-red text-sm mt-1">Passwords don't match</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="custom-checkbox mt-1"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span className="text-sm text-text-secondary">
                I agree to the{' '}
                <Link to="/legal/terms" className="text-neon-cyan hover:text-neon-cyan/80">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/legal/privacy" className="text-neon-cyan hover:text-neon-cyan/80">Privacy Policy</Link>
              </span>
            </label>

            {error && (
              <div className="p-3 bg-neon-red/10 border border-neon-red/30 rounded-lg text-neon-red text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-rgb text-void font-bold py-6 hover:opacity-90"
              disabled={isLoading || password !== confirmPassword || !agreeTerms}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-void/30 border-t-void rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Login Link */}
        <p className="text-center mt-6 text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-neon-cyan hover:text-neon-cyan/80 font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
