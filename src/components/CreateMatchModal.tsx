import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/utils/supabaseClient';
import Swal from 'sweetalert2';

interface CreateMatchModalProps {
  open: boolean;
  onClose: () => void;
}

interface MatchFormData {
  matchType: 'public' | 'private';
  gameMode: string;
  firstTo: string;
  platform: string;
  region: string;
  teamSize: string;
  entryFee: string;
}

const CreateMatchModal: React.FC<CreateMatchModalProps> = ({ open, onClose }) => {
  const router = useRouter();
  const { user, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MatchFormData>({
    matchType: 'public',
    gameMode: 'boxfights',
    firstTo: '3',
    platform: 'pc',
    region: 'nae',
    teamSize: '1v1',
    entryFee: '5',
  });

  if (!open) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEntryFeeClick = (amount: string) => {
    setFormData(prev => ({ ...prev, entryFee: amount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user || !session) {
      console.error('User not authenticated');
      // TODO: Show login modal or redirect to login
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the session token
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentSession?.access_token}`,
        },
        body: JSON.stringify({
          ...formData,
          entryFee: parseFloat(formData.entryFee),
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle insufficient balance error specifically
        if (errorData.error === 'Insufficient balance') {
          Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: 'error',
            title: `Not enough balance! You need ${errorData.requiredAmount} coins but only have ${errorData.currentBalance} coins.`,
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            background: '#1a1a1a',
            color: '#fff',
            iconColor: '#dc3545'
          });
          return;
        }
        
        throw new Error(errorData.error || 'Failed to create match');
      }
      
      const { id } = await response.json();
      
      // Show success toast
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'success',
        title: `Match created! Entry fee of ${formData.entryFee} coins deducted.`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#28a745'
      });
      
      router.push(`/match/${id}`);
    } catch (error) {
      console.error('Error creating match:', error);
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: 'error',
        title: 'Failed to create match. Please try again.',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#fff',
        iconColor: '#dc3545'
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="modal-match">
      <div className="backlayer" onClick={onClose}></div>
      <div className="create-modal">
        <div className="create-header">
          <span className="closemodal" onClick={onClose}>X</span>
          <Image src="/assets/img/fnlogo.png" alt="FN Logo" width={250} height={250} />
          <h2>Create Match</h2>
          <p>Choose your options and place your coins.</p>
        </div>
        <div className="create-content">
        <form onSubmit={handleSubmit}>
          <div className="form-row mb-5">
            <div className="form-group d-flex">
              <input 
                type="radio" 
                name="matchType" 
                id="public" 
                value="public"
                checked={formData.matchType === 'public'}
                onChange={handleInputChange}
              />
              <label htmlFor="public">Public Match</label>
            </div>
            <div className="form-group d-flex">
              <input 
                type="radio" 
                name="matchType" 
                id="private" 
                value="private"
                checked={formData.matchType === 'private'}
                onChange={handleInputChange}
              />
              <label htmlFor="private">Private Match</label>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Game mode</label>
              <select 
                name="gameMode" 
                value={formData.gameMode}
                onChange={handleInputChange}
              >
                <option value="boxfights">Box Fights</option>
                <option value="buildfights">Build Fights</option>
                <option value="realistic">Realistic</option>
                <option value="zerobuild">Zero Build</option>
                <option value="zonewars">Zone Wars</option>
                <option value="killrace">Kill Race</option>
                <option value="creative">Creative</option>
                <option value="battleroyale">Battle Royale</option>
              </select>
            </div>
            <div className="form-group">
              <label>First to</label>
              <select 
                name="firstTo" 
                value={formData.firstTo}
                onChange={handleInputChange}
              >
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="7">7</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Platform</label>
              <select 
                name="platform" 
                value={formData.platform}
                onChange={handleInputChange}
              >
                <option value="pc">PC</option>
                <option value="console">Console</option>
                <option value="mobile">Mobile</option>
                <option value="any">Any Platform</option>
              </select>
            </div>
            <div className="form-group">
              <label>Region</label>
              <select 
                name="region" 
                value={formData.region}
                onChange={handleInputChange}
              >
                <option value="nae">NA East</option>
                <option value="naw">NA West</option>
                <option value="nac">NA Central</option>
                <option value="eu">Europe</option>
                <option value="asia">Asia</option>
                <option value="oce">Oceania</option>
                <option value="br">Brazil</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Team Size</label>
              <select 
                name="teamSize" 
                value={formData.teamSize}
                onChange={handleInputChange}
              >
                <option value="1v1">1v1</option>
                <option value="2v2">2v2</option>
                <option value="3v3">3v3</option>
                <option value="4v4">4v4</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Entry :</label>
            <div className="entryamounts">
              {['0.50', '1', '5', '10'].map((amount) => (
                <span 
                  key={amount}
                  className={`single-amount ${formData.entryFee === amount ? 'active' : ''}`}
                  onClick={() => handleEntryFeeClick(amount)}
                >
                  {amount} Coin{amount !== '1' ? 's' : ''}
                </span>
              ))}
            </div>
            <input 
              type="number" 
              name="entryFee" 
              id="entryprice" 
              placeholder="Entry price" 
              value={formData.entryFee}
              onChange={handleInputChange}
              step="0.01"
              min="0.1"
            />
          </div>
          <button 
            type="submit" 
            className="create-match"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Creating Match...
              </>
            ) : (
              <>
                <i className="fas fa-plus me-2"></i>
                Create a match
              </>
            )}
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

export default CreateMatchModal;
