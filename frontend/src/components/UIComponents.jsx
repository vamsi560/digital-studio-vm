import React from 'react';

// Enhanced Progress Indicator Component
export const EnhancedProgressIndicator = ({ currentStep, steps, className = "" }) => {
    return (
        <div className={`flex items-center space-x-2 mb-6 ${className}`} role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={steps.length}>
            <div className="flex space-x-2">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;
                    const isUpcoming = stepNumber > currentStep;
                    
                    return (
                        <div key={stepNumber} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                                        isCompleted
                                            ? 'bg-green-500 text-white scale-110'
                                            : isActive
                                            ? 'bg-blue-500 text-white ring-4 ring-blue-500/30 animate-pulse'
                                            : 'bg-gray-600 text-white'
                                    }`}
                                    aria-label={`Step ${stepNumber}: ${step.title} - ${isCompleted ? 'Completed' : isActive ? 'Current' : 'Upcoming'}`}
                                >
                                    {isCompleted ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    ) : (
                                        stepNumber
                                    )}
                                </div>
                                <div className="mt-2 text-center max-w-24">
                                    <p className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                        {step.title}
                                    </p>
                                    {step.description && (
                                        <p className={`text-xs mt-1 ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-8 h-0.5 mx-2 mt-5 ${isCompleted ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Standardized Back Button Component
export const StandardBackButton = ({ onClick, variant = "default", className = "", children = "Back" }) => {
    const baseClasses = "group flex items-center space-x-2 font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-500/30";
    
    const variants = {
        default: "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-200 px-4 py-2 rounded-lg border border-gray-600/30",
        floating: "fixed top-5 left-5 z-50 bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600/50",
        minimal: "text-gray-400 hover:text-white px-2 py-1"
    };

    return (
        <button 
            onClick={onClick}
            className={`${baseClasses} ${variants[variant]} ${className}`}
            aria-label={`Navigate back: ${children}`}
        >
            <svg 
                className="w-4 h-4 group-hover:transform group-hover:-translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            <span className="text-sm">{children}</span>
        </button>
    );
};

// Skeleton Loader Components
export const SkeletonLoader = ({ className = "", variant = "default" }) => {
    const variants = {
        default: "h-4 bg-gray-700 rounded animate-pulse",
        image: "aspect-[9/16] bg-gray-700 rounded-lg animate-pulse",
        button: "h-10 bg-gray-700 rounded-lg animate-pulse",
        text: "h-3 bg-gray-700 rounded animate-pulse",
        card: "h-32 bg-gray-700 rounded-lg animate-pulse"
    };

    return <div className={`${variants[variant]} ${className}`} aria-hidden="true"></div>;
};

export const FileUploadSkeleton = () => (
    <div className="flex flex-col gap-3 p-2 bg-gray-900/50 rounded-lg" aria-label="Loading uploaded files">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
                <SkeletonLoader variant="image" className="w-16 h-16" />
                <div className="flex-1 space-y-2">
                    <SkeletonLoader variant="text" className="w-3/4" />
                    <SkeletonLoader variant="text" className="w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

// Enhanced Drag and Drop Visual Feedback
export const DragDropZone = ({ 
    onDrop, 
    onDragOver, 
    onDragLeave, 
    isDragging, 
    children, 
    className = "",
    acceptedTypes = "images"
}) => {
    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={`
                relative transition-all duration-300 ease-in-out
                ${isDragging 
                    ? 'border-blue-400 bg-blue-500/10 scale-105 shadow-lg ring-4 ring-blue-500/30' 
                    : 'border-gray-600 hover:border-gray-500'
                }
                border-2 border-dashed rounded-lg
                ${className}
            `}
            aria-label={`Drop zone for ${acceptedTypes}`}
            role="button"
            tabIndex={0}
        >
            {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 rounded-lg z-10">
                    <div className="text-center text-white">
                        <svg className="w-12 h-12 mx-auto mb-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <p className="font-medium">Drop {acceptedTypes} here</p>
                    </div>
                </div>
            )}
            {children}
        </div>
    );
};

// Immediate Image Preview Component
export const ImagePreview = ({ 
    src, 
    alt, 
    onRemove, 
    className = "", 
    showRemove = true,
    index,
    isDraggable = false,
    onDragStart 
}) => {
    return (
        <div 
            className={`relative group ${className} ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
            draggable={isDraggable}
            onDragStart={onDragStart}
        >
            <img 
                src={src} 
                alt={alt}
                className="w-full h-full object-cover rounded-lg transition-all duration-300 group-hover:opacity-90"
                loading="lazy"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                <div className="flex space-x-2">
                    {showRemove && (
                        <button
                            onClick={onRemove}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            aria-label={`Remove image ${alt}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    )}
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        aria-label={`Preview image ${alt}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Drag indicator */}
            {isDraggable && (
                <div className="absolute top-2 right-2 bg-gray-800/80 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path>
                    </svg>
                </div>
            )}

            {/* Index indicator */}
            {typeof index !== 'undefined' && (
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-bold">
                    {index + 1}
                </div>
            )}
        </div>
    );
};

// Responsive Grid Component
export const ResponsiveGrid = ({ 
    children, 
    minItemWidth = "280px", 
    gap = "1rem", 
    className = "" 
}) => {
    return (
        <div 
            className={`grid gap-${gap} ${className}`}
            style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
            }}
        >
            {children}
        </div>
    );
};

// Enhanced Modal with Focus Management
export const EnhancedModal = ({ 
    isOpen, 
    onClose, 
    children, 
    title,
    className = "",
    closeOnOverlayClick = true,
    showCloseButton = true 
}) => {
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Focus management
            const focusableElements = document.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            const handleTab = (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            };

            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };

            document.addEventListener('keydown', handleTab);
            document.addEventListener('keydown', handleEscape);

            return () => {
                document.body.style.overflow = 'unset';
                document.removeEventListener('keydown', handleTab);
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                onClick={closeOnOverlayClick ? onClose : undefined}
                aria-hidden="true"
            ></div>
            <div className={`relative bg-gray-800 rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-auto ${className}`}>
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        {title && (
                            <h2 id="modal-title" className="text-lg font-bold text-white">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded p-1"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        )}
                    </div>
                )}
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

// WCAG Compliant Text Component
export const AccessibleText = ({ 
    children, 
    variant = "body", 
    className = "",
    contrastLevel = "AA" // AA or AAA
}) => {
    const variants = {
        h1: "text-3xl font-bold text-white", // White on dark background = AAA
        h2: "text-2xl font-bold text-white",
        h3: "text-xl font-bold text-white",
        h4: "text-lg font-bold text-white",
        body: "text-gray-200", // Light gray on dark = AA compliant
        caption: "text-gray-300 text-sm",
        error: "text-red-300", // Enhanced for better contrast
        success: "text-green-300",
        warning: "text-yellow-300"
    };

    const ContrastEnhanced = {
        error: "text-red-200",
        success: "text-green-200", 
        warning: "text-yellow-200"
    };

    const textClass = contrastLevel === "AAA" && ContrastEnhanced[variant] 
        ? ContrastEnhanced[variant] 
        : variants[variant];

    const Tag = variant.startsWith('h') ? variant : 'p';

    return (
        <Tag className={`${textClass} ${className}`}>
            {children}
        </Tag>
    );
};

export default {
    EnhancedProgressIndicator,
    StandardBackButton,
    SkeletonLoader,
    FileUploadSkeleton,
    DragDropZone,
    ImagePreview,
    ResponsiveGrid,
    EnhancedModal,
    AccessibleText
};