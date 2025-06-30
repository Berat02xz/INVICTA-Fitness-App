![fcse_logo](https://github.com/BeratAhmetaj/Museudonia/blob/main/Gif%20Animations/Logo_FINKI_UKIM_EN/Logo_FINKI_UKIM_EN_00000.png)

# INFIT Workout

AI-powered fitness app (WIP) delivering personalized workouts, nutrition insights, and progress tracking to help you reach your goals faster.

## Features ✨

- **AI Coach Chat:** Customized workouts, recipes & dynamic tips.  
- **Nutrition Scanner:** Scan food for calories, fats & carbs automatically.  
- **Adaptive Routines:** Exercise difficulty adjusts to your skill level.  
- **Progress Tracking:** Monitor BMI and key stats toward your goals.  
- **Gamified Challenges:** Stay motivated with engaging activities.

## Roadmap 🚀

| Status     | Task                          |
|------------|-------------------------------|
| ✅ Completed | Full Onboarding              |
| ✅ Completed | Graphics                    |
| ✅ Completed | Animations                  |
| 🔄 Ongoing  | User Authentication using JWT |
| ⏳ Planned  | Persistent Database hosting in AWS |
| ⏳ Planned  | Main App Navigation          |
| ⏳ Planned | GPT ChatBot system with custom replies |
| ⏳ Planned | Nutrition AI Analyzer using camera |
| ⏳ Planned | Exercises program |
| ⏳ Planned  | AWS Gateway API hosting      |

## Setup 🛠️

```bash
cd fitness-app-frontend
npm install
npx expo start
```
```bash
docker run --name FitnessAppPostgresql -e POSTGRES_USER=berat -e POSTGRES_PASSWORD=berat -e POSTGRES_DB=fitnessappdb -p 5432:5432 -v fitnessapp_pgdata:/var/lib/postgresql/data -d postgres

docker start FitnessAppPostgresql
```

