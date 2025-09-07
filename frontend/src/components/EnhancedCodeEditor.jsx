import React, { useState } from 'react';
import { Button, Badge, Dropdown } from './EnhancedUIComponents';

export const EnhancedCodeEditor = ({ fileName, content, language = 'javascript', onContentChange }) => {
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState('14');
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const getLanguageFromFile = (fileName) => {
    const extension = fileName?.split('.').pop();
    const langMap = {
      'jsx': 'javascript',
      'js': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'css': 'css',
      'html': 'html',
      'md': 'markdown'
    };
    return langMap[extension] || 'text';
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // Add toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName || 'file.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatCode = () => {
    // Add code formatting logic here
    console.log('Formatting code...');
  };

  const lines = content.split('\n');

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg">
      {/* Editor Header */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {fileName || 'Code'}
            </span>
            <Badge variant="primary" size="sm">
              {getLanguageFromFile(fileName)}
            </Badge>
          </div>
          <div className="text-xs text-gray-500">
            {lines.length} lines • {content.length} chars
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Editor Controls */}
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" icon="⚙️">
                Settings
              </Button>
            }
          >
            <div className="p-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Theme
                </label>
                <select 
                  value={theme} 
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Font Size
                </label>
                <select 
                  value={fontSize} 
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                >
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                </select>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={showLineNumbers}
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                  className="mr-2"
                />
                <label className="text-xs text-gray-700 dark:text-gray-300">
                  Line Numbers
                </label>
              </div>
            </div>
          </Dropdown>
          
          <Button variant="ghost" size="sm" onClick={formatCode} icon="✨">
            Format
          </Button>
          <Button variant="ghost" size="sm" onClick={copyToClipboard} icon="📋">
            Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={downloadFile} icon="💾">
            Download
          </Button>
        </div>
      </div>
      
      {/* Editor Content */}
      <div className="relative">
        <div className="flex">
          {showLineNumbers && (
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-4 border-r border-gray-200 dark:border-gray-700 select-none">
              {lines.map((_, index) => (
                <div 
                  key={index} 
                  className="text-xs text-gray-500 dark:text-gray-400 text-right leading-6"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex-1 overflow-x-auto">
            <pre 
              className={`p-4 text-sm text-gray-800 dark:text-gray-200 leading-6 ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-white'
              }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              <code className={`language-${getLanguageFromFile(fileName)}`}>
                {content}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCodeEditor;