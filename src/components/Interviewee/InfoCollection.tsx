import React, { useState } from 'react';
import { User, Mail, Phone } from 'lucide-react';

interface InfoCollectionProps {
  missingFields: string[];
  onSubmit: (info: { name?: string; email?: string; phone?: string }) => void;
}

const InfoCollection: React.FC<InfoCollectionProps> = ({ missingFields, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const info: { name?: string; email?: string; phone?: string } = {};
    
    if (missingFields.includes('name') && formData.name) {
      info.name = formData.name;
    }
    if (missingFields.includes('email') && formData.email) {
      info.email = formData.email;
    }
    if (missingFields.includes('phone') && formData.phone) {
      info.phone = formData.phone;
    }
    
    onSubmit(info);
  };

  const isFormValid = missingFields.every(field => {
    return formData[field as keyof typeof formData].trim().length > 0;
  });

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Please provide missing information
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {missingFields.includes('name') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}
          
          {missingFields.includes('email') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter your email address"
                required
              />
            </div>
          )}
          
          {missingFields.includes('phone') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter your phone number"
                required
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Continue to Interview
          </button>
        </form>
      </div>
    </div>
  );
};

export default InfoCollection;