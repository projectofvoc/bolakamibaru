import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import Index from "./pages/Index";
import Fixtures from "./pages/Fixtures";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import NewsDetail from "./pages/NewsDetail";
import NotFound from "./pages/NotFound";
import Live from "./pages/Live";
import PrediksiAI from "./pages/PrediksiAI";
import Liga from "./pages/Liga";
import Berita from "./pages/Berita";
import BeritaTag from "./pages/BeritaTag";
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
} from "./pages/cms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnalyticsTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/news/:slug" element={<NewsDetail />} />
            <Route path="/live" element={<Live />} />
            <Route path="/prediksi-ai" element={<PrediksiAI />} />
            <Route path="/liga" element={<Liga />} />
            <Route path="/liga/:league" element={<Liga />} />
            <Route path="/berita/:filter" element={<Berita />} />
            <Route path="/berita" element={<BeritaTag />} />
            
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
              <Route path="navigation" element={<CMSNavigation />} />
              <Route path="api" element={<CMSApi />} />
              <Route path="users" element={<CMSUsers />} />
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
  </QueryClientProvider>
);

export default App;
