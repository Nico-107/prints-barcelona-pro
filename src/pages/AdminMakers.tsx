import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";

interface MakerApplication {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string;
  printers: string;
  message: string | null;
  created_at: string;
}

const AdminMakers = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [email, setEmail] = useState("011107miko@gmail.com");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [applications, setApplications] = useState<MakerApplication[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        setTimeout(() => checkRole(s.user.id), 0);
      } else {
        setIsAdmin(false);
        setAuthChecked(true);
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) checkRole(s.user.id);
      else setAuthChecked(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
    setAuthChecked(true);
  };

  useEffect(() => {
    if (isAdmin) loadApplications();
  }, [isAdmin]);

  const loadApplications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("maker_applications")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setApplications((data || []) as MakerApplication[]);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setAuthBusy(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setPassword("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  if (authChecked && session && !isAdmin) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4">
        <Card className="p-8 w-full max-w-sm shadow-xl text-center space-y-4">
          <Lock className="w-8 h-8 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-bold">Not authorized</h1>
          <p className="text-sm text-muted-foreground">
            Your account does not have admin access.
          </p>
          <Button onClick={handleLogout} variant="outline" className="w-full">Sign out</Button>
          <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground">← Back to site</Link>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4">
        <Card className="p-8 w-full max-w-sm shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex w-12 h-12 rounded-xl bg-foreground/5 items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-foreground" />
            </div>
            <h1 className="text-xl font-bold">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in with your admin account</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <Input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="h-11"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="h-11"
            />
            <Button type="submit" className="w-full" size="lg" disabled={authBusy}>
              {authBusy ? "Signing in..." : "Sign in"}
            </Button>
            <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">
              ← Back to site
            </Link>
          </form>
        </Card>
      </div>
    );
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="border-b border-border bg-background sticky top-0 z-30">
        <div className="container px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-semibold tracking-tight">Maker Applications</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 md:py-8 max-w-5xl">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : applications.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">No applications yet.</Card>
        ) : (
          <div className="grid gap-3">
            {applications.map((a) => (
              <Card key={a.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base">{a.name}</span>
                      <span className="text-xs text-muted-foreground">{a.city}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
                      <span>{a.email}</span>
                      {a.phone && <span>{a.phone}</span>}
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Printers:</span> {a.printers}
                    </p>
                    {a.message && (
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.message}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground md:text-right">
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminMakers;
