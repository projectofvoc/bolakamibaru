import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Gift, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Sparkles,
  CheckCircle,
  XCircle,
  Loader2,
  Package
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUserPoints } from '@/hooks/useUserPoints';
import { useRewards } from '@/hooks/useRewards';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Rewards: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { totalPoints, streak, pointHistory, hasCheckedInToday, claimCheckin, isClaimingCheckin } = useUserPoints();
  const { rewards, redemptions, redeemReward, isRedeeming, userId } = useRewards();
  const { activeMinutes, progressPercentage, minutesUntilNextPoint, readTimeMinutes } = useActivityTracker();
  
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Check if logged in
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleRedeemClick = (reward: any) => {
    if (totalPoints < reward.points_required) {
      toast.error(language === 'id' ? 'Poin tidak cukup' : 'Insufficient points');
      return;
    }
    if (reward.stock <= 0) {
      toast.error(language === 'id' ? 'Stok habis' : 'Out of stock');
      return;
    }
    setSelectedReward(reward);
    setShowConfirmDialog(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;
    
    try {
      const result = await redeemReward(selectedReward.id);
      if (result.success) {
        toast.success(language === 'id' ? 'Berhasil menukar hadiah!' : 'Successfully redeemed reward!');
        setShowConfirmDialog(false);
        setSelectedReward(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(language === 'id' ? 'Gagal menukar hadiah' : 'Failed to redeem reward');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: { id: string; en: string } }> = {
      pending: { color: 'bg-yellow-500/10 text-yellow-500', icon: <Clock className="w-3 h-3" />, label: { id: 'Menunggu', en: 'Pending' } },
      approved: { color: 'bg-blue-500/10 text-blue-500', icon: <CheckCircle className="w-3 h-3" />, label: { id: 'Disetujui', en: 'Approved' } },
      shipped: { color: 'bg-purple-500/10 text-purple-500', icon: <Package className="w-3 h-3" />, label: { id: 'Dikirim', en: 'Shipped' } },
      completed: { color: 'bg-primary/10 text-primary', icon: <CheckCircle className="w-3 h-3" />, label: { id: 'Selesai', en: 'Completed' } },
      rejected: { color: 'bg-destructive/10 text-destructive', icon: <XCircle className="w-3 h-3" />, label: { id: 'Ditolak', en: 'Rejected' } },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant="outline" className={`${config.color} border-0 gap-1`}>
        {config.icon}
        {config.label[language]}
      </Badge>
    );
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {language === 'id' ? 'Read to Earn' : 'Read to Earn'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'id' 
              ? 'Kumpulkan poin dan tukarkan dengan hadiah menarik!' 
              : 'Collect points and redeem exciting rewards!'}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {language === 'id' ? 'Total Poin' : 'Total Points'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">{totalPoints}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {language === 'id' ? 'Streak' : 'Streak'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">{streak} <span className="text-sm font-normal text-muted-foreground">{language === 'id' ? 'hari' : 'days'}</span></p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {language === 'id' ? 'Waktu Aktif' : 'Active Time'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">{activeMinutes} <span className="text-sm font-normal text-muted-foreground">min</span></p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {language === 'id' ? 'Ditukar' : 'Redeemed'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">{redemptions.length}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Progress to Next Point */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {language === 'id' ? 'Progress Menuju Poin Berikutnya' : 'Progress to Next Point'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {minutesUntilNextPoint} {language === 'id' ? 'menit lagi' : 'min left'}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {language === 'id' 
                  ? `Baca selama ${readTimeMinutes} menit untuk mendapat +1 poin` 
                  : `Read for ${readTimeMinutes} minutes to earn +1 point`}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily Check-in Card */}
        {!hasCheckedInToday && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {language === 'id' ? 'Daily Check-in' : 'Daily Check-in'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'id' ? 'Klaim +1 poin hari ini' : 'Claim +1 point today'}
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => claimCheckin()}
                  disabled={isClaimingCheckin}
                >
                  {isClaimingCheckin ? <Loader2 className="w-4 h-4 animate-spin" /> : language === 'id' ? 'Klaim' : 'Claim'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="rewards" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="rewards">
              {language === 'id' ? 'Hadiah' : 'Rewards'}
            </TabsTrigger>
            <TabsTrigger value="history">
              {language === 'id' ? 'Penukaran' : 'Redemptions'}
            </TabsTrigger>
            <TabsTrigger value="points">
              {language === 'id' ? 'Riwayat Poin' : 'Point History'}
            </TabsTrigger>
          </TabsList>

          {/* Rewards Tab */}
          <TabsContent value="rewards">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'id' ? 'Belum ada hadiah tersedia' : 'No rewards available yet'}
                  </p>
                </div>
              ) : (
                rewards.map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden h-full">
                      {reward.image_url && (
                        <div className="aspect-video relative overflow-hidden bg-muted">
                          <img 
                            src={reward.image_url} 
                            alt={reward.name}
                            className="w-full h-full object-cover"
                          />
                          {reward.stock <= 0 && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                              <Badge variant="destructive">
                                {language === 'id' ? 'Stok Habis' : 'Out of Stock'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-1">{reward.name}</h3>
                        {reward.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {reward.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-primary" />
                            <span className="font-bold text-primary">{reward.points_required}</span>
                            <span className="text-xs text-muted-foreground">{language === 'id' ? 'poin' : 'pts'}</span>
                          </div>
                          <Button
                            size="sm"
                            variant={totalPoints >= reward.points_required ? 'default' : 'outline'}
                            disabled={totalPoints < reward.points_required || reward.stock <= 0}
                            onClick={() => handleRedeemClick(reward)}
                          >
                            {language === 'id' ? 'Tukar' : 'Redeem'}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {language === 'id' ? 'Stok:' : 'Stock:'} {reward.stock}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Redemptions Tab */}
          <TabsContent value="history">
            <div className="space-y-3">
              {redemptions.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'id' ? 'Belum ada penukaran' : 'No redemptions yet'}
                  </p>
                </div>
              ) : (
                redemptions.map((redemption) => (
                  <Card key={redemption.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      {redemption.rewards?.image_url && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img 
                            src={redemption.rewards.image_url} 
                            alt={redemption.rewards?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {redemption.rewards?.name || 'Unknown Reward'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          -{redemption.points_spent} {language === 'id' ? 'poin' : 'pts'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(redemption.created_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
                        </p>
                      </div>
                      {getStatusBadge(redemption.status)}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Point History Tab */}
          <TabsContent value="points">
            <div className="space-y-2">
              {pointHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === 'id' ? 'Belum ada riwayat poin' : 'No point history yet'}
                  </p>
                </div>
              ) : (
                pointHistory.map((history) => (
                  <Card key={history.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {history.description || history.source}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(history.created_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`font-bold ${history.points > 0 ? 'text-primary' : 'text-destructive'}`}>
                        {history.points > 0 ? '+' : ''}{history.points}
                      </span>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'id' ? 'Konfirmasi Penukaran' : 'Confirm Redemption'}
            </DialogTitle>
            <DialogDescription>
              {language === 'id' 
                ? `Kamu akan menukar ${selectedReward?.points_required} poin untuk "${selectedReward?.name}". Lanjutkan?`
                : `You will redeem ${selectedReward?.points_required} points for "${selectedReward?.name}". Continue?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              {language === 'id' ? 'Batal' : 'Cancel'}
            </Button>
            <Button onClick={handleConfirmRedeem} disabled={isRedeeming}>
              {isRedeeming ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Gift className="w-4 h-4 mr-2" />
              )}
              {language === 'id' ? 'Tukar Sekarang' : 'Redeem Now'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Rewards;
