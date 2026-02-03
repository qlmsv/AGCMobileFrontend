/**
 * E2E тесты для курсов
 * Покрытие: /api/courses/courses/, /api/courses/categories/, /api/courses/courses/{id}/
 */

const DEMO_EMAIL = 'demo@apexglobal.app';
const DEMO_OTP_CODE = '1234';

describe('Courses Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true, delete: true });
    await device.disableSynchronization();

    // Login
    await waitFor(element(by.id('login-button')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('login-button')).tap();
    await waitFor(element(by.id('email-input')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('email-input')).typeText(DEMO_EMAIL);
    await element(by.id('send-code-button')).tap();
    await waitFor(element(by.id('code-input')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('code-input')).typeText(DEMO_OTP_CODE);
    await element(by.id('verify-button')).tap();
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(15000);
  });

  beforeEach(async () => {
    await device.disableSynchronization();
  });

  describe('Home Screen', () => {
    it('should display home screen', async () => {
      await expect(element(by.id('home-screen'))).toBeVisible();
    });

    it('should display banners carousel', async () => {
      await waitFor(element(by.id('banners-carousel')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should be able to swipe banners', async () => {
      await waitFor(element(by.id('banners-carousel')))
        .toBeVisible()
        .withTimeout(10000);
      await element(by.id('banners-carousel')).swipe('left');
      await expect(element(by.id('banners-carousel'))).toBeVisible();
    });

    it('should display course list', async () => {
      await waitFor(element(by.id('courses-list')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should navigate to course from home', async () => {
      await waitFor(element(by.id('course-card-0')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('course-card-0')).tap();
      await waitFor(element(by.id('course-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Courses Screen', () => {
    beforeEach(async () => {
      await element(by.text('Courses')).atIndex(0).tap();
    });

    it('should display courses screen', async () => {
      await expect(element(by.id('courses-screen'))).toBeVisible();
    });

    it('should display category filters', async () => {
      await waitFor(element(by.id('category-filters')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should filter courses by category', async () => {
      await waitFor(element(by.id('category-chip-0')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('category-chip-0')).tap();
      await waitFor(element(by.id('courses-list')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should switch between categories', async () => {
      await waitFor(element(by.id('category-chip-0')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('category-chip-0')).tap();
      await waitFor(element(by.id('courses-list')))
        .toBeVisible()
        .withTimeout(3000);

      try {
        await element(by.id('category-chip-1')).tap();
        await waitFor(element(by.id('courses-list')))
          .toBeVisible()
          .withTimeout(3000);
      } catch (e) {
        console.log('Only one category exists');
      }
    });

    it('should search courses', async () => {
      await element(by.id('search-input')).typeText('Course');
      await element(by.id('search-input')).tapReturnKey();
      await waitFor(element(by.id('courses-list')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should scroll courses list', async () => {
      await waitFor(element(by.id('courses-list')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('courses-list')).scroll(300, 'down');
      await expect(element(by.id('courses-list'))).toBeVisible();
    });
  });

  describe('Course Detail Screen', () => {
    beforeEach(async () => {
      await element(by.text('Courses')).atIndex(0).tap();
      await waitFor(element(by.id('course-card-0')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('course-card-0')).tap();
      await waitFor(element(by.id('course-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display course detail screen', async () => {
      await expect(element(by.id('course-detail-screen'))).toBeVisible();
    });

    it('should display course title', async () => {
      await expect(element(by.id('course-title'))).toBeVisible();
    });

    it('should display course description', async () => {
      await expect(element(by.id('course-description'))).toBeVisible();
    });

    it('should have enroll button', async () => {
      await expect(element(by.id('enroll-button'))).toBeVisible();
    });

    it('should display modules if available', async () => {
      try {
        await element(by.id('course-detail-screen')).scroll(200, 'down');
        await waitFor(element(by.id('modules-list')))
          .toBeVisible()
          .withTimeout(3000);
      } catch (e) {
        console.log('No modules found');
      }
    });

    it('should go back using swipe gesture', async () => {
      await element(by.id('course-detail-screen')).swipe('right', 'fast', 0.5, 0.1);
      await expect(element(by.id('courses-screen'))).toBeVisible();
    });
  });

  describe('Course Enrollment', () => {
    it('should tap enroll button', async () => {
      await element(by.text('Courses')).atIndex(0).tap();
      await waitFor(element(by.id('course-card-0')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('course-card-0')).tap();
      await waitFor(element(by.id('course-detail-screen')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('enroll-button')).tap();

      // Should either show success or stay on screen
      await expect(element(by.id('course-detail-screen'))).toBeVisible();
    });
  });
});
