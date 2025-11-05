# Settings Screen - User Guide

## How to Use the New Settings Features

### Editing Personal Information

1. **Open Settings Screen**
   - Navigate to the Settings tab (gear icon)
   - You'll see your profile at the top

2. **Edit Personal Info**
   - Tap any row in the "Informações Pessoais" section:
     - "Medicamento Atual" - Shows current medication and dose
     - "Frequência de Aplicação" - Shows injection frequency
     - "Meta de Peso" - Shows target weight

3. **PersonalInfoEditor Modal Opens**
   - Fill in the following fields:
     - **Nome** (Required): Your full name
     - **Altura**: Your height in meters (1.0 - 2.5m)
     - **Peso Inicial**: Your starting weight in kg
     - **Peso Alvo**: Your target weight in kg
     - **Medicamento**: Name of your medication (e.g., Mounjaro, Ozempic)
     - **Dose Atual**: Current dose in mg (e.g., 2.5)
     - **Frequência das Injeções**: Select daily, weekly, or biweekly

4. **Save Changes**
   - Tap "Salvar Alterações" button
   - You'll feel a haptic vibration
   - Success message will appear
   - Modal closes automatically
   - Settings screen updates with new values

### Managing Notifications

1. **Shot Reminders**
   - Toggle the "Lembretes de Injeção" switch
   - Changes save immediately to database
   - Haptic feedback confirms the action

2. **Achievement Notifications**
   - Toggle the "Notificações de Conquistas" switch
   - Changes save immediately to database
   - Haptic feedback confirms the action

3. **Configure Times**
   - Tap "Configurar Horários"
   - Opens notification settings screen
   - Set your preferred reminder times

### Theme & Appearance

1. **Theme Selection**
   - Tap the theme selector
   - Choose from available themes
   - Changes persist to database

2. **Accent Color**
   - Tap the color selector
   - Choose your preferred accent color
   - Changes persist to database

### Other Settings

- **Data & Privacy**: Manage biometrics, export data, clear cache
- **About**: View app version, contact support, read policies
- **Account**: Sign out or delete your account

## What Gets Saved to Database

### Profiles Table
- Name
- Height
- Starting weight
- Target weight
- Current medication
- Current dose
- Injection frequency

### Settings Table
- Shot reminders (enabled/disabled)
- Shot reminder time
- Achievement notifications (enabled/disabled)
- Theme preference
- Accent color
- Dark mode preference

## Validation Rules

- **Name**: Required field, cannot be empty
- **Height**: Optional, but if provided must be between 1.0 and 2.5 meters
- **Weights**: Optional, but if provided must be positive numbers
- **Dose**: Optional, but if provided must be a positive number
- **All text fields**: Whitespace is trimmed automatically

## Troubleshooting

### Changes Not Saving
1. Check your internet connection
2. Ensure you're logged in (Clerk authentication)
3. Try again - the app will show an error message if it fails

### Modal Won't Open
1. Ensure you have a valid profile
2. Check if the app is fully loaded
3. Restart the app if needed

### Old Data Still Showing
1. Pull down to refresh on the Settings screen
2. Close and reopen the Settings tab
3. The app auto-refreshes after saves

## Privacy & Security

- All data is saved to your personal Supabase account
- Row Level Security (RLS) ensures you can only access your own data
- Your Clerk authentication protects your account
- No data is shared without your explicit consent

## Need Help?

- Tap "Suporte" in the About section to email support
- Read the "Política de Privacidade" for data handling details
- Check "Termos de Uso" for app usage guidelines
