import React, { useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Upload as UploadIcon,
  FileSpreadsheet,
  Camera,
  Image,
  X,
  Check,
  AlertCircle,
  Loader2,
  FileText,
  Users,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

const Upload = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('mode') === 'camera' ? 'namecard' : 'spreadsheet');
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, success, error
  const [processedData, setProcessedData] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle file drop for spreadsheets
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFiles([file]);
      setUploadStatus('idle');
      setProcessedData(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Process spreadsheet file
  const handleProcessSpreadsheet = async () => {
    if (!files.length) return;

    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate API processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setUploadProgress(100);
      setUploadStatus('processing');

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock processed data
      setProcessedData({
        type: 'spreadsheet',
        totalRows: 156,
        validContacts: 142,
        duplicates: 8,
        errors: 6,
        columns: ['Name', 'Phone', 'Email', 'Company', 'Location'],
        preview: [
          { name: 'Ahmad Hassan', phone: '+60123456789', email: 'ahmad@xyz.com', company: 'XYZ Corp', location: 'KL' },
          { name: 'Sarah Lee', phone: '+60198765432', email: 'sarah@tech.my', company: 'Tech Solutions', location: 'PJ' },
          { name: 'David Wong', phone: '+60167891234', email: 'david@gfg.com', company: 'Global Finance', location: 'Penang' },
        ],
        categories: {
          'Real Estate': 34,
          'Technology': 45,
          'Finance': 28,
          'Healthcare': 20,
          'Others': 15,
        },
      });

      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
    }

    clearInterval(progressInterval);
  };

  // Start camera for namecard scanning
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      stopCamera();
      processNamecard(imageData);
    }
  };

  // Handle file input for namecard image
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        processNamecard(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process namecard with OCR
  const processNamecard = async (imageData) => {
    setUploadStatus('processing');

    try {
      // Simulate OCR processing
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Mock OCR result
      setProcessedData({
        type: 'namecard',
        confidence: 0.94,
        extractedData: {
          name: 'John Smith',
          title: 'Senior Sales Manager',
          company: 'ABC Corporation Sdn Bhd',
          phone: '+60 12-345 6789',
          email: 'john.smith@abccorp.com.my',
          address: 'Level 15, Menara XYZ, Jalan Ampang, 50450 Kuala Lumpur',
          website: 'www.abccorp.com.my',
        },
        suggestedCategory: 'Real Estate',
        duplicateWarning: null,
      });

      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
    }
  };

  // Reset upload state
  const handleReset = () => {
    setFiles([]);
    setUploadProgress(0);
    setUploadStatus('idle');
    setProcessedData(null);
    setCapturedImage(null);
    stopCamera();
  };

  // Render spreadsheet upload section
  const renderSpreadsheetUpload = () => (
    <div className="px-4 py-6">
      {uploadStatus === 'idle' && !files.length && (
        <>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet size={32} className="text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Spreadsheet
            </h3>
            <p className="text-gray-500 mb-4">
              Drag & drop your Excel or CSV file here, or tap to browse
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="badge-gray">.xlsx</span>
              <span className="badge-gray">.xls</span>
              <span className="badge-gray">.csv</span>
            </div>
            <p className="text-xs text-gray-400 mt-4">Maximum file size: 10MB</p>
          </div>

          {/* Features */}
          <div className="mt-8 space-y-4">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              AI-Powered Features
            </h4>
            {[
              { icon: Sparkles, text: 'Auto-detect columns (name, phone, email, company)' },
              { icon: RefreshCw, text: 'Auto-clean phone formats and remove duplicates' },
              { icon: Users, text: 'Auto-categorize contacts by industry' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <feature.icon size={20} className="text-primary-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* File selected */}
      {files.length > 0 && uploadStatus === 'idle' && (
        <div className="space-y-6">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText size={24} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{files[0].name}</p>
                <p className="text-sm text-gray-500">
                  {(files[0].size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={handleReset}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
          </div>

          <button onClick={handleProcessSpreadsheet} className="btn-primary w-full py-4">
            <Sparkles size={20} className="mr-2" />
            Process with AI
          </button>
        </div>
      )}

      {/* Uploading */}
      {uploadStatus === 'uploading' && (
        <div className="text-center py-12">
          <Loader2 size={48} className="text-primary-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Uploading...</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
        </div>
      )}

      {/* Processing */}
      {uploadStatus === 'processing' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-primary-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI is analyzing your data...
          </h3>
          <p className="text-gray-500">Detecting columns and cleaning data</p>
        </div>
      )}

      {/* Success - Spreadsheet */}
      {uploadStatus === 'success' && processedData?.type === 'spreadsheet' && (
        <div className="space-y-6 animate-fade-in">
          {/* Success header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Successfully Processed!
            </h3>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{processedData.totalRows}</p>
              <p className="text-sm text-gray-500">Total Rows</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{processedData.validContacts}</p>
              <p className="text-sm text-gray-500">Valid Contacts</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{processedData.duplicates}</p>
              <p className="text-sm text-gray-500">Duplicates</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{processedData.errors}</p>
              <p className="text-sm text-gray-500">Errors</p>
            </div>
          </div>

          {/* Detected columns */}
          <div className="card p-4">
            <h4 className="font-medium text-gray-900 mb-3">Detected Columns</h4>
            <div className="flex flex-wrap gap-2">
              {processedData.columns.map((col, i) => (
                <span key={i} className="badge-primary">{col}</span>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="card p-4">
            <h4 className="font-medium text-gray-900 mb-3">Auto-Categorized</h4>
            <div className="space-y-2">
              {Object.entries(processedData.categories).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-700">{category}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleReset} className="flex-1 btn-secondary py-3">
              Upload Another
            </button>
            <button className="flex-1 btn-primary py-3">
              Import All
              <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {uploadStatus === 'error' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Processing Failed
          </h3>
          <p className="text-gray-500 mb-6">
            There was an error processing your file. Please try again.
          </p>
          <button onClick={handleReset} className="btn-primary">
            Try Again
          </button>
        </div>
      )}
    </div>
  );

  // Render namecard scanning section
  const renderNamecardScan = () => (
    <div className="px-4 py-6">
      {!capturedImage && !isCameraActive && uploadStatus === 'idle' && (
        <>
          {/* Camera/Gallery options */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={startCamera}
              className="card p-6 text-center hover:shadow-card-hover transition-shadow"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Camera size={28} className="text-primary-600" />
              </div>
              <p className="font-medium text-gray-900">Take Photo</p>
              <p className="text-xs text-gray-500 mt-1">Use camera</p>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="card p-6 text-center hover:shadow-card-hover transition-shadow"
            >
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Image size={28} className="text-green-600" />
              </div>
              <p className="font-medium text-gray-900">From Gallery</p>
              <p className="text-xs text-gray-500 mt-1">Select image</p>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* Tips */}
          <div className="card p-4 bg-blue-50 border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Tips for best results</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>- Ensure good lighting</li>
              <li>- Keep the namecard flat</li>
              <li>- Avoid shadows and glare</li>
              <li>- Fill the frame with the card</li>
            </ul>
          </div>
        </>
      )}

      {/* Camera view */}
      {isCameraActive && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-2xl bg-black"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 border-2 border-white/50 rounded-lg"></div>
          </div>

          {/* Camera controls */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={stopCamera}
              className="p-4 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            >
              <X size={24} className="text-gray-700" />
            </button>
            <button
              onClick={capturePhoto}
              className="p-4 bg-primary-600 rounded-full hover:bg-primary-700 transition-colors"
            >
              <Camera size={24} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Processing */}
      {uploadStatus === 'processing' && capturedImage && (
        <div className="text-center py-6">
          <div className="relative mb-6">
            <img
              src={capturedImage}
              alt="Captured namecard"
              className="w-full rounded-2xl opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <Sparkles size={32} className="text-primary-600 animate-pulse mx-auto mb-2" />
                <p className="font-medium text-gray-900">Scanning with AI...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success - Namecard */}
      {uploadStatus === 'success' && processedData?.type === 'namecard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Captured image */}
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured namecard"
              className="w-full rounded-2xl"
            />
            <div className="absolute top-2 right-2 badge-success">
              {Math.round(processedData.confidence * 100)}% confidence
            </div>
          </div>

          {/* Extracted data */}
          <div className="card p-4">
            <h4 className="font-medium text-gray-900 mb-4">Extracted Information</h4>
            <div className="space-y-3">
              {Object.entries(processedData.extractedData).map(([key, value]) => (
                <div key={key} className="flex items-start gap-3">
                  <span className="text-sm text-gray-500 capitalize w-20 flex-shrink-0">
                    {key}:
                  </span>
                  <span className="text-sm font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested category */}
          <div className="card p-4 bg-primary-50 border-primary-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={18} className="text-primary-600" />
              <span className="font-medium text-primary-900">Suggested Category</span>
            </div>
            <span className="badge-primary">{processedData.suggestedCategory}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleReset} className="flex-1 btn-secondary py-3">
              Scan Another
            </button>
            <button className="flex-1 btn-primary py-3">
              Save Contact
              <Check size={18} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {uploadStatus === 'error' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Scan Failed
          </h3>
          <p className="text-gray-500 mb-6">
            Could not read the namecard. Please try again with better lighting.
          </p>
          <button onClick={handleReset} className="btn-primary">
            Try Again
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Import Contacts</h1>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setActiveTab('spreadsheet');
                handleReset();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'spreadsheet'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileSpreadsheet size={18} />
              Spreadsheet
            </button>
            <button
              onClick={() => {
                setActiveTab('namecard');
                handleReset();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'namecard'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Camera size={18} />
              Namecard
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'spreadsheet' ? renderSpreadsheetUpload() : renderNamecardScan()}
    </div>
  );
};

export default Upload;
