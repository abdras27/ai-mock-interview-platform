export type AptitudeDifficulty = "easy" | "medium" | "hard";

export interface AptitudeQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export type AptitudeQuestionBank = Record<AptitudeDifficulty, AptitudeQuestion[]>;

export const APTITUDE_QUESTION_BANK: AptitudeQuestionBank = {
  easy: [
    {
      id: 1,
      question: "What is 15 + 27?",
      options: ["41", "42", "43", "44"],
      correctAnswerIndex: 1,
      explanation: "15 + 27 = 42.",
    },
    {
      id: 2,
      question: "Find the missing number: 2, 4, 6, 8, ?",
      options: ["9", "10", "11", "12"],
      correctAnswerIndex: 1,
      explanation: "The pattern is +2 each step, so the next number is 10.",
    },
    {
      id: 3,
      question: "If a pen costs Rs. 20, what is the cost of 5 pens?",
      options: ["Rs. 80", "Rs. 90", "Rs. 100", "Rs. 120"],
      correctAnswerIndex: 2,
      explanation: "5 x 20 = 100.",
    },
    {
      id: 4,
      question: "Which word is a synonym of 'Rapid'?",
      options: ["Slow", "Fast", "Calm", "Short"],
      correctAnswerIndex: 1,
      explanation: "Rapid means fast.",
    },
    {
      id: 5,
      question: "A rectangle has length 8 and width 3. What is its area?",
      options: ["11", "24", "16", "20"],
      correctAnswerIndex: 1,
      explanation: "Area = length x width = 8 x 3 = 24.",
    },
    {
      id: 6,
      question: "Choose the odd one out.",
      options: ["Dog", "Cat", "Cow", "Car"],
      correctAnswerIndex: 3,
      explanation: "Dog, cat, and cow are animals; car is not.",
    },
    {
      id: 7,
      question: "What is 25% of 200?",
      options: ["25", "40", "50", "75"],
      correctAnswerIndex: 2,
      explanation: "25% = 1/4, and 1/4 of 200 is 50.",
    },
    {
      id: 8,
      question: "If NORTH is coded as OPSUI, how is EAST coded?",
      options: ["FBTU", "GBTU", "FATU", "EAST"],
      correctAnswerIndex: 0,
      explanation: "Each letter shifts by +1: E->F, A->B, S->T, T->U.",
    },
    {
      id: 9,
      question: "A die is thrown once. Probability of getting a number greater than 4 is:",
      options: ["1/6", "1/3", "1/2", "2/3"],
      correctAnswerIndex: 1,
      explanation: "Numbers greater than 4 are 5 and 6: 2/6 = 1/3.",
    },
    {
      id: 10,
      question: "A person walks 3 km east and then 4 km north. Distance from start is:",
      options: ["5 km", "6 km", "7 km", "4.5 km"],
      correctAnswerIndex: 0,
      explanation: "Use Pythagoras: sqrt(3^2 + 4^2) = 5 km.",
    },
    {
      id: 11,
      question: "What is 18 x 5?",
      options: ["80", "85", "90", "95"],
      correctAnswerIndex: 2,
      explanation: "18 x 5 = 90.",
    },
    {
      id: 12,
      question: "Which one is the opposite of 'Ancient'?",
      options: ["Old", "Modern", "Historic", "Past"],
      correctAnswerIndex: 1,
      explanation: "Modern is the antonym of ancient.",
    },
    {
      id: 13,
      question: "If one notebook costs Rs. 35, cost of 4 notebooks is:",
      options: ["Rs. 120", "Rs. 130", "Rs. 140", "Rs. 150"],
      correctAnswerIndex: 2,
      explanation: "4 x 35 = 140.",
    },
    {
      id: 14,
      question: "Find next: 5, 10, 20, 40, ?",
      options: ["45", "60", "70", "80"],
      correctAnswerIndex: 3,
      explanation: "Pattern is x2 each time, so next is 80.",
    },
    {
      id: 15,
      question: "A fair coin is tossed once. Probability of getting heads is:",
      options: ["0", "1/4", "1/2", "1"],
      correctAnswerIndex: 2,
      explanation: "There are two equally likely outcomes, so P(heads)=1/2.",
    },
  ],
  medium: [
    {
      id: 1,
      question: "If 12 workers complete a task in 15 days, how many days will 20 workers take (same efficiency)?",
      options: ["6 days", "8 days", "9 days", "10 days"],
      correctAnswerIndex: 2,
      explanation: "Work is constant: workers x days = 12 x 15 = 180. Days with 20 workers = 180/20 = 9.",
    },
    {
      id: 2,
      question: "Find the next number in the series: 2, 6, 12, 20, 30, ?",
      options: ["36", "40", "42", "44"],
      correctAnswerIndex: 2,
      explanation: "Differences are +4, +6, +8, +10; next is +12. So 30 + 12 = 42.",
    },
    {
      id: 3,
      question: "A train 180 m long passes a pole in 12 seconds. What is its speed?",
      options: ["15 m/s", "18 m/s", "54 km/h", "Both 15 m/s and 54 km/h"],
      correctAnswerIndex: 3,
      explanation: "Speed = distance/time = 180/12 = 15 m/s = 54 km/h.",
    },
    {
      id: 4,
      question: "Which word is the odd one out?",
      options: ["Triangle", "Square", "Circle", "Cube"],
      correctAnswerIndex: 3,
      explanation: "Triangle, square, and circle are 2D shapes; cube is 3D.",
    },
    {
      id: 5,
      question: "If 35% of a number is 140, what is the number?",
      options: ["300", "350", "400", "450"],
      correctAnswerIndex: 2,
      explanation: "0.35 x N = 140 so N = 140/0.35 = 400.",
    },
    {
      id: 6,
      question: "Choose the correct synonym of 'Concise'.",
      options: ["Lengthy", "Brief", "Confusing", "Polite"],
      correctAnswerIndex: 1,
      explanation: "'Concise' means brief and to the point.",
    },
    {
      id: 7,
      question: "A shop gives 20% discount on an item marked at Rs. 2500. Selling price is:",
      options: ["Rs. 1800", "Rs. 1900", "Rs. 2000", "Rs. 2100"],
      correctAnswerIndex: 2,
      explanation: "Discount = 20% of 2500 = 500. Selling price = 2500 - 500 = 2000.",
    },
    {
      id: 8,
      question: "If 'PEN' is coded as 'QFO', then 'BOOK' is coded as:",
      options: ["CPPL", "CQQM", "CPOK", "DPPL"],
      correctAnswerIndex: 0,
      explanation: "Each letter shifts by +1: B->C, O->P, O->P, K->L, so CPPL.",
    },
    {
      id: 9,
      question: "What is the probability of getting an even number on a fair die?",
      options: ["1/6", "1/3", "1/2", "2/3"],
      correctAnswerIndex: 2,
      explanation: "Even outcomes are 2, 4, 6: 3 favorable out of 6 total, so 1/2.",
    },
    {
      id: 10,
      question: "A person walks 5 km north, then 3 km east. Distance from start is:",
      options: ["8 km", "5.8 km", "6 km", "7 km"],
      correctAnswerIndex: 1,
      explanation: "Use Pythagoras: sqrt(5^2 + 3^2) = sqrt(34) = 5.8 km (approx).",
    },
    {
      id: 11,
      question: "If a sum becomes double in 8 years at simple interest, the annual rate is:",
      options: ["10%", "12.5%", "15%", "8%"],
      correctAnswerIndex: 1,
      explanation: "For doubling, SI = 100% in 8 years, so rate = 100/8 = 12.5%.",
    },
    {
      id: 12,
      question: "Find the next term: 1, 4, 9, 16, 25, ?",
      options: ["30", "36", "49", "35"],
      correctAnswerIndex: 1,
      explanation: "These are perfect squares: 1^2, 2^2, 3^2... next is 6^2=36.",
    },
    {
      id: 13,
      question: "A car covers 240 km in 4 hours. What is the average speed?",
      options: ["40 km/h", "50 km/h", "60 km/h", "80 km/h"],
      correctAnswerIndex: 2,
      explanation: "Speed = distance/time = 240/4 = 60 km/h.",
    },
    {
      id: 14,
      question: "If 3x - 7 = 11, then x = ?",
      options: ["4", "5", "6", "7"],
      correctAnswerIndex: 2,
      explanation: "3x=18, so x=6.",
    },
    {
      id: 15,
      question: "In how many ways can letters of 'CAT' be arranged?",
      options: ["3", "6", "9", "12"],
      correctAnswerIndex: 1,
      explanation: "3 distinct letters can be arranged in 3! = 6 ways.",
    },
  ],
  hard: [
    {
      id: 1,
      question: "A can do a job in 20 days and B in 30 days. They work together for 6 days, then A leaves. Remaining work is finished by B in how many days?",
      options: ["12", "15", "18", "20"],
      correctAnswerIndex: 1,
      explanation: "A+B per day = 1/20 + 1/30 = 1/12. In 6 days they complete 1/2. Remaining 1/2 by B alone takes (1/2)/(1/30) = 15 days.",
    },
    {
      id: 2,
      question: "Find the next term: 3, 7, 15, 31, 63, ?",
      options: ["95", "111", "127", "129"],
      correctAnswerIndex: 2,
      explanation: "Pattern is (previous x 2) + 1, so 63 x 2 + 1 = 127.",
    },
    {
      id: 3,
      question: "If the ratio of present ages of A and B is 4:5 and after 8 years it becomes 6:7, B's present age is:",
      options: ["18", "20", "25", "30"],
      correctAnswerIndex: 1,
      explanation: "Let ages be 4x and 5x. (4x+8)/(5x+8)=6/7 => 28x+56=30x+48 => x=4, so B=5x=20.",
    },
    {
      id: 4,
      question: "In a code language, if DELHI is coded as EFMIJ, how is MUMBAI coded?",
      options: ["NVNCBJ", "NVNABJ", "NVMCAJ", "NVNCAJ"],
      correctAnswerIndex: 0,
      explanation: "Each letter shifts by +1: M->N, U->V, M->N, B->C, A->B, I->J.",
    },
    {
      id: 5,
      question: "A sum amounts to Rs. 1331 in 3 years at compound interest compounded annually. If principal is Rs. 1000, rate is:",
      options: ["8%", "10%", "11%", "12%"],
      correctAnswerIndex: 1,
      explanation: "1331/1000 = 1.331 = (1.1)^3, so rate is 10%.",
    },
    {
      id: 6,
      question: "A boat goes 30 km downstream in 2 hours and returns upstream in 3 hours. Speed of boat in still water is:",
      options: ["12 km/h", "12.5 km/h", "13 km/h", "15 km/h"],
      correctAnswerIndex: 1,
      explanation: "Downstream speed = 15, upstream = 10. Still-water speed = (15+10)/2 = 12.5 km/h.",
    },
    {
      id: 7,
      question: "A bag has 5 red, 4 blue, 3 green balls. Probability of drawing two red balls without replacement is:",
      options: ["5/33", "10/66", "20/132", "Both 5/33 and 10/66"],
      correctAnswerIndex: 3,
      explanation: "P = (5/12) x (4/11) = 20/132 = 10/66 = 5/33.",
    },
    {
      id: 8,
      question: "Select the correct antonym of 'Obscure'.",
      options: ["Hidden", "Vague", "Evident", "Minor"],
      correctAnswerIndex: 2,
      explanation: "'Obscure' means unclear/hidden; antonym is evident.",
    },
    {
      id: 9,
      question: "If log10(2)=0.3010 and log10(3)=0.4771, then log10(24) is:",
      options: ["1.0791", "1.3010", "1.3802", "0.7781"],
      correctAnswerIndex: 2,
      explanation: "log(24)=log(3)+log(8)=0.4771+3log(2)=0.4771+0.9030=1.3801 approx 1.3802.",
    },
    {
      id: 10,
      question: "In how many ways can 5 people sit around a circular table?",
      options: ["24", "60", "120", "20"],
      correctAnswerIndex: 0,
      explanation: "Circular arrangements of n distinct people = (n-1)!, so 4! = 24.",
    },
    {
      id: 11,
      question: "A and B can complete a work in 12 days, B and C in 15 days, and A and C in 20 days. In how many days will A, B, and C together finish it?",
      options: ["8", "9", "10", "12"],
      correctAnswerIndex: 2,
      explanation: "(A+B)+(B+C)+(A+C)=2(A+B+C)=1/12+1/15+1/20=1/5, so A+B+C=1/10.",
    },
    {
      id: 12,
      question: "Find next number: 2, 5, 11, 23, 47, ?",
      options: ["94", "95", "96", "97"],
      correctAnswerIndex: 1,
      explanation: "Pattern is previous x2 +1. So 47x2+1 = 95.",
    },
    {
      id: 13,
      question: "If sin theta = 3/5 and theta is acute, then cos theta = ?",
      options: ["4/5", "5/4", "3/4", "2/5"],
      correctAnswerIndex: 0,
      explanation: "Using sin^2 + cos^2 = 1 => cos theta = 4/5 (acute positive).",
    },
    {
      id: 14,
      question: "In a class, ratio of boys to girls is 7:5. If 12 students are added to each group, ratio becomes 19:15. Original total students = ?",
      options: ["96", "120", "144", "168"],
      correctAnswerIndex: 2,
      explanation: "Let boys=7x, girls=5x. (7x+12)/(5x+12)=19/15 => x=12. Total=12x=144.",
    },
    {
      id: 15,
      question: "A number leaves remainder 1 when divided by 2, 3, and 4, but is divisible by 5. Smallest such number is:",
      options: ["25", "41", "61", "85"],
      correctAnswerIndex: 1,
      explanation: "Number is 1 more than LCM(2,3,4)=12k+1 and divisible by 5. Smallest is 41.",
    },
  ],
  hard: [],
};

export const APTITUDE_DIFFICULTY_LABELS: Record<AptitudeDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export function getAptitudeQuestionsByDifficulty(
  difficulty: AptitudeDifficulty,
  bank: AptitudeQuestionBank = APTITUDE_QUESTION_BANK
): AptitudeQuestion[] {
  return bank[difficulty];
}

function shuffleQuestions(questions: AptitudeQuestion[]): AptitudeQuestion[] {
  const arr = [...questions];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRandomAptitudeTest(
  difficulty: AptitudeDifficulty,
  count = 10,
  bank: AptitudeQuestionBank = APTITUDE_QUESTION_BANK
): AptitudeQuestion[] {
  const pool = bank[difficulty];
  return shuffleQuestions(pool).slice(0, Math.min(count, pool.length));
}

export async function fetchAptitudeQuestionBank(): Promise<AptitudeQuestionBank> {
  const res = await fetch("/api/aptitude/questions", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to load aptitude question bank");
  }
  return (await res.json()) as AptitudeQuestionBank;
}
