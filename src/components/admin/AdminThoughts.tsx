import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, Eye, EyeOff, LogOut, Lock, Edit2, Trash2, X, Check,
  ChevronLeft, ChevronRight, Search, Calendar, ImagePlus, Link as LinkIcon, Upload, Loader2,
  MessageSquare, Image as ImageIcon, Send
} from 'lucide-react';
import type { Thought } from '../../types';
import { 
  getAdminThoughts, createThought, updateThought, deleteThought, verifyAdminPassword, uploadImage 
} from '../../services/xano';
import { getXanoFileUrl } from '../../config/xano';
import { Card, Button } from '../ui';

const ITEMS_PER_PAGE = 5;

/**
 * Admin view for managing thoughts
 * Full CRUD with pagination and search
 */
export function AdminThoughts() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(
    sessionStorage.getItem('admin_auth_token')
  );
  
  // Edit modal state
  const [editingThought, setEditingThought] = useState<Thought | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editIsVisible, setEditIsVisible] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Delete confirmation
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalThoughts, setTotalThoughts] = useState(0);
  
  // Search/Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Image upload
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [editUploading, setEditUploading] = useState(false);
  const [editUploadError, setEditUploadError] = useState('');
  
  // Tab state: 'thoughts' or 'gallery'
  const [activeTab, setActiveTab] = useState<'thoughts' | 'gallery'>('thoughts');
  
  // Gallery-specific upload state
  const [galleryImageUrl, setGalleryImageUrl] = useState('');
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState('');
  const [gallerySaving, setGallerySaving] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (authToken) {
      fetchThoughts();
    }
  }, [authToken, currentPage, debouncedSearch]);

  const fetchThoughts = async () => {
    if (!authToken) return;
    setLoading(true);
    const { items, total } = await getAdminThoughts(authToken, currentPage, ITEMS_PER_PAGE, debouncedSearch);
    setThoughts(items);
    setTotalThoughts(total);
    setLoading(false);
  };

  // Filter by date (client-side for now)
  const filteredThoughts = thoughts.filter(t => {
    if (startDate) {
      const start = new Date(startDate);
      if (new Date(t.created_at) < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(t.created_at) > end) return false;
    }
    return true;
  });

  // Use actual displayed count for pagination
  const displayedCount = filteredThoughts.length;
  const totalPages = Math.ceil((totalThoughts || displayedCount) / ITEMS_PER_PAGE);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Require text content for thoughts (gallery photos use the gallery form)
    if (!authToken || !content.trim()) return;

    setSaving(true);
    const newThought = await createThought(content, authToken, isVisible, imageUrl || undefined);

    if (newThought) {
      setContent('');
      setImageUrl('');
      setIsVisible(true);
      await fetchThoughts();
    }
    setSaving(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setLoginError('Please enter a password');
      return;
    }

    setLoggingIn(true);
    setLoginError('');

    const result = await verifyAdminPassword(password);

    if (result.success && result.token) {
      sessionStorage.setItem('admin_auth_token', result.token);
      setAuthToken(result.token);
      setPassword('');
    } else {
      setLoginError(result.message || 'Invalid password');
    }

    setLoggingIn(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth_token');
    setAuthToken(null);
    setPassword('');
  };

  // Open edit modal
  const openEditModal = (thought: Thought) => {
    setEditingThought(thought);
    setEditContent(thought.content);
    setEditImageUrl(thought.image_url || '');
    setEditIsVisible(thought.is_visible);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingThought(null);
    setEditContent('');
    setEditImageUrl('');
    setEditIsVisible(true);
  };

  // Handle update
  const handleUpdate = async () => {
    if (!authToken || !editingThought) return;
    
    setUpdating(true);
    const updated = await updateThought(editingThought.id, authToken, {
      content: editContent,
      image_url: editImageUrl,
      is_visible: editIsVisible,
    });
    
    if (updated) {
      await fetchThoughts();
      closeEditModal();
    }
    setUpdating(false);
  };

  // Toggle visibility directly
  const toggleVisibility = async (thought: Thought) => {
    if (!authToken) return;
    
    // Optimistically update UI
    const newVisibility = !thought.is_visible;
    setThoughts(prev => 
      prev.map(t => t.id === thought.id ? { ...t, is_visible: newVisibility } : t)
    );
    
    const updated = await updateThought(thought.id, authToken, {
      is_visible: newVisibility,
    });
    
    // If failed, revert
    if (!updated) {
      setThoughts(prev => 
        prev.map(t => t.id === thought.id ? { ...t, is_visible: thought.is_visible } : t)
      );
    }
  };

  // Handle delete
  const handleDelete = async (thoughtId: number) => {
    if (!authToken) return;
    
    setDeleting(true);
    const success = await deleteThought(thoughtId, authToken);
    
    if (success) {
      setThoughts(prev => prev.filter(t => t.id !== thoughtId));
    }
    setDeletingId(null);
    setDeleting(false);
  };

  // Handle file upload for create form
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authToken) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload JPG, PNG, GIF, or WebP.');
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 10MB.');
      return;
    }
    
    setUploading(true);
    setUploadError('');
    
    const result = await uploadImage(file, authToken);
    
    if (result.success && result.image_url) {
      setImageUrl(result.image_url);
    } else {
      setUploadError(result.error || 'Upload failed');
    }
    
    setUploading(false);
    // Reset file input
    e.target.value = '';
  };

  // Handle file upload for edit modal
  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authToken) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setEditUploadError('Invalid file type. Please upload JPG, PNG, GIF, or WebP.');
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setEditUploadError('File too large. Maximum size is 10MB.');
      return;
    }
    
    setEditUploading(true);
    setEditUploadError('');
    
    const result = await uploadImage(file, authToken);
    
    if (result.success && result.image_url) {
      setEditImageUrl(result.image_url);
    } else {
      setEditUploadError(result.error || 'Upload failed');
    }
    
    setEditUploading(false);
    // Reset file input
    e.target.value = '';
  };

  // Handle file upload for gallery
  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authToken) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setGalleryUploadError('Invalid file type. Please upload JPG, PNG, GIF, or WebP.');
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setGalleryUploadError('File too large. Maximum size is 10MB.');
      return;
    }
    
    setGalleryUploading(true);
    setGalleryUploadError('');
    
    const result = await uploadImage(file, authToken);
    
    if (result.success && result.image_url) {
      setGalleryImageUrl(result.image_url);
    } else {
      setGalleryUploadError(result.error || 'Upload failed');
    }
    
    setGalleryUploading(false);
    // Reset file input
    e.target.value = '';
  };

  // Submit gallery photo (image only, no text)
  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !galleryImageUrl.trim()) return;

    setGallerySaving(true);
    // Create thought with empty content - just the image
    const newPhoto = await createThought('', authToken, isVisible, galleryImageUrl);

    if (newPhoto) {
      setGalleryImageUrl('');
      await fetchThoughts();
    }
    setGallerySaving(false);
  };

  // Login form if not authenticated
  if (!authToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight-950 p-6">
        <Card className="max-w-md w-full p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-accent-500/20 flex items-center justify-center">
              <Lock className="text-accent-400" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-midnight-100 mb-2 text-center">Admin Login</h2>
          <p className="text-midnight-400 mb-6 text-center text-sm">
            Enter your password to access the admin panel
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError('');
                }}
                className="w-full px-4 py-3 rounded-lg bg-midnight-800 border border-midnight-700 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                autoFocus
                disabled={loggingIn}
              />
              {loginError && (
                <p className="mt-2 text-sm text-red-400">{loginError}</p>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loggingIn || !password.trim()}
            >
              {loggingIn ? 'Verifying...' : 'Login'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-midnight-100 mb-2">Admin Panel</h1>
            <p className="text-midnight-400">Manage your thoughts and updates</p>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="/" 
              className="text-sm text-accent-400 hover:text-accent-300 transition-colors"
            >
              ← Back to Site
            </a>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('thoughts')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'thoughts'
                ? 'bg-accent-500 text-midnight-950 shadow-lg shadow-accent-500/30'
                : 'bg-midnight-800 text-midnight-300 hover:bg-midnight-700'
            }`}
          >
            <MessageSquare size={18} />
            Thoughts
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'gallery'
                ? 'bg-coral-500 text-white shadow-lg shadow-coral-500/30'
                : 'bg-midnight-800 text-midnight-300 hover:bg-midnight-700'
            }`}
          >
            <ImageIcon size={18} />
            Gallery Photos
          </button>
        </div>

        {/* Gallery Upload Form */}
        {activeTab === 'gallery' && (
          <Card className="p-6 mb-8 border-coral-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center">
                <ImageIcon size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-midnight-100">Add Gallery Photo</h2>
                <p className="text-sm text-midnight-400">Upload photos directly to the gallery section</p>
              </div>
            </div>
            <form onSubmit={handleGallerySubmit} className="space-y-4">
              {/* File Upload */}
              <div>
                <label className={`flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                  galleryUploading 
                    ? 'border-coral-500 bg-coral-500/10' 
                    : 'border-midnight-600 hover:border-coral-500 hover:bg-midnight-800'
                }`}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleGalleryFileUpload}
                    className="hidden"
                    disabled={galleryUploading}
                  />
                  {galleryUploading ? (
                    <>
                      <Loader2 size={32} className="animate-spin text-coral-400" />
                      <span className="text-coral-400">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="text-midnight-400" />
                      <span className="text-midnight-300">Click to upload photo</span>
                      <span className="text-xs text-midnight-500">JPG, PNG, GIF, WebP (max 10MB)</span>
                    </>
                  )}
                </label>
                {galleryUploadError && (
                  <p className="mt-2 text-sm text-red-400">{galleryUploadError}</p>
                )}
              </div>
              
              {/* Preview - Show uploaded image */}
              {galleryImageUrl && (
                <div className="flex items-center gap-4 p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl">
                  <img 
                    src={getXanoFileUrl(galleryImageUrl)} 
                    alt="Preview" 
                    className="h-24 w-24 rounded-lg object-cover border border-midnight-700"
                  />
                  <div className="flex-1">
                    <p className="text-teal-400 font-medium flex items-center gap-2">
                      <Check size={16} />
                      Photo uploaded successfully!
                    </p>
                    <p className="text-midnight-400 text-sm mt-1">Ready to post to gallery</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGalleryImageUrl('')}
                    className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                    title="Remove photo"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-midnight-200">Visibility:</label>
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    isVisible
                      ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                      : 'bg-midnight-800 border-midnight-700 text-midnight-400'
                  }`}
                >
                  {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                  {isVisible ? 'Visible' : 'Hidden'}
                </button>
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                disabled={gallerySaving || !galleryImageUrl.trim()}
                className="bg-coral-500 hover:bg-coral-600"
              >
                <ImagePlus size={16} className="mr-2" />
                {gallerySaving ? 'Posting...' : 'Post Photo'}
              </Button>
            </form>
          </Card>
        )}

        {/* Create Thought Form */}
        {activeTab === 'thoughts' && (
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-midnight-100">Create New Thought</h2>
              <p className="text-sm text-midnight-400">Share your thoughts (with optional photo)</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-midnight-200 mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-midnight-800 border border-midnight-700 text-midnight-100 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder="Write your thought or update here... (required)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-midnight-200 mb-2">
                <div className="flex items-center gap-2">
                  <ImagePlus size={16} />
                  Image (optional)
                </div>
              </label>
              
              {/* File Upload */}
              <div className="mb-3">
                <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                  uploading 
                    ? 'border-accent-500 bg-accent-500/10' 
                    : 'border-midnight-600 hover:border-accent-500 hover:bg-midnight-800'
                }`}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <>
                      <Loader2 size={20} className="animate-spin text-accent-400" />
                      <span className="text-accent-400">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} className="text-midnight-400" />
                      <span className="text-midnight-300">Click to upload image</span>
                    </>
                  )}
                </label>
                {uploadError && (
                  <p className="mt-1 text-sm text-red-400">{uploadError}</p>
                )}
              </div>
              
              {/* Or use URL */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px bg-midnight-700" />
                <span className="text-xs text-midnight-500">or paste URL</span>
                <div className="flex-1 h-px bg-midnight-700" />
              </div>
              
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-midnight-400" size={16} />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-midnight-800 border border-midnight-700 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="https://example.com/image.jpg"
                  disabled={uploading}
                />
              </div>
              
              {imageUrl && (
                <div className="mt-3 relative inline-block">
                  <img 
                    src={getXanoFileUrl(imageUrl)} 
                    alt="Preview" 
                    className="h-24 w-auto rounded-lg object-cover border border-midnight-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              <p className="text-xs text-midnight-400 mt-2">
                Upload directly or paste a URL. Supports JPG, PNG, GIF, WebP (max 10MB).
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-midnight-200">Visibility:</label>
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  isVisible
                    ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                    : 'bg-midnight-800 border-midnight-700 text-midnight-400'
                }`}
              >
                {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                {isVisible ? 'Visible' : 'Hidden'}
              </button>
            </div>

            <Button type="submit" variant="primary" disabled={saving || !content.trim()}>
              <Send size={16} className="mr-2" />
              {saving ? 'Posting...' : 'Post Thought'}
            </Button>
          </form>
        </Card>
        )}

        {/* Search and Filter */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-midnight-400" size={18} />
                <input
                  type="text"
                  placeholder="Search thoughts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-midnight-800 border border-midnight-700 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-midnight-400" size={18} />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-midnight-800 border border-midnight-700 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="Start date"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-midnight-400" size={18} />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-midnight-800 border border-midnight-700 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  placeholder="End date"
                />
              </div>
            </div>
          </div>
          {(searchQuery || startDate || endDate) && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-midnight-400">
                {filteredThoughts.length} result{filteredThoughts.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-sm text-accent-400 hover:text-accent-300"
              >
                Clear filters
              </button>
            </div>
          )}
        </Card>

        {/* Thoughts List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-midnight-100">
              All Items ({filteredThoughts.length})
            </h2>
            <div className="flex items-center gap-4 text-sm text-midnight-400">
              <span className="flex items-center gap-1">
                <MessageSquare size={14} className="text-accent-400" />
                {filteredThoughts.filter(t => t.content && t.content.trim()).length} thoughts
              </span>
              <span className="flex items-center gap-1">
                <ImageIcon size={14} className="text-coral-400" />
                {filteredThoughts.filter(t => !t.content || !t.content.trim()).length} photos
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
            </div>
          ) : filteredThoughts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-midnight-400">No thoughts found</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredThoughts.map((thought) => (
                <Card key={thought.id} className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail if has image */}
                    {thought.image_url && (
                      <div className="flex-shrink-0">
                        <img
                          src={getXanoFileUrl(thought.image_url)}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg border border-midnight-700"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {/* Type badge - Gallery Photo vs Thought */}
                        {thought.content && thought.content.trim() ? (
                          <span className="px-2 py-1 rounded text-xs bg-accent-500/20 text-accent-400 flex items-center gap-1">
                            <MessageSquare size={12} />
                            Thought
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs bg-coral-500/20 text-coral-400 flex items-center gap-1">
                            <ImageIcon size={12} />
                            Gallery Photo
                          </span>
                        )}
                        <button
                          onClick={() => toggleVisibility(thought)}
                          className={`px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                            thought.is_visible
                              ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
                              : 'bg-midnight-700 text-midnight-400 hover:bg-midnight-600'
                          }`}
                          title={thought.is_visible ? 'Click to hide' : 'Click to show'}
                        >
                          {thought.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                          {thought.is_visible ? 'Visible' : 'Hidden'}
                        </button>
                        {thought.content && thought.image_url && (
                          <span className="px-2 py-1 rounded text-xs bg-midnight-700 text-midnight-300 flex items-center gap-1">
                            <ImagePlus size={12} />
                            +Image
                          </span>
                        )}
                        <span className="text-xs text-midnight-400">
                          {new Date(thought.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {thought.content && (
                      <p className="text-midnight-200 whitespace-pre-wrap text-sm">
                        {thought.content}
                      </p>
                      )}
                      {(!thought.content || !thought.content.trim()) && thought.image_url && (
                        <p className="text-midnight-400 text-sm italic">Gallery photo (image only)</p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEditModal(thought)}
                        className="p-2 rounded-lg bg-midnight-700 text-midnight-300 hover:bg-midnight-600 hover:text-midnight-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeletingId(thought.id)}
                        className="p-2 rounded-lg bg-midnight-700 text-midnight-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Delete Confirmation */}
                  {deletingId === thought.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-midnight-700"
                    >
                      <p className="text-sm text-red-400 mb-3">
                        Are you sure you want to delete this thought? This action cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDelete(thought.id)}
                          variant="primary"
                          size="sm"
                          className="bg-red-500 hover:bg-red-600"
                          disabled={deleting}
                        >
                          {deleting ? 'Deleting...' : 'Yes, Delete'}
                        </Button>
                        <Button
                          onClick={() => setDeletingId(null)}
                          variant="outline"
                          size="sm"
                          disabled={deleting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Pagination - always show when there are items */}
          {(totalThoughts > 0 || thoughts.length > 0) && (
            <div className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-midnight-700">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-midnight-800 text-midnight-300 hover:bg-midnight-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft size={18} />
                <span className="text-sm">Prev</span>
              </button>
              
              <div className="flex items-center gap-1">
                {/* Smart pagination: show first, last, and nearby pages */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Always show first page, last page, and pages around current
                  const showPage = page === 1 || 
                                   page === totalPages || 
                                   Math.abs(page - currentPage) <= 1;
                  
                  // Show ellipsis
                  const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                  const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;
                  
                  if (showEllipsisBefore || showEllipsisAfter) {
                    return (
                      <span key={page} className="px-2 text-midnight-500">
                        ...
                      </span>
                    );
                  }
                  
                  if (!showPage) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-accent-500 text-midnight-950'
                          : 'bg-midnight-800 text-midnight-300 hover:bg-midnight-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-midnight-800 text-midnight-300 hover:bg-midnight-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <span className="text-sm">Next</span>
                <ChevronRight size={18} />
              </button>
              
              {/* Page info */}
              <span className="ml-4 text-sm text-midnight-400">
                Page {currentPage} of {totalPages || 1} ({totalThoughts || thoughts.length} items)
              </span>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingThought && (
          <div className="fixed inset-0 bg-midnight-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xl"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-midnight-100">Edit Thought</h3>
                  <button
                    onClick={closeEditModal}
                    className="p-2 rounded-lg hover:bg-midnight-700 text-midnight-400 hover:text-midnight-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-midnight-200 mb-2">Content</label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-midnight-800 border border-midnight-700 text-midnight-100 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-accent-500"
                      placeholder="Text content (optional if image provided)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight-200 mb-2">
                      <div className="flex items-center gap-2">
                        <ImagePlus size={16} />
                        Image
                      </div>
                    </label>
                    
                    {/* File Upload */}
                    <div className="mb-3">
                      <label className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                        editUploading 
                          ? 'border-accent-500 bg-accent-500/10' 
                          : 'border-midnight-600 hover:border-accent-500 hover:bg-midnight-800'
                      }`}>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleEditFileUpload}
                          className="hidden"
                          disabled={editUploading}
                        />
                        {editUploading ? (
                          <>
                            <Loader2 size={20} className="animate-spin text-accent-400" />
                            <span className="text-accent-400">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={20} className="text-midnight-400" />
                            <span className="text-midnight-300">Click to upload image</span>
                          </>
                        )}
                      </label>
                      {editUploadError && (
                        <p className="mt-1 text-sm text-red-400">{editUploadError}</p>
                      )}
                    </div>
                    
                    {/* Or use URL */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-px bg-midnight-700" />
                      <span className="text-xs text-midnight-500">or paste URL</span>
                      <div className="flex-1 h-px bg-midnight-700" />
                    </div>
                    
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-midnight-400" size={16} />
                      <input
                        type="url"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-midnight-800 border border-midnight-700 text-midnight-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                        placeholder="https://example.com/image.jpg"
                        disabled={editUploading}
                      />
                    </div>
                    {editImageUrl && (
                      <div className="mt-3 relative inline-block">
                        <img 
                          src={getXanoFileUrl(editImageUrl)} 
                          alt="Preview" 
                          className="h-24 w-auto rounded-lg object-cover border border-midnight-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setEditImageUrl('')}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-midnight-200">Visibility:</label>
                    <button
                      type="button"
                      onClick={() => setEditIsVisible(!editIsVisible)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        editIsVisible
                          ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                          : 'bg-midnight-800 border-midnight-700 text-midnight-400'
                      }`}
                    >
                      {editIsVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                      {editIsVisible ? 'Visible' : 'Hidden'}
                    </button>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      onClick={handleUpdate} 
                      variant="primary"
                      disabled={updating || (!editContent.trim() && !editImageUrl.trim())}
                    >
                      <Save size={16} className="mr-2" />
                      {updating ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button onClick={closeEditModal} variant="outline" disabled={updating}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
