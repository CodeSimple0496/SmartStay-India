import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Upload, Loader, CheckCircle, Info, CreditCard, ShieldAlert } from 'lucide-react';
import './AddProperty.css';

const AddProperty = () => {
  const { currentUser, userData, updateUserRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    rating: '5',
    description: '',
    amenities: '',
    imageUrl: '',
    isVerified: false,
    adminNotes: ''
  });

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      await updateUserRole('partner');
    } catch (err) {
      console.error("Upgrade failed:", err);
      alert("Failed to upgrade account.");
    } finally {
      setIsUpgrading(false);
    }
  };
  
  // Role Protection: Only partners can access this page
  if (userData?.role !== 'partner') {
     return (
       <div className="add-property-page access-denied flex items-center justify-center h-screen bg-bg-secondary">
          <div className="text-center p-8 glass animate-scale-in max-w-md">
            <div className="flex justify-center mb-4">
               <ShieldAlert size={64} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-primary mb-2 uppercase">Access Restricted</h1>
            <p className="text-muted italic mb-6">This professional toolkit is exclusively reserved for certified SmartPartners. Would you like to upgrade now?</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleUpgrade} 
                disabled={isUpgrading}
                className="btn btn-primary w-100"
              >
                {isUpgrading ? 'Upgrading...' : 'Upgrade to Partner Account'}
              </button>
              <Link to="/" className="text-sm text-primary font-bold hover:underline">Return to Marketplace</Link>
            </div>
          </div>
       </div>
     );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      const amenitiesArray = formData.amenities.split(',').map(item => item.trim());
      
      await addDoc(collection(db, 'properties'), {
        name: formData.name,
        location: formData.location,
        price: Number(formData.price),
        rating: Number(formData.rating),
        description: formData.description,
        amenities: amenitiesArray,
        images: [formData.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop'],
        ownerId: currentUser.uid,
        status: 'Active',
        reviews: 0,
        isVerified: formData.isVerified,
        adminNotes: formData.adminNotes,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => navigate('/partner/dashboard'), 3000);
    } catch (err) {
      console.error("Error adding property:", err);
      alert("Failed to add property: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="add-property-page success-view-center">
        <div className="success-card glass animate-fade-in">
          <CheckCircle size={64} color="var(--success)" />
          <h1>Property Listed!</h1>
          <p>Your luxury stay has been added to our global inventory. Redirecting to your dashboard...</p>
          <div className="loader-line mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-property-page">
      <div className="container narrow-container">
        <header className="form-header">
          <Link to="/partner/dashboard" className="back-btn-alt">
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <h1>List Your <span>Extraordinary</span> Stay</h1>
          <div className="smartpartner-badge mt-2 animate-fade-in flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #FFD700, #E8C872)', padding: '4px 12px', borderRadius: '20px', width: 'fit-content' }}>
             <CheckCircle size={14} className="text-primary" />
             <span className="text-[10px] font-black text-primary uppercase tracking-widest">SmartPartner Professional Mode</span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="add-property-form glass">
          <section className="form-section">
            <div className="section-title">
              <Info size={18} /> <h2>Basic Information</h2>
            </div>
            
            <div className="input-group">
              <label>Property Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="e.g. The Grand Imperial Heritage" 
                required 
              />
            </div>

            <div className="input-row">
              <div className="input-group half">
                <label>Location (City, State)</label>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  placeholder="e.g. Jaipur, Rajasthan" 
                  required 
                />
              </div>
              <div className="input-group half">
                <label>Star Rating (1-5)</label>
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
              <CreditCard size={18} /> <h2>Pricing & Features</h2>
            </div>
            
            <div className="input-group">
              <label>Price per Night (INR)</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                placeholder="₹" 
                required 
              />
            </div>

            <div className="input-group">
              <label>Amenities (Comma separated)</label>
              <input 
                type="text" 
                name="amenities" 
                value={formData.amenities} 
                onChange={handleChange} 
                placeholder="Pool, Spa, Gym, Free Wifi, valet" 
                required 
              />
            </div>
          </section>

          <section className="form-section mt-4">
            <div className="section-title">
              <Upload size={18} /> <h2>Media & Presentation</h2>
            </div>
            
            <div className="input-group">
              <label>Cover Image URL</label>
              <input 
                type="url" 
                name="imageUrl" 
                value={formData.imageUrl} 
                onChange={handleChange} 
                placeholder="https://..." 
                required 
              />
            </div>

            <div className="input-group mb-0">
              <label>Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Describe what makes this stay unique..." 
                rows="4" 
                required
              />
            </div>
          </section>

          <section className="form-section mt-4 smartpartner-exclusive-zone">
            <div className="section-title text-primary">
              <ShieldAlert size={18} /> <h2>Advanced Partner Settings</h2>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl border border-color bg-secondary bg-opacity-10 mb-4">
              <div className="toggle-container">
                  <input 
                    type="checkbox" 
                    id="isVerified" 
                    name="isVerified" 
                    checked={formData.isVerified}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <label htmlFor="isVerified" className="toggle-label"></label>
              </div>
              <div className="flex-1">
                <strong className="text-sm block text-primary font-black uppercase">Verified by SmartStay</strong>
                <p className="text-[11px] text-muted font-medium italic">Priority placement in marketplace results.</p>
              </div>
            </div>
            <div className="input-group mb-0">
              <label>Internal Operations Notes</label>
              <textarea 
                name="adminNotes" 
                value={formData.adminNotes}
                onChange={handleChange}
                placeholder="Confidential onboarding details..." 
                rows="2"
              />
            </div>
          </section>

          <button type="submit" className="btn btn-primary submit-btn mt-5" disabled={loading}>
            {loading ? <><Loader className="animate-spin" size={18} /> Listing Stay...</> : 'Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
