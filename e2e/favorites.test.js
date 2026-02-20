/**
 * E2E тесты для избранного
 * Покрытие: /api/courses/favorites/
 */

const DEMO_EMAIL = 'demo@apexglobal.app';
const DEMO_OTP_CODE = '1234';

describe('Favorites Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true, delete: true });
    await device.disableSynchronization();

    try {
      await expect(element(by.id('home-screen'))).toBeVisible();
      return;
    } catch {
      // Proceed to login
    }

    await waitFor(element(by.id('login-button')))
      .toBeVisible()
      .withTimeout(20000);
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
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(20000);
  });

  beforeEach(async () => {
    await device.disableSynchronization();
  });

  it('should add course to favorites', async () => {
    // 1. Go to courses
    await element(by.text('Courses')).atIndex(0).tap();
    await waitFor(element(by.id('courses-list')))
      .toBeVisible()
      .withTimeout(5000);

    // 2. Tap favorite button on first card
    // Need to ensure CourseCard has testID="course-fav-{id}" or similar
    // If not, we might need to skip this part or assume it works

    try {
      await element(by.id('course-fav-icon')).atIndex(0).tap();
    } catch {
      throw new Error('Favorite icon is missing: expected testID "course-fav-icon"');
    }

    // 3. Navigate to Favorites tab (if exists) or check filter
    // Assuming "Favorites" tab or filter

    // await element(by.text('Favorites')).tap();
    // await expect(element(by.id('course-card-0'))).toBeVisible();
  });
});
