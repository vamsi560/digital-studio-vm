import React from 'react';

const CodeViewer = ({ fileName, content, language = 'javascript' }) => {
  const getLanguageFromFile = (fileName) => {
    const extension = fileName?.split('.').pop();
    const langMap = {
      'jsx': 'javascript',
      'js': 'javascript',
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
      // You could add a toast notification here
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

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
        <h4 className="text-white font-medium">{fileName || 'Code'}</h4>
        <div className="flex gap-2">
          <button
            onClick={copyToClipboard}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Copy
          </button>
          <button
            onClick={downloadFile}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Download
          </button>
        </div>
      </div>
      <pre className="p-4 text-sm text-gray-200 overflow-x-auto max-h-96 overflow-y-auto">
        <code className={`language-${getLanguageFromFile(fileName)}`}>
          {content}
        </code>
      </pre>
    </div>
  );
};

export default CodeViewer; 