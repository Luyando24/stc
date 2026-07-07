import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEPARTMENTS = [
  'Agricultural Machinery',
  'Lighting Equipment',
  'Cars',
  'Heavy Equipment',
  'Doors',
  'Windows',
  'Tiles',
  'Ice Cream Machines',
  'Administration'
];

const AdminRegistrationPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    password: '',
    passwordConfirm: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup } = useAdminAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Front-end validations
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      toast.error('Weak Password', {
        description: 'Password must be at least 8 characters long.'
      });
      return;
    }

    if (!formData.department) {
      toast.error('Department required', {
        description: 'Please select a valid department.'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await signup(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone,
        formData.department
      );

      toast.success('Registration successful!', {
        description: 'Your account has been created and logged in.',
      });
      
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error('Registration failed', {
        description: err.message || 'Please check your inputs and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <Helmet>
        <title>{`Admin Registration | STC Logistics`}</title>
      </Helmet>
      
      <div className="w-full max-w-lg">
        <Link to="/" className="inline-block mb-8">
          <div className="text-2xl font-extrabold text-foreground tracking-tight flex items-center hover:opacity-80 transition-opacity">
            <span className="text-primary mr-2">STC</span> Admin
          </div>
        </Link>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 sm:p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground text-center">Create Account</h1>
            <p className="text-muted-foreground text-sm mt-1 text-center">
              Register to manage operations for your department.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName"
                  name="fullName"
                  type="text" 
                  required 
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone"
                  name="phone"
                  type="tel" 
                  required 
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email"
                name="email"
                type="email" 
                required 
                value={formData.email}
                onChange={handleChange}
                placeholder="john@stc-logistics.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <select 
                id="department"
                name="department"
                required 
                value={formData.department}
                onChange={handleChange}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>Select department</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  name="password"
                  type="password" 
                  required 
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Confirm Password</Label>
                <Input 
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password" 
                  required 
                  minLength={8}
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  disabled={isSubmitting}
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
                  Registering...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/admin/login" className="text-primary font-bold hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistrationPage;