# E2E Testing with Detox

Эта папка содержит End-to-End тесты для приложения AGC Mobile.

## Предварительные требования

### macOS (для iOS тестов)
```bash
brew tap wix/brew && brew install applesimutils
npm install -g detox-cli
```

### Общие
```bash
# Генерация нативного кода (требуется один раз)
npx expo prebuild
```

## Запуск тестов

### iOS
```bash
# Сборка (Release)
npm run e2e:build:ios -- --configuration ios.sim.release

# Тесты (Release)
npx detox test --configuration ios.sim.release
```

### Android
```bash
# Сборка
npm run e2e:build:android

# Тесты
npm run e2e:test:android
```

## Тестовые данные

- **Email:** `demo@apexglobal.app`
- **OTP код:** `1234`

## Структура тестов

| Файл | Покрытие |
|------|----------|
| `auth.test.js` | Авторизация, email, код подтверждения |
| `courses.test.js` | Курсы, категории, детали курса |
| `chat.test.js` | Список чатов, сообщения |
| `profile.test.js` | Профиль, настройки |

## Известные проблемы

### Profile Visibility
Тесты профиля могут падать с ошибкой `View does not pass visibility percent threshold`.
Это связано с особенностями рендеринга иконок таб-бара или наложений.
**Решение:** Проверить стили `MainTabNavigator` или отключить проверку видимости для конкретных действий.

## Полезные команды

```bash
# Запуск конкретного теста
npx detox test --configuration ios.sim.release e2e/auth.test.js

# Пересборка нативного кода
npx expo prebuild --clean
```
