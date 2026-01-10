import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Phone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import logoBolakami from '@/assets/logo-bolakami.png';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      toast({
        title: t('auth.loginSuccess'),
        description: t('auth.welcomeBack'),
      });
    } else {
      toast({
        title: t('auth.registerSuccess'),
        description: t('auth.accountCreated'),
      });
    }
    
    navigate('/');
  };

  const handleWhatsappChange = (value: string) => {
    // Only allow numbers
    const numbersOnly = value.replace(/\D/g, '');
    setWhatsapp(numbersOnly);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <img src={logoBolakami} alt="BOLAKAMI" className="h-12 mx-auto" />
          </Link>
          <p className="text-muted-foreground mt-4">
            {isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8">
          {/* Toggle Tabs */}
          <div className="flex bg-muted rounded-full p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('auth.register')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-muted border-border h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-muted border-border h-12 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* WhatsApp Input (Register Only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-sm text-muted-foreground">{t('auth.whatsapp')}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-foreground font-medium border-r border-border pr-2">
                    +62
                  </div>
                  <Input
                    type="tel"
                    placeholder="812 3456 7890"
                    value={whatsapp}
                    onChange={(e) => handleWhatsappChange(e.target.value)}
                    className="pl-24 bg-muted border-border h-12 rounded-xl"
                    maxLength={13}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t('auth.whatsappHint')}</p>
              </motion.div>
            )}

            {/* Terms Checkbox (Register Only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start space-x-3"
              >
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  {t('auth.termsAgree')}{' '}
                  <a href="#" className="text-primary hover:underline">
                    {t('auth.termsLink')}
                  </a>{' '}
                  {t('auth.and')}{' '}
                  <a href="#" className="text-primary hover:underline">
                    {t('auth.privacyLink')}
                  </a>
                </label>
              </motion.div>
            )}

            {/* Forgot Password (Login Only) */}
            {isLogin && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
            >
              {isLogin ? t('auth.loginButton') : t('auth.registerButton')}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-sm text-muted-foreground">{t('auth.or')}</span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-full border-border bg-muted hover:bg-muted/80 text-foreground hover:text-foreground"
              onClick={() => {
                toast({ title: isLogin ? t('auth.loginSuccess') : t('auth.registerSuccess') });
                navigate('/');
              }}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t('auth.continueWithGoogle')}
            </Button>
          </div>

          {/* Switch Mode Link */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? t('auth.register') : t('auth.login')}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
