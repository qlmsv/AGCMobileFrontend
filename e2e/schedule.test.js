/**
 * E2E тесты для расписания
 * Покрытие: /api/calendar/
 */

const DEMO_EMAIL = 'demo@apexglobal.app';
const DEMO_OTP_CODE = '1234';

describe('Schedule Flow', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true, delete: true });
        // CRITICAL: Disable sync immediately
        await device.disableSynchronization();

        try {
            await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(5000);
            return;
        } catch (e) {
            // Proceed to login
        }

        await waitFor(element(by.id('login-button'))).toBeVisible().withTimeout(20000);
        await element(by.id('login-button')).tap();
        await waitFor(element(by.id('email-input'))).toBeVisible().withTimeout(10000);
        await element(by.id('email-input')).typeText(DEMO_EMAIL);
        await element(by.id('send-code-button')).tap();
        await waitFor(element(by.id('code-input'))).toBeVisible().withTimeout(10000);
        await element(by.id('code-input')).typeText(DEMO_OTP_CODE);
        await element(by.id('verify-button')).tap();
        await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(20000);
    });

    beforeEach(async () => {
        await device.disableSynchronization();
    });

    afterEach(async () => {
        await device.enableSynchronization();
    });

    it('should display schedule screen and verify dates', async () => {
        // 1. Navigate to My Schedule
        // Assuming "My Schedule" is in the main tab or drawer. 
        // Based on analysis, ScheduleScreen exists. Assuming it is accessed via TabBar 'Schedule' or similar.
        // If not in TabBar, maybe via Home -> Schedule?
        // Let's assume it's a tab for now named "Schedule".

        try {
            await element(by.text('Schedule')).atIndex(0).tap();
        } catch (e) {
            console.log('Schedule tab not found, trying "Calendar" or verifying if it is available');
            // If tab name is different
        }

        await waitFor(element(by.id('schedule-screen'))).toBeVisible().withTimeout(10000);

        // 2. Verify List exists
        await expect(element(by.id('schedule-scroll-view'))).toBeVisible();

        // 3. Check for current date display (System date)
        const date = new Date();
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        // Format: "January 2026"
        const expectedMonthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

        await expect(element(by.text(expectedMonthYear))).toBeVisible();
    });
});
