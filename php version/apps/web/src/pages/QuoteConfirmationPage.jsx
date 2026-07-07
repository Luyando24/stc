import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, User, ArrowLeft, Mail } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';

const QuoteConfirmationPage = () => {
  const location = useLocation();
  const state = location.state;

  if (!state) {
    return <Navigate to="/procurement" replace />;
  }

  const { quoteId, contactPerson, productName, quantity, customerName } = state;

  return (
    <>
      <Helmet>
        <title>Quote Request Confirmed | STC Logistics</title>
      </Helmet>

      <div className="min-h-[100dvh] flex flex-col bg-background">
        <Header />

        <main className="flex-1 pt-32 pb-24 flex items-center justify-center">
          <div className="max-w-2xl w-full px-4 sm:px-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-12 text-center"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                Quote Request Received
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Thank you, {customerName}. Your request has been successfully submitted and logged with reference <span className="font-mono text-foreground font-semibold">{quoteId || 'PENDING'}</span>.
              </p>

              <div className="bg-muted/50 rounded-xl p-6 mb-8 text-left border border-border/50">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Request Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Product</span>
                    <span className="font-medium text-foreground">{productName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Quantity</span>
                    <span className="font-medium text-foreground">{quantity} Units</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-primary/5 text-primary rounded-xl p-5 mb-10 text-left border border-primary/20">
                <User className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Assigned Specialist: {contactPerson}</h4>
                  <p className="text-sm text-primary/80">
                    {contactPerson} is reviewing your requirements and will contact you via email within 1-2 business days with a detailed proposal and shipping options.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" className="h-12 px-6">
                  <Link to="/procurement">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Procurement
                  </Link>
                </Button>
                <Button asChild className="h-12 px-6">
                  <Link to="/">
                    Return to Home
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default QuoteConfirmationPage;