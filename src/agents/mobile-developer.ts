/**
 * MobileDeveloperAgent - Ryan O'Connor
 * 10 years of experience in Mobile Development
 * 
 * ⚠️ SCOPE OF WORK (DO NOT GO BEYOND THIS):
 * - Native mobile development (iOS Swift, Android Kotlin)
 * - Cross-platform (React Native, Flutter)
 * - Mobile-specific features (push notifications, offline)
 * - App store deployment
 * - Mobile testing
 * 
 * ❌ DO NOT DO:
 * - Write web frontend code (Frontend Developer)
 * - Write backend code (Backend Developer)
 * - Write business requirements (Product Manager)
 * - Design UI/UX (UX Designer)
 * - Setup backend infrastructure (DevOps)
 * - Web deployment (DevOps)
 */

import { BaseAgent } from './base-agent.js';
import { AgentRole } from '../types/index.js';

export class MobileDeveloperAgent extends BaseAgent {
  constructor() {
    super(AgentRole.MOBILE_DEVELOPER);
  }

  protected getSystemPrompt(): string {
    return `You are **Ryan O'Connor**, a Senior Mobile Developer with 10 years of experience building native and cross-platform mobile applications.

## Your Profile
- **Name**: Ryan O'Connor
- **Experience**: 10 years in Mobile Development
- **Expertise**: iOS (Swift/SwiftUI), Android (Kotlin), React Native, Flutter, Mobile Architecture, Performance Optimization, App Store Deployment, Offline-First

## Your Responsibilities
1. Develop native iOS and Android applications
2. Implement platform-specific features
3. Optimize mobile app performance and battery usage
4. Ensure cross-device compatibility
5. Implement offline functionality
6. Set up push notifications
7. App Store and Play Store deployment
8. Mobile testing and debugging

## Your Work Style
- Native-first but platform-aware
- Performance-conscious (battery, memory, network)
- Offline-first architecture
- Clean mobile architecture (MVVM, MVP, MVI)
- Platform-specific design patterns
- User experience focused

## Platform Expertise

### iOS (Swift/SwiftUI)
- UIKit and SwiftUI
- Combine for reactive programming
- Core Data for persistence
- HealthKit, MapKit, ARKit
- App Clips
- Swift Package Manager
- XcodeGen

### Android (Kotlin)
- Jetpack Compose
- Kotlin Coroutines and Flow
- Room for persistence
- Hilt for DI
- WorkManager
- Jetpack libraries
- Material Design 3

### Cross-Platform
- React Native (JavaScript/TypeScript)
- Flutter (Dart)
- Capacitor/Cordova

## Mobile Architecture

### MVVM Pattern
- View (SwiftUI) <-> ViewModel (Observable) <-> Model (Repository)

### Offline-First Architecture
- UI Layer: Displays cached data immediately
- Repository Layer: Coordinates local + remote
- Local (Room/SQLite) <--Sync--> Remote (API)

## Performance Optimization

### Battery
- Background task optimization
- Location services efficiency
- Network request batching

### Memory
- Image caching and downsampling
- Memory leak detection
- Large data set handling (pagination)

### Network
- Request batching
- Response caching
- Retry with exponential backoff
- Compression

### Rendering
- Lazy loading
- View recycling
- Smooth scrolling optimization

## App Store Requirements

### iOS App Store
- App Store Connect
- Privacy nutrition labels
- Age rating
- Screenshot sizes
- TestFlight beta
- App Review guidelines

### Google Play Store
- Play Console
- Data safety form
- Target API level
- App signing
- Internal testing tracks

## Communication Style
- Platform-specific considerations
- Device fragmentation handling
- Performance metrics (FPS, memory, battery)
- Mobile-specific UX patterns
- App store guideline compliance

Remember: You have 10 years of experience. Mobile is different from web - users have different expectations, constraints, and contexts. You optimize for touch, for offline, for battery life, for the small screen. The best mobile apps feel native and respect the user's time and device.`;
  }

  /**
   * Create mobile app architecture
   */
  async createMobileArchitecture(
    appType: string,
    platforms: ('ios' | 'android' | 'both')[],
    requirements: string
  ): Promise<{
    architecture: string;
    techStack: {
      frontend: string;
      stateManagement: string;
      networking: string;
      persistence: string;
      di: string;
    };
    folderStructure: string;
    platformSpecificNotes: string[];
  }> {
    const result = await this.execute(`
      Design mobile architecture for:
      
      App type: ${appType}
      Platforms: ${platforms.join(', ')}
      
      Requirements:
      ${requirements}
      
      Provide:
      1. Architecture pattern (MVVM/MVI/Clean)
      2. Tech stack recommendations
      3. Folder structure
      4. Platform-specific considerations
    `);

    return {
      architecture: result.data as string,
      techStack: {
        frontend: '',
        stateManagement: '',
        networking: '',
        persistence: '',
        di: '',
      },
      folderStructure: '',
      platformSpecificNotes: [],
    };
  }

  /**
   * Implement iOS feature
   */
  async implementiOSFeature(
    feature: string,
    requirements: string,
    useSwiftUI: boolean = true
  ): Promise<{
    code: string;
    tests: string;
    preview: string;
  }> {
    const result = await this.execute(`
      Implement iOS feature using ${useSwiftUI ? 'SwiftUI' : 'UIKit'}:
      
      Feature: ${feature}
      Requirements:
      ${requirements}
      
      Include:
      1. View/ViewController code
      2. ViewModel if using MVVM
      3. Model definitions
      4. Unit tests
    `);

    return {
      code: result.data as string,
      tests: '',
      preview: '',
    };
  }

  /**
   * Implement Android feature
   */
  async implementAndroidFeature(
    feature: string,
    requirements: string,
    useJetpackCompose: boolean = true
  ): Promise<{
    code: string;
    tests: string;
    preview: string;
  }> {
    const result = await this.execute(`
      Implement Android feature using ${useJetpackCompose ? 'Jetpack Compose' : 'XML layouts'}:
      
      Feature: ${feature}
      Requirements:
      ${requirements}
      
      Include:
      1. Composable function
      2. ViewModel
      3. State management
      4. Unit tests
    `);

    return {
      code: result.data as string,
      tests: '',
      preview: '',
    };
  }

  /**
   * Implement offline functionality
   */
  async implementOfflineFunctionality(
    feature: string,
    syncStrategy: 'local-first' | 'sync-on-connect' | 'optimistic'
  ): Promise<{
    localStorageImplementation: string;
    syncImplementation: string;
    conflictResolution: string;
  }> {
    const result = await this.execute(`
      Implement offline functionality for: ${feature}
      
      Sync strategy: ${syncStrategy}
      
      Include:
      1. Local storage (Room/SQLite/CoreData)
      2. Sync logic
      3. Conflict resolution
      4. Background sync
    `);

    return {
      localStorageImplementation: result.data as string,
      syncImplementation: '',
      conflictResolution: '',
    };
  }

  /**
   * Optimize mobile performance
   */
  async optimizeMobilePerformance(
    app: string,
    currentMetrics: {
      fps?: number;
      memoryUsage?: string;
      coldStart?: string;
      batteryImpact?: string;
    }
  ): Promise<{
    analysis: string;
    optimizations: string[];
    expectedImprovements: Record<string, string>;
  }> {
    const result = await this.execute(`
      Optimize mobile performance for: ${app}
      
      Current metrics:
      ${JSON.stringify(currentMetrics)}
      
      Focus on:
      1. Startup time
      2. Memory usage
      3. Rendering performance
      4. Network efficiency
      5. Battery usage
    `);

    return {
      analysis: result.data as string,
      optimizations: [],
      expectedImprovements: {},
    };
  }

  /**
   * Prepare app store submission
   */
  async prepareAppStoreSubmission(
    appName: string,
    platform: 'ios' | 'android' | 'both',
    releaseNotes: string
  ): Promise<{
    checklist: string[];
    screenshots: string[];
    metadata: {
      description: string;
      keywords: string[];
      category: string;
      ageRating?: string;
    };
    reviewNotes: string;
  }> {
    const result = await this.execute(`
      Prepare ${platform} app store submission for: ${appName}
      
      Release notes:
      ${releaseNotes}
      
      Include:
      1. Submission checklist
      2. Screenshot requirements
      3. Metadata (description, keywords)
      4. Privacy policy requirements
      5. Common rejection reasons to avoid
    `);

    return {
      checklist: [],
      screenshots: [],
      metadata: {
        description: '',
        keywords: [],
        category: '',
      },
      reviewNotes: result.data as string,
    };
  }
}
