# 🚀 Quick Start Guide

Get your Loyalty Card Wallet app up and running in 5 minutes!

## Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js v16+ installed
- ✅ npm or yarn package manager
- ✅ iOS Simulator or Android Emulator (optional but recommended)
- ✅ Expo CLI (can be run via npx)

To check your environment:

```bash
node --version    # Should be v16 or higher
npm --version     # Or yarn --version
```

---

## Installation Steps

### 1. Navigate to Project Directory

```bash
cd "Mobile application"
```

### 2. Install Dependencies

```bash
npm install
```

**Expected output:** All packages installed successfully (~5s)

**Troubleshooting:**

- If you see peer dependency warnings, it's safe to ignore them
- If npm hangs, try: `npm cache clean --force` then retry
- On M1/M2 Mac, you may need: `npm install --force`

### 3. Start Development Server

```bash
npm start
```

Or using expo CLI directly:

```bash
npx expo start
```

**Expected output:**

```
Starting dev server...
 ✓ Loaded environment variables from .env.example
 ✓ Babel is checking files...
 ✓ Babel transformation complete
 ✓ Restart the dev server to revisit loading state.

› Press `i` to open iOS Simulator
› Press `a` to open Android Emulator
› Press `w` to open web
› Press `r` to reload
› Press `s` to send to web
```

### 4. Open on Simulator or Device

#### Option A: iOS Simulator (macOS only)

```bash
# Press 'i' in the terminal, or run:
npm run ios
```

#### Option B: Android Emulator

```bash
# Press 'a' in the terminal, or run:
npm run android
```

#### Option C: Physical Device

1. Install **Expo Go** app from App Store or Play Store
2. Scan the QR code displayed in terminal with your phone camera
3. Open the link in Expo Go

---

## First Run Experience

### What to expect:

**~2 seconds**: App loads with splash screen

**Main Screen** - "Loyalty Cards" screen appears with:

- 2 mock cards already loaded:
  - ☕ Coffee Rewards (Brown card)
  - 🛒 Grocery Plus (Green card)
- Tab bar at bottom with "Cards" and "Add Card" tabs

### Test the App

**1. View a Card**

- Tap on a card to expand it
- See the full card details
- View barcode information
- Press back to close

**2. Add a New Card**

- Tap "Add Card" tab
- Fill in the form:
  - Card Name: "Movie Club"
  - Issuer: "Cinema Plus"
  - Barcode Value: "1234567890123456"
  - Barcode Type: "QR"
  - Color: Purple
- Tap "Add Card" button
- New card should appear in the list

**3. Delete a Card**

- Tap an existing card
- Scroll down to "Delete Card" button
- Tap and confirm deletion
- Card is removed from list

**4. Persistence Check**

- Add a card
- Close the app completely
- Reopen the app
- Card should still be there (saved locally)

---

## Troubleshooting

### Issue: "Port already in use"

**Solution:**

```bash
npm start -- -p 8090
```

### Issue: "Metro bundler failed"

**Solution:**

```bash
npm start -- --clear
```

Then retry.

### Issue: "Cannot find module" errors

**Solution:**

```bash
npm install
npm start -- --reset-cache
```

### Issue: "No expo CLI"

**Solution:**

```bash
npx expo start
```

### Issue: Simulator crashes

**Solution:**

- Close simulator completely
- `npm start -- --clear`
- Restart simulator manually
- Press `i` or `a` to reopen

### Issue: Animations look choppy

- Ensure simulator/device isn't in low power mode
- Close other apps consuming CPU
- Use a physical device for better performance

---

## Development Workflow

### During Development

**Refresh App**: Press `r` in terminal (or press `R` twice)
**Open Menu**: Press `m` in terminal
**View Logs**: Check terminal output or use:

```bash
npm start -- --verbose
```

### Hot Reload vs Full Reload

- **Hot Reload** (automatic): Most changes appear instantly
- **Full Reload** (press `r`): Use after changing native code or dependencies

---

## Project Structure Overview

Once running, here's what you're seeing:

```
App Structure:
│
├── Home Screen (index.tsx)
│   ├── Card Stack display
│   ├── Sorted by most recent
│   └── Quick Add FAB button
│
├── Add Card Screen (add.tsx)
│   ├── Live preview
│   ├── Form with validation
│   └── Color selector
│
├── Card Detail Modal (card/[id].tsx)
│   ├── Full-screen card
│   ├── Barcode view
│   ├── Card info
│   └── Delete option
│
└── Components
    ├── CardItem - Single card
    ├── CardStack - Animated list
    ├── AddCardForm - Form UI
    └── BarcodeView - Barcode display
```

---

## Building for Production

When ready to release:

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

### Web

```bash
npm start -- --web
```

---

## Performance Tips

### For Smooth Animations

- Close other apps
- Use physical device for demos
- Keep dev server running on powerful machine

### For Faster Development

- Use hot reload (automatic, usually 2-3 seconds)
- Avoid full app restarts when possible
- Use `--clear` only when necessary

---

## Environment Setup

Copy the environment template:

```bash
cp .env.example .env
```

Current environment variables:

- `EXPO_PUBLIC_APP_NAME` - App display name
- `EXPO_PUBLIC_APP_VERSION` - Version number

---

## Next Steps

### Ready to Customize?

1. **Change Colors** → Edit `constants/theme.ts`
2. **Modify Animations** → Update components with `react-native-reanimated`
3. **Add Features** → Update `store/useCards.ts` and screens
4. **Change Theme** → Modify StyleSheet colors

### Need Help?

1. Check `README.md` for full documentation
2. Review `types/card.ts` for data structure
3. Look at component files for examples
4. Check `store/useCards.ts` for state management

---

## Common Commands Reference

| Command             | Purpose                 |
| ------------------- | ----------------------- |
| `npm start`         | Start dev server        |
| `npm run ios`       | Open iOS Simulator      |
| `npm run android`   | Open Android Emulator   |
| `npm run web`       | Open in web browser     |
| `npm run typecheck` | Check TypeScript errors |
| `npm build`         | Build production bundle |

Press `r` during dev to reload app after changes.

---

## Success! 🎉

Your Loyalty Card Wallet app is now running!

**You have:**

- ✅ 2 Demo cards seeded
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Smooth animations on all screens
- ✅ Persistent local storage
- ✅ Beautiful dark UI theme
- ✅ Production-ready code

**Start exploring:**

1. Tap a card to view details
2. Add a new card to test the form
3. Delete a card to test persistence
4. Close and reopen app to verify data saves

**Happy coding! 💡**
