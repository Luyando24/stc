import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const CATEGORIES = [
  'Agricultural Machinery',
  'Lighting Equipment',
  'Cars',
  'Heavy Equipment',
  'Doors',
  'Windows',
  'Tiles',
  'Ice Cream Machines'
];

const ProcurementQuoteForm = ({ preselectedCategory = '' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    destinationCountry: '',
    productCategory: preselectedCategory || '',
    productDetails: '',
    quantity: 1,
    budgetRange: '',
    preferredShippingMethod: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName('');
    }
  };

  const getRoutingEmail = (category) => {
    if (['Agricultural Machinery', 'Lighting Equipment'].includes(category)) return 'sales@stc-logistics.com';
    if (['Cars', 'Heavy Equipment'].includes(category)) return 'sackie@stc-logistics.com';
    return 'charlaine@stc-logistics.com';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      
      // Required fields by DB schema
      submitData.append('service_type', 'procurement');
      submitData.append('origin', 'China');
      submitData.append('destination', formData.destinationCountry);
      submitData.append('weight', 0);
      submitData.append('quote_amount', 0);
      submitData.append('status', 'pending');
      submitData.append('created_by', pb.authStore.model?.id || 'public');
      submitData.append('productId', `PROC-${Date.now()}`);
      submitData.append('productName', `${formData.productCategory} Request`);
      
      // Form fields
      submitData.append('customerName', formData.customerName);
      submitData.append('customerEmail', formData.customerEmail);
      submitData.append('customerPhone', formData.customerPhone);
      submitData.append('quantity', formData.quantity);
      submitData.append('destinationCountry', formData.destinationCountry);
      submitData.append('productCategory', formData.productCategory);
      submitData.append('productDetails', formData.productDetails);
      submitData.append('budgetRange', formData.budgetRange);
      submitData.append('preferredShippingMethod', formData.preferredShippingMethod);

      if (fileInputRef.current?.files?.[0]) {
        submitData.append('referenceImage', fileInputRef.current.files[0]);
      }

      await pb.collection('quotes').create(submitData, { $autoCancel: false });
      
      const routingEmail = getRoutingEmail(formData.productCategory);
      toast.success('Quote request submitted successfully!', {
        description: `Your request has been routed to our specialist at ${routingEmail}. We will contact you shortly.`
      });

      // Reset form
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        destinationCountry: '',
        productCategory: '',
        productDetails: '',
        quantity: 1,
        budgetRange: '',
        preferredShippingMethod: ''
      });
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit request', {
        description: error.message || 'Please check your inputs and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Info */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Full Name *</label>
          <input 
            required 
            type="text" 
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Phone / WhatsApp *</label>
          <input 
            required 
            type="tel" 
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            placeholder="+1 234 567 8900"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Email Address *</label>
          <input 
            required 
            type="email" 
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            placeholder="john@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Destination Country *</label>
          <input 
            required 
            type="text" 
            name="destinationCountry"
            value={formData.destinationCountry}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            placeholder="e.g., Liberia"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-foreground">Product Category *</label>
          <select 
            required 
            name="productCategory"
            value={formData.productCategory}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
          >
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-foreground">Product Details</label>
          <textarea 
            name="productDetails"
            value={formData.productDetails}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
            placeholder="Describe specifications, models, or specific requirements..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Quantity *</label>
          <input 
            required 
            type="number" 
            min="1"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Budget Range</label>
          <input 
            type="text" 
            name="budgetRange"
            value={formData.budgetRange}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            placeholder="e.g., $5,000 - $10,000"
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold text-foreground">Reference Image (Optional)</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {fileName ? <span className="font-semibold text-primary">{fileName}</span> : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, GIF up to 20MB</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/gif, image/webp"
              />
            </label>
          </div>
        </div>

        {/* Shipping Method */}
        <div className="space-y-3 md:col-span-2">
          <label className="text-sm font-semibold text-foreground">Preferred Shipping Method</label>
          <div className="flex flex-wrap gap-6">
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

      </div>

      <div className="mt-8">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full md:w-auto px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting Request...
            </>
          ) : (
            'Submit Quote Request'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProcurementQuoteForm;