import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Upload, Loader, CheckCircle, Info, CreditCard } from 'lucide-react';
import './AddProperty.css'; // Reuse the same premium styling

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    rating: '5',
    description: '',
    amenities: '',
    imageUrl: ''
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const docRef = doc(db, 'properties', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name,
            location: data.location,
            price: data.price,
            rating: data.rating.toString(),
            description: data.description,
            amenities: data.amenities?.join(', ') || '',
            imageUrl: data.images ? data.images[0] : ''
          });
        } else {
          alert('Property not found');
          navigate('/partner/dashboard');
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setUpdating(true);
      const amenitiesArray = formData.amenities.split(',').map(item => item.trim());
      
      const docRef = doc(db, 'properties', id);
      await updateDoc(docRef, {
        name: formData.name,
        location: formData.location,
        price: Number(formData.price),
        rating: Number(formData.rating),
        description: formData.description,
        amenities: amenitiesArray,
        images: [formData.imageUrl],
        updatedAt: new Date()
      });

      setSuccess(true);
      setTimeout(() => navigate('/partner/dashboard'), 2000);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update property.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="add-property-page flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="add-property-page success-view-center">
        <div className="success-card glass">
          <CheckCircle size={64} color="var(--success)" />
          <h1>Changes Saved!</h1>
          <p>Your property details have been updated across the platform.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-property-page">
      <div className="container narrow-container">
        <header className="form-header">
          <Link to="/partner/dashboard" className="back-btn-alt">
            <ArrowLeft size={18} /> Cancel Changes
          </Link>
          <h1>Edit <span>{formData.name}</span></h1>
        </header>

        <form onSubmit={handleSubmit} className="add-property-form glass">
          <section className="form-section">
            <div className="section-title">
              <Info size={18} /> <h2>Essential Details</h2>
            </div>
            
            <div className="input-group">
              <label>Property Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="input-row">
              <div className="input-group half">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required />
              </div>
              <div className="input-group half">
                <label>Star Rating</label>
                <select name="rating" value={formData.rating} onChange={handleChange}>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                </select>
              </div>
            </div>
          </section>

          <section className="form-section mt-4">
            <div className="section-title">
              <CreditCard size={18} /> <h2>Revenue & Facilities</h2>
            </div>
            <div className="input-group">
              <label>Price per Night (INR)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Amenities (Comma separated)</label>
              <input type="text" name="amenities" value={formData.amenities} onChange={handleChange} required />
            </div>
          </section>

          <section className="form-section mt-4">
            <div className="section-title">
              <Upload size={18} /> <h2>Imagery & Story</h2>
            </div>
            <div className="input-group">
              <label>Primary Image URL</label>
              <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required />
            </div>
          </section>

          <button type="submit" className="btn btn-primary submit-btn mt-5" disabled={updating}>
            {updating ? <><Loader className="animate-spin" size={18} /> Synchronizing...</> : 'Save Property Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
