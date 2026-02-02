/**
 * E2E тесты для Teachers (Создание курса)
 * Покрытие: /api/courses/courses/ (POST), etc.
 */

const TEACHER_EMAIL = 'teacher@apexglobal.app';
const TEACHER_CODE = '1234';

describe('Teacher Course Flow', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true, delete: true });
        await device.disableSynchronization();

        // Wait for app to settle
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Ensure we are at login flow
        try {
            // If we are at home (unexpectedly), logout
            await expect(element(by.id('home-screen'))).toBeVisible();
            await element(by.text('Profile')).tap();
            await element(by.id('logout-button')).tap();
            try { await element(by.text('Выйти')).tap(); } catch (e) { }
        } catch (e) {
            // Not at home, proceed
        }

        // Start Login Flow
        try {
            await waitFor(element(by.id('welcome-screen'))).toBeVisible().withTimeout(10000);
        } catch (e) { }

        // Login - exposed errors
        await waitFor(element(by.id('login-button'))).toBeVisible().withTimeout(20000);
        await element(by.id('login-button')).tap();
        await waitFor(element(by.id('email-input'))).toBeVisible().withTimeout(20000);
        await element(by.id('email-input')).typeText(TEACHER_EMAIL);
        await element(by.id('send-code-button')).tap();
        await waitFor(element(by.id('code-input'))).toBeVisible().withTimeout(20000);
        await element(by.id('code-input')).typeText(TEACHER_CODE);
        await element(by.id('verify-button')).tap();
        await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(30000);
    });

    beforeEach(async () => {
        await device.disableSynchronization();
    });

    it('should create a new course structure', async () => {
        // 1. Navigate to Profile by text
        // "Profile" or "Профиль" depending on locale, but "Profile" is likely based on other tests
        await waitFor(element(by.text('Profile'))).toBeVisible().withTimeout(10000);
        await element(by.text('Profile')).tap();

        await waitFor(element(by.id('profile-screen'))).toBeVisible().withTimeout(5000);

        // 2. Click Create Course (Menu Item or Header)
        try {
            await waitFor(element(by.id('create-course-menu-item'))).toBeVisible().withTimeout(5000);
            await element(by.id('create-course-menu-item')).tap();
        } catch (e) {
            console.log('Menu item not found, trying header button');
            await element(by.id('create-course-header-button')).tap();
        }

        // 3. Step 1: Main Info
        await waitFor(element(by.id('course-title-input'))).toBeVisible().withTimeout(10000);
        await element(by.id('course-title-input')).typeText('E2E Test Course');
        await element(by.id('course-title-input')).tapReturnKey();

        // Select Category (first one)
        await waitFor(element(by.id('category-option-0'))).toBeVisible().withTimeout(10000);
        await element(by.id('category-option-0')).tap();

        // Select duration
        await element(by.id('duration-option-1 month')).tap();

        // Continue
        await element(by.id('continue-button')).tap();

        // 4. Step 2: Modules
        await waitFor(element(by.id('add-module-button'))).toBeVisible();
        await element(by.id('add-module-button')).tap();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await element(by.id('module-title-0')).tap();
        await element(by.id('module-title-0')).typeText('Module 1');
        await element(by.id('module-title-0')).tapReturnKey();
        await element(by.id('continue-button')).tap();

        // 5. Step 3: Lessons
        await waitFor(element(by.id('add-lesson-button'))).toBeVisible();
        await element(by.id('add-lesson-button')).tap();
        await element(by.id('lesson-title-0')).typeText('Lesson 1');
        await element(by.id('continue-button')).tap();

        // 6. Step 4: Summary & Submit
        await expect(element(by.text('Review Your Course'))).toBeVisible();
        await element(by.id('submit-course-button')).tap();

        // 7. Verify Success
        await waitFor(element(by.text('Success!'))).toBeVisible().withTimeout(10000);
        await element(by.text('OK')).tap();

        // Should navigate to Course Detail
        await waitFor(element(by.id('course-detail-screen'))).toBeVisible().withTimeout(10000);
    });
});
