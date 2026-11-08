import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({ name: '', description: '', price: '', category: '', stock: '' });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');

  const token = localStorage.getItem('gocartToken');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/products/${id}`, { headers: authHeader });
        const data = await res.json();
        setProduct({
          name: data.name || '',
          description: data.description || '',
          price: data.price || '',
          category: data.category || '',
          stock: data.stock || '',
        });
      } catch (e) {
        console.error(e);
        setError('Failed to load product');
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = e => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleFile = e => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(product).forEach(([key, value]) => formData.append(key, value));
    if (imageFile) formData.append('image', imageFile);
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: authHeader,
        body: formData,
      });
      if (!res.ok) throw new Error('Update failed');
      navigate('/admin/dashboard');
    } catch (e) {
      console.error(e);
      setError('Failed to update product');
    }
  };

  return (
    <div className="container py-5">
      <h2>Edit Product</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3"><label className="form-label">Name</label><input className="form-control" name="name" value={product.name} onChange={handleChange} required /></div>
        <div className="mb-3"><label className="form-label">Description</label><textarea className="form-control" name="description" value={product.description} onChange={handleChange} required /></div>
        <div className="mb-3"><label className="form-label">Price</label><input type="number" className="form-control" name="price" value={product.price} onChange={handleChange} required /></div>
        <div className="mb-3"><label className="form-label">Category</label><input className="form-control" name="category" value={product.category} onChange={handleChange} required /></div>
        <div className="mb-3"><label className="form-label">Stock</label><input type="number" className="form-control" name="stock" value={product.stock} onChange={handleChange} required /></div>
        <div className="mb-3"><label className="form-label">Image (optional)</label><input type="file" className="form-control" onChange={handleFile} /></div>
        <button type="submit" className="btn btn-primary">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProduct;
