import JSZip from 'jszip';
import cors from 'cors';

// CORS configuration
const corsMiddleware = cors({
  origin: true,
  credentials: true
});

export default async function handler(req, res) {
  console.log('Download ZIP API called:', { method: req.method, url: req.url });

  // Handle CORS
  await new Promise((resolve) => corsMiddleware(req, res, resolve));

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { projectData, projectName } = req.body;

    if (!projectData || !projectName) {
      return res.status(400).json({
        success: false,
        error: 'Project data and name are required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Downloading project ZIP:', { projectName });

    // Create a ZIP file
    const zip = new JSZip();
    
    if (projectData.mainCode) {
      zip.file("App.jsx", projectData.mainCode);
    }

    // Add basic project structure
    const packageJson = {
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: "1.0.0",
      private: true,
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      },
      scripts: {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      }
    };

    zip.file("package.json", JSON.stringify(packageJson, null, 2));

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${projectName}.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);

    res.send(zipBuffer);

  } catch (error) {
    console.error('Download ZIP error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
} 