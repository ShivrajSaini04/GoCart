import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import apiService from '../services/api';
import '../style/addProduct.css';

const AddProduct = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: null,
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false); const [uploading, setUploading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleFileChange = (event) => {
        setForm((prev) => ({ ...prev, image: event.target.files?.[0] || null }));
        setError('');
        setSuccess('');
    };

    const removeImage = () => {
        setForm((prev) => ({ ...prev, image: null }));
    };

    const previewImage = () => {
        if (!form.image) return null;
        return URL.createObjectURL(form.image);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        if (!form.name.trim()) {
            setError('Product name is required.');
            setSubmitting(false);
            return;
        }
        if (!form.description.trim()) {
            setError('Description is required.');
            setSubmitting(false);
            return;
        }
        if (!form.price || Number(form.price) <= 0) {
            setError('Enter a valid price.');
            setSubmitting(false);
            return;
        }
        if (!form.category) {
            setError('Please select a category.');
            setSubmitting(false);
            return;
        }
        if (!form.stock || Number(form.stock) < 0) {
            setError('Enter a valid stock number.');
            setSubmitting(false);
            return;
        }
        if (!form.image) {
            setError('Please upload a product image.');
            setSubmitting(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', form.name.trim());
            formData.append('description', form.description.trim());
            formData.append('price', Number(form.price));
            formData.append('category', form.category);
            formData.append('stock', Number(form.stock));
            formData.append('image', form.image);

            await apiService.createProduct(formData);

            setSuccess('Product added successfully!');
            setForm({
                name: '',
                description: '',
                price: '',
                category: '',
                stock: '',
                image: null,
            });
        } catch (err) {
            setError(err.message || 'Failed to add product. Please try again.');
        } finally {
            setSubmitting(false);
            setUploading(false);
        }
    };

    return (
        <main className='add-product-page'>
            <header className='add-product-nav'>
                <Link to='/admin' className='back-btn'>
                    <ArrowLeft size={18} /> Back to Admin
                </Link>
                <span className='admin-badge'>Admin</span>
            </header>

            <div className='add-product-form-container'>
                {error && (
                    <div className='alert alert-error'>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className='alert alert-success'>
                        <CheckCircle size={20} />
                        <span>{success}</span>
                    </div>
                )}

                <form className='add-product-form' onSubmit={handleSubmit} encType='multipart/form-data'>
                    <div className='form-row'>
                        <div className='form-group'>
                            <label htmlFor='name'>Product Name <span className='required'>*</span></label>
                            <input
                                type='text'
                                id='name'
                                name='name'
                                value={form.name}
                                onChange={handleChange}
                                placeholder='e.g. Nike Air Zoom'
                                required
                                disabled={submitting}
                            />
                        </div>

                        <div className='form-group'>
                            <label htmlFor='category'>Category <span className='required'>*</span></label>
                            <select
                                id='category'
                                name='category'
                                value={form.category}
                                onChange={handleChange}
                                required
                                disabled={submitting}
                            >
                                <option value=''>Select category</option>
                                <option value='Men'>Men</option>
                                <option value='Women'>Women</option>
                            </select>
                        </div>

                        <div className='form-group'>
                            <label htmlFor='price'>Price () <span className='required'>*</span></label>
                            <input
                                type='number'
                                id='price'
                                name='price'
                                value={form.price}
                                onChange={handleChange}
                                placeholder='0.00'
                                min='0'
                                step='0.01'
                                required
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <div className='form-group'>
                        <label htmlFor='stock'>Stock Quantity <span className='required'>*</span></label>
                        <input
                            type='number'
                            id='stock'
                            name='stock'
                            value={form.stock}
                            onChange={handleChange}
                            placeholder='0'
                            min='0'
                            required
                            disabled={submitting}
                        />
                    </div>

                    <div className='form-group'>
                        <label htmlFor='description'>Description <span className='required'>*</span></label>
                        <textarea
                            id='description'
                            name='description'
                            value={form.description}
                            onChange={handleChange}
                            placeholder='Describe the product...'
                            rows={5}
                            required
                            disabled={submitting}
                        />
                    </div>

                    <div className='form-group image-upload'>
                        <label htmlFor='image'>
                            Product Image <span className='required'>*</span>
                        </label>
                        <div className='image-input-wrapper'>
                            <input
                                type='file'
                                id='image'
                                name='image'
                                accept='image/*'
                                onChange={handleFileChange}
                                disabled={submitting}
                            />
                            {!form.image ? (
                                <div className='image-placeholder'>
                                    <Upload size={28} />
                                    <p>Click to upload product image</p>
                                    <p className='image-hint'>Supports JPG, PNG, WEBP (max 5MB)</p>
                                </div>
                            ) : (
                                <div className='image-preview'>
                                    <img src={previewImage()} alt='Preview' />
                                    <button
                                        type='button'
                                        className='remove-image'
                                        onClick={removeImage}
                                        aria-label='Remove image'
                                        disabled={submitting}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <button type='submit' className='submit-btn' disabled={submitting}>
                        {submitting ? (
                            <>
                                <span className='spin' /> Adding product...
                            </>
                        ) : (
                            <>
                                <Upload size={18} /> Add Product
                            </>
                        )}
                    </button>

                    <div className='form-actions'>
                        <Link to='/admin' className='secondary-btn'>
                            <ArrowLeft size={18} /> Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default AddProduct;
