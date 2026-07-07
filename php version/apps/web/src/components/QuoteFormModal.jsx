import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Loader2, X, Send } from 'lucide-react';

const QuoteFormModal = ({ product, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    destinationCountry: '',
    quantity: 1,
    budgetRange: '',
    message: '',
    preferredShippingMethod: ''
  });

  useEffect(() => {
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        service_type: 'procurement',
        origin: 'China',
        destination: formData.destinationCountry,
        weight: 0,
        quote_amount: 0,
        status: 'pending',
        created_by: pb.authStore.model?.id || 'public',
        productId: product.id,
        productName: product.productName,
        productCategory: product.category,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        quantity: formData.quantity,
        destinationCountry: formData.destinationCountry,
        budgetRange: formData.budgetRange,
        message: formData.message,
        preferredShippingMethod: formData.preferredShippingMethod
      };

      await pb.collection('quotes').create(payload, { $autoCancel: false });
      
      toast.success('Quote request sent!', {
        description: 'Our team will review your request and get back to you shortly.'
      });
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit request', { description: 'Please check your inputs and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const imgUrl = product?.productImage 
    ? pb.files.getURL(product, product.productImage, { thumb: '400x300' }) 
    : 'https://images.unsplash.com/photo-1586528116311-ad8ed7e66a5a?w=400&h=300&fit=crop';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-3xl rounded-2xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden my-8 animate-slide-up">
        
        {/* Left Side: Product Summary */}
        <div className="md:w-1/3 bg-muted p-6 flex flex-col items-center text-center border-r border-border shrink-0">
          <img src={imgUrl} alt={product.productName} className="w-full rounded-xl aspect-[4/3] object-cover border border-border shadow-sm mb-4" />
          <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full uppercase tracking-wider mb-2">
            {product.category}
          </span>
          <h3 className="font-extrabold text-foreground text-xl mb-2 text-balance leading-tight">{product.productName}</h3>
          {product.price && (
            <p className="text-lg font-bold text-secondary">${product.price.toLocaleString()}</p>
          )}
        </div>

        {/* Right Side: Form */}
        <div className="md:w-2/3 flex flex-col p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Request Quote</h2>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Full Name *</label>
                <input 
                  required 
                  type="text" 
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Email Address *</label>
                <input 
                  required 
                  type="email" 
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Phone / WhatsApp *</label>
                <input 
                  required 
                  type="tel" 
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Destination Country *</label>
                <input 
                  required 
                  type="text" 
                  name="destinationCountry"
                  value={formData.destinationCountry}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Quantity *</label>
                <input 
                  required 
                  type="number" 
                  min="1"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Budget Range</label>
                <input 
                  type="text" 
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                  placeholder="e.g. $5k - $10k"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Preferred Shipping Method</label>
              <div className="flex gap-4">
                {['Air Cargo', 'Sea Cargo', 'Not Sure'].map(method => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="preferredShippingMethod"
                      value={method}
                      checked={formData.preferredShippingMethod === method}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary focus:ring-primary border-input"
                    />
                    <span className="text-sm text-foreground">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Additional Details / Questions</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm resize-none"
              />
            </div>

            <div className="pt-4 mt-4 border-t border-border">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center shadow-md"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                Submit Quote Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuoteFormModal;