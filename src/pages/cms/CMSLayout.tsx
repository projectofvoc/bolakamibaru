import { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  Video, 
  Trophy, 
  Link2, 
  Users, 
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  BarChart3,
  Key,
  Megaphone,
  Share2
} from 'lucide-react';
import logoBolakami from '@/assets/logo-bolakami.png';

interface UserRole {
  role: 'admin' | 'author' | 'user';
}

const CMSSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  
  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserRole[];
    },
  });

  const isAdmin = userRoles.some(r => r.role === 'admin');
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { title: 'Dashboard', url: '/cms', icon: LayoutDashboard },
    { title: 'Analytics', url: '/cms/analytics', icon: BarChart3 },
    { title: 'Semua Berita', url: '/cms/articles', icon: FileText },
    { title: 'Tambah Berita', url: '/cms/articles/new', icon: Plus },
    { title: 'Momen Terbaik', url: '/cms/moments', icon: Video },
  ];

  const adminItems = [
    { title: 'Liga', url: '/cms/leagues', icon: Trophy },
    { title: 'Advertise', url: '/cms/advertise', icon: Megaphone },
    { title: 'Navigation', url: '/cms/navigation', icon: Link2 },
    { title: 'Social Media', url: '/cms/social-media', icon: Share2 },
    { title: 'API', url: '/cms/api', icon: Key },
    { title: 'Users', url: '/cms/users', icon: Users },
  ];

  return (
    <Sidebar className="border-r border-border bg-sidebar-background">
      <div className="p-4 flex items-center gap-3 border-b border-border">
        <img src={logoBolakami} alt="BOLAKAMI" className="h-8" />
        {!collapsed && <span className="text-lg font-bold text-primary">CMS</span>}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs text-muted-foreground">
            {!collapsed && 'KONTEN'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/cms'}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-sidebar-accent rounded-lg transition-colors"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-xs text-muted-foreground">
              {!collapsed && 'ADMIN'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-sidebar-accent rounded-lg transition-colors"
                        activeClassName="bg-sidebar-accent text-primary font-medium"
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

const CMSLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CMSSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 h-14 border-b border-border bg-card/95 backdrop-blur flex items-center justify-between px-4">
            <SidebarTrigger className="p-2 hover:bg-muted rounded-lg">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CMSLayout;
