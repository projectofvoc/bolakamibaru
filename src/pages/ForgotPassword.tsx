import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import logoBolakami from '@/assets/logo-bolakami.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitted(true);
    toast({
      title: t('auth.resetEmailSent'),
      description: t('auth.checkInbox'),
    });
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
            {t('auth.forgotPasswordTitle')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8">
          {!isSubmitted ? (
            <>
              {/* Back Link */}
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.backToLogin')}
              </Link>

              <h2 className="text-xl font-bold text-foreground mb-2">
                {t('auth.resetPassword')}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {t('auth.resetPasswordDesc')}
              </p>

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
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
                >
                  {t('auth.sendResetLink')}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t('auth.checkYourEmail')}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {t('auth.resetEmailSentTo')} <span className="text-foreground font-medium">{email}</span>
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
              >
                {t('auth.backToLogin')}
              </Button>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('auth.didntReceiveEmail')}
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
