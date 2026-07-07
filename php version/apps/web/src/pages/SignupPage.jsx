import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    phone: '',
    password: '',
    passwordConfirm: ''
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

    if (!formData.name || !formData.email || !formData.password || !formData.passwordConfirm) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);

    const result = await signup(
      formData.email,
      formData.password,
      formData.passwordConfirm,
      formData.name,
      formData.company_name,
      formData.phone
    );

    if (result.success) {
      toast.success('Account created successfully');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Failed to create account');
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - Create Your Account | STC Logistics</title>
        <meta name="description" content="Create your STC Logistics account to start booking shipments, tracking cargo, and managing your logistics needs." />
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
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">Create your account</h1>
              <p className="text-lg font-medium text-muted-foreground">Start shipping with STC Logistics</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-card rounded-2xl shadow-md p-10 border border-border"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-foreground mb-2">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="bg-background border-border text-foreground font-medium shadow-sm focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-foreground mb-2">
                    Email <span className="text-destructive">*</span>
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
                  <label htmlFor="company_name" className="block text-sm font-bold text-foreground mb-2">
                    Company Name
                  </label>
                  <Input
                    id="company_name"
                    name="company_name"
                    type="text"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Your Company Ltd"
                    className="bg-background border-border text-foreground font-medium shadow-sm focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-foreground mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="bg-background border-border text-foreground font-medium shadow-sm focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-foreground mb-2">
                    Password <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="bg-background border-border text-foreground font-medium shadow-sm focus-visible:ring-primary"
                  />
                  <p className="text-xs font-medium text-muted-foreground mt-2">Minimum 8 characters</p>
                </div>

                <div>
                  <label htmlFor="passwordConfirm" className="block text-sm font-bold text-foreground mb-2">
                    Confirm Password <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    value={formData.passwordConfirm}
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-3" />
                      Sign Up
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:text-primary/80 font-bold transition-colors">
                    Log in
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

export default SignupPage;