import React, { useState } from 'react';

const ProjectFileExplorer = ({ projectFiles, onFileSelect, selectedFile }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src', 'public']));

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop();
    const iconMap = {
      'jsx': '⚛️',
      'js': '📄',
      'json': '⚙️',
      'css': '🎨',
      'html': '🌐',
      'md': '📝',
      'txt': '📄'
    };
    return iconMap[extension] || '📄';
  };

  const getFolderIcon = (isExpanded) => isExpanded ? '📂' : '📁';

  const organizeFiles = (files) => {
    const structure = {};
    
    Object.keys(files).forEach(filePath => {
      const parts = filePath.split('/');
      let current = structure;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const folder = parts[i];
        if (!current[folder]) {
          current[folder] = { type: 'folder', children: {} };
        }
        current = current[folder].children;
      }
      
      const fileName = parts[parts.length - 1];
      current[fileName] = { type: 'file', content: files[filePath], path: filePath };
    });
    
    return structure;
  };

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const renderItem = (name, item, path = '', level = 0) => {
    const fullPath = path ? `${path}/${name}` : name;
    const isSelected = selectedFile === fullPath;

    if (item.type === 'folder') {
      const isExpanded = expandedFolders.has(fullPath);
      return (
        <div key={fullPath}>
          <div 
            className={`flex items-center cursor-pointer hover:bg-gray-700 px-2 py-1 rounded`}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
            onClick={() => toggleFolder(fullPath)}
          >
            <span className="mr-2">{getFolderIcon(isExpanded)}</span>
            <span className="text-blue-400 font-medium">{name}</span>
          </div>
          {isExpanded && (
            <div>
              {Object.entries(item.children).map(([childName, childItem]) =>
                renderItem(childName, childItem, fullPath, level + 1)
              )}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div 
          key={fullPath}
          className={`flex items-center cursor-pointer hover:bg-gray-700 px-2 py-1 rounded ${
            isSelected ? 'bg-blue-600' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => onFileSelect(fullPath)}
        >
          <span className="mr-2">{getFileIcon(name)}</span>
          <span className={isSelected ? 'text-white font-medium' : 'text-gray-200'}>{name}</span>
        </div>
      );
    }
  };

  const fileStructure = organizeFiles(projectFiles);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        📁 Project Files
        <span className="ml-2 text-sm text-gray-400">
          ({Object.keys(projectFiles).length} files)
        </span>
      </h3>
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {Object.entries(fileStructure).map(([name, item]) =>
          renderItem(name, item)
        )}
      </div>
    </div>
  );
};

export default ProjectFileExplorer; 