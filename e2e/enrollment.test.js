/**
 * E2E тесты для записи на курс
 * Покрытие: /api/courses/enroll/
 */

const DEMO_EMAIL = 'demo@apexglobal.app';
const DEMO_OTP_CODE = '1234';

describe('Enrollment Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true, delete: true });
    await device.disableSynchronization();
  });

  beforeEach(async () => {
    await device.disableSynchronization();
  });

  it('should login successfully', async () => {
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

  it('should enroll in a course successfully', async () => {
    // Ensure we are logged in (if separate test runs, this relies on prev state if app not killed)
    // But beforeAll launched with delete=true, and first test logged in.
    // beforeEach reloads RN, so app state (Redux/Context) might reset?
    // NO. React Native reload does NOT clear AsyncStorage usually, but it clears Redux state if not persisted.
    // If auth state is in Context/State but not persisted/restored, reloadRN will log us out!

    // CHECK: AuthContext loads from AsyncStorage?
    // If yes, reloadRN is fine.
    // If validation fails, we might need to verify login again or skip reload.

    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);

    // 1. Open first course
    await element(by.text('Courses')).atIndex(0).tap();
    await waitFor(element(by.id('course-card-0')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('course-card-0')).tap();
    await waitFor(element(by.id('course-detail-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // 2. Check Enroll Button state
    try {
      await expect(element(by.text('Enroll Now'))).toBeVisible();
      await element(by.id('enroll-button')).tap();

      if (device.getPlatform() === 'ios') {
        await waitFor(element(by.text('Success').or(by.text('Info'))))
          .toBeVisible()
          .withTimeout(5000);
        await element(by.label('OK')).atIndex(0).tap();
      }
    } catch (e) {
      console.log('User might be already enrolled');
      await expect(element(by.text('Already Enrolled'))).toBeVisible();
    }
  });
});
