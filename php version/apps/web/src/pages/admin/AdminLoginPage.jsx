import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { toast } from 'sonner';
import { Loader2, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errorMsg) setErrorMsg('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errorMsg) setErrorMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in both fields');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(''); 
    
    try {
      await login(email, password);
      toast.success('Login successful');
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
      toast.error('Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <Helmet>
        <title>{`Admin Login | STC Logistics`}</title>
      </Helmet>
      
      <div className="w-full max-w-md">
        <Link to="/" className="inline-block mb-10">
          <div className="text-2xl font-extrabold text-foreground tracking-tight flex items-center hover:opacity-80 transition-opacity">
            <span className="text-primary mr-2">STC</span> Admin
          </div>
        </Link>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">STC Admin</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Welcome back - Enter your credentials to access the administrative dashboard.
          </p>

          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-destructive animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-tight">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isSubmitting}
                  className="pl-9 bg-background"
                  placeholder="sales@stc-logistics.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isSubmitting}
                  className="pl-9 bg-background"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-6"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                  Authenticating...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/admin/signup" className="text-primary font-bold hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;