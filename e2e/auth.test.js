/**
 * E2E тесты для потока авторизации
 * Покрытие: /api/auth/code/send/, /api/auth/code/check/, /api/auth/logout/
 */

const DEMO_EMAIL = 'demo@apexglobal.app';
const DEMO_OTP_CODE = '1234';
const INVALID_OTP_CODE = '0000';

describe('Auth Flow', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true, delete: true });
        await device.disableSynchronization();
    });

    beforeEach(async () => {
        await device.disableSynchronization();
    });

    describe('Welcome Screen', () => {
        it('should display welcome screen on first launch', async () => {
            await expect(element(by.id('welcome-screen'))).toBeVisible();
        });

        it('should have login button', async () => {
            await expect(element(by.id('login-button'))).toBeVisible();
        });

        it('should have signup button', async () => {
            await expect(element(by.id('signup-button'))).toBeVisible();
        });

        it('should navigate to email input on login tap', async () => {
            await element(by.id('login-button')).tap();
            await expect(element(by.id('email-input-screen'))).toBeVisible();
        });
    });

    describe('Email Input Screen', () => {
        beforeEach(async () => {
            await element(by.id('login-button')).tap();
        });

        it('should display email input field', async () => {
            await expect(element(by.id('email-input'))).toBeVisible();
        });

        it('should display send code button', async () => {
            await expect(element(by.id('send-code-button'))).toBeVisible();
        });

        it('should show error for invalid email format', async () => {
            await element(by.id('email-input')).typeText('invalid-email');
            await element(by.id('send-code-button')).tap();
            // Should stay on email input screen
            await expect(element(by.id('email-input-screen'))).toBeVisible();
        });

        it('should send verification code for valid email', async () => {
            await element(by.id('email-input')).typeText(DEMO_EMAIL);
            await element(by.id('send-code-button')).tap();
            await waitFor(element(by.id('verification-screen')))
                .toBeVisible()
                .withTimeout(10000);
        });
    });

    describe('Verification Screen', () => {
        beforeEach(async () => {
            await element(by.id('login-button')).tap();
            await element(by.id('email-input')).typeText(DEMO_EMAIL);
            await element(by.id('send-code-button')).tap();
            await waitFor(element(by.id('verification-screen')))
                .toBeVisible()
                .withTimeout(10000);
        });

        it('should display code input field', async () => {
            await expect(element(by.id('code-input'))).toBeVisible();
        });

        it('should display verify button', async () => {
            await expect(element(by.id('verify-button'))).toBeVisible();
        });

        it('should show error for invalid OTP code', async () => {
            await element(by.id('code-input')).typeText(INVALID_OTP_CODE);
            await element(by.id('verify-button')).tap();
            // Should stay on verification screen
            await waitFor(element(by.id('verification-screen')))
                .toBeVisible()
                .withTimeout(5000);
        });

        it('should successfully login with valid OTP code', async () => {
            await element(by.id('code-input')).typeText(DEMO_OTP_CODE);
            await element(by.id('verify-button')).tap();
            await waitFor(element(by.id('home-screen')))
                .toBeVisible()
                .withTimeout(15000);
        });
    });

    describe('Full Login Flow', () => {
        beforeEach(async () => {
            await device.launchApp({ newInstance: true, delete: true });
            await device.disableSynchronization();
        });

        it('should complete full login with demo account', async () => {
            // 1. Welcome screen
            await expect(element(by.id('welcome-screen'))).toBeVisible();

            // 2. Tap login
            await element(by.id('login-button')).tap();
            await expect(element(by.id('email-input-screen'))).toBeVisible();

            // 3. Enter email
            await element(by.id('email-input')).typeText(DEMO_EMAIL);
            await element(by.id('send-code-button')).tap();

            // 4. Verification screen
            await waitFor(element(by.id('verification-screen')))
                .toBeVisible()
                .withTimeout(10000);

            // 5. Enter OTP
            await element(by.id('code-input')).typeText(DEMO_OTP_CODE);
            await element(by.id('verify-button')).tap();

            // 6. Home screen
            await waitFor(element(by.id('home-screen')))
                .toBeVisible()
                .withTimeout(15000);

            // 7. Verify content loaded
            await waitFor(element(by.id('banners-carousel')))
                .toBeVisible()
                .withTimeout(10000);
            await expect(element(by.id('courses-list'))).toBeVisible();
        });
    });

    describe('Logout Flow', () => {
        beforeAll(async () => {
            // Login first
            await device.launchApp({ newInstance: true, delete: true });
            await device.disableSynchronization();
            await waitFor(element(by.id('login-button'))).toBeVisible().withTimeout(10000);
            await element(by.id('login-button')).tap();
            await element(by.id('email-input')).typeText(DEMO_EMAIL);
            await element(by.id('send-code-button')).tap();
            await waitFor(element(by.id('code-input'))).toBeVisible().withTimeout(10000);
            await element(by.id('code-input')).typeText(DEMO_OTP_CODE);
            await element(by.id('verify-button')).tap();
            await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(15000);
        });

        it('should logout and return to welcome screen', async () => {
            // Navigate to profile
            await element(by.text('Profile')).atIndex(0).tap();
            await expect(element(by.id('profile-screen'))).toBeVisible();

            // Tap logout
            await element(by.id('logout-button')).tap();

            // Confirm logout if dialog appears
            try {
                await waitFor(element(by.text('Выйти'))).toBeVisible().withTimeout(2000);
                await element(by.text('Выйти')).tap();
            } catch (e) {
                // No confirmation dialog
            }

            // Should return to welcome screen
            await waitFor(element(by.id('welcome-screen')))
                .toBeVisible()
                .withTimeout(10000);
        });
    });
});
