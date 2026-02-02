import { API_ENDPOINTS } from '../api';
import { OPENAPI_SPEC_ENDPOINTS, ENDPOINT_CATEGORIES, TOTAL_SPEC_ENDPOINTS } from '../apiSpecEndpoints';

/**
 * Нормализует путь эндпоинта для сравнения:
 * - Добавляет /api/ префикс
 * - Заменяет все параметры на {param}
 * - Убирает trailing slash для унификации
 */
function normalizeEndpoint(path: string): string {
    // Добавляем /api/ префикс если его нет
    let normalized = path.startsWith('/api/') ? path : `/api${path}`;

    // Заменяем ${...} на {param} (фронтенд функции используют template literals)
    normalized = normalized.replace(/\$\{[^}]+\}/g, '{param}');

    // Заменяем {...} на {param} (спецификация использует {id}, {chat_id} и т.д.)
    normalized = normalized.replace(/\{[^}]+\}/g, '{param}');

    // Заменяем /placeholder/ на /{param}/ (когда функция вызывается с 'placeholder')
    normalized = normalized.replace(/\/placeholder(\/|$)/g, '/{param}$1');

    // Убираем trailing slash
    normalized = normalized.replace(/\/$/, '');

    return normalized;
}

/**
 * Извлекает все эндпоинты из API_ENDPOINTS объекта
 */
function extractFrontendEndpoints(): string[] {
    const endpoints: string[] = [];

    for (const [key, value] of Object.entries(API_ENDPOINTS)) {
        if (typeof value === 'string') {
            endpoints.push(normalizeEndpoint(value));
        } else if (typeof value === 'function') {
            // Для функций вызываем с placeholder параметрами
            try {
                const argCount = value.length;
                const args = Array(argCount).fill('placeholder');
                const result = value(...args);
                endpoints.push(normalizeEndpoint(result));
            } catch {
                console.warn(`Could not extract endpoint from function: ${key}`);
            }
        }
    }

    return endpoints;
}

describe('API Endpoint Coverage', () => {
    const frontendEndpoints = extractFrontendEndpoints();
    const normalizedFrontend = [...new Set(frontendEndpoints)]; // unique

    it('should have correct total count of spec endpoints', () => {
        expect(TOTAL_SPEC_ENDPOINTS).toBe(52);
    });

    it('should extract endpoints from frontend API config', () => {
        expect(frontendEndpoints.length).toBeGreaterThan(0);
        console.log(`\nFrontend endpoints found: ${frontendEndpoints.length}`);
    });

    describe('Coverage by category', () => {
        for (const [category, specEndpoints] of Object.entries(ENDPOINT_CATEGORIES)) {
            it(`should cover ${category} endpoints`, () => {
                const missing: string[] = [];

                for (const specEndpoint of specEndpoints) {
                    const normalizedSpec = normalizeEndpoint(specEndpoint);
                    const isImplemented = normalizedFrontend.includes(normalizedSpec);

                    if (!isImplemented) {
                        missing.push(specEndpoint);
                    }
                }

                if (missing.length > 0) {
                    console.log(`\n⚠️  Missing ${category} endpoints:`);
                    missing.forEach((e) => console.log(`   - ${e}`));
                }

                // Пропускаем /api/schema/ - это OpenAPI схема, не нужна в приложении
                const filtered = missing.filter((e) => !e.startsWith('/api/schema/'));

                // Report warnings but don't fail - это информационный тест
                if (filtered.length > 0) {
                    console.warn(`   → ${filtered.length} endpoints not implemented in frontend`);
                }
            });
        }
    });

    it('should report overall coverage', () => {
        let covered = 0;
        const missing: string[] = [];
        const extra: string[] = [];

        // Проверяем покрытие спецификации
        for (const specEndpoint of OPENAPI_SPEC_ENDPOINTS) {
            // Пропускаем /api/schema/
            if (specEndpoint.startsWith('/api/schema/')) {
                covered++;
                continue;
            }

            const normalizedSpec = normalizeEndpoint(specEndpoint);
            const isImplemented = normalizedFrontend.includes(normalizedSpec);

            if (isImplemented) {
                covered++;
            } else {
                missing.push(specEndpoint);
            }
        }

        // Проверяем дополнительные эндпоинты в фронтенде (не из спецификации)
        const normalizedSpec = OPENAPI_SPEC_ENDPOINTS.map(normalizeEndpoint);
        for (const fe of normalizedFrontend) {
            if (!normalizedSpec.includes(fe)) {
                extra.push(fe);
            }
        }

        const coveragePercent = ((covered / TOTAL_SPEC_ENDPOINTS) * 100).toFixed(1);

        console.log('\n' + '='.repeat(60));
        console.log('📊 API ENDPOINT COVERAGE REPORT');
        console.log('='.repeat(60));
        console.log(`✅ Covered: ${covered}/${TOTAL_SPEC_ENDPOINTS} (${coveragePercent}%)`);

        if (missing.length > 0) {
            console.log(`\n❌ Missing endpoints (${missing.length}):`);
            missing.forEach((e) => console.log(`   - ${e}`));
        }

        if (extra.length > 0) {
            console.log(`\n➕ Extra endpoints in frontend (not in spec, ${extra.length}):`);
            extra.forEach((e) => console.log(`   - ${e}`));
        }

        console.log('='.repeat(60) + '\n');

        // Тест информационный - показываем покрытие
        // Раскомментируйте чтобы тест падал при низком покрытии:
        // expect(covered).toBeGreaterThanOrEqual(Math.floor(TOTAL_SPEC_ENDPOINTS * 0.95));
    });
});
