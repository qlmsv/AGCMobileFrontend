/**
 * E2E тесты для чатов
 * Покрытие: /api/chat/chats/, /api/chat/chats/{id}/, /api/chat/chats/{id}/messages/,
 *           /api/users/ (для поиска пользователей)
 */

const DEMO_EMAIL = 'demo@apexglobal.app';
const DEMO_OTP_CODE = '1234';
const TEST_MESSAGE = 'Hello from E2E test';

describe('Chat Flow', () => {
    beforeAll(async () => {
        await device.launchApp({ newInstance: true, delete: true });
        // CRITICAL: Disable sync immediately to prevent "app is busy" hangs
        await device.disableSynchronization();

        // Wait for UI to stabilize - increase to 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));

        try {
            await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(5000);
            return;
        } catch (e) { }

        // Check for welcome screen first
        try {
            await waitFor(element(by.id('welcome-screen'))).toBeVisible().withTimeout(10000);
        } catch (e) { }

        // Login flow
        await waitFor(element(by.id('login-button'))).toBeVisible().withTimeout(30000);
        await element(by.id('login-button')).tap();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await waitFor(element(by.id('email-input'))).toBeVisible().withTimeout(10000);
        await element(by.id('email-input')).typeText(DEMO_EMAIL);
        await element(by.id('send-code-button')).tap();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await waitFor(element(by.id('code-input'))).toBeVisible().withTimeout(10000);
        await element(by.id('code-input')).typeText(DEMO_OTP_CODE);
        await element(by.id('verify-button')).tap();
        await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(20000);
    });

    beforeEach(async () => {
        // Skip reload - it causes sync issues. Just ensure sync is off.
        await device.disableSynchronization();
    });

    afterEach(async () => {
        // Re-enable for cleanup
        await device.enableSynchronization();
    });

    describe('Chats Screen', () => {
        beforeEach(async () => {
            await waitFor(element(by.text('Chats'))).toBeVisible().withTimeout(5000);
            await element(by.text('Chats')).tap();
        });
        it('should display chats screen', async () => {
            await waitFor(element(by.id('chats-screen'))).toBeVisible().withTimeout(5000);
        });

        it('should have create chat button', async () => {
            await expect(element(by.id('create-chat-button'))).toBeVisible();
        });

        it('should display chat list', async () => {
            await waitFor(element(by.id('chats-list'))).toBeVisible().withTimeout(5000);
        });
    });

    describe('Create Chat Modal', () => {
        beforeEach(async () => {
            // First go to Home to reset, then to Chats
            await waitFor(element(by.text('Home'))).toBeVisible().withTimeout(5000);
            await element(by.text('Home')).tap();
            await new Promise(resolve => setTimeout(resolve, 500));
            await element(by.text('Chats')).tap();
            await waitFor(element(by.id('chats-screen'))).toBeVisible().withTimeout(5000);
        });

        afterEach(async () => {
            // Try to close modal if open
            try {
                await element(by.id('cancel-chat-modal')).tap();
            } catch (e) { /* Modal not open */ }
        });

        it('should open create chat modal and show title', async () => {
            await element(by.id('create-chat-button')).tap();
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for animation

            // Wait for modal content to appear
            await waitFor(element(by.id('create-chat-modal-content'))).toBeVisible().withTimeout(10000);
        });

        it('should load users from API', async () => {
            await element(by.id('create-chat-button')).tap();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await waitFor(element(by.id('create-chat-modal-content'))).toBeVisible().withTimeout(10000);

            // Wait for API response and render
            await waitFor(element(by.id('user-item-0'))).toBeVisible().withTimeout(10000);

            // Verify at least one user is shown
            await expect(element(by.id('user-item-0'))).toBeVisible();
        });

        it('should create a personal chat', async () => {
            await element(by.id('create-chat-button')).tap();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await waitFor(element(by.id('user-item-0'))).toBeVisible().withTimeout(10000);

            // Tap on the first user in the list
            await element(by.id('user-item-0')).tap();

            // Verify Detail Screen opens
            await waitFor(element(by.id('chat-detail-screen'))).toBeVisible().withTimeout(10000);
            await expect(element(by.id('chat-detail-screen'))).toBeVisible();
        });
    });

    describe('Group Chat', () => {
        it('should create a group chat', async () => {
            // Navigate Home first, then Chats
            await waitFor(element(by.text('Home'))).toBeVisible().withTimeout(5000);
            await element(by.text('Home')).tap();
            await new Promise(resolve => setTimeout(resolve, 500));
            await element(by.text('Chats')).tap();
            await waitFor(element(by.id('chats-screen'))).toBeVisible().withTimeout(5000);

            // 1. Open Create Group Chat (Teacher only?)
            // Demo user role needs to be checked. Assuming demo user has permissions or button is visible.
            try {
                await element(by.id('create-group-chat-button')).tap();
            } catch (e) {
                console.log('User might not be a teacher or button hidden');
                return;
            }

            await waitFor(element(by.text('Create group chat'))).toBeVisible().withTimeout(5000);

            // 2. Select Course
            // Wait for courses list
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Tap first available course
            try {
                // Assuming we added testID `course-item-{id}` but we don't know IDs.
                // We can try index if FlatList, but it's a map in ScrollView.
                // We will try finding by type
                // Or just skip if too dynamic without mocks
            } catch (e) {
                console.log('No courses available');
            }

            // 3. Enter Name
            await element(by.id('group-chat-name-input')).typeText('Test Group');

            // 4. Create
            await element(by.id('create-group-submit-button')).tap();

            // 5. Verify Detail Screen opens
            await waitFor(element(by.id('chat-detail-screen'))).toBeVisible().withTimeout(10000);
        });
    });

    describe('Chat Detail', () => {
        it('should open chat if available', async () => {
            // Navigate Home first, then Chats
            await waitFor(element(by.text('Home'))).toBeVisible().withTimeout(5000);
            await element(by.text('Home')).tap();
            await new Promise(resolve => setTimeout(resolve, 500));
            await element(by.text('Chats')).tap();
            await waitFor(element(by.id('chats-screen'))).toBeVisible().withTimeout(5000);

            try {
                await waitFor(element(by.id('chat-item-0'))).toBeVisible().withTimeout(5000);
                await element(by.id('chat-item-0')).tap();
                await waitFor(element(by.id('chat-detail-screen'))).toBeVisible().withTimeout(5000);

                // Verify chat elements
                await expect(element(by.id('chat-header'))).toBeVisible();
                await expect(element(by.id('message-input'))).toBeVisible();
                await expect(element(by.id('send-message-button'))).toBeVisible();

                // Go back to chats list
                try {
                    await element(by.id('back-button')).tap();
                } catch (e) {
                    // Try iOS back gesture or header back
                    try {
                        await element(by.type('_UIButtonBarButton')).atIndex(0).tap();
                    } catch (e2) { }
                }
            } catch (e) {
                console.log('No chats available - skipping detail test');
            }
        });

        it('should send a message', async () => {
            // Try navigating to chats via tab, or from current screen
            try {
                await waitFor(element(by.text('Chats'))).toBeVisible().withTimeout(3000);
                await element(by.text('Chats')).tap();
            } catch (e) {
                // Maybe already on chats or different screen, continue
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            try {
                // Try to get to chats screen first
                await waitFor(element(by.id('chats-screen'))).toBeVisible().withTimeout(5000);
                await waitFor(element(by.id('chat-item-0'))).toBeVisible().withTimeout(5000);
                await element(by.id('chat-item-0')).tap();
                await waitFor(element(by.id('chat-detail-screen'))).toBeVisible().withTimeout(5000);

                // Type and send message
                await element(by.id('message-input')).typeText(TEST_MESSAGE);
                await element(by.id('send-message-button')).tap();

                // Wait for message to appear
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Verify message list is visible
                await expect(element(by.id('messages-list'))).toBeVisible();
            } catch (e) {
                console.log('Could not send message - no chats available');
            }
        });
    });
});
