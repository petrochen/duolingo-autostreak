// Import required modules
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logger class
class Logger {
	constructor(logFilePath) {
		this.logFilePath = logFilePath;
		// Create logs directory if it doesn't exist
		const logDir = path.dirname(logFilePath);
		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir, { recursive: true });
		}
		// Clear log file on startup
		fs.writeFileSync(logFilePath, '');
	}

	log(level, message) {
		const timestamp = new Date().toISOString();
		const logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}\n`;
		console.log(logMessage.trim());
		fs.appendFileSync(this.logFilePath, logMessage);
	}

	info(message) {
		this.log('info', message);
	}

	error(message) {
		this.log('error', message);
	}

	success(message) {
		this.log('success', message);
	}
}

// Function to load configuration
function loadConfig(configPath) {
	try {
		const configData = fs.readFileSync(configPath, 'utf8');
		return JSON.parse(configData);
	} catch (error) {
		console.error(`Error loading configuration from ${configPath}:`, error);
		process.exit(1);
	}
}

// Function to get random time for next execution (8 AM to 11 PM)
function getNextExecutionTime() {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	
	// Random hour between 8 AM and 11 PM (15 hour window)
	const hour = 8 + Math.floor(Math.random() * 15);
	const minute = Math.floor(Math.random() * 60);
	
	tomorrow.setHours(hour, minute, 0, 0);
	
	const msUntilExecution = tomorrow - Date.now();
	return msUntilExecution;
}

// Function to get variable lesson count
function getDailyLessonCount() {
	const rand = Math.random();
	if (rand < 0.5) return 1;      // 50% - 1 lesson
	if (rand < 0.8) return 2;      // 30% - 2 lessons
	return 3;                       // 20% - 3 lessons
}

// Function to complete lessons for a user
async function doLessonsForUser(jwtToken, username, config, logger, attempt = 1) {
	// Use variable lesson count instead of fixed config value
	const numLessonsToComplete = getDailyLessonCount();
	const { settings } = config;
	const { max_retries, retry_delay } = settings;
	logger.info(`Starting lessons for user ${username} (Attempt ${attempt})...`);
	const headers = {
		'Authorization': `Bearer ${jwtToken}`,
		'User-Agent': 'Mozilla/5.0'
	};

	try {
		// Get user information to determine current language
		const userResponse = await fetch(`https://www.duolingo.com/2017-06-30/users?username=${username}`, { headers });
		if (!userResponse.ok) {
			throw new Error(`Failed to get user information for ${username}: ${userResponse.statusText}`);
		}
		const userData = await userResponse.json();
		const currentUser = userData.users[0];
		const learningLanguage = currentUser.learningLanguage;
		const fromLanguage = currentUser.fromLanguage;

		if (!learningLanguage) {
			throw new Error(`Failed to determine learning language for ${username}`);
		}
		logger.info(`User ${username} is learning ${learningLanguage} from ${fromLanguage}.`);

		let lessonsCompleted = 0;
		let totalXpGained = 0;

		while (lessonsCompleted < numLessonsToComplete) {
			logger.info(`Starting lesson ${lessonsCompleted + 1}/${numLessonsToComplete} for ${username}...`);
			const sessionResponse = await fetch('https://www.duolingo.com/2017-06-30/sessions', {
				method: 'POST',
				headers: { ...headers, 'Content-Type': 'application/json' },
				body: JSON.stringify({
					challengeTypes: [
						"assist", "characterIntro", "characterMatch", "characterPuzzle",
						"characterSelect", "characterTrace", "characterWrite",
						"completeReverseTranslation", "definition", "dialogue",
						"form", "freeResponse", "gapFill", "judge", "listen",
						"listenComplete", "listenMatch", "match", "name", "listenComprehension",
						"listenIsolation", "listenTap", "orderTap", "partialListen",
						"partialReverseTranslate", "patternTap", "radioListenMatch",
						"radioListenTap", "readComprehension", "select",
						"selectPronunciation", "selectTranscription", "syllableTap",
						"syllableListenTap", "speak", "tapComplete", "tapCompleteTable",
						"tapDescribe", "translate", "typeComplete", "typeCompleteTable",
						"typeCloze", "typeClozeTable", "wordSearch"
					],
					fromLanguage: fromLanguage,
					isFinalLevel: false,
					isMasteryTest: false,
					isPathChallenge: true,
					juicy: true,
					learningLanguage: learningLanguage,
					smartTipsVersion: 2,
					type: "GLOBAL_PRACTICE"
				}),
			});

			if (!sessionResponse.ok) {
				throw new Error(`Failed to start lesson session for ${username}: ${sessionResponse.statusText}`);
			}
			const sessionData = await sessionResponse.json();

			// Simulate realistic lesson completion time (3-6 minutes)
			const timeTaken = 180 + Math.floor(Math.random() * 180); // Random time between 180-360 seconds (3-6 minutes)
			logger.info(`Simulating lesson completion (${Math.round(timeTaken / 60)} minutes)...`);
			await new Promise(resolve => setTimeout(resolve, timeTaken * 1000)); // Delay to simulate lesson time

			const resultResponse = await fetch(`https://www.duolingo.com/2017-06-30/sessions/${sessionData.id}`, {
				method: 'PUT',
				headers: { ...headers, 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...sessionData,
					heartsLeft: Math.floor(Math.random() * 3) + 1,  // 1-3 hearts left (more realistic)
					startTime: Math.floor((Date.now() - timeTaken * 1000) / 1000),
					enableBonusPoints: false,
					endTime: Math.floor(Date.now() / 1000),
					failed: false,
					maxInLessonStreak: Math.floor(Math.random() * 7) + 3,  // 3-9 streak (variable performance)
					shouldLearnSkills: true
				}),
			});

			if (!resultResponse.ok) {
				throw new Error(`Failed to complete lesson session for ${username}: ${resultResponse.statusText}`);
			}
			const resultData = await resultResponse.json();

			const xpGained = resultData.xpGain;
			totalXpGained += xpGained;
			lessonsCompleted++;
			logger.success(`Lesson ${lessonsCompleted}/${numLessonsToComplete} for ${username} completed. Gained ${xpGained} XP.`);
			
			// Add realistic pause between lessons
			if (lessonsCompleted < numLessonsToComplete) {
				const pauseSeconds = 30 + Math.floor(Math.random() * 120); // 30 seconds to 2.5 minutes
				logger.info(`Taking a ${Math.round(pauseSeconds)} second break before next lesson...`);
				await new Promise(resolve => setTimeout(resolve, pauseSeconds * 1000));
			}
		}

		logger.success(`All ${numLessonsToComplete} lessons for ${username} completed. Total XP gained: ${totalXpGained}.`);
		return { username, success: true, xpGained: totalXpGained, lessonsCompleted };
	} catch (error) {
		logger.error(`Error performing lessons for ${username}: ${error.message}`);
		if (attempt < max_retries) {
			logger.info(`Retrying in ${retry_delay} seconds...`);
			await new Promise(resolve => setTimeout(resolve, retry_delay * 1000));
			return doLessonsForUser(jwtToken, username, config, logger, attempt + 1);
		} else {
			logger.error(`Maximum number of attempts (${max_retries}) exceeded for ${username}.`);
			return { username, success: false, error: error.message };
		}
	}
}

// Main function
async function main() {
	const configPath = path.join(__dirname, 'config.json');
	const config = loadConfig(configPath);
	const logFilePath = path.join(__dirname, config.settings.log_file || 'logs/duolingo.log');
	const logger = new Logger(logFilePath);
	const resultsFilePath = path.join(__dirname, 'results.json');

	logger.info("--- Starting Duolingo Autostreak ---");

	while (true) {
		logger.info("Beginning lesson execution cycle...");
		const allUserResults = [];

		for (const user of config.users) {
			if (user.enabled) {
				const result = await doLessonsForUser(user.jwt_token, user.username, config, logger);
				allUserResults.push(result);
				if (config.users.indexOf(user) < config.users.length - 1) {
					const delay = config.settings.delay_between_users || 5;
					logger.info(`Pausing for ${delay} seconds before next user...`);
					await new Promise(resolve => setTimeout(resolve, delay * 1000));
				}
			} else {
				logger.info(`User ${user.username} is disabled, skipping.`);
				allUserResults.push({ username: user.username, success: null, message: 'User disabled' });
			}
		}

		// Save results
		try {
			fs.writeFileSync(resultsFilePath, JSON.stringify(allUserResults, null, 2));
			logger.info(`Results saved to ${resultsFilePath}`);
		} catch (error) {
			logger.error(`Failed to save results to ${resultsFilePath}: ${error.message}`);
		}

		logger.info("--- Lesson execution cycle completed ---");

		// Calculate random time for next run (tomorrow between 8 AM and 11 PM)
		const waitTimeMilliseconds = getNextExecutionTime();
		const waitTimeHours = Math.round(waitTimeMilliseconds / (1000 * 60 * 60));
		const nextRunTime = new Date(Date.now() + waitTimeMilliseconds);
		logger.info(`Next run scheduled for ${nextRunTime.toLocaleString()} (in ~${waitTimeHours} hours)`);
		await new Promise(resolve => setTimeout(resolve, waitTimeMilliseconds));
	}
}

// Start the main function
main().catch(error => {
	// Log critical error if main fails
	const criticalLogPath = path.join(__dirname, 'logs/critical_error.log');
	const timestamp = new Date().toISOString();
	const errorMessage = `${timestamp} [CRITICAL]: An unexpected error occurred in main: ${error.stack || error}\n`;
	console.error(errorMessage.trim());
	try {
		fs.appendFileSync(criticalLogPath, errorMessage);
	} catch (logError) {
		console.error('Failed to write critical error to file:', logError);
	}
	process.exit(1);
});