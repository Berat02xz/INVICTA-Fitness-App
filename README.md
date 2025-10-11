# React Native Fitness App

AI-powered fitness app (WIP) delivering personalized workouts, nutrition insights, and progress tracking to help you reach your goals faster.

## Features ✨

- **AI Coach Chat:** Customized workouts, recipes & dynamic tips.  
- **Nutrition Scanner:** Scan food for calories, fats & carbs automatically.  
- **Adaptive Routines:** Exercise difficulty adjusts to your skill level.  
- **Progress Tracking:** Monitor BMI and key stats toward your goals.  
- **Gamified Challenges:** Stay motivated with engaging activities.

## Roadmap 🚀



# Current Sprint Tasks

| Status | Task |
|--------|------|
| ❌ | Convert structured outputs to string outputs to reduce token usage (canceled - no difference on token usage) |
| ✅ | Increase image resolution for menu or fridge scans to 720px (from 256px) |
| ✅ | Store meal responses in WatermelonDB and display them in a bottom sheet for the current date. Save meals but delete images with cronjob (optional) |
| ✅  | Save and display meals watermelondDb |
| ✅ | Style the "Grant Permission" screen for better visuals and user experience |
| ✅ | Change the navigation bar color to black and apply the glass effect from scanning buttons |
| ✅ | Update the bottom sheet bar color to black |
| ⬜ | Use a faster GPT model for scanning, also use dynamic animation to lower the response time |
| ⬜ | Implement a dynamic loading animation during meal scanning with Rive |
| ✅ | Put health score in database, input/output and WatermelonDB |
| ✅ | Put type of user, "FREE" "PREMIUM" or "ADMIN" (default: FREE) |
| ⬜ | Limit food scanning to 5 scans a day. After that show a modal: "Daily Scan Limit Reached" (same as permission screen, so make it a ui component Modal to reuse) |
| ✅ | Show animation loading while registering/login (DB + backend init). |
| ⬜ | Design TopBar with rive elements |
| ⬜ | Implement TopBar with Rive |
| ⬜ | ChatBot AI Page |
| ⬜ | Nutrition Page & Chatbot integrated together (generate recipes, check todays meal health etc...) |
| ⬜ | Profile Screen with badges |
| ⬜ | Roadmap Full Rive |
| ⬜ | Host Dotnet backend |
| ⬜ | Early V1 Release for testing (nutrition & AI chat finish) |


## Setup 🛠️
Setup might change in the future
App requires Database, Backend and Frontend to be running for it to work (working on an offline version)
```bash
cd fitness-app-frontend
npm install
npx expo run
```
