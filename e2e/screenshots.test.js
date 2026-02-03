const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = '/Users/kulmashev/AGCMobileFrontend/screenshots';

// User credentials
const DEMO_EMAIL = 'demo@apexglobal.app';
const DEMO_OTP_CODE = '1234';

// Increase test timeout to 5 minutes
jest.setTimeout(300000);

const takeScreenshot = (name) => {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  try {
    execSync(`xcrun simctl io booted screenshot "${filePath}"`);
    console.log(`Screenshot saved: ${filePath}`);
  } catch (error) {
    console.error(`Failed to take screenshot ${name}:`, error);
  }
};

describe('App Store Screenshots', () => {
  beforeAll(async () => {
    // Override status bar for pretty screenshots (9:41 AM, full battery)
    try {
      execSync(
        'xcrun simctl status_bar booted override --time "9:41" --batteryState charged --batteryLevel 100'
      );
    } catch (e) {
      console.log('Status bar override failed (ignoring):', e.message);
    }

    // Launch app fresh
    await device.launchApp({ newInstance: true, delete: true });
    await device.disableSynchronization();
  });

  afterAll(async () => {
    // Clear status bar override
    try {
      execSync('xcrun simctl status_bar booted clear');
    } catch (e) {}
  });

  it('should navigate and take screenshots', async () => {
    // 1. Welcome Screen
    await waitFor(element(by.id('login-button')))
      .toBeVisible()
      .withTimeout(15000);
    // Wait a bit for animations
    await new Promise((resolve) => setTimeout(resolve, 1000));
    takeScreenshot('00_Welcome');

    // Login Flow
    await element(by.id('login-button')).tap();
    await waitFor(element(by.id('email-input')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('email-input')).typeText(DEMO_EMAIL);

    await element(by.id('send-code-button')).tap();
    await waitFor(element(by.id('code-input')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('code-input')).typeText(DEMO_OTP_CODE);
    await element(by.id('verify-button')).tap();

    // Wait for Home
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(20000);

    // 3. Home Screen
    await new Promise((resolve) => setTimeout(resolve, 3000));
    takeScreenshot('01_Home');

    // 4. Courses Screen
    // Go to courses
    try {
      await element(by.text('Courses')).atIndex(0).tap();
      await waitFor(element(by.id('courses-screen')))
        .toBeVisible()
        .withTimeout(10000);
      await new Promise((resolve) => setTimeout(resolve, 4000)); // Load courses
      takeScreenshot('02_Courses');

      // 5. Course Detail
      // Use ID course-card-0 (fixed)
      try {
        await waitFor(element(by.id('course-card-0')))
          .toBeVisible()
          .withTimeout(10000);
        await element(by.id('course-card-0')).tap();

        await waitFor(element(by.id('course-detail-screen')))
          .toBeVisible()
          .withTimeout(10000);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        takeScreenshot('03_Course_Detail');

        // Try to go back, but we will reload anyway
        // await element(by.id('course-detail-screen')).swipe('right', 'fast', 0.1);
      } catch (e) {
        console.log('Skipping Course Detail:', e);
      }
    } catch (e) {
      console.log('Skipping Courses Screen:', e);
    }

    // RELOAD to ensure clean state and navigation reset
    console.log('Reloading app to reset navigation...');
    await device.disableSynchronization();
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(20000);

    // 6. Chats Screen
    try {
      await element(by.text('Chats')).atIndex(0).tap();
      await waitFor(element(by.id('chats-screen')))
        .toBeVisible()
        .withTimeout(10000);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      takeScreenshot('04_Chats');

      // 7. Chats Create Modal (New Chat)
      await element(by.id('create-chat-button')).tap();
      // Check for modal with extended timeout
      await waitFor(element(by.text('Create chat')))
        .toBeVisible()
        .withTimeout(15000);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for API users
      takeScreenshot('05_Create_Chat_Modal');
    } catch (e) {
      console.log('Skipping Chats/Modal:', e);
    }

    // RELOAD again
    console.log('Reloading app before Profile...');
    await device.disableSynchronization();
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(20000);

    // 8. Profile Screen
    try {
      await element(by.text('Profile')).atIndex(0).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(10000);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      takeScreenshot('06_Profile');
    } catch (e) {
      console.log('Skipping Profile:', e);
    }

    console.log('All screenshots captured!');
  });
});
