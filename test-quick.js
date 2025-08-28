// Quick test script to verify the new logic without waiting
import fs from 'fs';

// Test getDailyLessonCount function
function getDailyLessonCount() {
	const rand = Math.random();
	if (rand < 0.5) return 1;      // 50% - 1 lesson
	if (rand < 0.8) return 2;      // 30% - 2 lessons
	return 3;                       // 20% - 3 lessons
}

// Test getNextExecutionTime function
function getNextExecutionTime() {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	
	// Random hour between 8 AM and 11 PM (15 hour window)
	const hour = 8 + Math.floor(Math.random() * 15);
	const minute = Math.floor(Math.random() * 60);
	
	tomorrow.setHours(hour, minute, 0, 0);
	
	const msUntilExecution = tomorrow - Date.now();
	return { ms: msUntilExecution, time: tomorrow };
}

console.log('=== Testing New Duolingo Autostreak Logic ===\n');

// Test lesson count distribution (100 iterations)
console.log('1. Testing Lesson Count Distribution (100 iterations):');
const counts = { 1: 0, 2: 0, 3: 0 };
for (let i = 0; i < 100; i++) {
	const lessons = getDailyLessonCount();
	counts[lessons]++;
}
console.log(`   1 lesson: ${counts[1]}% (target: ~50%)`);
console.log(`   2 lessons: ${counts[2]}% (target: ~30%)`);
console.log(`   3 lessons: ${counts[3]}% (target: ~20%)\n`);

// Test next execution time
console.log('2. Testing Next Execution Time:');
for (let i = 0; i < 5; i++) {
	const nextRun = getNextExecutionTime();
	const hours = Math.round(nextRun.ms / (1000 * 60 * 60));
	console.log(`   Run ${i + 1}: ${nextRun.time.toLocaleString()} (in ~${hours} hours)`);
}

// Test realistic lesson parameters
console.log('\n3. Testing Lesson Parameters (5 simulations):');
for (let i = 0; i < 5; i++) {
	const timeTaken = 180 + Math.floor(Math.random() * 180); // 3-6 minutes
	const heartsLeft = Math.floor(Math.random() * 3) + 1;  // 1-3 hearts
	const maxStreak = Math.floor(Math.random() * 7) + 3;   // 3-9 streak
	const pauseSeconds = 30 + Math.floor(Math.random() * 120); // 30s-2.5min
	
	console.log(`   Simulation ${i + 1}:`);
	console.log(`     - Lesson time: ${Math.round(timeTaken / 60)} minutes`);
	console.log(`     - Hearts left: ${heartsLeft}`);
	console.log(`     - Max streak: ${maxStreak}`);
	console.log(`     - Pause before next: ${Math.round(pauseSeconds)} seconds`);
}

console.log('\n=== All tests completed ===');