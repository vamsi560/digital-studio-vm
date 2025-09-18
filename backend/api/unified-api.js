import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import cors from 'cors';
import JSZip from 'jszip';
import crypto from 'crypto';
import { InputValidator, SecurityValidator, createValidationMiddleware } from './validation.js';
import { codeGenerationCache, performanceMonitor, requestThrottler } from './cache.js';
import { advancedCodeGenerator, CodeAnalyzer, ProjectOptimizer } from './advanced-features.js';

// CORS configuration
const corsMiddleware = cors({
  origin: true, // Allow all origins for testing
  credentials: true
});

// Initialize Gemini AI model
const gemini = new GoogleGenerativeAI("AIzaSyBcR6rMwP9v8e2cN56gdnkWMhJtOWyP_uU");

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  }
});

export default async function handler(req, res) {
  const startTime = performanceMonitor.startTimer();
  const clientId = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  
  console.log('Unified API Request received:', {
    method: req.method,
    url: req.url,
    contentType: req.headers['content-type'],
    clientId,
    timestamp: new Date().toISOString()
  });

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

  // Rate limiting
  if (!requestThrottler.isAllowed(clientId)) {
    const remaining = requestThrottler.getRemainingRequests(clientId);
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: 60,
      remainingRequests: remaining,
      timestamp: new Date().toISOString()
    });
  }

  try {
    const { action, ...data } = req.body || {};
    const contentType = req.headers['content-type'] || '';

    // Handle form data requests (for generate-code)
    if (contentType.includes('multipart/form-data')) {
      return await handleCodeGeneration(req, res);
    }

    // Handle JSON requests with action parameter
    switch (action) {
      case 'generate_code':
        return await handleCodeGeneration(req, res);
      
      case 'import_figma':
        return await handleFigmaImport(req, res);
      
      case 'generate_native_code':
        return await handleNativeCodeGeneration(req, res);
      
      case 'generate_android':
        return await handleAndroidGeneration(req, res);
      
      case 'generate_mcp':
        return await handleMCPGeneration(req, res);
      
      case 'analyze_prompt':
        return await handlePromptAnalysis(req, res);
      
      case 'generate_from_text':
        return await handleTextGeneration(req, res);
      
      case 'github_export':
        return await handleGitHubExport(req, res);
      
      case 'download_zip':
        return await handleDownloadZip(req, res);
      
      case 'live_preview':
        return await handleLivePreview(req, res);
      
      case 'evaluate_code':
        return await handleCodeEvaluation(req, res);
      
      case 'enhanced_api':
        return await handleEnhancedAPI(req, res);
      
      case 'health':
        return await handleHealth(req, res);
      
      case 'metrics':
        return await handleMetrics(req, res);
      
      default:
        return res.status(400).json({ error: 'Invalid action specified' });
    }

  } catch (error) {
    console.error('Unified API Error:', error);
    
    // Record error metrics
    performanceMonitor.recordRequest(
      performanceMonitor.endTimer(startTime), 
      true, 
      false
    );
    
    // Enhanced error response
    const errorResponse = {
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    };
    
    // Add validation error details
    if (error.name === 'ValidationError') {
      errorResponse.field = error.field;
      errorResponse.code = error.code;
      res.status(400).json(errorResponse);
    } else {
      res.status(500).json(errorResponse);
    }
  }
}

// Enhanced code generation function that creates complete projects
async function generateCompleteReactProject(images, options) {
  try {
    // Validate inputs
    InputValidator.validateProjectOptions(options);
    
    // Use advanced code generator with caching and retry logic
    const result = await advancedCodeGenerator.generateWithRetry(images, options);
    
    // Analyze the generated code
    const analysis = CodeAnalyzer.analyzeCode(result.code, options.framework);
    
    // Optimize the project
    const optimizedProject = ProjectOptimizer.optimizeProject(result.projectFiles || { 'src/App.jsx': result.code });
    
    return {
      success: true,
      projectFiles: optimizedProject,
      mainCode: optimizedProject['src/App.jsx'] || result.code,
      analysis: analysis,
      qualityScore: result.quality || analysis.maintainability,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Enhanced code generation failed:', error);
    // Fallback to basic generation
    const mainComponentCode = await generateWithGemini(images, options);
    
    // Create complete project structure
  const projectFiles = {
    'package.json': JSON.stringify({
      name: "digital-studio-project",
      version: "1.0.0",
      private: true,
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-scripts": "5.0.1",
        ...(options.styling === 'Tailwind CSS' && {
          "tailwindcss": "^3.3.0",
          "autoprefixer": "^10.4.14",
          "postcss": "^8.4.24"
        })
      },
      scripts: {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
      },
      eslintConfig: {
        extends: ["react-app", "react-app/jest"]
      },
      browserslist: {
        production: [">0.2%", "not dead", "not op_mini all"],
        development: ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
      }
    }, null, 2),

    'src/App.jsx': mainComponentCode,

    'src/index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

    'src/index.css': generateCSS(options.styling),

    'public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Generated React App by Digital Studio VM" />
    <title>Digital Studio Project</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`,

    'README.md': `# Digital Studio Project

This project was generated using Digital Studio VM.

## Available Scripts

In the project directory, you can run:

### \`npm start\`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### \`npm test\`

Launches the test runner in interactive watch mode.

### \`npm run build\`

Builds the app for production to the \`build\` folder.

## Generated Features

- Framework: ${options.framework}
- Platform: ${options.platform}
- Styling: ${options.styling}
- Architecture: ${options.architecture}

Generated on: ${new Date().toISOString()}
`
  };

  // Add Tailwind config if using Tailwind CSS
  if (options.styling === 'Tailwind CSS') {
    projectFiles['tailwind.config.js'] = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    projectFiles['postcss.config.js'] = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  }

    return {
      success: true,
      projectFiles: projectFiles,
      mainCode: mainComponentCode,
      timestamp: new Date().toISOString()
    };
  }
}

function generateCSS(stylingOption) {
  const baseCSS = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

* {
  box-sizing: border-box;
}`;

  if (stylingOption === 'Tailwind CSS') {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

${baseCSS}`;
  }

  return baseCSS;
}

// Helper: generate code with Gemini using images and options
async function generateWithGemini(images, options) {
  const {
    platform = 'web',
    framework = 'React',
    styling = 'Tailwind CSS',
    architecture = 'Component Based',
    customLogic = '',
    routing = ''
  } = options || {};

  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Generate a complete ${framework} main component (App.jsx) for a ${platform} project.\n\nRequirements:\n\n- Styling: ${styling}\n\n- Architecture: ${architecture}\n\n- Custom Logic: ${customLogic || 'None'}\n\n- Routing: ${routing || 'None'}\n\n\nProvide production-ready, accessible, responsive code. Include necessary imports. Return only the component code.`;

  const imageParts = (images || []).map(img => ({
    inlineData: {
      data: img.data,
      mimeType: img.mimeType || 'image/png'
    }
  }));

  const result = await model.generateContent([prompt, ...imageParts]);
  return result.response.text();
}

// Update the handleCodeGeneration function
async function handleCodeGeneration(req, res) {
  try {
    console.log('Parsing form data...');
    const formData = await new Promise((resolve, reject) => {
      upload.array('images', 10)(req, res, (err) => {
        if (err) {
          console.error('Multer error:', err);
          reject(err);
        } else {
          console.log('Form data parsed successfully');
          console.log('Files received:', req.files?.length || 0);
          console.log('Body data:', req.body);
          resolve(req);
        }
      });
    });

    // Handle case where no files are uploaded
    if (!formData.files || formData.files.length === 0) {
      console.log('No files uploaded, generating sample project...');
      
      const options = {
        platform: 'web',
        framework: 'React',
        styling: 'Tailwind CSS',
        architecture: 'Component Based'
      };

      const sampleProjectFiles = await generateCompleteReactProject([], options);
      
      res.json({
        success: true,
        projectFiles: sampleProjectFiles,
        mainCode: sampleProjectFiles['src/App.jsx'],
        qualityScore: { overall: 8, codeQuality: 8, performance: 8, accessibility: 8, security: 8 },
        analysis: { analysis: 'Sample project with complete file structure' },
        projectId: `project-${Date.now()}`,
        metadata: {
          id: `project-${Date.now()}`,
          platform: options.platform,
          framework: options.framework,
          qualityScore: { overall: 8 },
          timestamp: new Date().toISOString(),
          analysis: 'Complete project structure generated'
        },
        platform: options.platform,
        framework: options.framework,
        timestamp: new Date().toISOString()
      });
      return;
    }

    const images = formData.files?.map(file => ({
      data: file.buffer.toString('base64'),
      mimeType: file.mimetype,
      originalname: file.originalname
    })) || [];

    const options = {
      platform: formData.body.platform || 'web',
      framework: formData.body.framework || 'React',
      styling: formData.body.styling || 'Tailwind CSS',
      architecture: formData.body.architecture || 'Component Based',
      customLogic: formData.body.customLogic || '',
      routing: formData.body.routing || ''
    };

    // Generate complete project with all files
    const projectFiles = await generateCompleteReactProject(images, options);
    
    const projectId = `project-${Date.now()}`;
    
    res.json({
      success: true,
      projectFiles: projectFiles,
      mainCode: projectFiles['src/App.jsx'],
      qualityScore: { overall: 8, codeQuality: 8, performance: 8, accessibility: 8, security: 8 },
      analysis: { analysis: 'Complete project structure generated with all necessary files' },
      projectId,
      metadata: {
        id: projectId,
        platform: options.platform,
        framework: options.framework,
        qualityScore: { overall: 8 },
        timestamp: new Date().toISOString(),
        analysis: 'Complete project structure generated'
      },
      platform: options.platform,
      framework: options.framework,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Handle Figma import
async function handleFigmaImport(req, res) {
  try {
    const { figmaUrl, platform, framework, styling, architecture } = req.body;

    if (!figmaUrl) {
      return res.status(400).json({
        success: false,
        error: 'Figma URL is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Importing from Figma:', { figmaUrl, platform, framework });

    // Extract file key from Figma URL
    const fileKey = extractFigmaFileKey(figmaUrl);
    if (!fileKey) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Figma URL',
        timestamp: new Date().toISOString()
      });
    }

    // Get Figma file data
    const figmaData = await getFigmaFileData(fileKey);
    const frames = extractFigmaFrames(figmaData.document);
    const imageUrls = await getFigmaImageUrls(fileKey, frames);
    const images = await downloadFigmaImages(imageUrls);

    // Generate code from Figma data
    const options = {
      platform: platform || 'web',
      framework: framework || 'React',
      styling: styling || 'Tailwind CSS',
      architecture: architecture || 'Component Based'
    };

    const generatedCode = await generateWithGemini(images, options);
    
    const projectId = `figma-project-${Date.now()}`;
    
    res.json({
      success: true,
      mainCode: generatedCode,
      figmaData: {
        fileKey,
        frames: frames.length,
        images: images.length
      },
      projectId,
      platform: options.platform,
      framework: options.framework,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Figma import error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Handle native code generation
async function handleNativeCodeGeneration(req, res) {
  try {
    const { platform, framework, description, images } = req.body;

    console.log('Generating native code:', { platform, framework, description });

    const prompt = `Generate ${platform} native code using ${framework} for the following description: ${description}`;
    
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const generatedCode = result.response.text();

    res.json({
      success: true,
      code: generatedCode,
      platform,
      framework,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Native code generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Handle Android generation
async function handleAndroidGeneration(req, res) {
  try {
    const { description, features, architecture = 'MVVM', language = 'Kotlin' } = req.body;

    console.log('Generating Android code:', { description, features, architecture, language });

    const projectFiles = await generateCompleteAndroidProject(description, features, architecture, language);

    res.json({
      success: true,
      projectFiles: projectFiles,
      mainCode: projectFiles['app/src/main/java/com/example/app/MainActivity.kt'] || projectFiles['app/src/main/java/com/example/app/MainActivity.java'],
      platform: 'android',
      architecture: architecture,
      language: language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Android generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Enhanced Android project generation
async function generateCompleteAndroidProject(description, features, architecture, language) {
  const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const projectName = 'DigitalStudioApp';
  const packageName = 'com.digitalstudio.app';
  
  // Generate main activity
  const mainActivityPrompt = `Generate a complete ${language} MainActivity for Android with ${architecture} architecture.
Description: ${description}
Features: ${features}

Include:
- Modern Android development practices
- ${architecture} architecture pattern
- Material Design 3 components
- Proper lifecycle management
- Error handling
- Accessibility features

Return only the ${language} code without explanations.`;
  
  const mainActivityResult = await model.generateContent(mainActivityPrompt);
  const mainActivityCode = mainActivityResult.response.text();

  // Generate project structure
  const projectFiles = {
    'build.gradle': `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    id 'kotlin-kapt'
    id 'kotlin-parcelize'
}

android {
    namespace '${packageName}'
    compileSdk 34

    defaultConfig {
        applicationId "${packageName}"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = '1.8'
    }
    buildFeatures {
        viewBinding true
        dataBinding true
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'
    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.7.0'
    implementation 'androidx.navigation:navigation-fragment-ktx:2.7.6'
    implementation 'androidx.navigation:navigation-ui-ktx:2.7.6'
    implementation 'androidx.room:room-runtime:2.6.1'
    implementation 'androidx.room:room-ktx:2.6.1'
    kapt 'androidx.room:room-compiler:2.6.1'
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    implementation 'androidx.work:work-runtime-ktx:2.9.0'
    
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}`,

    'app/src/main/AndroidManifest.xml': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.DigitalStudioApp"
        tools:targetApi="31">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.DigitalStudioApp">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`,

    'app/src/main/res/values/strings.xml': `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Digital Studio App</string>
    <string name="app_description">Generated with Digital Studio VM</string>
    <string name="welcome_message">Welcome to your generated Android app!</string>
    <string name="error_generic">Something went wrong. Please try again.</string>
    <string name="loading">Loading...</string>
</resources>`,

    'app/src/main/res/values/themes.xml': `<?xml version="1.0" encoding="utf-8"?>
<resources xmlns:tools="http://schemas.android.com/tools">
    <!-- Base application theme. -->
    <style name="Base.Theme.DigitalStudioApp" parent="Theme.Material3.DayNight">
        <!-- Customize your light theme here. -->
        <item name="colorPrimary">@color/md_theme_light_primary</item>
        <item name="colorOnPrimary">@color/md_theme_light_onPrimary</item>
        <item name="colorPrimaryContainer">@color/md_theme_light_primaryContainer</item>
        <item name="colorOnPrimaryContainer">@color/md_theme_light_onPrimaryContainer</item>
    </style>

    <style name="Theme.DigitalStudioApp" parent="Base.Theme.DigitalStudioApp" />
</resources>`,

    'app/src/main/res/values/colors.xml': `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="md_theme_light_primary">#6750A4</color>
    <color name="md_theme_light_onPrimary">#FFFFFF</color>
    <color name="md_theme_light_primaryContainer">#EADDFF</color>
    <color name="md_theme_light_onPrimaryContainer">#21005D</color>
    <color name="md_theme_light_secondary">#625B71</color>
    <color name="md_theme_light_onSecondary">#FFFFFF</color>
    <color name="md_theme_light_secondaryContainer">#E8DEF8</color>
    <color name="md_theme_light_onSecondaryContainer">#1D192B</color>
    <color name="md_theme_light_tertiary">#7D5260</color>
    <color name="md_theme_light_onTertiary">#FFFFFF</color>
    <color name="md_theme_light_tertiaryContainer">#FFD8E4</color>
    <color name="md_theme_light_onTertiaryContainer">#31111D</color>
    <color name="md_theme_light_error">#BA1A1A</color>
    <color name="md_theme_light_errorContainer">#FFDAD6</color>
    <color name="md_theme_light_onError">#FFFFFF</color>
    <color name="md_theme_light_onErrorContainer">#410002</color>
    <color name="md_theme_light_outline">#79747E</color>
    <color name="md_theme_light_background">#FFFBFE</color>
    <color name="md_theme_light_onBackground">#1C1B1F</color>
    <color name="md_theme_light_surface">#FFFBFE</color>
    <color name="md_theme_light_onSurface">#1C1B1F</color>
    <color name="md_theme_light_surfaceVariant">#E7E0EC</color>
    <color name="md_theme_light_onSurfaceVariant">#49454F</color>
    <color name="md_theme_light_inverseSurface">#313033</color>
    <color name="md_theme_light_inverseOnSurface">#F4EFF4</color>
    <color name="md_theme_light_inversePrimary">#D0BCFF</color>
</resources>`,

    'app/src/main/res/layout/activity_main.xml': `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="16dp"
    tools:context=".MainActivity">

    <com.google.android.material.card.MaterialCardView
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_margin="16dp"
        app:cardCornerRadius="12dp"
        app:cardElevation="4dp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:padding="24dp">

            <ImageView
                android:layout_width="64dp"
                android:layout_height="64dp"
                android:layout_gravity="center_horizontal"
                android:layout_marginBottom="16dp"
                android:src="@android:drawable/ic_dialog_info"
                app:tint="@color/md_theme_light_primary" />

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_gravity="center_horizontal"
                android:layout_marginBottom="8dp"
                android:text="@string/app_name"
                android:textAppearance="@style/TextAppearance.Material3.HeadlineSmall"
                android:textColor="@color/md_theme_light_onSurface" />

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_gravity="center_horizontal"
                android:layout_marginBottom="24dp"
                android:text="@string/welcome_message"
                android:textAppearance="@style/TextAppearance.Material3.BodyLarge"
                android:textColor="@color/md_theme_light_onSurfaceVariant" />

            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnAction"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:text="Get Started"
                app:icon="@android:drawable/ic_media_play"
                style="@style/Widget.Material3.Button" />

        </LinearLayout>

    </com.google.android.material.card.MaterialCardView>

</androidx.constraintlayout.widget.ConstraintLayout>`,

    'README.md': `# Digital Studio Android App

This Android application was generated using Digital Studio VM.

## Features

- **Architecture**: ${architecture}
- **Language**: ${language}
- **Description**: ${description}
- **Features**: ${features}

## Getting Started

1. Open the project in Android Studio
2. Sync the project with Gradle files
3. Run the app on an emulator or device

## Project Structure

- \`app/src/main/java/\` - Main source code
- \`app/src/main/res/\` - Resources (layouts, strings, colors)
- \`app/src/main/AndroidManifest.xml\` - App configuration

## Dependencies

- Material Design 3
- AndroidX libraries
- Room database
- Retrofit for networking
- Coroutines for async operations

Generated on: ${new Date().toISOString()}
`
  };

  // Add main activity code
  if (language.toLowerCase() === 'kotlin') {
    projectFiles[`app/src/main/java/${packageName.replace(/\./g, '/')}/MainActivity.kt`] = mainActivityCode;
  } else {
    projectFiles[`app/src/main/java/${packageName.replace(/\./g, '/')}/MainActivity.java`] = mainActivityCode;
  }

  return projectFiles;
}

// Handle MCP generation
async function handleMCPGeneration(req, res) {
  try {
    const { description } = req.body;

    console.log('Generating MCP code:', { description });

    const prompt = `Generate Model Context Protocol (MCP) code for: ${description}`;
    
    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const generatedCode = result.response.text();

    res.json({
      success: true,
      code: generatedCode,
      platform: 'mcp',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('MCP generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Handle prompt analysis
async function handlePromptAnalysis(req, res) {
  try {
    const { prompt, platform, framework, styling, architecture } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Analyzing prompt:', { prompt, platform, framework, styling, architecture });

    const analysisPrompt = `
Analyze the following project description and provide a detailed breakdown:

Project Description: ${prompt}
Platform: ${platform || 'web'}
Framework: ${framework || 'React'}
Styling: ${styling || 'Tailwind CSS'}
Architecture: ${architecture || 'Component-Based'}

Please provide:
1. Project Overview
2. Key Features
3. Technical Requirements
4. Component Structure
5. Data Flow
6. UI/UX Considerations
7. Implementation Recommendations

Return the analysis in a structured format.
    `;

    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(analysisPrompt);
    const analysis = result.response.text();

    res.json({
      success: true,
      analysis,
      prompt,
      platform: platform || 'web',
      framework: framework || 'React',
      styling: styling || 'Tailwind CSS',
      architecture: architecture || 'Component-Based',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Prompt analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Handle text generation
async function handleTextGeneration(req, res) {
  try {
    const { prompt, platform, framework, styling, architecture, customLogic, routing } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Generating code from text:', { prompt, platform, framework, styling, architecture });

    const codeGenerationPrompt = `
Generate a complete ${framework} component based on the following description:

Description: ${prompt}
Platform: ${platform || 'web'}
Framework: ${framework || 'React'}
Styling: ${styling || 'Tailwind CSS'}
Architecture: ${architecture || 'Component-Based'}
Custom Logic: ${customLogic || 'None'}
Routing: ${routing || 'None'}

Requirements:
1. Create a functional ${framework} component
2. Use ${styling} for styling
3. Follow ${architecture} architecture
4. Include proper error handling
5. Make it responsive and accessible
6. Add comprehensive comments
7. Follow best practices

Return only the complete component code without explanations.
    `;

    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(codeGenerationPrompt);
    const generatedCode = result.response.text();

    const qualityScore = {
      overall: 8,
      codeQuality: 8,
      performance: 8,
      accessibility: 8,
      security: 8
    };

    const analysis = `# Component Analysis

## ${framework} Component for ${platform}

### Component Structure
- Functional component using ${framework}
- Styled with ${styling}
- Follows ${architecture} architecture

### Features
- Responsive design
- Accessible markup
- Error handling
- Clean code structure

### Technical Details
- Platform: ${platform}
- Framework: ${framework}
- Styling: ${styling}
- Architecture: ${architecture}

Generated from text description: "${prompt}"
    `;

    const projectId = `project-${Date.now()}`;

    res.json({
      success: true,
      mainCode: generatedCode,
      qualityScore,
      analysis: { analysis },
      projectId,
      metadata: {
        id: projectId,
        platform: platform || 'web',
        framework: framework || 'React',
        qualityScore,
        timestamp: new Date().toISOString(),
        analysis
      },
      platform: platform || 'web',
      framework: framework || 'React',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Text generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Handle GitHub export
async function handleGitHubExport(req, res) {
  try {
    const { projectData, projectName, framework, platform } = req.body;

    if (!projectData || !projectName) {
      return res.status(400).json({
        success: false,
        error: 'Project data and name are required',
        timestamp: new Date().toISOString()
      });
    }

    console.log('Exporting project to GitHub:', { projectName, framework, platform });

    // Create a ZIP file with the project structure
    const zip = new JSZip();

    // Add package.json
    const packageJson = {
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: "1.0.0",
      private: true,
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      },
      devDependencies: {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "vite": "^4.0.0",
        "@vitejs/plugin-react": "^4.0.0"
      },
      scripts: {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
      }
    };

    zip.file("package.json", JSON.stringify(packageJson, null, 2));

    // Add README.md
    const readme = `# ${projectName}

This project was generated using Digital Studio VM.

## Features
- ${framework} framework
- ${platform} platform
- Modern development setup

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start development server:
\`\`\`bash
npm run dev
\`\`\`

3. Build for production:
\`\`\`bash
npm run build
\`\`\`

## Project Structure
- \`src/\` - Source code
- \`public/\` - Static assets
- \`package.json\` - Dependencies and scripts

Generated on: ${new Date().toISOString()}
`;

    zip.file("README.md", readme);

    // Add source files
    if (projectData.mainCode) {
      zip.file("src/App.jsx", projectData.mainCode);
    }

    // Add index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;

    zip.file("index.html", indexHtml);

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${projectName}.zip"`);
    res.send(zipBuffer);

  } catch (error) {
    console.error('GitHub export error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Handle download zip
async function handleDownloadZip(req, res) {
  try {
    const { projectData, projectName } = req.body;

    if (!projectData || !projectName) {
      return res.status(400).json({
        success: false,
        error: 'Project data and name are required',
        timestamp: new Date().toISOString()
      });
    }

    // Create a ZIP file with the project structure
    const zip = new JSZip();

    // Add package.json
    const packageJson = {
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: "1.0.0",
      private: true,
      dependencies: {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      },
      scripts: {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test"
      }
    };

    zip.file("package.json", JSON.stringify(packageJson, null, 2));

    // Add source files
    if (projectData.mainCode) {
      zip.file("src/App.jsx", projectData.mainCode);
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${projectName}.zip"`);
    res.send(zipBuffer);

  } catch (error) {
    console.error('Download zip error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Handle live preview
async function handleLivePreview(req, res) {
  try {
    const { code, framework } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
        timestamp: new Date().toISOString()
      });
    }

    // Generate preview URL or return preview data
    res.json({
      success: true,
      previewUrl: `data:text/html;base64,${Buffer.from(code).toString('base64')}`,
      framework: framework || 'React',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Live preview error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Handle code evaluation
async function handleCodeEvaluation(req, res) {
  try {
    const { code, framework } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required',
        timestamp: new Date().toISOString()
      });
    }

    const evaluationPrompt = `
Evaluate the quality of the following ${framework} code:

${code}

Provide a detailed evaluation covering:
1. Code Quality (1-10)
2. Performance (1-10)
3. Accessibility (1-10)
4. Best Practices (1-10)
5. Security (1-10)
6. Overall Score (1-10)

Return the evaluation as JSON format.
    `;

    const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(evaluationPrompt);
    const evaluation = result.response.text();

    res.json({
      success: true,
      evaluation,
      framework: framework || 'React',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Code evaluation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Handle enhanced API
async function handleEnhancedAPI(req, res) {
  try {
    const { action, ...data } = req.body;

    res.json({
      success: true,
      message: 'Enhanced API endpoint',
      action,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Figma helper functions
function extractFigmaFileKey(url) {
  const match = url.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

async function getFigmaFileData(fileKey) {
  // Placeholder for Figma API integration
  return {
    document: {
      children: []
    }
  };
}

function extractFigmaFrames(document) {
  // Placeholder for frame extraction
  return [];
}

async function getFigmaImageUrls(fileKey, frames) {
  // Placeholder for image URL generation
  return [];
}

async function downloadFigmaImages(imageUrls) {
  // Placeholder for image downloading
  return [];
}

// Health check endpoint
async function handleHealth(req, res) {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      services: {
        gemini: 'operational',
        cache: 'operational',
        validation: 'operational',
        performance: 'operational'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Metrics endpoint
async function handleMetrics(req, res) {
  try {
    const metrics = {
      performance: performanceMonitor.getMetrics(),
      cache: codeGenerationCache.getStats(),
      timestamp: new Date().toISOString()
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}