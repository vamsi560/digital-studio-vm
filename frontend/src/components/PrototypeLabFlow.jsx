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

    const handleFileUpload = useCallback((files) => {
        const newScreens = Array.from(files).map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            url: URL.createObjectURL(file)
        }));
        setUploadedScreens(prev => [...prev, ...newScreens]);
    }, []);

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
        <div className="min-h-screen bg-black text-gray-300">
            {/* Top Header with Navigation */}
            <div className="bg-gray-900 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <button 
                            onClick={() => onNavigate('landing')}
                            className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg transition-colors"
                        >
                            ← Back
                        </button>
                        <div>
                            <h1 className="text-lg font-medium text-gray-400">Screen 1</h1>
                            <h2 className="text-2xl font-bold text-gray-300">Digital Studio</h2>
                        </div>
                    </div>
                    
                    {/* Configuration Boxes */}
                    <div className="flex items-center space-x-4">
                        {/* Framework Selection */}
                        <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 min-w-[180px]">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Framework</h3>
                            <div className="space-y-2">
                                {['React', 'Angular', 'Vue.js', 'Svelte'].map((option) => (
                                    <label key={option} className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors">{option}</span>
                                        <input
                                            type="radio"
                                            name="framework"
                                            value={option}
                                            checked={framework === option}
                                            onChange={(e) => setFramework(e.target.value)}
                                            className="w-4 h-4 text-gray-400 bg-gray-700 border-gray-500 focus:ring-gray-400 focus:ring-2"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Styling Selection */}
                        <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 min-w-[180px]">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Styling</h3>
                            <div className="space-y-2">
                                {['Tailwind CSS', 'Styled Comp', 'SCSS', 'PureCSS'].map((option) => (
                                    <label key={option} className="flex items-center justify-between cursor-pointer group">
                                        <span className={`text-gray-300 text-sm group-hover:text-gray-200 transition-colors ${option === 'PureCSS' ? 'border-b border-dashed border-red-500' : ''}`}>{option}</span>
                                        <input
                                            type="radio"
                                            name="styling"
                                            value={option}
                                            checked={styling === option}
                                            onChange={(e) => setStyling(e.target.value)}
                                            className="w-4 h-4 text-gray-400 bg-gray-700 border-gray-500 focus:ring-gray-400 focus:ring-2"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Architecture Selection */}
                        <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 min-w-[180px]">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Architecture</h3>
                            <div className="space-y-2">
                                {['MVC', 'Modular', 'Comp Based', 'Atomic'].map((option) => (
                                    <label key={option} className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors">{option}</span>
                                        <input
                                            type="radio"
                                            name="architecture"
                                            value={option}
                                            checked={architecture === option}
                                            onChange={(e) => setArchitecture(e.target.value)}
                                            className="w-4 h-4 text-gray-400 bg-gray-700 border-gray-500 focus:ring-gray-400 focus:ring-2"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Screen Navigation */}
                    <div className="flex items-center space-x-3">
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => setCurrentScreen(1)}
                                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                                    currentScreen === 1 ? 'border-gray-400 text-gray-400' : 'border-gray-600 text-gray-600 hover:border-gray-500'
                                }`}
                            >
                                1
                            </button>
                            <button 
                                onClick={() => setCurrentScreen(2)}
                                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                                    currentScreen === 2 ? 'border-gray-400 text-gray-400' : 'border-gray-600 text-gray-600 hover:border-gray-500'
                                }`}
                            >
                                2
                            </button>
                        </div>
                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 012.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex h-[calc(100vh-80px)]">
                {/* Left Sidebar - Import/Upload Section */}
                <div className="w-80 bg-gray-900 border-r border-gray-700 p-6">
                    <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 h-full">
                        <h3 className="text-lg font-bold text-gray-300 mb-6">Import / Upload Screens</h3>
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <span className="text-gray-300 font-medium">Figma Icon</span>
                            </div>
                            
                            <div className="flex items-center space-x-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 012.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/>
                                    </svg>
                                </div>
                                <span className="text-gray-300 font-medium">Github Icon</span>
                            </div>
                            
                            <div className="mt-8">
                                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer">
                                    <div className="text-center">
                                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                        <span className="text-gray-300 font-medium">Choose Files</span>
                                        <p className="text-gray-500 text-sm mt-1">No file chosen</p>
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

                {/* Main Area - Screen Order Display */}
                <div className="flex-1 p-6">
                    <div className="bg-gray-800 border border-gray-600 rounded-xl p-8 h-full">
                        <h3 className="text-xl font-bold text-gray-300 mb-6">Once Uploaded Screen order appears</h3>
                        {uploadedScreens.length === 0 ? (
                            <div className="flex items-center justify-center h-[calc(100%-120px)] border-2 border-dashed border-gray-600 rounded-xl bg-gray-700">
                                <div className="text-center">
                                    <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                    </svg>
                                    <p className="text-gray-500 text-lg">Upload images to see screen order</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-4 gap-4">
                                    {uploadedScreens.map((screen, index) => (
                                        <div key={screen.id} className="aspect-square border-2 border-dotted border-gray-600 rounded-xl flex items-center justify-center bg-gray-700 overflow-hidden">
                                            <img src={screen.url} alt={screen.name} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        <div className="absolute bottom-6 right-6">
                            <button
                                onClick={() => setCurrentScreen(2)}
                                disabled={uploadedScreens.length === 0}
                                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-gray-300 font-bold py-3 px-8 rounded-xl transition-colors shadow-lg"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderScreen2 = () => (
        <div className="min-h-screen bg-black text-gray-300">
            {/* Top Header with Navigation */}
            <div className="bg-gray-900 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <button 
                            onClick={() => onNavigate('landing')}
                            className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg transition-colors"
                        >
                            ← Back
                        </button>
                        <div>
                            <h1 className="text-lg font-medium text-gray-400">Screen 2</h1>
                            <h2 className="text-2xl font-bold text-gray-300">Digital Studio</h2>
                        </div>
                    </div>
                    
                    {/* Screen Navigation */}
                    <div className="flex items-center space-x-3">
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => setCurrentScreen(1)}
                                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                                    currentScreen === 1 ? 'border-gray-400 text-gray-400' : 'border-gray-600 text-gray-600 hover:border-gray-500'
                                }`}
                            >
                                1
                            </button>
                            <button 
                                onClick={() => setCurrentScreen(2)}
                                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                                    currentScreen === 2 ? 'border-gray-400 text-gray-400' : 'border-gray-600 text-gray-600 hover:border-gray-500'
                                }`}
                            >
                                2
                            </button>
                        </div>
                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 012.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    {/* Left Panel - Code Generation */}
                    <div className="bg-gray-800 border border-gray-600 rounded-xl p-8">
                        <h3 className="text-xl font-bold text-gray-300 mb-6">Generate code for the screens and show animation when code generation completes for each screen</h3>
                        {isGenerating && (
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                                    <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse"></div>
                                    <span className="text-gray-300 font-medium">Generating code for screen 1...</span>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                                    <div className="w-4 h-4 bg-gray-400 rounded-full animate-pulse"></div>
                                    <span className="text-gray-300 font-medium">Generating code for screen 2...</span>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg opacity-50">
                                    <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                                    <span className="text-gray-500">Generating code for screen 3...</span>
                                </div>
                                <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg opacity-50">
                                    <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                                    <span className="text-gray-500">Generating code for screen 4...</span>
                                </div>
                            </div>
                        )}
                        {!isGenerating && (
                            <button
                                onClick={handleGenerateCode}
                                className="bg-gray-600 hover:bg-gray-700 text-gray-300 font-bold py-4 px-8 rounded-xl transition-colors shadow-lg"
                            >
                                Generate Code
                            </button>
                        )}
                    </div>

                    {/* Right Panel - Preview */}
                    <div className="bg-gray-800 border border-gray-600 rounded-xl p-8">
                        <h3 className="text-xl font-bold text-gray-300 mb-6">Preview of generated code</h3>
                        {generatedCode ? (
                            <pre className="bg-gray-700 p-6 rounded-xl text-sm text-gray-300 overflow-auto max-h-96 border border-gray-600 shadow-inner">
                                <code>{generatedCode}</code>
                            </pre>
                        ) : (
                            <div className="text-gray-500 text-center py-12 bg-gray-700 rounded-xl">
                                <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className="bg-gray-600 hover:bg-gray-700 text-gray-300 font-bold py-3 px-6 rounded-xl transition-colors shadow-lg"
                    >
                        Add logic
                    </button>
                </div>
            </div>
        </div>
    );

    const renderScreen3 = () => (
        <div className="min-h-screen bg-black text-gray-300 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-300">Screen 3</h1>
                    <div className="flex items-center space-x-4">
                        <h2 className="text-4xl font-bold text-gray-300">Design Studio</h2>
                        <div className="flex space-x-2">
                            {[1, 2, 3].map((num) => (
                                <div key={num} className={`w-8 h-8 rounded-lg border-2 border-dashed flex items-center justify-center text-sm ${
                                    num <= 3 ? 'border-gray-400 text-gray-400' : 'border-gray-600 text-gray-600'
                                }`}>
                                    {num}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel - Code Generation */}
                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-gray-300 mb-4">Generate code for the screens and show animation when code generation completes for each screen with input provided by user making changes to previous generated code</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                                <span className="text-gray-300">Screen 1 completed</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                                <span className="text-gray-300">Screen 2 completed</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                                <span className="text-gray-300">Screen 3 completed</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Preview */}
                    <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-gray-300 mb-4">Preview of generated code</h3>
                        <pre className="bg-gray-700 p-4 rounded-lg text-sm text-gray-300 overflow-auto max-h-64 border border-gray-600">
                            <code>{generatedCode}</code>
                        </pre>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={handleDownload}
                        className="bg-gray-600 hover:bg-gray-700 text-gray-300 font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Download
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-gray-300 font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 012.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.39 24 17.08 24 12c0-6.27-5.23-11.5-12-11.5z"/>
                        </svg>
                        <span>Push to Git</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderLogicPopup = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-300 mb-4">Add Logic & Routing</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-2">Custom Logic</label>
                        <textarea
                            value={customLogic}
                            onChange={(e) => setCustomLogic(e.target.value)}
                            placeholder="Enter any custom logic or changes..."
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 resize-none h-24"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2">Routing</label>
                        <textarea
                            value={routing}
                            onChange={(e) => setRouting(e.target.value)}
                            placeholder="Enter routing configuration..."
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 resize-none h-24"
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowLogicPopup(false)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-gray-300 font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                setShowLogicPopup(false);
                                setCurrentScreen(3);
                            }}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-gray-300 font-bold py-2 px-4 rounded-lg transition-colors"
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
            {/* Back Button */}
            <button
                onClick={() => onNavigate('landing')}
                className="absolute top-4 left-4 bg-gray-600 hover:bg-gray-700 text-gray-300 font-bold py-2 px-4 rounded-lg transition-colors z-10"
            >
                ← Back
            </button>

            {/* Screen Navigation */}
            <div className="absolute top-4 right-4 flex space-x-2 z-10">
                {[1, 2, 3].map((screen) => (
                    <button
                        key={screen}
                        onClick={() => setCurrentScreen(screen)}
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm transition-colors ${
                            currentScreen === screen
                                ? 'border-gray-400 text-gray-400'
                                : 'border-gray-600 text-gray-600 hover:border-gray-500'
                        }`}
                    >
                        {screen}
                    </button>
                ))}
            </div>

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