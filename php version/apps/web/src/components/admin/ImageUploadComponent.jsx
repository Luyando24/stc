import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { compressImage } from '@/lib/imageUtils.js';
import { toast } from 'sonner';

const ImageUploadComponent = ({ onImageSelect, initialImage, onClear }) => {
  const [preview, setPreview] = useState(initialImage || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type', { description: 'Please upload JPG, PNG, or WEBP images only.' });
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', { description: 'Maximum file size is 5MB.' });
      return;
    }

    setIsProcessing(true);
    try {
      // Compress and resize
      const compressedFile = await compressImage(file, 600, 450, 0.85);
      
      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);

      onImageSelect(compressedFile);
    } catch (error) {
      toast.error('Image processing failed', { description: 'Could not compress image.' });
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Clear input so same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelect(null);
    if (onClear) onClear();
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border group bg-muted aspect-[4/3] flex items-center justify-center">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleClear}
              className="bg-destructive text-destructive-foreground p-2 rounded-full hover:scale-110 transition-transform shadow-lg flex items-center gap-2 px-4"
            >
              <X className="w-4 h-4" /> Remove Image
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isProcessing ? 'bg-muted/50 border-muted-foreground/30' : 'bg-card border-border hover:bg-muted/50 hover:border-primary/50'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center text-muted-foreground">
              <Loader2 className="w-8 h-8 mb-4 animate-spin text-primary" />
              <p className="text-sm font-medium">Processing image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-muted-foreground p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-semibold text-foreground mb-1">Click or drag image to upload</p>
              <p className="text-sm">JPG, PNG, WEBP up to 5MB</p>
              <p className="text-xs mt-4 text-muted-foreground/80">Recommended size: 600x450px</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploadComponent;