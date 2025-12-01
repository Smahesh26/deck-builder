'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Upload, FileImage, Type, 
  ArrowRight, CheckCircle, Link, 
  Plus, X, Sparkles, Building2, ArrowLeft
} from 'lucide-react';

interface ProductData {
  id: string;
  name: string;
  description: string;
  sku: string;
  image: File | null;
  imagePreview?: string;
}

interface WebsiteData {
  title: string;
  colors: string[];
  fonts: string[];
  logo: string;
  description: string;
}

export default function ProjectBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState(1); // Default template
  const [projectName, setProjectName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [businessDetails, setBusinessDetails] = useState({
    companyName: '',
    tagline: '',
    description: ''
  });
  const [exportFormat, setExportFormat] = useState('ppt'); // Default format

  const handleWebsiteAnalysis = async () => {
    if (!websiteUrl) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze/website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: websiteUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        setWebsiteData(data);
        // Auto-fill business details if not already filled
        if (!businessDetails.companyName && data.title) {
          setBusinessDetails(prev => ({
            ...prev,
            companyName: data.title,
            description: data.description || ''
          }));
        }
      } else {
        console.error('Analysis failed:', data.error);
        alert('Failed to analyze website. Please check the URL and try again.');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze website. Please check the URL and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addProduct = () => {
    const newProduct: ProductData = {
      id: `product_${Date.now()}`,
      name: '',
      description: '',
      sku: '',
      image: null
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, field: keyof ProductData, value: any) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    ));
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleLogoUpload = (file: File) => {
    setLogo(file);
    const imageUrl = URL.createObjectURL(file);
    setLogoPreview(imageUrl);
  };

  const handleFileUpload = useCallback((productId: string, file: File) => {
    const imageUrl = URL.createObjectURL(file);
    updateProduct(productId, 'image', file);
    updateProduct(productId, 'imagePreview', imageUrl);
  }, []);

  const handleSubmit = async () => {
    // Validate required fields
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    if (!websiteData) {
      alert('Please analyze a website first');
      return;
    }

    if (products.length === 0) {
      alert('Please add at least one product');
      return;
    }

    // Check if all products have required fields
    const incompleteProducts = products.filter(p => !p.name);
    if (incompleteProducts.length > 0) {
      alert('Please complete all product information (name is required)');
      return;
    }

    // Send all data to backend API for presentation generation
    try {
      const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          websiteData,
          logo,
          products,
          businessDetails,
          exportFormat,
          selectedTemplate
        })
      });

      if (response.ok) {
        // For PPT format, response is the file itself
        if (exportFormat === 'ppt') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${projectName}-presentation.pptx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          // For other formats, handle JSON response
          const result = await response.json();
          if (result.downloadUrl) {
            window.location.href = result.downloadUrl;
          } else {
            alert(result.message || 'Presentation generated successfully');
          }
        }
      } else {
        // Handle error response
        const result = await response.json();
        alert(result.message || result.error || 'Failed to generate presentation');
      }
    } catch (error) {
          let errorMsg = '';
          if (error && typeof error === 'object' && 'message' in error) {
            errorMsg = (error as any).message;
          } else {
            errorMsg = String(error);
          }
          alert('Error generating presentation: ' + errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Export Format Selection */}
      <div className="max-w-4xl mx-auto px-6 pt-6 pb-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2 font-heading">Export Format</label>
        <select
          value={exportFormat}
          onChange={e => setExportFormat(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans"
        >
          <option value="ppt">PowerPoint (.pptx)</option>
          <option value="pdf">PDF (.pdf)</option>
          <option value="image">Image (.png)</option>
          <option value="gdocs">Google Docs</option>
          <option value="gslides">Google Slides</option>
        </select>
      </div>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-24 left-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-white/30 sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-heading">Create New Project</h1>
              <p className="text-gray-600 mt-2 font-sans text-lg">Provide your data and let AI create your presentation</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/dashboard'}
              className="text-gray-600 hover:text-gray-900 transition-colors font-sans flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/40 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10 relative z-10">
        {/* Project Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-heading">Project Name</h2>
              <p className="text-gray-600 font-sans">Give your presentation a name</p>
            </div>
          </div>
          
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g., Q4 Business Review, Product Launch Deck"
            className="w-full px-6 py-4 bg-white/50 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 font-sans text-lg text-gray-900 placeholder-gray-500 shadow-lg transition-all duration-300 hover:bg-white/70"
          />
        </motion.div>

        {/* Website Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-heading">Website Analysis</h2>
              <p className="text-gray-600 font-sans">We'll extract your brand colors, fonts, and logo</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 font-sans text-gray-900 placeholder-gray-500 shadow-lg transition-all duration-300 hover:bg-white/70"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWebsiteAnalysis}
                disabled={!websiteUrl || isAnalyzing}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-heading relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </span>
              </motion.button>
            </div>

            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 text-center"
              >
                <div className="relative mx-auto mb-4 w-12 h-12">
                  <div className="absolute inset-0 animate-spin w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full"></div>
                  <div className="absolute inset-2 animate-pulse w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-60"></div>
                </div>
                <p className="text-blue-800 font-bold text-lg font-heading">Analyzing your website...</p>
                <p className="text-blue-600 text-sm mt-2 font-sans">Extracting brand colors, fonts, and content</p>
              </motion.div>
            )}

            {websiteData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 font-heading">Analysis Complete!</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="font-sans text-gray-700"><strong className="text-green-800">Company:</strong> {websiteData.title}</p>
                    <p className="font-sans text-gray-700"><strong className="text-green-800">Colors Found:</strong> {(websiteData.colors ?? []).length}</p>
                    <p className="font-sans text-gray-700"><strong className="text-green-800">Fonts:</strong> {
                      (websiteData.fonts ?? [])
                        .map(f => f.trim())
                        .filter(f => f && !f.startsWith('var(') && !f.startsWith('-') && !f.includes('!important') && !f.includes('inherit') && !f.includes('global-typography'))
                        .filter((f, i, arr) => arr.indexOf(f) === i)
                        .join(', ')
                    }
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-bold text-green-800 mb-3 font-heading">Brand Colors:</p>
                    <div className="flex space-x-2">
                      {(websiteData.colors ?? []).slice(0, 5).map((color: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="w-10 h-10 rounded-xl border-2 border-white shadow-lg transform hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Logo Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ y: -5 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4">
              <FileImage className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-heading">Company Logo</h2>
              <p className="text-gray-600 font-sans">Upload your company logo (optional)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Logo Preview */}
            <div>
              {logoPreview ? (
                <div className="relative">
                  <img 
                    src={logoPreview} 
                    alt="Company Logo"
                    className="w-full h-32 object-contain bg-white/50 rounded-2xl border-2 border-white/40 p-4 shadow-lg"
                  />
                  <button
                    onClick={() => {
                      setLogo(null);
                      setLogoPreview('');
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-dashed border-emerald-300 flex items-center justify-center">
                  <div className="text-center">
                    <FileImage className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-600 text-sm font-sans">Logo preview will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Area */}
            <div>
              <div className="border-3 border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 text-center hover:border-emerald-400 hover:bg-gradient-to-br hover:from-emerald-100 hover:to-teal-100 transition-all duration-300 shadow-lg">
                <FileImage className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <p className="text-emerald-700 mb-4 font-sans">Drop your logo here or click to upload</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 inline-block font-heading"
                >
                  Choose Logo
                </label>
                <p className="text-emerald-600 text-xs mt-3 font-sans">Supports PNG, JPG, SVG (Max 5MB)</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-heading">Product Upload</h2>
                <p className="text-gray-600 font-sans">Add your products with images and details</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={addProduct}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 flex items-center space-x-2 font-heading relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Add Product</span>
            </motion.button>
          </div>

          <div className="space-y-4">
            {products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FileImage className="w-10 h-10 text-purple-400" />
              </div>
              <p className="font-sans text-lg">No products added yet</p>
              <p className="font-sans text-sm text-gray-400 mt-1">Click "Add Product" to start building your deck</p>
            </div>
            ) : (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/60 backdrop-blur-sm border-2 border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 font-heading">Product {index + 1}</h3>
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 font-heading">Product Image *</label>
                      {product.imagePreview ? (
                        <div className="relative">
                          <img 
                            src={product.imagePreview} 
                            alt={product.name}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => {
                              updateProduct(product.id, 'image', null);
                              updateProduct(product.id, 'imagePreview', '');
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="border-3 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-center hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 transition-all duration-300 shadow-lg">
                          <FileImage className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(product.id, file);
                            }}
                            className="hidden"
                            id={`file-${product.id}`}
                          />
                          <label
                            htmlFor={`file-${product.id}`}
                            className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 inline-block font-heading"
                          >
                            Upload Image
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 font-heading">Product Name *</label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                          placeholder="e.g., Wireless Headphones"
                          className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 font-sans text-gray-900 placeholder-gray-500 shadow-md transition-all duration-300 hover:bg-white/80"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1 font-heading">SKU Code</label>
                          <input
                            type="text"
                            value={product.sku}
                            onChange={(e) => updateProduct(product.id, 'sku', e.target.value)}
                            placeholder="e.g., WH-001"
                            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 font-sans text-gray-900 placeholder-gray-500 shadow-md transition-all duration-300 hover:bg-white/80"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1 font-heading">Description</label>
                          <input
                            type="text"
                            value={product.description}
                            onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                            placeholder="Brief description..."
                            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 font-sans text-gray-900 placeholder-gray-500 shadow-md transition-all duration-300 hover:bg-white/80"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Business Details (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -5 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mr-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-heading">Business Details</h2>
              <p className="text-gray-600 font-sans">Optional: Add or override company information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 font-heading">Company Name</label>
              <input
                type="text"
                value={businessDetails.companyName}
                onChange={(e) => setBusinessDetails({...businessDetails, companyName: e.target.value})}
                placeholder="Your Company Name"
                className="w-full px-6 py-4 bg-white/50 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 font-sans text-gray-900 placeholder-gray-500 shadow-lg transition-all duration-300 hover:bg-white/70"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 font-heading">Tagline</label>
              <input
                type="text"
                value={businessDetails.tagline}
                onChange={(e) => setBusinessDetails({...businessDetails, tagline: e.target.value})}
                placeholder="Your company tagline"
                className="w-full px-6 py-4 bg-white/50 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 font-sans text-gray-900 placeholder-gray-500 shadow-lg transition-all duration-300 hover:bg-white/70"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2 font-heading">Company Description</label>
              <textarea
                value={businessDetails.description}
                onChange={(e) => setBusinessDetails({...businessDetails, description: e.target.value})}
                placeholder="Brief description of your company..."
                rows={4}
                className="w-full px-6 py-4 bg-white/50 backdrop-blur-sm border-2 border-white/30 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 font-sans text-gray-900 placeholder-gray-500 shadow-lg transition-all duration-300 hover:bg-white/70 resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          {/* Template Selection */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-700 mb-2 font-heading">Choose a Template</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-center">
              {[1,2,3,4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSelectedTemplate(num)}
                  className={`border-4 rounded-2xl p-2 transition-all duration-300 shadow-lg hover:shadow-xl ${selectedTemplate === num ? 'border-indigo-500' : 'border-transparent'}`}
                  style={{ background: `url(/templates/previews/template${num}.png) center/cover` }}
                  aria-label={`Template ${num}`}
                >
                  <div className="bg-white/80 rounded-xl px-2 py-1 text-xs font-bold text-indigo-700 mt-24 mx-auto w-fit">Template {num}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Export Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-heading">Export Format</label>
            <select
              value={exportFormat}
              onChange={e => setExportFormat(e.target.value)}
              className="w-full max-w-xs mx-auto px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans"
            >
              <option value="ppt">PowerPoint (.pptx)</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="image">Image (.png)</option>
              <option value="gdocs">Google Docs</option>
              <option value="gslides">Google Slides</option>
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-16 py-5 rounded-3xl font-bold text-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center space-x-4 mx-auto font-heading relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Sparkles className="w-7 h-7 relative z-10" />
            <span className="relative z-10">Create Presentation</span>
            <ArrowRight className="w-7 h-7 relative z-10" />
          </motion.button>
          
          <p className="text-gray-600 mt-4 font-sans text-lg">
            Our AI will analyze your data and create a stunning presentation
          </p>
        </motion.div>
  const [selectedTemplate, setSelectedTemplate] = useState(1); // Default template
      </div>
    </div>
  );
}