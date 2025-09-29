import React, { useRef } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { uploadResume } from '../../store/slices/interviewSlice';

interface ResumeUploadProps {
  onUpload: (file: File) => void;
  error?: string;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
      dispatch(uploadResume(file));
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      onUpload(file);
      dispatch(uploadResume(file));
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">Upload your resume</p>
        <p className="text-sm text-gray-500 mb-4">
          Drag and drop your file here, or click to browse
        </p>
        <p className="text-xs text-gray-400">
          Supports PDF and DOCX files
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;