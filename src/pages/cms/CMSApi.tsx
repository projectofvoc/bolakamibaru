import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Key, Plus, Pencil, History, Eye, EyeOff, Trash2, CheckCircle, XCircle, AlertCircle, Wifi, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ApiConfig {
  id: string;
  name: string;
  display_name: string;
  api_key: string | null;
  description: string | null;
  is_active: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

interface ApiHistory {
  id: string;
  config_id: string;
  old_api_key: string | null;
  new_api_key: string | null;
  changed_at: string;
  changed_by: string | null;
  reason: string | null;
}

interface TestResult {
  status: 'idle' | 'testing' | 'success' | 'error';
  code?: number;
  message?: string;
  latency?: number;
  details?: Record<string, unknown>;
}

const categoryLabels: Record<string, string> = {
  livescore: "Live Score",
  prediction: "Prediksi AI",
  general: "Umum",
  news: "Berita",
};

const maskApiKey = (key: string | null): string => {
  if (!key) return "Belum dikonfigurasi";
  if (key.length <= 8) return "****" + key.slice(-4);
  return "****" + key.slice(-8);
};

export default function CMSApi() {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ApiConfig | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [testResult, setTestResult] = useState<TestResult>({ status: 'idle' });
  const [cardTestResults, setCardTestResults] = useState<Record<string, TestResult>>({});
  
  // Form states
  const [editForm, setEditForm] = useState({
    api_key: "",
    reason: "",
  });
  
  const [addForm, setAddForm] = useState({
    name: "",
    display_name: "",
    api_key: "",
    description: "",
    category: "general",
  });

  // Fetch API configurations
  const { data: configs, isLoading } = useQuery({
    queryKey: ["api-configurations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_configurations")
        .select("*")
        .order("category", { ascending: true })
        .order("display_name", { ascending: true });
      
      if (error) throw error;
      return data as ApiConfig[];
    },
  });

  // Fetch history for selected config
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["api-history", selectedConfig?.id],
    queryFn: async () => {
      if (!selectedConfig) return [];
      const { data, error } = await supabase
        .from("api_configurations_history")
        .select("*")
        .eq("config_id", selectedConfig.id)
        .order("changed_at", { ascending: false });
      
      if (error) throw error;
      return data as ApiHistory[];
    },
    enabled: !!selectedConfig && historyDialogOpen,
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async ({ apiName, apiKey }: { apiName: string; apiKey: string }) => {
      const { data, error } = await supabase.functions.invoke('test-api-connection', {
        body: { apiName, apiKey }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setTestResult({
        status: data.success ? 'success' : 'error',
        code: data.status,
        message: data.message,
        latency: data.latency,
        details: data.details,
      });
    },
    onError: (error) => {
      setTestResult({
        status: 'error',
        message: error.message,
      });
    }
  });

  // Test existing API card mutation
  const testCardConnectionMutation = useMutation({
    mutationFn: async ({ configId, apiName, apiKey }: { configId: string; apiName: string; apiKey: string }) => {
      const { data, error } = await supabase.functions.invoke('test-api-connection', {
        body: { apiName, apiKey }
      });
      if (error) throw error;
      return { configId, ...data };
    },
    onSuccess: (data) => {
      setCardTestResults(prev => ({
        ...prev,
        [data.configId]: {
          status: data.success ? 'success' : 'error',
          code: data.status,
          message: data.message,
          latency: data.latency,
        }
      }));
      
      if (data.success) {
        toast.success(`Koneksi berhasil (${data.latency}ms)`);
      } else {
        toast.error(`Koneksi gagal: ${data.message}`);
      }
    },
    onError: (error, variables) => {
      setCardTestResults(prev => ({
        ...prev,
        [variables.configId]: {
          status: 'error',
          message: error.message,
        }
      }));
      toast.error(`Error: ${error.message}`);
    }
  });

  // Update API key mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, api_key, reason }: { id: string; api_key: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get old API key for history
      const { data: oldConfig } = await supabase
        .from("api_configurations")
        .select("api_key")
        .eq("id", id)
        .single();

      // Insert history record
      await supabase.from("api_configurations_history").insert({
        config_id: id,
        old_api_key: oldConfig?.api_key || null,
        new_api_key: api_key,
        changed_by: user?.id,
        reason: reason || null,
      });

      // Update configuration
      const { error } = await supabase
        .from("api_configurations")
        .update({
          api_key,
          updated_by: user?.id,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-configurations"] });
      toast.success("API key berhasil diupdate");
      setEditDialogOpen(false);
      setEditForm({ api_key: "", reason: "" });
      setTestResult({ status: 'idle' });
    },
    onError: (error) => {
      toast.error("Gagal mengupdate API key: " + error.message);
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("api_configurations")
        .update({ is_active, updated_by: user?.id })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-configurations"] });
      toast.success("Status API berhasil diubah");
    },
    onError: (error) => {
      toast.error("Gagal mengubah status: " + error.message);
    },
  });

  // Add new API mutation
  const addMutation = useMutation({
    mutationFn: async (form: typeof addForm) => {
      const { data: { user } } = await supabase.auth.getUser();
      // Auto-generate name from display_name if name is empty
      const generatedName = form.name || form.display_name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
      const { error } = await supabase.from("api_configurations").insert({
        name: generatedName,
        display_name: form.display_name,
        api_key: form.api_key || null,
        description: form.description || null,
        category: form.category,
        updated_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-configurations"] });
      toast.success("API baru berhasil ditambahkan");
      setAddDialogOpen(false);
      setAddForm({ name: "", display_name: "", api_key: "", description: "", category: "general" });
    },
    onError: (error) => {
      toast.error("Gagal menambahkan API: " + error.message);
    },
  });

  // Delete API mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("api_configurations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-configurations"] });
      toast.success("API berhasil dihapus");
      setDeleteDialogOpen(false);
      setSelectedConfig(null);
    },
    onError: (error) => {
      toast.error("Gagal menghapus API: " + error.message);
    },
  });

  const handleEditClick = (config: ApiConfig) => {
    setSelectedConfig(config);
    setEditForm({ api_key: "", reason: "" });
    setTestResult({ status: 'idle' });
    setEditDialogOpen(true);
  };

  const handleHistoryClick = (config: ApiConfig) => {
    setSelectedConfig(config);
    setHistoryDialogOpen(true);
  };

  const handleDeleteClick = (config: ApiConfig) => {
    setSelectedConfig(config);
    setDeleteDialogOpen(true);
  };

  const handleTestConnection = () => {
    if (!selectedConfig || !editForm.api_key) return;
    setTestResult({ status: 'testing' });
    testConnectionMutation.mutate({
      apiName: selectedConfig.name,
      apiKey: editForm.api_key,
    });
  };

  const handleTestExistingApi = (config: ApiConfig) => {
    if (!config.api_key) {
      toast.error("API key belum dikonfigurasi");
      return;
    }
    setCardTestResults(prev => ({
      ...prev,
      [config.id]: { status: 'testing' }
    }));
    testCardConnectionMutation.mutate({
      configId: config.id,
      apiName: config.name,
      apiKey: config.api_key,
    });
  };

  const toggleShowKey = (id: string) => {
    setShowApiKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Group configs by category
  const groupedConfigs = configs?.reduce((acc, config) => {
    const cat = config.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(config);
    return acc;
  }, {} as Record<string, ApiConfig[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6" />
            API Configuration
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola API keys untuk integrasi eksternal
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah API
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : !configs?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Belum ada API yang dikonfigurasi</p>
            <Button className="mt-4" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah API Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedConfigs || {}).map(([category, categoryConfigs]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
              {categoryLabels[category] || category}
            </h2>
            <div className="grid gap-4">
              {categoryConfigs.map((config) => (
                <Card key={config.id} className={!config.is_active ? "opacity-60" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.is_active ? "bg-primary/10" : "bg-muted"}`}>
                          <Key className={`h-5 w-5 ${config.is_active ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {config.display_name}
                            {config.is_active ? (
                              <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aktif
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="h-3 w-3 mr-1" />
                                Nonaktif
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {config.description || "Tidak ada deskripsi"}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.is_active}
                          onCheckedChange={(checked) => 
                            toggleActiveMutation.mutate({ id: config.id, is_active: checked })
                          }
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-sm bg-muted/50 px-3 py-2 rounded-md">
                        <span className="text-muted-foreground">API Key:</span>
                        <span>
                          {showApiKey[config.id] && config.api_key
                            ? config.api_key
                            : maskApiKey(config.api_key)}
                        </span>
                        {config.api_key && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleShowKey(config.id)}
                          >
                            {showApiKey[config.id] ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleTestExistingApi(config)}
                          disabled={!config.api_key || cardTestResults[config.id]?.status === 'testing'}
                        >
                          {cardTestResults[config.id]?.status === 'testing' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Wifi className="h-4 w-4 mr-1" />
                              Test
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleHistoryClick(config)}>
                          <History className="h-4 w-4 mr-1" />
                          History
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(config)}>
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(config)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Card Test Result */}
                    {cardTestResults[config.id] && cardTestResults[config.id].status !== 'idle' && (
                      <div className={cn(
                        "mt-3 p-2 rounded-md text-sm flex items-center gap-2",
                        cardTestResults[config.id].status === 'success' && "bg-green-500/10 text-green-600",
                        cardTestResults[config.id].status === 'error' && "bg-red-500/10 text-red-600",
                        cardTestResults[config.id].status === 'testing' && "bg-blue-500/10 text-blue-600"
                      )}>
                        {cardTestResults[config.id].status === 'success' && (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Connected</span>
                            <Badge variant="outline" className="ml-auto text-green-600 border-green-600/30">
                              {cardTestResults[config.id].latency}ms
                            </Badge>
                          </>
                        )}
                        {cardTestResults[config.id].status === 'error' && (
                          <>
                            <XCircle className="h-4 w-4" />
                            <span className="truncate">{cardTestResults[config.id].message}</span>
                          </>
                        )}
                      </div>
                    )}
                    
                    {config.updated_at && (
                      <p className="text-xs text-muted-foreground mt-3">
                        Terakhir diupdate: {format(new Date(config.updated_at), "d MMM yyyy, HH:mm", { locale: localeId })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) setTestResult({ status: 'idle' });
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update API Key</DialogTitle>
            <DialogDescription>
              Update API key untuk {selectedConfig?.display_name}. Perubahan akan dicatat dalam history.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api_key">API Key Baru</Label>
              <Input
                id="api_key"
                type="password"
                placeholder="Masukkan API key baru"
                value={editForm.api_key}
                onChange={(e) => {
                  setEditForm(prev => ({ ...prev, api_key: e.target.value }));
                  setTestResult({ status: 'idle' });
                }}
              />
            </div>
            
            {/* Test Connection Section */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={!editForm.api_key || testConnectionMutation.isPending}
                className="w-full"
              >
                {testConnectionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
              
              {/* Display Test Result */}
              {testResult.status !== 'idle' && (
                <div className={cn(
                  "p-3 rounded-lg text-sm",
                  testResult.status === 'success' && "bg-green-500/10 text-green-600 border border-green-500/30",
                  testResult.status === 'error' && "bg-red-500/10 text-red-600 border border-red-500/30",
                  testResult.status === 'testing' && "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                )}>
                  {testResult.status === 'success' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1">{testResult.message}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-green-600 border-green-600/30">
                          {testResult.latency}ms
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600/30">
                          HTTP {testResult.code}
                        </Badge>
                        {testResult.details?.rate_limit_remaining && (
                          <Badge variant="outline" className="text-green-600 border-green-600/30">
                            Rate Limit: {String(testResult.details.rate_limit_remaining)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {testResult.status === 'error' && (
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span>{testResult.message}</span>
                        {testResult.code && (
                          <Badge variant="destructive" className="ml-2">
                            HTTP {testResult.code}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {testResult.status === 'testing' && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Testing connection...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Alasan Perubahan (opsional)</Label>
              <Textarea
                id="reason"
                placeholder="Contoh: API key expired, upgrade plan, dll"
                value={editForm.reason}
                onChange={(e) => setEditForm(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => selectedConfig && updateMutation.mutate({
                id: selectedConfig.id,
                api_key: editForm.api_key,
                reason: editForm.reason,
              })}
              disabled={!editForm.api_key || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah API Baru</DialogTitle>
            <DialogDescription>
              Tambahkan konfigurasi API baru untuk integrasi eksternal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Nama API *</Label>
              <Input
                id="display_name"
                placeholder="Contoh: Football Data API"
                value={addForm.display_name}
                onChange={(e) => setAddForm(prev => ({ ...prev, display_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Identifier (slug)</Label>
              <Input
                id="name"
                placeholder="football_data_api"
                value={addForm.name || addForm.display_name.toLowerCase().replace(/\s+/g, "_")}
                onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={addForm.category}
                onValueChange={(value) => setAddForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="livescore">Live Score</SelectItem>
                  <SelectItem value="prediction">Prediksi AI</SelectItem>
                  <SelectItem value="news">Berita</SelectItem>
                  <SelectItem value="general">Umum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add_api_key">API Key</Label>
              <Input
                id="add_api_key"
                type="password"
                placeholder="Masukkan API key"
                value={addForm.api_key}
                onChange={(e) => setAddForm(prev => ({ ...prev, api_key: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Deskripsi fungsi API ini"
                value={addForm.description}
                onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => addMutation.mutate(addForm)}
              disabled={!addForm.display_name || addMutation.isPending}
            >
              {addMutation.isPending ? "Menambahkan..." : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>History Perubahan</DialogTitle>
            <DialogDescription>
              Riwayat perubahan API key untuk {selectedConfig?.display_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-96 overflow-y-auto">
            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : !history?.length ? (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <History className="h-10 w-10 mb-2" />
                <p>Belum ada riwayat perubahan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {format(new Date(item.changed_at), "d MMM yyyy, HH:mm:ss", { locale: localeId })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Sebelum:</span>
                        <p className="font-mono bg-muted/50 px-2 py-1 rounded mt-1">
                          {maskApiKey(item.old_api_key)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sesudah:</span>
                        <p className="font-mono bg-muted/50 px-2 py-1 rounded mt-1">
                          {maskApiKey(item.new_api_key)}
                        </p>
                      </div>
                    </div>
                    {item.reason && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Alasan:</span>
                        <p className="mt-1">{item.reason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Hapus API Configuration
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus "{selectedConfig?.display_name}"? 
              Semua history perubahan juga akan dihapus. Aksi ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedConfig && deleteMutation.mutate(selectedConfig.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}