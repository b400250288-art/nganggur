import { PrismaClient, UserRole, GradeScale, CareerFitCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // 1. Clear Existing Data (Reverse order of dependencies)
  console.log("Cleaning up existing data...");
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.careerScore.deleteMany();
  await prisma.studentGrade.deleteMany();
  await prisma.careerWeight.deleteMany();
  await prisma.aiRecommendation.deleteMany();
  await prisma.jobRecommendation.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.universityAdmin.deleteMany();
  await prisma.course.deleteMany();
  await prisma.careerTarget.deleteMany();
  await prisma.studyProgram.deleteMany();
  await prisma.university.deleteMany();
  await prisma.user.deleteMany();

  // 2. Default System Settings
  console.log("Seeding system settings...");
  await prisma.systemSetting.createMany({
    data: [
      { key: "platform_name", value: "Industry Mirror", type: "string", label: "Platform Name" },
      { key: "maintenance_mode", value: "false", type: "boolean", label: "Maintenance Mode" },
      { key: "groq_api_fallback", value: "true", type: "boolean", label: "AI Fallback Option" },
    ],
  });

  // 3. System Administrator
  console.log("Seeding system administrator...");
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@industrymirror.id",
      fullName: "Super Administrator",
      role: UserRole.admin,
      authId: "e415ef40-8452-4752-9426-302ef35b5463",
      isActive: true,
    },
  });

  // 4. Demo University
  console.log("Seeding demo university...");
  const university = await prisma.university.create({
    data: {
      name: "Universitas Indonesia Demo",
      code: "UID",
      accreditation: "A",
      address: "Kampus Depok",
      city: "Depok",
      province: "Jawa Barat",
      website: "uid.ac.id",
      email: "info@uid.ac.id",
      phone: "021-788888",
    },
  });

  // 5. University Administrator
  console.log("Seeding university administrator...");
  const univAdminUser = await prisma.user.create({
    data: {
      email: "dean@uid.ac.id",
      fullName: "Dr. Budi Utomo",
      role: UserRole.university,
      authId: "a0799863-71cc-4ea2-abff-5c4250275883",
      isActive: true,
    },
  });

  await prisma.universityAdmin.create({
    data: {
      userId: univAdminUser.id,
      universityId: university.id,
      position: "Dekan Fakultas Ekonomi & Bisnis",
    },
  });

  // 6. Study Programs
  console.log("Seeding study programs...");
  const prodiManajemen = await prisma.studyProgram.create({
    data: {
      universityId: university.id,
      name: "S1 Manajemen",
      code: "MNG-UID",
      degree: "S1",
      accreditation: "A",
    },
  });

  const prodiAkuntansi = await prisma.studyProgram.create({
    data: {
      universityId: university.id,
      name: "S1 Akuntansi",
      code: "ACC-UID",
      degree: "S1",
      accreditation: "A",
    },
  });

  // 7. Courses
  console.log("Seeding courses...");
  // Manajemen Courses
  const mngCourses = [
    { name: "Pengantar Manajemen", code: "MNG101", credits: 3, semester: 1 },
    { name: "Manajemen Keuangan", code: "MNG201", credits: 3, semester: 2 },
    { name: "Perilaku Organisasi", code: "MNG202", credits: 3, semester: 2 },
    { name: "Manajemen Pemasaran", code: "MNG301", credits: 3, semester: 3 },
    { name: "Manajemen Strategis", code: "MNG401", credits: 3, semester: 4 },
  ];
  const dbMngCourses = [];
  for (const c of mngCourses) {
    const course = await prisma.course.create({
      data: {
        studyProgramId: prodiManajemen.id,
        name: c.name,
        code: c.code,
        credits: c.credits,
        semester: c.semester,
      },
    });
    dbMngCourses.push(course);
  }

  // Akuntansi Courses
  const accCourses = [
    { name: "Pengantar Akuntansi", code: "ACC101", credits: 3, semester: 1 },
    { name: "Akuntansi Keuangan Menengah", code: "ACC201", credits: 3, semester: 2 },
    { name: "Perpajakan", code: "ACC202", credits: 3, semester: 2 },
    { name: "Akuntansi Biaya", code: "ACC301", credits: 3, semester: 3 },
    { name: "Auditing", code: "ACC401", credits: 3, semester: 4 },
  ];
  const dbAccCourses = [];
  for (const c of accCourses) {
    const course = await prisma.course.create({
      data: {
        studyProgramId: prodiAkuntansi.id,
        name: c.name,
        code: c.code,
        credits: c.credits,
        semester: c.semester,
      },
    });
    dbAccCourses.push(course);
  }

  // 8. Career Targets
  console.log("Seeding career targets...");
  const brandManager = await prisma.careerTarget.create({
    data: {
      studyProgramId: prodiManajemen.id,
      name: "Brand Manager",
      industryField: "FMCG / Pemasaran",
      linkedinKeyword: "brand-manager",
      jobstreetKeyword: "brand manager",
      glintsKeyword: "brand manager",
      description: "Merencanakan, mengembangkan, dan mengarahkan strategi pemasaran jangka panjang untuk sebuah merek produk.",
    },
  });

  const financialAnalyst = await prisma.careerTarget.create({
    data: {
      studyProgramId: prodiManajemen.id,
      name: "Financial Analyst",
      industryField: "Perbankan / Investasi",
      linkedinKeyword: "financial-analyst",
      jobstreetKeyword: "financial analyst",
      glintsKeyword: "financial analyst",
      description: "Menganalisis data keuangan, memantau tren pasar, dan menyusun laporan perkiraan untuk memandu keputusan investasi.",
    },
  });

  const auditor = await prisma.careerTarget.create({
    data: {
      studyProgramId: prodiAkuntansi.id,
      name: "Auditor",
      industryField: "Jasa Keuangan / Kantor Akuntan Publik",
      linkedinKeyword: "auditor",
      jobstreetKeyword: "auditor",
      glintsKeyword: "auditor",
      description: "Memeriksa catatan keuangan perusahaan, memastikan kepatuhan hukum, dan mendeteksi penyelewengan keuangan.",
    },
  });

  const taxSpecialist = await prisma.careerTarget.create({
    data: {
      studyProgramId: prodiAkuntansi.id,
      name: "Tax Specialist",
      industryField: "Perpajakan & Konsultan",
      linkedinKeyword: "tax-specialist",
      jobstreetKeyword: "tax specialist",
      glintsKeyword: "tax specialist",
      description: "Menyusun strategi perpajakan, menghitung kewajiban pajak badan/orang pribadi, dan memastikan kepatuhan pajak.",
    },
  });

  // 9. Career Weights (Ensure sum to 100% / 1.0)
  console.log("Seeding career weights...");
  // Brand Manager weights: 15% + 10% + 25% + 35% + 15% = 100%
  const brandManagerWeights = [0.15, 0.10, 0.25, 0.35, 0.15];
  for (let i = 0; i < dbMngCourses.length; i++) {
    await prisma.careerWeight.create({
      data: {
        careerTargetId: brandManager.id,
        courseId: dbMngCourses[i].id,
        weight: brandManagerWeights[i],
      },
    });
  }

  // Financial Analyst weights: 10% + 45% + 10% + 10% + 25% = 100%
  const finAnalystWeights = [0.10, 0.45, 0.10, 0.10, 0.25];
  for (let i = 0; i < dbMngCourses.length; i++) {
    await prisma.careerWeight.create({
      data: {
        careerTargetId: financialAnalyst.id,
        courseId: dbMngCourses[i].id,
        weight: finAnalystWeights[i],
      },
    });
  }

  // Auditor weights: 15% + 30% + 15% + 10% + 30% = 100%
  const auditorWeights = [0.15, 0.30, 0.15, 0.10, 0.30];
  for (let i = 0; i < dbAccCourses.length; i++) {
    await prisma.careerWeight.create({
      data: {
        careerTargetId: auditor.id,
        courseId: dbAccCourses[i].id,
        weight: auditorWeights[i],
      },
    });
  }

  // Tax Specialist weights: 10% + 20% + 50% + 0.10% + 10% = 100%
  const taxWeights = [0.10, 0.20, 0.50, 0.10, 0.10];
  for (let i = 0; i < dbAccCourses.length; i++) {
    await prisma.careerWeight.create({
      data: {
        careerTargetId: taxSpecialist.id,
        courseId: dbAccCourses[i].id,
        weight: taxWeights[i],
      },
    });
  }

  // 10. Student Profiles & Grades
  console.log("Seeding student profiles and grades...");
  const dummyStudents = [
    {
      email: "rian.adi@student.uid.ac.id",
      fullName: "Rian Adi",
      authId: "student-uuid-rian-adi",
      nim: "1412022001",
      semester: 4,
      gpa: 3.42,
      studyProgramId: prodiManajemen.id,
      careerTargetId: brandManager.id,
      grades: [88, 72, 90, 86, 80], // in order of dbMngCourses
      careerFitScore: 84.8,
      careerCategory: CareerFitCategory.excellent,
    },
    {
      email: "siti.rahma@student.uid.ac.id",
      fullName: "Siti Rahma",
      authId: "student-uuid-siti-rahma",
      nim: "1412022002",
      semester: 4,
      gpa: 3.65,
      studyProgramId: prodiManajemen.id,
      careerTargetId: financialAnalyst.id,
      grades: [76, 92, 78, 70, 85],
      careerFitScore: 84.5,
      careerCategory: CareerFitCategory.excellent,
    },
    {
      email: "budi.hartono@student.uid.ac.id",
      fullName: "Budi Hartono",
      authId: "student-uuid-budi-hartono",
      nim: "1422022001",
      semester: 4,
      gpa: 3.72,
      studyProgramId: prodiAkuntansi.id,
      careerTargetId: auditor.id,
      grades: [90, 85, 80, 82, 92], // in order of dbAccCourses
      careerFitScore: 87.9,
      careerCategory: CareerFitCategory.excellent,
    },
    {
      email: "dewi.lestari@student.uid.ac.id",
      fullName: "Dewi Lestari",
      authId: "student-uuid-dewi-lestari",
      nim: "1422022002",
      semester: 4,
      gpa: 3.28,
      studyProgramId: prodiAkuntansi.id,
      careerTargetId: taxSpecialist.id,
      grades: [80, 76, 95, 70, 72],
      careerFitScore: 84.8,
      careerCategory: CareerFitCategory.excellent,
    },
  ];

  for (const s of dummyStudents) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        fullName: s.fullName,
        role: UserRole.student,
        authId: s.authId,
        isActive: true,
      },
    });

    const studentProfile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        studyProgramId: s.studyProgramId,
        careerTargetId: s.careerTargetId,
        nim: s.nim,
        semester: s.semester,
        gpa: s.gpa,
      },
    });

    // Seed grades
    const coursesToUse = s.studyProgramId === prodiManajemen.id ? dbMngCourses : dbAccCourses;
    for (let i = 0; i < coursesToUse.length; i++) {
      const numGrade = s.grades[i];
      let letter: GradeScale = GradeScale.C;
      if (numGrade >= 85) letter = GradeScale.A;
      else if (numGrade >= 75) letter = GradeScale.AB;
      else if (numGrade >= 70) letter = GradeScale.B;
      else if (numGrade >= 65) letter = GradeScale.BC;
      else if (numGrade >= 55) letter = GradeScale.C;
      else if (numGrade >= 40) letter = GradeScale.D;
      else letter = GradeScale.E;

      await prisma.studentGrade.create({
        data: {
          studentProfileId: studentProfile.id,
          courseId: coursesToUse[i].id,
          numericGrade: numGrade,
          letterGrade: letter,
          semester: coursesToUse[i].semester,
          academicYear: "2023/2024",
        },
      });
    }

    // Seed career fit score
    await prisma.careerScore.create({
      data: {
        studentProfileId: studentProfile.id,
        careerTargetId: s.careerTargetId,
        score: s.careerFitScore,
        category: s.careerCategory,
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
