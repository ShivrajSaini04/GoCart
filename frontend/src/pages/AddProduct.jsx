import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Package,
  IndianRupee,
  Layers,
  Image as ImageIcon,
  Sparkles,
  Eye,
  Check
} from 'lucide-react';
import apiService from '../services/api';
import '../style/addProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Men',
    stock: '10',
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdProduct, setCreatedProduct] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB limit.');
      return;
    }

    setForm((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
    setImageMeta({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
    });
    setError('');
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setForm((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    setImageMeta(null);
  };

  const resetForm = () => {
    removeImage();
    setForm({
      name: '',
      description: '',
      price: '',
      category: 'Men',
      stock: '10',
      image: null,
    });
    setCreatedProduct(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = form.name.trim();
    const trimmedDesc = form.description.trim();
    const numPrice = Number(form.price);
    const numStock = Number(form.stock);

    if (!trimmedName) {
      setError('Please enter a sneaker product name.');
      return;
    }

    if (!form.category) {
      setError('Please select a target category (Men / Women).');
      return;
    }

    if (!form.price || isNaN(numPrice) || numPrice <= 0) {
      setError('Please enter a valid price in INR.');
      return;
    }

    if (form.stock === '' || isNaN(numStock) || numStock < 0) {
      setError('Please enter a valid inventory stock count.');
      return;
    }

    if (!trimmedDesc) {
      setError('Please provide a short description for this sneaker.');
      return;
    }

    if (!form.image) {
      setError('Please upload a product photograph.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', trimmedName);
      formData.append('description', trimmedDesc);
      formData.append('price', numPrice);
      formData.append('category', form.category);
      formData.append('stock', numStock);
      formData.append('image', form.image);

      const response = await apiService.createProduct(formData);
      setCreatedProduct(response);
    } catch (err) {
      setError(err.message || 'Failed to upload product. Check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const numericPrice = Number(form.price) || 0;
  const numericStock = Number(form.stock) || 0;

  return (
    <div className="add-product-page">
      {/* ── Top Header ── */}
      <header className="add-product-header">
        <div className="add-product-header-inner">
          <div className="add-product-header-left">
            <Link to="/admin/dashboard" className="add-product-back-btn">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div>
              <div className="add-product-breadcrumb">
                <Link to="/admin/dashboard">Admin</Link>
                <span className="add-product-breadcrumb-sep">/</span>
                <Link to="/admin/dashboard">Products</Link>
                <span className="add-product-breadcrumb-sep">/</span>
                <span>Add Sneaker</span>
              </div>
              <h1 className="add-product-header-title">Add New Sneaker</h1>
            </div>
          </div>
          <div>
            <span className="add-product-badge">
              <Sparkles size={14} /> GoCart Inventory
            </span>
          </div>
        </div>
      </header>

      <main className="add-product-container">
        {/* ── Success Screen ── */}
        {createdProduct ? (
          <div className="add-product-success-card">
            <div className="success-icon-badge">
              <CheckCircle2 size={40} />
            </div>
            <h2>Sneaker Published Successfully!</h2>
            <p>
              <strong>{createdProduct.name}</strong> has been added to the GoCart catalogue with{' '}
              {createdProduct.stock} pairs in stock at ₹
              {Number(createdProduct.price).toLocaleString('en-IN')}.
            </p>
            <div className="success-actions-row">
              <button
                type="button"
                className="btn-primary-custom"
                onClick={resetForm}
              >
                <Package size={18} /> Add Another Sneaker
              </button>
              <Link to="/admin/dashboard" className="btn-secondary-custom">
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* ── Main Form Grid ── */
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="add-product-alert add-product-alert-error" role="alert">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="add-product-grid">
              {/* ── Left Column: Form Fields ── */}
              <div className="add-product-form-col">
                {/* Card 1: Sneaker Information */}
                <section className="add-product-card">
                  <div className="add-product-card-header">
                    <div className="add-product-card-icon">
                      <Layers size={20} />
                    </div>
                    <div>
                      <h2 className="add-product-card-title">Sneaker Details</h2>
                      <p className="add-product-card-subtitle">
                        Brand, model name, and category classification
                      </p>
                    </div>
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom" htmlFor="product-name">
                      <span>
                        Sneaker Name <span className="required-star">*</span>
                      </span>
                      <span className="form-label-hint">e.g. Nike Dunk Low Retro</span>
                    </label>
                    <input
                      id="product-name"
                      type="text"
                      name="name"
                      className="form-control-custom"
                      placeholder="e.g. Nike Air Jordan 1 Retro High OG"
                      value={form.name}
                      onChange={handleChange}
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group-custom">
                      <label className="form-label-custom" htmlFor="product-category">
                        <span>
                          Category <span className="required-star">*</span>
                        </span>
                      </label>
                      <select
                        id="product-category"
                        name="category"
                        className="form-select-custom"
                        value={form.category}
                        onChange={handleChange}
                        disabled={submitting}
                        required
                      >
                        <option value="Men">Men's Sneakers</option>
                        <option value="Women">Women's Sneakers</option>
                      </select>
                    </div>

                    <div className="form-group-custom">
                      <label className="form-label-custom" htmlFor="product-stock">
                        <span>
                          Stock Inventory <span className="required-star">*</span>
                        </span>
                      </label>
                      <input
                        id="product-stock"
                        type="number"
                        name="stock"
                        min="0"
                        className="form-control-custom"
                        placeholder="e.g. 24"
                        value={form.stock}
                        onChange={handleChange}
                        disabled={submitting}
                        required
                      />
                      <div className="form-field-info">
                        {numericStock <= 0 ? (
                          <span style={{ color: '#dc2626' }}>Will be marked Out of Stock</span>
                        ) : numericStock < 5 ? (
                          <span style={{ color: '#d97706' }}>Will show 'Only {numericStock} Left' badge</span>
                        ) : (
                          <span>In Stock inventory count</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom" htmlFor="product-desc">
                      <span>
                        Description & Story <span className="required-star">*</span>
                      </span>
                    </label>
                    <textarea
                      id="product-desc"
                      name="description"
                      rows={4}
                      className="form-textarea-custom"
                      placeholder="Describe the silhouette, materials (e.g. genuine leather, Zoom Air cushioning), colorway, and sizing recommendation..."
                      value={form.description}
                      onChange={handleChange}
                      disabled={submitting}
                      required
                    />
                  </div>
                </section>

                {/* Card 2: Pricing */}
                <section className="add-product-card">
                  <div className="add-product-card-header">
                    <div className="add-product-card-icon">
                      <IndianRupee size={20} />
                    </div>
                    <div>
                      <h2 className="add-product-card-title">Pricing</h2>
                      <p className="add-product-card-subtitle">
                        Retail selling price and shipping rule eligibility
                      </p>
                    </div>
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom" htmlFor="product-price">
                      <span>
                        Price (INR) <span className="required-star">*</span>
                      </span>
                      <span className="form-label-hint">All inclusive of taxes</span>
                    </label>
                    <div className="form-input-prefix-wrapper">
                      <span className="form-input-prefix">₹</span>
                      <input
                        id="product-price"
                        type="number"
                        name="price"
                        min="1"
                        step="1"
                        className="form-control-custom"
                        placeholder="8995"
                        value={form.price}
                        onChange={handleChange}
                        disabled={submitting}
                        required
                      />
                    </div>
                    <div className="form-field-info shipping-tag">
                      {numericPrice >= 999 ? (
                        <>
                          <Check size={14} /> Eligible for Free Shipping on GoCart (&gt; ₹999)
                        </>
                      ) : numericPrice > 0 ? (
                        <>Standard shipping fee applies (&lt; ₹999 threshold)</>
                      ) : null}
                    </div>
                  </div>
                </section>
              </div>

              {/* ── Right Column: Media Upload & Live Storefront Preview ── */}
              <div className="add-product-preview-col">
                {/* Card 3: Image Upload */}
                <section className="add-product-card">
                  <div className="add-product-card-header">
                    <div className="add-product-card-icon">
                      <ImageIcon size={20} />
                    </div>
                    <div>
                      <h2 className="add-product-card-title">Sneaker Image</h2>
                      <p className="add-product-card-subtitle">
                        Primary high-res photograph
                      </p>
                    </div>
                  </div>

                  {!imagePreview ? (
                    <div
                      className={`upload-zone ${isDragging ? 'has-drag' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleFileInput}
                        disabled={submitting}
                      />
                      <div className="upload-zone-content">
                        <div className="upload-zone-icon">
                          <Upload size={26} />
                        </div>
                        <p className="upload-zone-text">
                          Drag sneaker photo here or <span>browse files</span>
                        </p>
                        <p className="upload-zone-sub">
                          High-resolution photograph with clean or white background recommended
                        </p>
                        <div className="upload-badges">
                          <span className="upload-format-badge">JPG</span>
                          <span className="upload-format-badge">PNG</span>
                          <span className="upload-format-badge">WEBP</span>
                          <span className="upload-format-badge">MAX 5MB</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="image-preview-container">
                        <img
                          src={imagePreview}
                          alt="Sneaker Preview"
                          className="image-preview-img"
                        />
                        <div className="image-preview-overlay">
                          <button
                            type="button"
                            className="image-preview-btn"
                            onClick={removeImage}
                            title="Remove image"
                            aria-label="Remove image"
                            disabled={submitting}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      {imageMeta && (
                        <div className="image-file-meta">
                          <span className="image-file-meta-name">
                            {imageMeta.name}
                          </span>
                          <span>{imageMeta.size}</span>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Card 4: Storefront Live Preview */}
                <div className="storefront-preview-wrapper">
                  <div className="storefront-preview-header">
                    <span className="storefront-preview-label">
                      <Eye size={13} style={{ marginRight: 5, verticalAlign: -1 }} /> Storefront Preview
                    </span>
                    <span className="storefront-preview-chip">Live Preview</span>
                  </div>

                  <div className="mock-product-card">
                    <div className="mock-card-image">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Card preview" />
                      ) : (
                        <div className="mock-card-placeholder">
                          <ImageIcon size={36} />
                          <span>Photo will appear here</span>
                        </div>
                      )}
                      <span className="mock-category-tag">
                        {form.category}
                      </span>
                      {numericStock <= 0 ? (
                        <span className="mock-stock-tag out-of-stock" style={{ background: '#fee2e2', color: '#b91c1c' }}>
                          Out of Stock
                        </span>
                      ) : numericStock < 5 ? (
                        <span className="mock-stock-tag low-stock">
                          Only {numericStock} Left
                        </span>
                      ) : (
                        <span className="mock-stock-tag in-stock">
                          In Stock
                        </span>
                      )}
                    </div>

                    <div className="mock-card-body">
                      <h3 className="mock-card-title">
                        {form.name.trim() || 'Sneaker Title'}
                      </h3>
                      <p className="mock-card-desc">
                        {form.description.trim() || 'Sneaker description and material details...'}
                      </p>
                      <div className="mock-card-footer">
                        <span className="mock-card-price">
                          ₹{numericPrice > 0 ? numericPrice.toLocaleString('en-IN') : '0'}
                        </span>
                        <button type="button" className="mock-card-btn">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Actions Bar ── */}
            <div className="add-product-actions-bar">
              <Link to="/admin/dashboard" className="btn-secondary-custom">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn-primary-custom"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="btn-spinner" /> Uploading to Cloudinary & Publishing...
                  </>
                ) : (
                  <>
                    <Upload size={17} /> Publish Sneaker to Store
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default AddProduct;
