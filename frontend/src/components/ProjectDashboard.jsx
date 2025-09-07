import React, { useState } from 'react';
import { Button, Card, Badge, Tabs, ProgressBar, Modal } from './EnhancedUIComponents';

export const ProjectDashboard = ({ projectFiles, onFileSelect, selectedFile, projectMetadata }) => {
  const [activeTab, setActiveTab] = useState('files');
  const [showPreview, setShowPreview] = useState(false);

  const getProjectStats = () => {
    const totalFiles = Object.keys(projectFiles).length;
    const fileTypes = {};
    
    Object.keys(projectFiles).forEach(filePath => {
      const extension = filePath.split('.').pop();
      fileTypes[extension] = (fileTypes[extension] || 0) + 1;
    });
    
    return { totalFiles, fileTypes };
  };

  const stats = getProjectStats();

  const tabs = [
    {
      id: 'files',
      label: 'Project Files',
      icon: '📁',
      content: <ProjectFileTree projectFiles={projectFiles} onFileSelect={onFileSelect} selectedFile={selectedFile} />
    },
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      content: <ProjectOverview stats={stats} metadata={projectMetadata} />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      content: <ProjectSettings />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {projectMetadata?.name || 'Generated Project'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {projectMetadata?.framework} • {stats.totalFiles} files
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="success">Ready</Badge>
              <Button 
                size="sm" 
                onClick={() => setShowPreview(true)}
                icon="👁️"
              >
                Preview
              </Button>
            </div>
          </div>
        }
      >
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Project Preview"
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Live preview will be displayed here
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const ProjectFileTree = ({ projectFiles, onFileSelect, selectedFile }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src', 'public']));

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

  const fileStructure = organizeFiles(projectFiles);

  const renderItem = (name, item, path = '', level = 0) => {
    const fullPath = path ? `${path}/${name}` : name;
    const isSelected = selectedFile === fullPath;

    if (item.type === 'folder') {
      const isExpanded = expandedFolders.has(fullPath);
      return (
        <div key={fullPath}>
          <div 
            className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
            style={{ paddingLeft: `${level * 20 + 8}px` }}
            onClick={() => {
              const newExpanded = new Set(expandedFolders);
              if (newExpanded.has(fullPath)) {
                newExpanded.delete(fullPath);
              } else {
                newExpanded.add(fullPath);
              }
              setExpandedFolders(newExpanded);
            }}
          >
            <span className="mr-2">{isExpanded ? '📂' : '📁'}</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">{name}</span>
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

      return (
        <div 
          key={fullPath}
          className={`flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded ${
            isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => onFileSelect(fullPath)}
        >
          <span className="mr-2">{getFileIcon(name)}</span>
          <span className={isSelected ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}>
            {name}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto">
      {Object.entries(fileStructure).map(([name, item]) =>
        renderItem(name, item)
      )}
    </div>
  );
};

const ProjectOverview = ({ stats, metadata }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.totalFiles}</div>
            <div className="text-sm text-gray-500">Total Files</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{Object.keys(stats.fileTypes).length}</div>
            <div className="text-sm text-gray-500">File Types</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{metadata?.qualityScore?.overall || 8}</div>
            <div className="text-sm text-gray-500">Quality Score</div>
          </div>
        </Card>
      </div>

      <Card header={<h3 className="font-semibold">File Distribution</h3>}>
        <div className="space-y-3">
          {Object.entries(stats.fileTypes).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-sm font-medium">.{type}</span>
              <div className="flex items-center gap-2">
                <Badge variant="default">{count}</Badge>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(count / stats.totalFiles) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {metadata?.qualityScore && (
        <Card header={<h3 className="font-semibold">Quality Metrics</h3>}>
          <div className="space-y-4">
            <ProgressBar 
              label="Code Quality" 
              value={metadata.qualityScore.codeQuality || 8} 
              max={10} 
            />
            <ProgressBar 
              label="Performance" 
              value={metadata.qualityScore.performance || 8} 
              max={10} 
              variant="success"
            />
            <ProgressBar 
              label="Accessibility" 
              value={metadata.qualityScore.accessibility || 8} 
              max={10} 
              variant="warning"
            />
            <ProgressBar 
              label="Security" 
              value={metadata.qualityScore.security || 8} 
              max={10} 
              variant="danger"
            />
          </div>
        </Card>
      )}
    </div>
  );
};

const ProjectSettings = () => {
  return (
    <div className="space-y-6">
      <Card header={<h3 className="font-semibold">Export Options</h3>}>
        <div className="space-y-4">
          <Button variant="primary" icon="📦">
            Download ZIP
          </Button>
          <Button variant="secondary" icon="🐙">
            Export to GitHub
          </Button>
          <Button variant="outline" icon="☁️">
            Deploy to Vercel
          </Button>
        </div>
      </Card>

      <Card header={<h3 className="font-semibold">Project Settings</h3>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input 
              type="text" 
              defaultValue="Generated Project" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              rows={3}
              placeholder="Enter project description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProjectDashboard; 