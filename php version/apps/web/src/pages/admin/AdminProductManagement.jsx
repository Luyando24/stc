import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash2, ExternalLink, Loader2, Image as ImageIcon } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm.jsx';
import { Link } from 'react-router-dom';

const AdminProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { currentAdmin, isSuperAdmin, logActivity } = useAdminAuth();

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const filters = [];
      
      // Role-based filter
      if (!isSuperAdmin && currentAdmin?.department) {
        // Find which categories belong to this admin's department group
        // currentAdmin.department is one specific string from the dropdown. Wait, if their profile has 'department', it limits them.
        filters.push(`category = "${currentAdmin.department}"`);
      }

      if (searchQuery) filters.push(`(productName ~ "${searchQuery}" || description ~ "${searchQuery}")`);
      if (categoryFilter) filters.push(`category = "${categoryFilter}"`);
      if (statusFilter) filters.push(`status = "${statusFilter}"`);

      const records = await pb.collection('procurement_products').getFullList({
        filter: filters.join(' && '),
        sort: 'displayOrder,-created',
        $autoCancel: false
      });
      
      setProducts(records);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, categoryFilter, statusFilter, isSuperAdmin, currentAdmin]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    try {
      await pb.collection('procurement_products').delete(id, { $autoCancel: false });
      await logActivity('delete_product', id, { productName: name });
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await pb.collection('procurement_products').update(product.id, { status: newStatus }, { $autoCancel: false });
      setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
      toast.success(`Product marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const openForm = (product = null) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Helmet>
        <title>{`Product Management | STC Logistics Admin`}</title>
      </Helmet>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Procurement Gallery</h1>
          <p className="text-muted-foreground">Manage products available in the public procurement gallery.</p>
        </div>
        
        <button 
          onClick={() => openForm(null)}
          className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" /> Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>
        
        {isSuperAdmin && (
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary md:w-48"
          >
            <option value="">All Categories</option>
            <option value="Agricultural Machinery">Agricultural Machinery</option>
            <option value="Lighting Equipment">Lighting Equipment</option>
            <option value="Cars">Cars</option>
            <option value="Heavy Equipment">Heavy Equipment</option>
            <option value="Doors">Doors</option>
            <option value="Windows">Windows</option>
            <option value="Tiles">Tiles</option>
            <option value="Ice Cream Machines">Ice Cream Machines</option>
          </select>
        )}

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary md:w-36"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        {isLoading ? (
          <div className="flex justify-center items-center p-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Products Found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your filters or add a new product.</p>
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b hover:bg-muted/50">
                <th className="admin-th w-16">Image</th>
                <th className="admin-th">Product Name</th>
                <th className="admin-th">Category & Dept</th>
                <th className="admin-th">Order</th>
                <th className="admin-th">Status</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {products.map(product => {
                const imgUrl = product.productImage ? pb.files.getURL(product, product.productImage, { thumb: '100x100' }) : null;
                return (
                  <tr key={product.id} className="admin-tr">
                    <td className="admin-td">
                      {imgUrl ? (
                        <img src={imgUrl} alt={product.productName} className="w-12 h-12 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border border-border">
                          <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                        </div>
                      )}
                    </td>
                    <td className="admin-td">
                      <div className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">{product.productName}</div>
                      <div className="text-xs text-muted-foreground">{product.price ? `$${product.price.toLocaleString()}` : 'Quote on Request'}</div>
                    </td>
                    <td className="admin-td">
                      <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary font-semibold text-xs rounded-md mb-1">
                        {product.category}
                      </span>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">{product.department || 'Unassigned'}</div>
                    </td>
                    <td className="admin-td font-mono text-muted-foreground">{product.displayOrder}</td>
                    <td className="admin-td">
                      <button 
                        onClick={() => handleToggleStatus(product)}
                        className={`badge-${product.status === 'active' ? 'active' : 'inactive'} hover:opacity-80 transition-opacity cursor-pointer border-0`}
                      >
                        {product.status.toUpperCase()}
                      </button>
                    </td>
                    <td className="admin-td text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          to="/procurement" 
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                          title="View in Gallery"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => openForm(product)}
                          className="p-2 text-secondary hover:bg-secondary/10 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id, product.productName)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isFormOpen && (
        <ProductForm 
          product={editingProduct} 
          onClose={closeForm} 
          onSuccess={() => {
            closeForm();
            fetchProducts();
          }} 
        />
      )}
    </div>
  );
};

export default AdminProductManagement;