import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Store, Users, LogOut, TrendingUp, Activity, Smartphone, FileText, Settings } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut, isAdmin, loading, isAdminCheckComplete, user } = useAuth();
  const { currentStore } = useStore();

  // No auto redirect - show dashboard for all users

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading while checking admin status
  if (loading || !isAdminCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // All approved users can see dashboard

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2F2F7] via-[#FAFAFA] to-[#E5E5EA] p-6 pb-20">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Header dengan gaya iOS */}
        <div className="text-center space-y-3 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-light shadow-lg mb-4">
            <Store className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {currentStore?.name || 'KasirQ'}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Selamat datang kembali, {user?.email?.split('@')[0]}
          </p>
        </div>

        {/* Quick Stats - iOS Style Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="bg-white/90 backdrop-blur-sm border-0 shadow-sm rounded-2xl hover:shadow-md transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/analytics')}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">Analytics</p>
              <p className="text-lg font-bold text-foreground">Dashboard</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-success" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="text-lg font-bold text-success">Online</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Menu - iOS Style dengan gradient cards */}
        <div className="space-y-3">
          {/* POS Menu */}
          <Card 
            className="bg-gradient-to-br from-primary via-primary to-primary-light border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] rounded-2xl overflow-hidden"
            onClick={() => navigate('/pos')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-4 text-white">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Store className="h-8 w-8 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">Kasir POS</span>
                  <p className="text-xs text-white/80 font-normal mt-1">
                    Transaksi & Manajemen Produk
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* PPOB Menu */}
          <Card 
            className="bg-gradient-to-br from-success via-success to-success-light border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] rounded-2xl overflow-hidden"
            onClick={() => navigate('/ppob')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-4 text-white">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">PPOB</span>
                  <p className="text-xs text-white/80 font-normal mt-1">
                    Pembayaran & Pulsa Digital
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Admin Menu - Only show if user is admin */}
          {isAdmin && (
            <Card 
              className="bg-white/90 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] rounded-2xl"
              onClick={() => navigate('/admin/users')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <span className="text-lg font-semibold text-foreground">Admin Panel</span>
                    <p className="text-xs text-muted-foreground font-normal mt-1">
                      Kelola User & Sistem
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          )}
        </div>

        {/* Quick Actions - iOS Style */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => navigate('/reports')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 active:scale-95"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">Laporan</span>
          </button>

          <button 
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 active:scale-95"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">Pengaturan</span>
          </button>

          <button 
            onClick={handleLogout}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 active:scale-95"
          >
            <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center">
              <LogOut className="h-6 w-6 text-error" />
            </div>
            <span className="text-xs font-medium text-foreground">Keluar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
