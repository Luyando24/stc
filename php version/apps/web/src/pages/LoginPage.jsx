import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success('Login successful');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Invalid email or password');
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <Helmet>
        <title>Login - Access Your Account | STC Logistics</title>
        <meta name="description" content="Log in to your STC Logistics account to manage bookings, track shipments, and view quotes." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <section className="py-24 bg-muted/30 min-h-[80vh] flex items-center">
          <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <div className="w-20 h-20 bg-accent/10 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-accent/20">
                <Package className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">Welcome Back</h1>
              <p className="text-lg font-medium text-muted-foreground">Log in to manage your shipments</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-card rounded-2xl shadow-md p-10 border border-border"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="bg-background border-border text-foreground font-medium shadow-sm focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-foreground mb-2">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="bg-background border-border text-foreground font-medium shadow-sm focus-visible:ring-primary"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-md shadow-primary/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-3"></div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-3" />
                      Log In
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary hover:text-primary/80 font-bold transition-colors">
                    Sign up
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default LoginPage;