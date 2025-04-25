import { db } from '../server/db';
import { users, activities, expenses, goals } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function seedDatabase() {
  console.log('Seeding database...');

  // Check if a user already exists
  const existingUsers = await db.select().from(users);
  
  let userId = 1;
  if (existingUsers.length === 0) {
    console.log('Creating default user...');
    // Create a default user
    const [user] = await db.insert(users).values({
      username: 'user',
      password: 'password',
      displayName: 'Demo User',
      darkMode: false
    }).returning();
    
    userId = user.id;
    console.log(`Created user with ID: ${userId}`);
  } else {
    userId = existingUsers[0].id;
    console.log(`Using existing user with ID: ${userId}`);
  }

  // Add sample activities for the past week
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  // Check if activities already exist
  const existingActivities = await db.select().from(activities).where(eq(activities.userId, userId));
  
  if (existingActivities.length === 0) {
    console.log('Adding sample activities...');
    
    // Add prayer activities (salah)
    const prayerTimes = [
      { name: 'Fajr', time: 5 }, // 5 AM
      { name: 'Dhuhr', time: 13 }, // 1 PM
      { name: 'Asr', time: 16 }, // 4 PM
      { name: 'Maghrib', time: 19 }, // 7 PM
      { name: 'Isha', time: 21 }, // 9 PM
    ];

    // Generate prayer activities for the past week
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(now.getDate() - day);
      
      // Add 3-5 prayers each day (random selection)
      const numPrayers = Math.floor(Math.random() * 3) + 3; // 3 to 5 prayers
      const selectedPrayers = prayerTimes
        .sort(() => 0.5 - Math.random())
        .slice(0, numPrayers);
      
      for (const prayer of selectedPrayers) {
        const startTime = new Date(date);
        startTime.setHours(prayer.time, 0, 0, 0);
        
        const endTime = new Date(startTime);
        const duration = Math.floor(Math.random() * 10) + 5; // 5-15 minutes
        endTime.setMinutes(endTime.getMinutes() + duration);
        
        await db.insert(activities).values({
          userId,
          category: 'salah',
          description: `${prayer.name} prayer`,
          startTime,
          endTime,
          duration: duration * 60, // convert to seconds
        });
      }
    }
    
    // Add reading activities
    for (let day = 0; day < 7; day++) {
      if (Math.random() > 0.3) { // 70% chance of reading on a given day
        const date = new Date();
        date.setDate(now.getDate() - day);
        date.setHours(Math.floor(Math.random() * 6) + 16, 0, 0, 0); // Between 4 PM and 10 PM
        
        const startTime = new Date(date);
        const endTime = new Date(startTime);
        const duration = Math.floor(Math.random() * 60) + 20; // 20-80 minutes
        endTime.setMinutes(endTime.getMinutes() + duration);
        
        const books = ['The Power of Habit', 'Atomic Habits', 'Deep Work', 'Quran', 'Psychology 101'];
        const book = books[Math.floor(Math.random() * books.length)];
        
        await db.insert(activities).values({
          userId,
          category: 'reading',
          description: `Reading ${book}`,
          startTime,
          endTime,
          duration: duration * 60, // convert to seconds
        });
      }
    }
    
    // Add social media activities
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(now.getDate() - day);
      
      // Random number of sessions (1-3) per day
      const sessions = Math.floor(Math.random() * 3) + 1;
      
      for (let s = 0; s < sessions; s++) {
        const hour = Math.floor(Math.random() * 14) + 8; // Between 8 AM and 10 PM
        date.setHours(hour, 0, 0, 0);
        
        const startTime = new Date(date);
        const endTime = new Date(startTime);
        const duration = Math.floor(Math.random() * 45) + 15; // 15-60 minutes
        endTime.setMinutes(endTime.getMinutes() + duration);
        
        const platforms = ['Instagram', 'Twitter', 'Facebook', 'TikTok', 'YouTube'];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        
        await db.insert(activities).values({
          userId,
          category: 'social_media',
          description: platform,
          startTime,
          endTime,
          duration: duration * 60, // convert to seconds
        });
      }
    }
    
    // Add lecture activities (3-5 times a week)
    const lectureCount = Math.floor(Math.random() * 3) + 3; // 3-5 lectures
    for (let i = 0; i < lectureCount; i++) {
      const day = Math.floor(Math.random() * 7); // Random day in the past week
      const date = new Date();
      date.setDate(now.getDate() - day);
      date.setHours(Math.floor(Math.random() * 8) + 9, 0, 0, 0); // Between 9 AM and 5 PM
      
      const startTime = new Date(date);
      const endTime = new Date(startTime);
      const duration = Math.floor(Math.random() * 60) + 60; // 60-120 minutes
      endTime.setMinutes(endTime.getMinutes() + duration);
      
      const subjects = ['Mathematics', 'Computer Science', 'Physics', 'Economics', 'Islamic Studies'];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      
      await db.insert(activities).values({
        userId,
        category: 'lectures',
        description: `${subject} lecture`,
        startTime,
        endTime,
        duration: duration * 60, // convert to seconds
      });
    }
    
    // Add sleep records for the week
    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(now.getDate() - day - 1); // Previous night
      date.setHours(22, 0, 0, 0); // 10 PM
      
      const startTime = new Date(date);
      startTime.setMinutes(Math.floor(Math.random() * 60)); // Random minutes
      
      const endTime = new Date(date);
      endTime.setDate(endTime.getDate() + 1); // Next morning
      endTime.setHours(6, 0, 0, 0); // 6 AM
      endTime.setMinutes(Math.floor(Math.random() * 60)); // Random minutes
      
      // Calculate duration
      const duration = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds
      
      await db.insert(activities).values({
        userId,
        category: 'sleep',
        description: 'Night sleep',
        startTime,
        endTime,
        duration,
      });
    }
    
    console.log('Added sample activities');
  } else {
    console.log(`Found ${existingActivities.length} existing activities, skipping activity seeding`);
  }

  // Add sample expenses if none exist
  const existingExpenses = await db.select().from(expenses).where(eq(expenses.userId, userId));
  
  if (existingExpenses.length === 0) {
    console.log('Adding sample expenses...');
    
    const expenseItems = [
      { category: 'food', description: 'Groceries', amount: 85.45 },
      { category: 'food', description: 'Restaurant', amount: 45.75 },
      { category: 'food', description: 'Coffee shop', amount: 12.35 },
      { category: 'transport', description: 'Gas', amount: 52.10 },
      { category: 'transport', description: 'Public transit', amount: 25.00 },
      { category: 'entertainment', description: 'Movies', amount: 28.50 },
      { category: 'entertainment', description: 'Subscription', amount: 15.99 },
      { category: 'shopping', description: 'Clothes', amount: 78.95 },
      { category: 'shopping', description: 'Electronics', amount: 129.99 },
      { category: 'utilities', description: 'Electricity', amount: 95.45 },
      { category: 'utilities', description: 'Internet', amount: 65.00 },
      { category: 'other', description: 'Miscellaneous', amount: 35.25 },
    ];
    
    // Distribute expenses over the past week
    for (const item of expenseItems) {
      const daysAgo = Math.floor(Math.random() * 7); // Random day within the past week
      const date = new Date();
      date.setDate(now.getDate() - daysAgo);
      date.setHours(Math.floor(Math.random() * 12) + 8, 0, 0, 0); // Between 8 AM and 8 PM
      
      await db.insert(expenses).values({
        userId,
        category: item.category,
        description: item.description,
        amount: item.amount,
        date,
      });
    }
    
    console.log('Added sample expenses');
  } else {
    console.log(`Found ${existingExpenses.length} existing expenses, skipping expense seeding`);
  }

  // Add sample goals if none exist
  const existingGoals = await db.select().from(goals).where(eq(goals.userId, userId));
  
  if (existingGoals.length === 0) {
    console.log('Adding sample goals...');
    
    const sampleGoals = [
      { name: 'Sleep 8 hours', category: 'sleep', targetValue: 8, unit: 'hours' },
      { name: 'Social Media < 2 hours', category: 'social_media', targetValue: 120, unit: 'minutes' },
      { name: 'Read 30 minutes', category: 'reading', targetValue: 30, unit: 'minutes' },
      { name: 'Pray 5 times', category: 'salah', targetValue: 5, unit: 'prayers' },
      { name: 'Keep food expenses < $100', category: 'food', targetValue: 100, unit: 'USD' }
    ];
    
    for (const goal of sampleGoals) {
      await db.insert(goals).values({
        userId,
        name: goal.name,
        category: goal.category,
        targetValue: goal.targetValue,
        currentValue: Math.random() * goal.targetValue,
        unit: goal.unit,
        active: true,
      });
    }
    
    console.log('Added sample goals');
  } else {
    console.log(`Found ${existingGoals.length} existing goals, skipping goal seeding`);
  }

  console.log('Database seeding completed');
}

seedDatabase().catch(console.error).finally(() => {
  process.exit(0);
});