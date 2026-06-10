// App.tsx - Main application entry point with routing
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { HelmetProvider } from "react-helmet-async";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { GoogleIntegrations } from "@/components/GoogleIntegrations";
import PointsWidget from "@/components/PointsWidget";
import Index from "./pages/Index";

import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import NewsDetail from "./pages/NewsDetail";
import NotFound from "./pages/NotFound";
import Live from "./pages/Live";
import ShareRedirect from "./pages/ShareRedirect";
import ShareEventRedirect from "./pages/ShareEventRedirect";


import Liga from "./pages/Liga";
import Berita from "./pages/Berita";
import BeritaTag from "./pages/BeritaTag";
import Klasemen from "./pages/Klasemen";
import EventPage from "./pages/Event";
import {
  CMSLayout,
  CMSDashboard,
  CMSArticles,
  CMSArticleEditor,
  CMSMoments,
  CMSLeagues,
  CMSNavigation,
  CMSUsers,
  CMSAnalytics,
  CMSApi,
  CMSAdvertise,
  CMSSocialMedia,
  CMSOGPreview,
  CMSFooterBanners,
  CMSSidebarBanners,
  CMSReadToEarn,
  CMSIntegrations,
  CMSBotSender,
  CMSEvents,
} from "./pages/cms";
import Rewards from "./pages/Rewards";

// QueryClient imported from @/lib/queryClient

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsTracker />
          <GoogleIntegrations />
          <PointsWidget />
          <Routes>
            <Route path="/" element={<Index />} />
            
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/share/:slug" element={<ShareRedirect />} />
            <Route path="/share/event/:id" element={<ShareEventRedirect />} />
            <Route path="/news/:slug" element={<NewsDetail />} />
            <Route path="/live" element={<Live />} />
            
            <Route path="/liga" element={<Liga />} />
            <Route path="/liga/:league" element={<Liga />} />
            <Route path="/berita/:filter" element={<Berita />} />
            <Route path="/berita" element={<BeritaTag />} />
            <Route path="/klasemen" element={<Klasemen />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/event" element={<EventPage />} />
            
            {/* CMS Routes */}
            <Route path="/cms" element={<CMSLayout />}>
              <Route index element={<CMSDashboard />} />
              <Route path="analytics" element={<CMSAnalytics />} />
              <Route path="articles" element={<CMSArticles />} />
              <Route path="articles/new" element={<CMSArticleEditor />} />
              <Route path="articles/:id" element={<CMSArticleEditor />} />
              <Route path="moments" element={<CMSMoments />} />
              <Route path="leagues" element={<CMSLeagues />} />
              <Route path="advertise" element={<CMSAdvertise />} />
              <Route path="footer-banners" element={<CMSFooterBanners />} />
              <Route path="sidebar-banners" element={<CMSSidebarBanners />} />
              <Route path="navigation" element={<CMSNavigation />} />
              <Route path="social-media" element={<CMSSocialMedia />} />
              <Route path="og-preview" element={<CMSOGPreview />} />
              <Route path="api" element={<CMSApi />} />
              <Route path="users" element={<CMSUsers />} />
              <Route path="read-to-earn" element={<CMSReadToEarn />} />
              <Route path="integrations" element={<CMSIntegrations />} />
              <Route path="bot-sender" element={<CMSBotSender />} />
              <Route path="events" element={<CMSEvents />} />
            </Route>
            
            {/* Legacy route redirect */}
            <Route path="/bolakamicms" element={<CMSLayout />}>
              <Route index element={<CMSDashboard />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
