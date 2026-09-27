console.log("=== RUNNING STEP 10 — SEARCHABLE ADMIN MANAGEMENT VALIDATION ===");

// Generate 125 mock students across skills
const mockStudents = [];
const skills = ["graphic", "video", "web", "content_creation"];

for (let i = 1; i <= 125; i++) {
  mockStudents.push({
    id: `KR82026ST${String(i).padStart(4, "0")}GRA`,
    name: `Student Number ${i}`,
    email: `student${i}@example.com`,
    phone: `+2348000000${String(i).padStart(3, "0")}`,
    skill: skills[i % skills.length],
    graduated: i % 3 === 0,
    points: i * 15,
  });
}

function filterAndPaginate(students, { q = "", skill = "all", status = "all", page = 1, pageSize = 15 }) {
  const qLower = q.toLowerCase().trim();
  const filtered = students.filter(s => {
    const matchesQ = !qLower || s.name.toLowerCase().includes(qLower) || s.id.toLowerCase().includes(qLower) || s.email.toLowerCase().includes(qLower);
    const matchesSkill = skill === "all" || s.skill === skill;
    const matchesStatus = status === "all" || (status === "graduated" && s.graduated) || (status === "training" && !s.graduated);
    return matchesQ && matchesSkill && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const items = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return { totalMatched: filtered.length, totalPages, currentPage, items };
}

// 1. Test pagination on all 125 records
console.log("\n--- [TEST 1] Full Dataset Pagination (125 items, pageSize=15) ---");
const resAll = filterAndPaginate(mockStudents, { page: 1, pageSize: 15 });
console.log("Total matched:", resAll.totalMatched);
console.log("Total pages:", resAll.totalPages);
console.log("Page 1 items count:", resAll.items.length);
if (resAll.totalPages !== 9 || resAll.items.length !== 15) {
  throw new Error("Pagination math error!");
}
console.log("✓ Pagination correctly divides 125 items into 9 pages of max 15 items!");

// 2. Test Skill Filter
console.log("\n--- [TEST 2] Skill Filter ('video') ---");
const resSkill = filterAndPaginate(mockStudents, { skill: "video" });
console.log("Video track students count:", resSkill.totalMatched);
const allAreVideo = resSkill.items.every(s => s.skill === "video");
if (!allAreVideo) throw new Error("Skill filter leaked other skills!");
console.log("✓ Skill filter exclusively returns video students!");

// 3. Test Multi-field Search
console.log("\n--- [TEST 3] Multi-field Search ('student42@') ---");
const resSearch = filterAndPaginate(mockStudents, { q: "student42@" });
if (resSearch.totalMatched !== 1 || resSearch.items[0].email !== "student42@example.com") {
  throw new Error("Search failed to isolate student42!");
}
console.log("✓ Search isolated exact record:", resSearch.items[0].name, resSearch.items[0].email);

console.log("\n=======================================================");
console.log("=== STEP 10 SEARCHABLE ADMIN MANAGEMENT VERIFIED! ===");
console.log("=======================================================");
