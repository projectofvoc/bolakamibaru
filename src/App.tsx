import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
