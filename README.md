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


| Status       | Task                                               |
|--------------|----------------------------------------------------|
| ✅ Completed | User Onboarding Flow                               |
| ✅ Completed | Onboarding Graphics & Design Assets                |
| ✅ Completed | Onboarding Animations Integration                  |
| 🔄 Ongoing   | JWT-Based User Authentication                      |
| 🔄 Ongoing   | Ngrok Setup for Local Expo Access                  |
| ✅ Completed | Swagger Integration for API Testing                |
| ⏳ Planned   | AWS Database Hosting (PostgreSQL)                   |
| 🔄 Ongoing   | Core App Navigation Structure                      |
| ⏳ Planned   | GPT-Powered ChatBot with Custom Responses           |
| ⏳ Planned   | AI Nutrition Scanner via Camera Input               |
| ⏳ Planned   | Exercise & Workout Program Module                   |
| ⏳ Planned   | API Gateway Deployment on AWS                       |
| ⏳ Planned   | CI/CD for Dev and Prod builds                       |
## Setup 🛠️
Setup might change in the future, working on containerizing a fully working dev build asap.

```bash
cd fitness-app-frontend
npm install
npx expo start
```
```bash
docker run --name FitnessAppPostgresql -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=fitnessappdb -p 5432:5432 -v fitnessapp_pgdata:/var/lib/postgresql/data -d postgres

docker start FitnessAppPostgresql
```