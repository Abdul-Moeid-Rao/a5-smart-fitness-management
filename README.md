# Smart Fitness Management System

## Overview
Smart Fitness Management System is a comprehensive web application designed to help users track their workouts, manage their biometrics, and achieve their fitness goals. It features a modern Cyber Dark aesthetic with glassmorphism UI elements, smooth animations, and a responsive layout that works seamlessly across devices.

## Full Functionality
- **User Authentication & Authorization**: Secure registration, login, and password reset functionality using Better Auth. Supports role-based access control (Admin, User, Trainer) with a beautiful split-screen authentication layout.
- **Personalized Dashboard**: A central hub displaying total workouts, weight goals, daily calorie targets (TDEE), active streak days, and visual progress charts. Includes an activity feed of recent workout logs.
- **Workout Planner & Logger**: 
  - An extensive exercise catalog that can be filtered by muscle group and difficulty.
  - Detailed exercise views with instructions, equipment required, and target muscle groups.
  - A comprehensive logging system to record sets, reps, weight, and Rate of Perceived Exertion (RPE) along with custom notes.
- **Biometric Profile Management**: Users can manage their age, height, weight, goal weight, activity level, and fitness goals. The system automatically calculates BMR (Basal Metabolic Rate) and TDEE (Total Daily Energy Expenditure).
- **Admin Dashboard**: Specialized tools for administrators to monitor global KPIs (e.g., total volume lifted across all users), manage the exercise and article catalogs, and oversee user roles.
- **Theme Customization**: Built-in support for switching between custom Dark and Light modes, persisting user preference seamlessly.

## Technology Stack
- **Frontend & Framework**: Next.js 16 (App Router) combined with React 19 and TypeScript.
- **Styling**: Tailwind CSS v4 for utility-first styling and creating the custom Cyber Dark theme.
- **UI Components & Animations**: Radix UI for accessible headless components, Framer Motion for fluid page transitions and micro-animations, and Lucide React for iconography.
- **Data Visualization**: Recharts for rendering interactive and responsive workout progress charts.
- **Backend & Database**: Next.js API routes handling the server logic, connected to a local SQLite database (via better-sqlite3) managed by Prisma ORM.
- **Authentication**: Better Auth with bcryptjs for secure and scalable user session management.
- **Validation**: Zod for strict schema-based data and input validation.

## Technical Approach
The application embraces a modern, full-stack JavaScript architecture using the Next.js App Router for both UI rendering (Server and Client Components) and backend API endpoints. 

1. **Relational Data Modeling**: Prisma ORM is used to define clear relational structures for Users, Biometric Profiles, Workouts, Sets, Exercises, and Articles. This ensures end-to-end type safety from the database to the frontend components.
2. **Component-Driven Design System**: The UI is built using modular, reusable components powered by Radix UI and Tailwind CSS. The design system heavily leverages CSS variables and a dedicated ThemeProvider to support instant switching between light and dark modes while maintaining a premium glassmorphism aesthetic.
3. **Progressive Enhancements**: While the application provides robust server-side data fetching for performance and SEO optimization, it heavily utilizes client-side enhancements like Framer Motion for smooth state transitions, animated stat counters, and highly interactive modals/drawers.
4. **Separation of Concerns**: Backend logic and API integrations are cleanly encapsulated within Next.js route handlers (`/api/...`), while complex database querying is executed securely on the server. The frontend consumes these APIs using standard RESTful principles, ensuring a clean, decoupled, and maintainable codebase.

## Getting Started

1. Install all required dependencies:
```bash
npm install
```

2. Initialize and seed the database with sample data:
```bash
npm run db:setup
```

3. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the application!
