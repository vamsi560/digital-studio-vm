import React, { useState } from 'react';
import { Button, Container, Grid, Card, Badge } from './EnhancedUIComponents';
import ProjectDashboard from './ProjectDashboard';
import EnhancedCodeEditor from './EnhancedCodeEditor';

export const EnhancedAppLayout = ({ 
  view, 
  onNavigate, 
  generatedFiles, 
  selectedFile, 
  onFileSelect, 
  projectMetadata,
  isLoading,
  error 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');

  if (view === 'prototype' && Object.keys(generatedFiles).length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <Container>
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  icon="☰"
                >
                  Menu
                </Button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Digital Studio VM
                </h1>
                <Badge variant="success">Project Ready</Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={activeView === 'dashboard' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('dashboard')}
                  icon="📊"
                >
                  Dashboard
                </Button>
                <Button
                  variant={activeView === 'editor' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('editor')}
                  icon="💻"
                >
                  Editor
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('landing')}
                  icon="🏠"
                >
                  Home
                </Button>
              </div>
            </div>
          </Container>
        </header>

        {/* Main Content */}
        <div className="flex">
          {/* Sidebar */}
          {sidebarOpen && (
            <aside className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen overflow-y-auto">
              <div className="p-4">
                <ProjectDashboard
                  projectFiles={generatedFiles}
                  onFileSelect={onFileSelect}
                  selectedFile={selectedFile}
                  projectMetadata={projectMetadata}
                />
              </div>
            </aside>
          )}

          {/* Main Panel */}
          <main className="flex-1 p-6">
            {activeView === 'dashboard' && (
              <Container>
                <div className="space-y-6">
                  <Card
                    header={
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">Project Overview</h2>
                        <div className="flex gap-2">
                          <Button variant="success" icon="🚀">Deploy</Button>
                          <Button variant="primary" icon="📦">Export</Button>
                        </div>
                      </div>
                    }
                  >
                    <Grid cols={3} gap={6}>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {Object.keys(generatedFiles).length}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Files Generated</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {projectMetadata?.qualityScore?.overall || 8.5}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Quality Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {projectMetadata?.framework || 'React'}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Framework</div>
                      </div>
                    </Grid>
                  </Card>

                  {selectedFile && generatedFiles[selectedFile] && (
                    <Card
                      header={
                        <h3 className="text-lg font-semibold">File Preview: {selectedFile}</h3>
                      }
                    >
                      <EnhancedCodeEditor
                        fileName={selectedFile}
                        content={generatedFiles[selectedFile]}
                      />
                    </Card>
                  )}
                </div>
              </Container>
            )}

            {activeView === 'editor' && selectedFile && (
              <Container size="full">
                <EnhancedCodeEditor
                  fileName={selectedFile}
                  content={generatedFiles[selectedFile]}
                />
              </Container>
            )}
          </main>
        </div>
      </div>
    );
  }

  // Default view for other states
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Container>
        <div className="py-12">
          {isLoading && (
            <Card>
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Generating your project...</p>
              </div>
            </Card>
          )}

          {error && (
            <Card>
              <div className="text-center py-12">
                <div className="text-red-600 text-4xl mb-4">❌</div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => onNavigate('landing')}
                >
                  Go Back
                </Button>
              </div>
            </Card>
          )}
        </div>
      </Container>
    </div>
  );
};

export default EnhancedAppLayout;