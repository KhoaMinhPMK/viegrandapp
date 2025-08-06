/**
 * Generates a random 8-character string containing numbers and lowercase letters
 * @returns {string} Random string like "93haosjf"
 */
export function generateRandomString(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Generates a unique random string and ensures it's not already in use
 * @param {Function} checkExists - Function to check if string already exists
 * @returns {Promise<string>} Unique random string
 */
export async function generateUniqueRandomString(
  checkExists?: (str: string) => Promise<boolean>
): Promise<string> {
  let randomString = generateRandomString();
  
  // If no check function provided, return the generated string
  if (!checkExists) {
    return randomString;
  }
  
  // Keep generating until we get a unique string
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    if (!(await checkExists(randomString))) {
      return randomString;
    }
    randomString = generateRandomString();
    attempts++;
  }
  
  // If we can't find a unique string after max attempts, append timestamp
  return randomString + Date.now().toString().slice(-4);
} 