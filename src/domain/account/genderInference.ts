/**
 * Intelligent Gender Inference from First Name / Display Name / Email.
 * Used when Google People API returns null / unspecified for gender,
 * ensuring users (especially male users) are never mistakenly assigned
 * to women's cycle / period tracking by default.
 */

// Core high-confidence male names
const MALE_NAMES = new Set([
  'amit', 'rahul', 'rohit', 'sachin', 'virat', 'deepak', 'gaurav', 'saurabh', 'alok', 'ashish',
  'abhishek', 'vikas', 'manish', 'pradeep', 'sandeep', 'sumit', 'tarun', 'varun', 'ajay', 'vijay',
  'sanjay', 'manoj', 'anil', 'sunil', 'pankaj', 'rajesh', 'suresh', 'ramesh', 'mukesh', 'ravi',
  'anand', 'arun', 'ashok', 'avinash', 'bharat', 'chetak', 'dev', 'dhruv', 'gopal', 'harsh',
  'ishaan', 'jaideep', 'kamal', 'karan', 'kishore', 'lalit', 'madhav', 'mayank', 'nakul', 'navin',
  'nikhil', 'nitin', 'omkar', 'prashant', 'praveen', 'raghav', 'raj', 'rajiv', 'rakesh', 'rishabh',
  'rohan', 'samir', 'shankar', 'shivam', 'shubham', 'siddharth', 'utkarsh', 'vaibhav', 'vinay', 'yash',
  'john', 'david', 'michael', 'james', 'robert', 'william', 'joseph', 'charles', 'thomas', 'christopher',
  'daniel', 'matthew', 'anthony', 'donald', 'mark', 'paul', 'steven', 'andrew', 'kenneth', 'joshua',
  'kevin', 'brian', 'george', 'edward', 'ronald', 'timothy', 'jason', 'jeffrey', 'ryan', 'jacob',
  'gary', 'nicholas', 'eric', 'stephen', 'jonathan', 'larry', 'justin', 'scott', 'brandon', 'frank',
  'benjamin', 'gregory', 'samuel', 'raymond', 'patrick', 'alexander', 'jack', 'dennis', 'jerry', 'tyler',
  'aaron', 'jose', 'adam', 'nathan', 'henry', 'douglas', 'zachary', 'peter', 'kyle', 'walter',
  'ethan', 'jeremy', 'harold', 'keith', 'christian', 'roger', 'noah', 'gerald', 'carl', 'terry',
  'sean', 'austin', 'arthur', 'lawrence', 'jesse', 'dylan', 'bryan', 'joe', 'jordan', 'billy',
  'bruce', 'albert', 'willie', 'gabriel', 'logan', 'alan', 'juan', 'wayne', 'roy', 'ralph',
  'randy', 'eugene', 'vincent', 'russell', 'elijah', 'louis', 'bobby', 'philip', 'johnny', 'liam',
  'lucas', 'mason', 'oliver', 'elijah', 'aiden', 'jackson', 'sebastian', 'mateo', 'leo', 'theodore',
]);

// Core high-confidence female names
const FEMALE_NAMES = new Set([
  'priya', 'pooja', 'anjali', 'neha', 'ritu', 'sunita', 'geeta', 'anita', 'shweta', 'kavita',
  'meena', 'rekha', 'sneha', 'swati', 'preeti', 'divya', 'aarti', 'deepa', 'aditi', 'akanksha',
  'ananya', 'archana', 'bhavna', 'chhaya', 'deepika', 'disha', 'garima', 'hema', 'ishita', 'jaya',
  'jyoti', 'kajal', 'kriti', 'lakshmi', 'madhu', 'manisha', 'megha', 'monika', 'nandini', 'pallavi',
  'payal', 'prerna', 'rachna', 'radha', 'radhika', 'rashmi', 'richa', 'riya', 'roshni', 'sakshi',
  'sangeeta', 'sapna', 'sarita', 'seema', 'shalini', 'shilpa', 'shreya', 'shruti', 'simran', 'smriti',
  'sonal', 'sonia', 'tanvi', 'trisha', 'upasana', 'urvashi', 'vandana', 'varsha', 'vidya', 'yashika',
  'mary', 'patricia', 'jennifer', 'linda', 'elizabeth', 'barbara', 'susan', 'jessica', 'sarah', 'karen',
  'lisa', 'nancy', 'betty', 'margaret', 'sandra', 'ashley', 'kimberly', 'emily', 'donna', 'michelle',
  'carol', 'amanda', 'melissa', 'deborah', 'stephanie', 'rebecca', 'sharon', 'laura', 'cynthia', 'kathleen',
  'amy', 'shirley', 'angela', 'helen', 'anna', 'brenda', 'pamela', 'nicole', 'emma', 'samantha',
  'katherine', 'christine', 'debra', 'rachel', 'catherine', 'carolyn', 'janet', 'ruth', 'maria', 'heather',
  'diane', 'virginia', 'julie', 'joyce', 'victoria', 'olivia', 'kelly', 'christina', 'lauren', 'joan',
  'evelyn', 'judith', 'megan', 'cheryl', 'andrea', 'hannah', 'martha', 'jacqueline', 'frances', 'gloria',
  'ann', 'teresa', 'kathryn', 'sara', 'janice', 'jean', 'alice', 'madison', 'doris', 'abigail',
  'julia', 'judy', 'grace', 'denise', 'amber', 'marilyn', 'beverly', 'danielle', 'theresa', 'sophia',
  'isabella', 'charlotte', 'amelia', 'harper', 'evelyn', 'abigail', 'ella', 'chloe', 'mila', 'avery',
]);

export function extractFirstName(fullNameOrEmail: string | null | undefined): string {
  if (!fullNameOrEmail) return '';
  const cleaned = fullNameOrEmail.trim();
  if (cleaned.includes('@')) {
    // If an email, take the part before the dot or plus
    const userPart = cleaned.split('@')[0].split(/[.+_-]/)[0];
    return userPart.toLowerCase();
  }
  // Otherwise split words and take first token
  const words = cleaned.split(/\s+/);
  return words[0].toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Synchronous local heuristic dictionary check.
 */
export function inferGenderFromLocalName(name: string | null | undefined): 'Male' | 'Female' | null {
  const firstName = extractFirstName(name);
  if (!firstName) return null;

  if (MALE_NAMES.has(firstName)) return 'Male';
  if (FEMALE_NAMES.has(firstName)) return 'Female';

  return null;
}

/**
 * Combined gender inference with optional online lookup fallback.
 */
export async function inferGender(name: string | null | undefined): Promise<'Male' | 'Female' | null> {
  const local = inferGenderFromLocalName(name);
  if (local) return local;

  const firstName = extractFirstName(name);
  if (!firstName || firstName.length < 2) return null;

  // Try online genderize.io with 1.2s timeout
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`https://api.genderize.io?name=${encodeURIComponent(firstName)}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data.gender === 'male' && (data.probability ?? 0) >= 0.6) return 'Male';
      if (data.gender === 'female' && (data.probability ?? 0) >= 0.6) return 'Female';
    }
  } catch {
    // Timeout or network offline; ignore
  }

  return null;
}
