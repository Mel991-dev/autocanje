// frontend/src/components/PremiumBadge.jsx

import React, { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import '../styles/components/premiumBadge.css';

const PremiumBadge = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [diasRestantes, setDiasRestantes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/membresias/mi-membresia', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.es_premium) {
        setIsPremium(true);
        setDiasRestantes(data.membresia.dias_restantes);
      }
    } catch (error) {
      console.error('Error al verificar membresía:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !isPremium) {
    return null;
  }

  const esCritico = diasRestantes <= 7;

  return (
    <div className={`premium-badge-header ${esCritico ? 'critico' : ''}`}>
      <Crown size={16} />
      <span className="badge-text">Premium</span>
      {esCritico && (
        <span className="badge-dias">{diasRestantes}d</span>
      )}
    </div>
  );
};

export default PremiumBadge;