import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Loader2, Save, X } from 'lucide-react';
import ImageUploadComponent from './ImageUploadComponent.jsx';

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

const ProductForm = ({ product = null, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [clearExistingImage, setClearExistingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    description: '',
    price: '',
    specifications: '',
    status: 'active',
    displayOrder: 0
  });

  const [departmentData, setDepartmentData] = useState({ department: '', departmentEmail: '' });

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName || '',
        category: product.category || '',
        description: product.description || '',
        price: product.price || '',
        specifications: product.specifications || '',
        status: product.status || 'active',
        displayOrder: product.displayOrder || 0
      });
      setDepartmentData({
        department: product.department || '',
        departmentEmail: product.departmentEmail || ''
      });
    }
  }, [product]);

  useEffect(() => {
    // Auto-populate department info based on category selection
    const cat = formData.category;
    if (['Agricultural Machinery', 'Lighting Equipment'].includes(cat)) {
      setDepartmentData({ department: 'Agricultural & Lighting', departmentEmail: 'frankie@stc-logistics.com' });
    } else if (['Cars', 'Heavy Equipment'].includes(cat)) {
      setDepartmentData({ department: 'Vehicles & Heavy Equipment', departmentEmail: 'sackie@stc-logistics.com' });
    } else if (['Doors', 'Windows', 'Tiles', 'Ice Cream Machines'].includes(cat)) {
      setDepartmentData({ department: 'Building Materials & Commercial', departmentEmail: 'charlaine@stc-logistics.com' });
    } else {
      setDepartmentData({ department: '', departmentEmail: '' });
    }
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'active' : 'inactive') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('productName', formData.productName);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('specifications', formData.specifications);
      data.append('status', formData.status);
      data.append('displayOrder', formData.displayOrder);
      data.append('department', departmentData.department);
      data.append('departmentEmail', departmentData.departmentEmail);
      
      if (formData.price) {
        data.append('price', formData.price);
      }

      data.append('updatedBy', pb.authStore.model.id);

      // Handle Image
      if (imageFile) {
        data.append('productImage', imageFile);
      } else if (clearExistingImage && product) {
        data.append('productImage', ''); // Pocketbase uses empty string to clear file field
      }

      if (product) {
        await pb.collection('procurement_products').update(product.id, data, { $autoCancel: false });
        toast.success('Product updated successfully');
      } else {
        data.append('createdBy', pb.authStore.model.id);
        await pb.collection('procurement_products').create(data, { $autoCancel: false });
        toast.success('Product created successfully');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save product', { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialImageUrl = product?.productImage 
    ? pb.files.getURL(product, product.productImage, { thumb: '600x450' }) 
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-4xl rounded-2xl shadow-2xl my-8 relative flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30 shrink-0">
          <h2 className="text-xl font-bold text-foreground">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Image & Status */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Product Image *</label>
                  <ImageUploadComponent 
                    initialImage={!clearExistingImage ? initialImageUrl : null}
                    onImageSelect={(file) => {
                      setImageFile(file);
                      setClearExistingImage(false);
                    }}
                    onClear={() => {
                      setImageFile(null);
                      setClearExistingImage(true);
                    }}
                  />
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground cursor-pointer" htmlFor="status-toggle">
                      Active Status
                    </label>
                    <div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
                      <input 
                        type="checkbox" 
                        name="status" 
                        id="status-toggle" 
                        checked={formData.status === 'active'}
                        onChange={handleChange}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-muted appearance-none cursor-pointer transition-transform duration-300 checked:translate-x-6 checked:border-primary"
                      />
                      <label htmlFor="status-toggle" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ${formData.status === 'active' ? 'bg-primary' : 'bg-muted-foreground/30'}`}></label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Display Order</label>
                    <input 
                      type="number" 
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Product Name *</label>
                  <input 
                    required 
                    type="text" 
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g., Heavy Duty Excavator"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Category *</label>
                  <select 
                    required 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="" disabled>Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <div>
                    <label className="block text-xs font-semibold text-primary/70 uppercase tracking-wider mb-1">Assigned Dept</label>
                    <div className="text-sm font-medium text-foreground">{departmentData.department || '—'}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-primary/70 uppercase tracking-wider mb-1">Dept Email</label>
                    <div className="text-sm font-medium text-foreground truncate">{departmentData.departmentEmail || '—'}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Price ($) (Optional)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Leave blank for 'Request Quote'"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Short Description *</label>
                  <textarea 
                    required 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                    placeholder="Brief overview of the product..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">Technical Specifications (Optional)</label>
                  <textarea 
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary resize-y"
                    placeholder="Detailed specs, materials, dimensions..."
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border bg-muted/30 shrink-0 flex justify-end gap-3 rounded-b-2xl">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border border-border bg-background text-foreground hover:bg-muted font-semibold transition-colors"
          >
            Cancel
          </button>
          <button 
            form="product-form"
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            {product ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;