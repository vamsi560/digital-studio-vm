import React, { useState, useCallback } from 'react';

const PrototypeLabFlow = ({ onNavigate }) => {
    const [currentScreen, setCurrentScreen] = useState(1);
    const [framework, setFramework] = useState('');
    const [styling, setStyling] = useState('');
    const [architecture, setArchitecture] = useState('');
    const [uploadedScreens, setUploadedScreens] = useState([]);
    const [generatedCode, setGeneratedCode] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showLogicPopup, setShowLogicPopup] = useState(false);
    const [customLogic, setCustomLogic] = useState('');
    const [routing, setRouting] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const handleFileUpload = useCallback((files) => {
        const newScreens = Array.from(files).map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            url: URL.createObjectURL(file)
        }));
        setUploadedScreens(prev => [...prev, ...newScreens]);
    }, []);

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
        const files = Array.from(e.dataTransfer.files);
        handleFileUpload(files);
    };

    const handleGenerateCode = async () => {
        setIsGenerating(true);
        // Simulate code generation
        setTimeout(() => {
            setGeneratedCode(`// Generated React Code
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Generated App</h1>
      </header>
      <main>
        <p>Your app content will appear here</p>
      </main>
    </div>
  );
}

export default App;`);
            setIsGenerating(false);
        }, 3000);
    };

    const handleDownload = () => {
        const element = document.createElement('a');
        const file = new Blob([generatedCode], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = 'generated-app.js';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const renderScreen1 = () => (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-300 relative overflow-hidden">
            {/* Professional Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                                    radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`
                }}></div>
            </div>
            {/* Enhanced Top Header with Better Spacing */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700/50 backdrop-blur-sm px-6 py-4 shadow-xl">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center space-x-6">
                        <button 
                            onClick={() => onNavigate('landing')}
                            className="group bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-200 px-4 py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                            aria-label="Go back to landing page"
                        >
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 group-hover:transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                                <span className="font-medium text-sm">Back</span>
                            </div>
                        </button>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">Digital Studio</h1>
                        </div>
                    </div>
                    
                    {/* Enhanced Configuration Cards with Better Visual Hierarchy */}
                    <div className="flex items-center space-x-4">
                        {/* Framework Selection */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600/50 rounded-xl p-4 min-w-[200px] shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Framework</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {['React', 'Angular', 'Vue.js', 'Svelte'].map((option) => (
                                    <label key={option} className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 focus-within:bg-gray-700/50">
                                        <span className="text-gray-300 text-sm font-medium group-hover:text-gray-200 transition-colors">{option}</span>
                                        <div className="relative">
                                            <input
                                                type="radio"
                                                name="framework"
                                                value={option}
                                                checked={framework === option}
                                                onChange={(e) => setFramework(e.target.value)}
                                                className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-500 focus:ring-blue-400 focus:ring-2 rounded-full cursor-pointer"
                                            />
                                            {framework === option && (
                                                <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Styling Selection */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600/50 rounded-xl p-4 min-w-[200px] shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Styling</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {['Tailwind CSS', 'CSS Modules', 'Styled Components', 'Material-UI'].map((option) => (
                                    <label key={option} className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 focus-within:bg-gray-700/50">
                                        <span className="text-gray-300 text-sm font-medium group-hover:text-gray-200 transition-colors">{option}</span>
                                        <div className="relative">
                                            <input
                                                type="radio"
                                                name="styling"
                                                value={option}
                                                checked={styling === option}
                                                onChange={(e) => setStyling(e.target.value)}
                                                className="w-4 h-4 text-green-500 bg-gray-700 border-gray-500 focus:ring-green-400 focus:ring-2 rounded-full cursor-pointer"
                                            />
                                            {styling === option && (
                                                <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-20"></div>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Architecture Selection */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600/50 rounded-xl p-4 min-w-[200px] shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Architecture</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {['Component-Based', 'Atomic Design', 'Feature-Based', 'Domain-Driven'].map((option) => (
                                    <label key={option} className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 focus-within:bg-gray-700/50">
                                        <span className="text-gray-300 text-sm font-medium group-hover:text-gray-200 transition-colors">{option}</span>
                                        <div className="relative">
                                            <input
                                                type="radio"
                                                name="architecture"
                                                value={option}
                                                checked={architecture === option}
                                                onChange={(e) => setArchitecture(e.target.value)}
                                                className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-500 focus:ring-purple-400 focus:ring-2 rounded-full cursor-pointer"
                                            />
                                            {architecture === option && (
                                                <div className="absolute inset-0 w-4 h-4 bg-purple-500 rounded-full animate-ping opacity-20"></div>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Screen Navigation */}
                    <div className="flex items-center space-x-3">
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => setCurrentScreen(1)}
                                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
                                    currentScreen === 1 
                                        ? 'border-blue-400 text-blue-400 bg-blue-400/10 shadow-lg shadow-blue-400/20' 
                                        : 'border-gray-600 text-gray-600 hover:border-gray-500 hover:text-gray-500'
                                }`}
                                aria-label="Go to screen 1"
                            >
                                1
                            </button>
                            <button 
                                onClick={() => setCurrentScreen(2)}
                                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
                                    currentScreen === 2 
                                        ? 'border-blue-400 text-blue-400 bg-blue-400/10 shadow-lg shadow-blue-400/20' 
                                        : 'border-gray-600 text-gray-600 hover:border-gray-500 hover:text-gray-500'
                                }`}
                                aria-label="Go to screen 2"
                            >
                                2
                            </button>
                            <button 
                                onClick={() => setCurrentScreen(3)}
                                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
                                    currentScreen === 3 
                                        ? 'border-blue-400 text-blue-400 bg-blue-400/10 shadow-lg shadow-blue-400/20' 
                                        : 'border-gray-600 text-gray-600 hover:border-gray-500 hover:text-gray-500'
                                }`}
                                aria-label="Go to screen 3"
                            >
                                3
                            </button>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-600 rounded-lg flex items-center justify-center shadow-lg border border-gray-600/30">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Main Content Area */}
            <div className="flex h-[calc(100vh-88px)] max-w-7xl mx-auto">
                {/* Enhanced Left Sidebar - Import/Upload Section */}
                <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700/50 p-4">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600/50 rounded-xl p-6 h-full shadow-2xl backdrop-blur-sm">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <h3 className="text-lg font-bold text-gray-200">Import / Upload Screens</h3>
                        </div>
                        <div className="space-y-4">
                            <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-400/50">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                </svg>
                                <span className="text-white font-medium text-sm">Import from Figma</span>
                            </button>
                            
                            <button className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-400/50">
                                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 012.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/>
                                </svg>
                                <span className="text-gray-300 font-medium text-sm">Import from GitHub</span>
                            </button>
                            
                            <div className="mt-6">
                                <label className={`flex items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-blue-400/50 ${
                                    isDragging 
                                        ? 'border-blue-400 bg-blue-400/10' 
                                        : 'border-gray-600 bg-gradient-to-br from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                >
                                    <div className="text-center">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${
                                            isDragging 
                                                ? 'bg-blue-500 scale-110' 
                                                : 'bg-gradient-to-br from-blue-500 to-purple-500'
                                        }`}>
                                            <svg className={`w-6 h-6 text-white transition-all duration-300 ${isDragging ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                            </svg>
                                        </div>
                                        <span className="text-gray-200 font-medium text-sm block mb-1">
                                            {isDragging ? 'Drop files here' : 'Upload your screens'}
                                        </span>
                                        <span className="text-gray-400 text-xs">Drag & drop or click to browse</span>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e.target.files)}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Main Area - Screen Order Display */}
                <div className="flex-1 p-4">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600/50 rounded-xl p-6 h-[calc(100vh-200px)] shadow-2xl backdrop-blur-sm relative max-w-4xl mx-auto">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <h3 className="text-lg font-bold text-gray-200">Prototype Screen Flow Preview</h3>
                        </div>
                        {uploadedScreens.length === 0 ? (
                            <div className="flex items-center justify-center h-[calc(100%-120px)] border-2 border-dashed border-gray-600/50 rounded-xl bg-gradient-to-br from-gray-700 to-gray-600 transition-all duration-300 hover:border-gray-500/50">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                    </div>
                                    <p className="text-gray-400 font-medium mb-1">Upload images to see prototype screen flow</p>
                                    <p className="text-gray-500 text-sm">Drag and drop your screens here</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 gap-4">
                                    {uploadedScreens.map((screen, index) => (
                                        <div key={screen.id} className="group aspect-square border-2 border-dotted border-gray-600/50 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-600 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                            <img src={screen.url} alt={screen.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Enhanced Submit Button */}
                        <div className="absolute bottom-6 right-6">
                            <button
                                onClick={() => setCurrentScreen(2)}
                                disabled={uploadedScreens.length === 0}
                                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-600 disabled:text-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none disabled:hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                aria-label="Generate prototype code"
                            >
                                <div className="flex items-center space-x-2">
                                    <span>Generate Prototype Code</span>
                                    <svg className="w-4 h-4 group-hover:transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderScreen2 = () => (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-300">
            {/* Top Header with Navigation */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700/50 backdrop-blur-sm px-6 py-4 shadow-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <button 
                            onClick={() => onNavigate('landing')}
                            className="group bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-200 px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-gray-600/30"
                        >
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 group-hover:transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                                <span className="font-semibold">Back</span>
                            </div>
                        </button>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">Digital Studio</h2>
                        </div>
                    </div>
                    
                    {/* Screen Navigation */}
                    <div className="flex items-center space-x-4">
                        <div className="flex space-x-3">
                            <button 
                                onClick={() => setCurrentScreen(1)}
                                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 transform hover:scale-110 ${
                                    currentScreen === 1 
                                        ? 'border-blue-400 text-blue-400 bg-blue-400/10 shadow-lg shadow-blue-400/20' 
                                        : 'border-gray-600 text-gray-600 hover:border-gray-500 hover:text-gray-500'
                                }`}
                            >
                                1
                            </button>
                            <button 
                                onClick={() => setCurrentScreen(2)}
                                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 transform hover:scale-110 ${
                                    currentScreen === 2 
                                        ? 'border-blue-400 text-blue-400 bg-blue-400/10 shadow-lg shadow-blue-400/20' 
                                        : 'border-gray-600 text-gray-600 hover:border-gray-500 hover:text-gray-500'
                                }`}
                            >
                                2
                            </button>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl flex items-center justify-center shadow-lg border border-gray-600/30">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 012.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                    {/* Left Panel - Code Generation */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600/50 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                        <h3 className="text-xl font-bold text-gray-200 mb-6">Code Generation Progress</h3>
                        {isGenerating && (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl border border-gray-600/30">
                                    <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse shadow-lg"></div>
                                    <span className="text-gray-200 font-medium">Generating code for screen 1...</span>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl border border-gray-600/30">
                                    <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse shadow-lg"></div>
                                    <span className="text-gray-200 font-medium">Generating code for screen 2...</span>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl border border-gray-600/30 opacity-50">
                                    <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                                    <span className="text-gray-400">Generating code for screen 3...</span>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl border border-gray-600/30 opacity-50">
                                    <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                                    <span className="text-gray-400">Generating code for screen 4...</span>
                                </div>
                            </div>
                        )}
                        {!isGenerating && (
                            <button
                                onClick={handleGenerateCode}
                                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                            >
                                <div className="flex items-center space-x-2">
                                    <span>Generate Code</span>
                                    <svg className="w-5 h-5 group-hover:transform group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                    </svg>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Right Panel - Preview */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600/50 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                        <h3 className="text-xl font-bold text-gray-200 mb-6">Code Preview</h3>
                        {generatedCode ? (
                            <pre className="bg-gradient-to-br from-gray-700 to-gray-600 p-6 rounded-xl text-sm text-gray-200 overflow-auto max-h-96 border border-gray-600/30 shadow-inner">
                                <code>{generatedCode}</code>
                            </pre>
                        ) : (
                            <div className="text-gray-400 text-center py-12 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl border border-gray-600/30">
                                <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                                </svg>
                                <p className="text-lg">Generated code will appear here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Logic Button */}
                <div className="mt-8 flex justify-end max-w-7xl mx-auto">
                    <button
                        onClick={() => setShowLogicPopup(true)}
                        className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <div className="flex items-center space-x-2">
                            <span>Add Logic</span>
                            <svg className="w-4 h-4 group-hover:transform group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderScreen3 = () => (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-300">
            {/* Top Header with Navigation */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-b border-gray-700/50 backdrop-blur-sm px-6 py-4 shadow-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <button 
                            onClick={() => onNavigate('landing')}
                            className="group bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-200 px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-gray-600/30"
                        >
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 group-hover:transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                                <span className="font-semibold">Back</span>
                            </div>
                        </button>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">Digital Studio</h2>
                        </div>
                    </div>
                    
                    {/* Screen Navigation */}
                    <div className="flex items-center space-x-4">
                        <div className="flex space-x-3">
                            <button 
                                onClick={() => setCurrentScreen(1)}
                                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 transform hover:scale-110 ${
                                    currentScreen === 1 
                                        ? 'border-blue-400 text-blue-400 bg-blue-400/10 shadow-lg shadow-blue-400/20' 
                                        : 'border-gray-600 text-gray-600 hover:border-gray-500 hover:text-gray-500'
                                }`}
                            >
                                1
                            </button>
                            <button 
                                onClick={() => setCurrentScreen(2)}
                                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 transform hover:scale-110 ${
                                    currentScreen === 2 
                                        ? 'border-blue-400 text-blue-400 bg-blue-400/10 shadow-lg shadow-blue-400/20' 
                                        : 'border-gray-600 text-gray-600 hover:border-gray-500 hover:text-gray-500'
                                }`}
                            >
                                2
                            </button>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl flex items-center justify-center shadow-lg border border-gray-600/30">
                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 012.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Panel - Code Generation */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600/50 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                            <h3 className="text-xl font-bold text-gray-200 mb-6">Code Generation Complete</h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-green-700 to-green-600 rounded-xl border border-green-600/30">
                                    <div className="w-4 h-4 bg-green-400 rounded-full shadow-lg"></div>
                                    <span className="text-gray-200 font-medium">Screen 1 completed</span>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-green-700 to-green-600 rounded-xl border border-green-600/30">
                                    <div className="w-4 h-4 bg-green-400 rounded-full shadow-lg"></div>
                                    <span className="text-gray-200 font-medium">Screen 2 completed</span>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-green-700 to-green-600 rounded-xl border border-green-600/30">
                                    <div className="w-4 h-4 bg-green-400 rounded-full shadow-lg"></div>
                                    <span className="text-gray-200 font-medium">Screen 3 completed</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Preview */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600/50 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                            <h3 className="text-xl font-bold text-gray-200 mb-6">Final Code Preview</h3>
                            <pre className="bg-gradient-to-br from-gray-700 to-gray-600 p-6 rounded-xl text-sm text-gray-200 overflow-auto max-h-64 border border-gray-600/30 shadow-inner">
                                <code>{generatedCode}</code>
                            </pre>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                            onClick={handleDownload}
                            className="group bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 group-hover:transform group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                                <span>Download</span>
                            </div>
                        </button>
                        <button className="group bg-gradient-to-r from-purple-600 to-gray-600 hover:from-purple-500 hover:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2">
                            <svg className="w-4 h-4 group-hover:transform group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 012.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/>
                            </svg>
                            <span>Push to Git</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderLogicPopup = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600/50 rounded-2xl p-8 w-full max-w-md shadow-2xl backdrop-blur-sm">
                <h3 className="text-xl font-bold text-gray-200 mb-6">Add Logic & Routing</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-gray-200 mb-3 font-medium">Custom Logic</label>
                        <textarea
                            value={customLogic}
                            onChange={(e) => setCustomLogic(e.target.value)}
                            placeholder="Enter any custom logic or changes..."
                            className="w-full p-4 bg-gradient-to-br from-gray-700 to-gray-600 border border-gray-600/30 rounded-xl text-gray-200 resize-none h-24 shadow-inner"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-200 mb-3 font-medium">Routing</label>
                        <textarea
                            value={routing}
                            onChange={(e) => setRouting(e.target.value)}
                            placeholder="Enter routing configuration..."
                            className="w-full p-4 bg-gradient-to-br from-gray-700 to-gray-600 border border-gray-600/30 rounded-xl text-gray-200 resize-none h-24 shadow-inner"
                        />
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setShowLogicPopup(false)}
                            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-gray-200 font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                setShowLogicPopup(false);
                                setCurrentScreen(3);
                            }}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative">
            {/* Render Current Screen */}
            {currentScreen === 1 && renderScreen1()}
            {currentScreen === 2 && renderScreen2()}
            {currentScreen === 3 && renderScreen3()}

            {/* Logic Popup */}
            {showLogicPopup && renderLogicPopup()}
        </div>
    );
};

export default PrototypeLabFlow; 