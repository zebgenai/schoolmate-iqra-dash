export const SCHOOL = {
  name: "IQRA Smart School",
  address: "Plot 14, Gulberg III, Lahore, Pakistan",
  phone: "+92 42 1234 5678",
  email: "info@iqrasmartschool.edu.pk",
  principal: "Mr. Tariq Mehmood",
  session: "2025–2026",
};

export const STATS = {
  totalStudents: 842,
  totalTeachers: 46,
  presentToday: 781,
  absentToday: 61,
  feesCollected: 1_240_500,
  pendingFees: 318_000,
  upcomingExams: 4,
  recentAdmissions: 23,
};

export const CLASSES = ["Nursery", "KG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
export const SECTIONS = ["A", "B", "C"];

const firstNames = ["Ahmad", "Hassan", "Ali", "Zain", "Bilal", "Hamza", "Usman", "Faisal", "Ayesha", "Fatima", "Hira", "Maryam", "Zainab", "Iqra", "Noor", "Sara"];
const lastNames = ["Khan", "Ahmed", "Raza", "Iqbal", "Hussain", "Sheikh", "Malik", "Butt", "Chaudhry", "Awan", "Siddiqui"];

const pick = <T>(arr: T[], i: number) => arr[i % arr.length];

export type Student = {
  id: string;
  admissionNo: string;
  name: string;
  fatherName: string;
  guardianPhone: string;
  whatsapp: string;
  gender: "Male" | "Female";
  dob: string;
  class: string;
  section: string;
  monthlyFee: number;
  address: string;
  status: "Active" | "Inactive";
};

export const STUDENTS: Student[] = Array.from({ length: 28 }, (_, i) => {
  const fn = pick(firstNames, i * 3 + 1);
  const ln = pick(lastNames, i);
  const father = `${pick(firstNames, i + 7)} ${ln}`;
  return {
    id: `s${i + 1}`,
    admissionNo: `IQ-${2024}-${(100 + i).toString()}`,
    name: `${fn} ${ln}`,
    fatherName: father,
    guardianPhone: `+92 300 ${1000000 + i * 12345}`.slice(0, 16),
    whatsapp: `+92 321 ${2000000 + i * 11111}`.slice(0, 16),
    gender: i % 3 === 0 ? "Female" : "Male",
    dob: `20${10 + (i % 8)}-0${1 + (i % 9)}-1${i % 9}`,
    class: pick(CLASSES, i + 2),
    section: pick(SECTIONS, i),
    monthlyFee: 2500 + (i % 6) * 500,
    address: `House ${i + 12}, Street ${i + 3}, Lahore`,
    status: i % 11 === 0 ? "Inactive" : "Active",
  };
});

export const ATTENDANCE_WEEK = [
  { day: "Mon", present: 790, absent: 52 },
  { day: "Tue", present: 805, absent: 37 },
  { day: "Wed", present: 778, absent: 64 },
  { day: "Thu", present: 812, absent: 30 },
  { day: "Fri", present: 781, absent: 61 },
  { day: "Sat", present: 720, absent: 122 },
];

export const FEE_MONTHLY = [
  { month: "Jan", amount: 980000 },
  { month: "Feb", amount: 1020000 },
  { month: "Mar", amount: 1110000 },
  { month: "Apr", amount: 1080000 },
  { month: "May", amount: 1150000 },
  { month: "Jun", amount: 1200000 },
  { month: "Jul", amount: 1180000 },
  { month: "Aug", amount: 1240500 },
];

export const RECENT_ADMISSIONS = STUDENTS.slice(0, 6);

export const FEE_DEFAULTERS = STUDENTS.slice(0, 7).map((s, i) => ({
  ...s,
  pending: s.monthlyFee * (1 + (i % 3)),
  months: 1 + (i % 3),
}));

export type Teacher = {
  id: string;
  name: string;
  subject: string;
  qualification: string;
  phone: string;
  classes: string;
};

export const TEACHERS: Teacher[] = [
  { id: "t1", name: "Mrs. Saima Akhtar", subject: "Mathematics", qualification: "M.Sc Math", phone: "+92 300 1234567", classes: "6, 7, 8" },
  { id: "t2", name: "Mr. Asad Iqbal", subject: "Physics", qualification: "M.Sc Physics", phone: "+92 301 2345678", classes: "9, 10" },
  { id: "t3", name: "Ms. Hina Sheikh", subject: "English", qualification: "M.A English", phone: "+92 302 3456789", classes: "5, 6, 7" },
  { id: "t4", name: "Mr. Bilal Chaudhry", subject: "Urdu", qualification: "M.A Urdu", phone: "+92 303 4567890", classes: "3, 4, 5" },
  { id: "t5", name: "Mrs. Nadia Khan", subject: "Islamiyat", qualification: "M.A Islamic Studies", phone: "+92 304 5678901", classes: "All" },
  { id: "t6", name: "Mr. Faraz Malik", subject: "Computer Science", qualification: "BS CS", phone: "+92 305 6789012", classes: "8, 9, 10" },
  { id: "t7", name: "Ms. Rabia Awan", subject: "Biology", qualification: "M.Sc Biology", phone: "+92 306 7890123", classes: "9, 10" },
  { id: "t8", name: "Mr. Imran Butt", subject: "Chemistry", qualification: "M.Sc Chemistry", phone: "+92 307 8901234", classes: "9, 10" },
];

export const SUBJECTS = ["English", "Urdu", "Mathematics", "Science", "Islamiyat", "Social Studies", "Computer"];

export const UPCOMING_EXAMS = [
  { name: "Mid-Term", class: "9", date: "2026-06-12", subjects: 7 },
  { name: "Monthly Test", class: "5", date: "2026-06-08", subjects: 5 },
  { name: "Final-Term", class: "10", date: "2026-06-20", subjects: 8 },
  { name: "Monthly Test", class: "3", date: "2026-06-10", subjects: 4 },
];

export const formatPKR = (n: number) =>
  "Rs " + n.toLocaleString("en-PK");
