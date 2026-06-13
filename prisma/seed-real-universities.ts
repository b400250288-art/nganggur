import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// Helper to batched createMany inserts due to PostgreSQL prepared statement parameter limits (max 65,535 parameters)
async function safeCreateMany(model: any, data: any[], batchSize = 3000) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await model.createMany({ data: batch });
  }
}

// Comprehensive list of 60 Indonesian universities
const universitiesData = [
  // ===================== JAWA BARAT & DKI JAKARTA =====================
  { name: "Universitas Indonesia", code: "UI", accreditation: "A", city: "Depok", province: "Jawa Barat" },
  { name: "Universitas Padjadjaran", code: "UNPAD", accreditation: "A", city: "Sumedang", province: "Jawa Barat" },
  { name: "Universitas Siliwangi", code: "UNSIL", accreditation: "B", city: "Tasikmalaya", province: "Jawa Barat" },
  { name: "Universitas Singaperbangsa Karawang", code: "UNSIKA", accreditation: "B", city: "Karawang", province: "Jawa Barat" },
  { name: "Universitas Pasundan", code: "UNPAS", accreditation: "B", city: "Bandung", province: "Jawa Barat" },
  { name: "Universitas Islam Bandung", code: "UNISBA", accreditation: "B", city: "Bandung", province: "Jawa Barat" },
  { name: "Bina Nusantara University", code: "BINUS", accreditation: "A", city: "Jakarta Barat", province: "DKI Jakarta" },
  { name: "Universitas Trisakti", code: "USAKTI", accreditation: "A", city: "Jakarta Barat", province: "DKI Jakarta" },
  { name: "Universitas Tarumanagara", code: "UNTAR", accreditation: "A", city: "Jakarta Barat", province: "DKI Jakarta" },
  { name: "Universitas Mercu Buana", code: "UMB", accreditation: "B", city: "Jakarta Barat", province: "DKI Jakarta" },
  { name: "Universitas Pelita Harapan", code: "UPH", accreditation: "A", city: "Tangerang", province: "Banten" },
  { name: "Universitas Prasetiya Mulya", code: "PRASMUL", accreditation: "A", city: "Tangerang Selatan", province: "Banten" },
  { name: "Universitas Sultan Ageng Tirtayasa", code: "UNTIRTA", accreditation: "B", city: "Serang", province: "Banten" },
  // ===================== JAWA TENGAH & DI YOGYAKARTA =====================
  { name: "Universitas Gadjah Mada", code: "UGM", accreditation: "A", city: "Sleman", province: "DI Yogyakarta" },
  { name: "Universitas Islam Indonesia", code: "UII", accreditation: "A", city: "Sleman", province: "DI Yogyakarta" },
  { name: "Universitas Muhammadiyah Yogyakarta", code: "UMY", accreditation: "A", city: "Bantul", province: "DI Yogyakarta" },
  { name: "Universitas Negeri Yogyakarta", code: "UNY", accreditation: "A", city: "Sleman", province: "DI Yogyakarta" },
  { name: "Universitas Atma Jaya Yogyakarta", code: "UAJY", accreditation: "A", city: "Sleman", province: "DI Yogyakarta" },
  { name: "Universitas Sanata Dharma", code: "USD", accreditation: "A", city: "Sleman", province: "DI Yogyakarta" },
  { name: "Universitas Diponegoro", code: "UNDIP", accreditation: "A", city: "Semarang", province: "Jawa Tengah" },
  { name: "Universitas Sebelas Maret", code: "UNS", accreditation: "A", city: "Surakarta", province: "Jawa Tengah" },
  { name: "Universitas Muhammadiyah Surakarta", code: "UMS", accreditation: "A", city: "Surakarta", province: "Jawa Tengah" },
  { name: "Universitas Negeri Semarang", code: "UNNES", accreditation: "A", city: "Semarang", province: "Jawa Tengah" },
  { name: "Universitas Dian Nuswantoro", code: "UDINUS", accreditation: "B", city: "Semarang", province: "Jawa Tengah" },
  // ===================== JAWA TIMUR =====================
  { name: "Universitas Airlangga", code: "UNAIR", accreditation: "A", city: "Surabaya", province: "Jawa Timur" },
  { name: "Universitas Brawijaya", code: "UB", accreditation: "A", city: "Malang", province: "Jawa Timur" },
  { name: "Universitas Negeri Surabaya", code: "UNESA", accreditation: "A", city: "Surabaya", province: "Jawa Timur" },
  { name: "Universitas Negeri Malang", code: "UM", accreditation: "A", city: "Malang", province: "Jawa Timur" },
  { name: "Universitas Muhammadiyah Malang", code: "UMM", accreditation: "A", city: "Malang", province: "Jawa Timur" },
  { name: "Universitas Islam Malang", code: "UNISMA", accreditation: "B", city: "Malang", province: "Jawa Timur" },
  { name: "Universitas Ciputra Surabaya", code: "UC", accreditation: "A", city: "Surabaya", province: "Jawa Timur" },
  { name: "Institut Teknologi Sepuluh Nopember", code: "ITS", accreditation: "A", city: "Surabaya", province: "Jawa Timur" },
  // ===================== SUMATERA =====================
  { name: "Universitas Sumatera Utara", code: "USU", accreditation: "A", city: "Medan", province: "Sumatera Utara" },
  { name: "Universitas HKBP Nommensen", code: "UHN", accreditation: "B", city: "Medan", province: "Sumatera Utara" },
  { name: "Universitas Muhammadiyah Sumatera Utara", code: "UMSU", accreditation: "B", city: "Medan", province: "Sumatera Utara" },
  { name: "Universitas Andalas", code: "UNAND", accreditation: "A", city: "Padang", province: "Sumatera Barat" },
  { name: "Universitas Bung Hatta", code: "UBH", accreditation: "B", city: "Padang", province: "Sumatera Barat" },
  { name: "Universitas Riau", code: "UNRI", accreditation: "A", city: "Pekanbaru", province: "Riau" },
  { name: "Universitas Islam Riau", code: "UIR", accreditation: "B", city: "Pekanbaru", province: "Riau" },
  { name: "Universitas Jambi", code: "UNJA", accreditation: "A", city: "Jambi", province: "Jambi" },
  { name: "Universitas Sriwijaya", code: "UNSRI", accreditation: "A", city: "Indralaya", province: "Sumatera Selatan" },
  { name: "Universitas Lampung", code: "UNILA", accreditation: "A", city: "Bandar Lampung", province: "Lampung" },
  { name: "Universitas Bengkulu", code: "UNIB", accreditation: "B", city: "Bengkulu", province: "Bengkulu" },
  // ===================== KALIMANTAN =====================
  { name: "Universitas Mulawarman", code: "UNMUL", accreditation: "A", city: "Samarinda", province: "Kalimantan Timur" },
  { name: "Universitas Lambung Mangkurat", code: "ULM", accreditation: "B", city: "Banjarmasin", province: "Kalimantan Selatan" },
  { name: "Universitas Palangka Raya", code: "UPR", accreditation: "B", city: "Palangka Raya", province: "Kalimantan Tengah" },
  { name: "Universitas Tanjungpura", code: "UNTAN", accreditation: "B", city: "Pontianak", province: "Kalimantan Barat" },
  // ===================== SULAWESI =====================
  { name: "Universitas Hasanuddin", code: "UNHAS", accreditation: "A", city: "Makassar", province: "Sulawesi Selatan" },
  { name: "Universitas Negeri Makassar", code: "UNM", accreditation: "A", city: "Makassar", province: "Sulawesi Selatan" },
  { name: "Universitas Muslim Indonesia", code: "UMI", accreditation: "B", city: "Makassar", province: "Sulawesi Selatan" },
  { name: "Universitas Sam Ratulangi", code: "UNSRAT", accreditation: "A", city: "Manado", province: "Sulawesi Utara" },
  { name: "Universitas Tadulako", code: "UNTAD", accreditation: "B", city: "Palu", province: "Sulawesi Tengah" },
  { name: "Universitas Halu Oleo", code: "UHO", accreditation: "B", city: "Kendari", province: "Sulawesi Tenggara" },
  // ===================== BALI & NUSA TENGGARA =====================
  { name: "Universitas Udayana", code: "UNUD", accreditation: "A", city: "Denpasar", province: "Bali" },
  { name: "Universitas Pendidikan Ganesha", code: "UNDIKSHA", accreditation: "B", city: "Singaraja", province: "Bali" },
  { name: "Universitas Mataram", code: "UNRAM", accreditation: "B", city: "Mataram", province: "Nusa Tenggara Barat" },
  { name: "Universitas Nusa Cendana", code: "UNDANA", accreditation: "B", city: "Kupang", province: "Nusa Tenggara Timur" },
  // ===================== MALUKU & PAPUA =====================
  { name: "Universitas Pattimura", code: "UNPATTI", accreditation: "B", city: "Ambon", province: "Maluku" },
  { name: "Universitas Cenderawasih", code: "UNCEN", accreditation: "B", city: "Jayapura", province: "Papua" },
  { name: "Universitas Musamus", code: "UNMUS", accreditation: "B", city: "Merauke", province: "Papua Selatan" },
];

const studyProgramsTemplate = [
  // 1. Rumpun Inti (The Big Three)
  {
    name: "S1 Manajemen",
    code: "MAN",
    industryField: "Manajemen & Bisnis",
    courses: [
      // Semester 1
      { name: "Pendidikan Agama", credits: 2, semester: 1 },
      { name: "Pancasila", credits: 2, semester: 1 },
      { name: "Bahasa Indonesia", credits: 2, semester: 1 },
      { name: "Pengantar Bisnis", credits: 3, semester: 1 },
      { name: "Pengantar Manajemen", credits: 3, semester: 1 },
      { name: "Matematika Ekonomi", credits: 3, semester: 1 },
      { name: "Pengantar Ekonomi Mikro", credits: 3, semester: 1 },
      // Semester 2
      { name: "Kewarganegaraan", credits: 2, semester: 2 },
      { name: "Bahasa Inggris Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Akuntansi", credits: 3, semester: 2 },
      { name: "Statistika Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Ekonomi Makro", credits: 3, semester: 2 },
      { name: "Hukum Bisnis", credits: 3, semester: 2 },
      // Semester 3
      { name: "Manajemen Pemasaran", credits: 3, semester: 3 },
      { name: "Manajemen Keuangan", credits: 3, semester: 3 },
      { name: "Manajemen SDM", credits: 3, semester: 3 },
      { name: "Manajemen Operasional", credits: 3, semester: 3 },
      { name: "Perilaku Organisasi", credits: 3, semester: 3 },
      { name: "Etika Bisnis", credits: 3, semester: 3 },
      // Semester 4
      { name: "Manajemen Strategis", credits: 3, semester: 4 },
      { name: "Metode Penelitian Bisnis", credits: 3, semester: 4 },
      { name: "Penganggaran Perusahaan", credits: 3, semester: 4 },
      { name: "Riset Pemasaran", credits: 3, semester: 4 },
      { name: "Manajemen Operasional Lanjutan", credits: 3, semester: 4 },
      // Semester 5
      { name: "Keuangan Internasional", credits: 3, semester: 5 },
      { name: "Manajemen Talenta & Karir", credits: 3, semester: 5 },
      { name: "Perilaku Konsumen", credits: 3, semester: 5 },
      { name: "Sistem Informasi Manajemen", credits: 3, semester: 5 },
      { name: "Manajemen Risiko Bisnis", credits: 3, semester: 5 },
      // Semester 6 (MBKM)
      { name: "Magang Industri Kontemporer / Studi Independen Bersertifikat (MBKM)", credits: 20, semester: 6 },
      // Semester 7
      { name: "Kuliah Kerja Nyata (KKN)", credits: 4, semester: 7 },
      { name: "Seminar Isu Manajemen", credits: 3, semester: 7 },
      { name: "Manajemen Perubahan", credits: 3, semester: 7 },
      { name: "Kewirausahaan Terapan", credits: 3, semester: 7 },
      // Semester 8
      { name: "Skripsi / Tugas Akhir Manajemen", credits: 6, semester: 8 },
    ],
    careers: [
      { name: "Management Trainee (MT)", description: "Jalur akselerasi karir korporat yang melatih lulusan di berbagai divisi manajemen." },
      { name: "HR Business Partner (HRBP)", description: "Menghubungkan strategi SDM dengan target pertumbuhan bisnis perusahaan." },
      { name: "Product Manager", description: "Menjembatani tim bisnis, desain (UX), dan teknis dalam pengembangan produk/aplikasi." },
      { name: "Operations Manager", description: "Mengawasi efisiensi operasional harian, menekan biaya, dan menjaga kualitas layanan." },
      { name: "Business Development (BD) Specialist", description: "Mengidentifikasi kemitraan baru dan peluang ekspansi pasar." },
      { name: "Corporate Strategy Analyst", description: "Menganalisis kompetitor dan merumuskan rencana bisnis jangka panjang." },
      { name: "Project Management Officer (PMO)", description: "Mengelola linimasa, anggaran, dan eksekusi proyek-proyek strategis." },
      { name: "Change Management Consultant", description: "Membantu transisi budaya atau adaptasi sistem teknologi baru di internal perusahaan." },
      { name: "Brand Manager", description: "Mengelola seluruh ekosistem citra produk, mulai dari riset konsumen hingga eksekusi kampanye." },
      { name: "Risk Advisory Associate", description: "Menganalisis potensi risiko internal dan kepatuhan tata kelola organisasi." },
    ],
  },
  {
    name: "S1 Akuntansi",
    code: "AKT",
    industryField: "Akuntansi & Audit",
    courses: [
      // Semester 1
      { name: "Pendidikan Agama", credits: 2, semester: 1 },
      { name: "Pancasila", credits: 2, semester: 1 },
      { name: "Bahasa Indonesia", credits: 2, semester: 1 },
      { name: "Pengantar Bisnis", credits: 3, semester: 1 },
      { name: "Pengantar Manajemen", credits: 3, semester: 1 },
      { name: "Matematika Ekonomi", credits: 3, semester: 1 },
      { name: "Pengantar Akuntansi 1", credits: 3, semester: 1 },
      // Semester 2
      { name: "Kewarganegaraan", credits: 2, semester: 2 },
      { name: "Bahasa Inggris Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Akuntansi 2", credits: 3, semester: 2 },
      { name: "Statistika Keuangan", credits: 3, semester: 2 },
      { name: "Pengantar Ekonomi Mikro & Makro", credits: 3, semester: 2 },
      { name: "Hukum Bisnis", credits: 3, semester: 2 },
      // Semester 3
      { name: "Akuntansi Keuangan Menengah 1", credits: 3, semester: 3 },
      { name: "Akuntansi Biaya", credits: 3, semester: 3 },
      { name: "Perpajakan 1", credits: 3, semester: 3 },
      { name: "Sistem Informasi Akuntansi", credits: 3, semester: 3 },
      { name: "Akuntansi Sektor Publik", credits: 3, semester: 3 },
      // Semester 4
      { name: "Akuntansi Keuangan Menengah 2", credits: 3, semester: 4 },
      { name: "Akuntansi Manajemen", credits: 3, semester: 4 },
      { name: "Perpajakan 2", credits: 3, semester: 4 },
      { name: "Audit & Asurans 1", credits: 3, semester: 4 },
      { name: "Hukum Pajak", credits: 3, semester: 4 },
      // Semester 5
      { name: "Akuntansi Keuangan Lanjutan 1", credits: 3, semester: 5 },
      { name: "Audit & Asurans 2", credits: 3, semester: 5 },
      { name: "Analisis Laporan Keuangan", credits: 3, semester: 5 },
      { name: "Teori Akuntansi", credits: 3, semester: 5 },
      { name: "Etika Profesi Akuntan", credits: 3, semester: 5 },
      // Semester 6 (MBKM)
      { name: "Magang Kerja di Kantor Akuntan Publik (KAP) / Divisi Finansial Korporasi (MBKM)", credits: 20, semester: 6 },
      // Semester 7
      { name: "Akuntansi Keuangan Lanjutan 2", credits: 3, semester: 7 },
      { name: "Akuntansi Keberlanjutan (ESG Reporting)", credits: 3, semester: 7 },
      { name: "Sistem Pengendalian Manajemen", credits: 3, semester: 7 },
      { name: "Kuliah Kerja Nyata (KKN)", credits: 4, semester: 7 },
      // Semester 8
      { name: "Skripsi / Tugas Akhir Akuntansi", credits: 6, semester: 8 },
    ],
    careers: [
      { name: "External Auditor (KAP)", description: "Memeriksa validitas laporan keuangan perusahaan klien di Kantor Akuntan Publik." },
      { name: "Internal Auditor", description: "Memastikan sistem pengendalian keuangan internal berjalan efisien dan bebas kecurangan (fraud)." },
      { name: "Tax Consultant", description: "Menyusun strategi perpajakan legal dan memastikan kepatuhan e-faktur korporasi." },
      { name: "Corporate Accountant", description: "Menyusun laporan laba rugi, neraca, dan arus kas internal perusahaan." },
      { name: "Forensic Accountant", description: "Menyelidiki kejahatan keuangan, pencucian uang, dan sengketa dana di ranah hukum." },
      { name: "Financial Analyst", description: "Mengevaluasi kinerja keuangan dan memberikan rekomendasi investasi internal." },
      { name: "SaaS Revenue Accountant", description: "Spesialis akuntansi untuk perusahaan berbasis teknologi dengan model bisnis langganan (subscription-based)." },
      { name: "Budget Analyst", description: "Merencanakan, menguji, dan mengawasi alokasi anggaran operasional tahunan perusahaan." },
      { name: "Accounting Systems Specialist", description: "Merancang dan mengonfigurasi perangkat lunak akuntansi berbasis cloud (seperti ERP)." },
      { name: "ESG Reporting Specialist", description: "Menyusun laporan pengungkapan dampak lingkungan, sosial, dan tata kelola perusahaan ke investor." },
    ],
  },
  {
    name: "S1 Ekonomi Pembangunan",
    code: "EKP",
    industryField: "Ekonomi & Kebijakan Publik",
    courses: [
      // Semester 1
      { name: "Pendidikan Agama", credits: 2, semester: 1 },
      { name: "Pancasila", credits: 2, semester: 1 },
      { name: "Bahasa Indonesia", credits: 2, semester: 1 },
      { name: "Pengantar Bisnis", credits: 3, semester: 1 },
      { name: "Matematika Ekonomi 1", credits: 3, semester: 1 },
      { name: "Pengantar Ekonomi Mikro", credits: 3, semester: 1 },
      { name: "Sejarah Perekonomian", credits: 3, semester: 1 },
      // Semester 2
      { name: "Kewarganegaraan", credits: 2, semester: 2 },
      { name: "Bahasa Inggris Ekonomi", credits: 3, semester: 2 },
      { name: "Matematika Ekonomi 2", credits: 3, semester: 2 },
      { name: "Statistika Ekonomi 1", credits: 3, semester: 2 },
      { name: "Pengantar Ekonomi Makro", credits: 3, semester: 2 },
      { name: "Hukum Ekonomi", credits: 3, semester: 2 },
      // Semester 3
      { name: "Ekonomi Mikro Menengah", credits: 3, semester: 3 },
      { name: "Ekonomi Makro Menengah", credits: 3, semester: 3 },
      { name: "Statistika Ekonomi 2", credits: 3, semester: 3 },
      { name: "Ekonomi Pembangunan 1", credits: 3, semester: 3 },
      { name: "Ekonomi Publik 1", credits: 3, semester: 3 },
      // Semester 4
      { name: "Ekonometrika 1", credits: 3, semester: 4 },
      { name: "Ekonomi Moneter 1", credits: 3, semester: 4 },
      { name: "Ekonomi Internasional 1", credits: 3, semester: 4 },
      { name: "Ekonomi Wilayah & Perkotaan", credits: 3, semester: 4 },
      { name: "Ekonomi Pembangunan 2", credits: 3, semester: 4 },
      // Semester 5
      { name: "Ekonometrika Lanjutan", credits: 3, semester: 5 },
      { name: "Evaluasi Proyek Pembangunan", credits: 3, semester: 5 },
      { name: "Kebijakan Publik", credits: 3, semester: 5 },
      { name: "Sejarah Pemikiran Ekonomi", credits: 3, semester: 5 },
      { name: "Metode Penelitian Ekonomi", credits: 3, semester: 5 },
      // Semester 6 (MBKM)
      { name: "Magang Instansi Pemerintahan (Bappenas/BI/OJK/BPS) / Proyek Riset Ekonomi (MBKM)", credits: 20, semester: 6 },
      // Semester 7
      { name: "Ekonomi Demografi & Ketenagakerjaan", credits: 3, semester: 7 },
      { name: "Perencanaan Pembangunan", credits: 3, semester: 7 },
      { name: "Ekonomi Sumber Daya Alam & Lingkungan", credits: 3, semester: 7 },
      { name: "Kuliah Kerja Nyata (KKN)", credits: 4, semester: 7 },
      // Semester 8
      { name: "Skripsi / Tugas Akhir Ilmu Ekonomi", credits: 6, semester: 8 },
    ],
    careers: [
      { name: "Economic Policy Analyst", description: "Merumuskan dan mengevaluasi dampak kebijakan publik untuk kementerian atau pemerintah daerah." },
      { name: "Data Analyst (Public Sector)", description: "Mengolah data survei dan statistik makro untuk program-program pemerintah." },
      { name: "Research Associate (Think Tank)", description: "Melakukan studi mendalam mengenai isu kemiskinan, ketimpangan, dan inflasi." },
      { name: "Econometrician", description: "Menggunakan model matematika dan statistik untuk memprediksi tren pasar dan ekonomi." },
      { name: "Socio-Economic Consultant", description: "Menilai dampak sosial-ekonomi dari proyek pembangunan infrastruktur nasional." },
      { name: "Market Intelligence Analyst", description: "Menganalisis dinamika permintaan dan penawaran (supply-demand) pada industri tertentu." },
      { name: "Transfer Pricing Specialist", description: "Menangani regulasi harga transaksi antar-anak perusahaan multinasional demi kepatuhan pajak." },
      { name: "Credit Risk Analyst", description: "Menilai kapasitas ekonomi makro calon debitur skala besar di sektor perbankan." },
      { name: "Urban & Regional Planner", description: "Perencana wilayah yang fokus pada pengembangan pusat pertumbuhan ekonomi baru." },
      { name: "Sustainability Economist", description: "Spesialis analisis nilai ekonomi dari program karbon, energi terbarukan, dan ekonomi hijau." },
    ],
  },
  // 2. Rumpun Bisnis Modern & Teknologi
  {
    name: "S1 Bisnis Digital",
    code: "BDG",
    industryField: "Bisnis Digital & Teknologi",
    courses: [
      // Semester 1
      { name: "Pendidikan Agama", credits: 2, semester: 1 },
      { name: "Pancasila", credits: 2, semester: 1 },
      { name: "Bahasa Indonesia", credits: 2, semester: 1 },
      { name: "Pengantar Bisnis", credits: 3, semester: 1 },
      { name: "Pengantar Manajemen", credits: 3, semester: 1 },
      { name: "Matematika Bisnis", credits: 3, semester: 1 },
      { name: "Pengantar Teknologi Informasi", credits: 3, semester: 1 },
      // Semester 2
      { name: "Kewarganegaraan", credits: 2, semester: 2 },
      { name: "Bahasa Inggris Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Akuntansi", credits: 3, semester: 2 },
      { name: "Dasar-Dasar Pemrograman (Python)", credits: 3, semester: 2 },
      { name: "Dasar Bisnis Digital", credits: 3, semester: 2 },
      { name: "Statistika Bisnis", credits: 3, semester: 2 },
      // Semester 3
      { name: "Arsitektur E-Commerce", credits: 3, semester: 3 },
      { name: "Pengantar Data Analytics", credits: 3, semester: 3 },
      { name: "UI/UX Design untuk Bisnis", credits: 3, semester: 3 },
      { name: "Digital Marketing Strategis", credits: 3, semester: 3 },
      { name: "Basis Data & SQL", credits: 3, semester: 3 },
      // Semester 4
      { name: "Business Intelligence", credits: 3, semester: 4 },
      { name: "Analisis Perilaku Konsumen Digital", credits: 3, semester: 4 },
      { name: "Manajemen Produk Digital", credits: 3, semester: 4 },
      { name: "Hukum Cyber & Regulasi", credits: 3, semester: 4 },
      { name: "Fintech & Sistem Pembayaran", credits: 3, semester: 4 },
      // Semester 5
      { name: "Big Data Analytics untuk Bisnis", credits: 3, semester: 5 },
      { name: "Growth Hacking", credits: 3, semester: 5 },
      { name: "Omnichannel Strategy", credits: 3, semester: 5 },
      { name: "Tata Kelola IT", credits: 3, semester: 5 },
      { name: "Manajemen Startup Digital", credits: 3, semester: 5 },
      // Semester 6 (MBKM)
      { name: "Magang di Tech Company / Startup Accelerator / Project Mandiri (MBKM)", credits: 20, semester: 6 },
      // Semester 7
      { name: "Aplikasi AI & Machine Learning dalam Bisnis", credits: 3, semester: 7 },
      { name: "Cloud Computing", credits: 3, semester: 7 },
      { name: "Capstone Project (Inovasi Digital)", credits: 3, semester: 7 },
      { name: "Kuliah Kerja Nyata (KKN)", credits: 4, semester: 7 },
      // Semester 8
      { name: "Skripsi / Laporan Komprehensif Inkubasi Produk Digital", credits: 6, semester: 8 },
    ],
    careers: [
      { name: "Business Intelligence (BI) Analyst", description: "Membuat visualisasi data dan dashboard untuk mendukung keputusan manajemen." },
      { name: "Data Scientist (Business Concentration)", description: "Menggunakan algoritma prediktif untuk memetakan perilaku konsumen di masa depan." },
      { name: "E-commerce Specialist", description: "Mengoptimalkan performa penjualan, promosi, dan konversi di platform toko digital." },
      { name: "Digital Marketing Strategist", description: "Merancang strategi pemasaran digital berbasis metrik (Performance Marketing)." },
      { name: "Growth Hacker", description: "Mempercepat akuisisi pengguna produk digital secara kreatif dengan biaya efisien." },
      { name: "SEO/SEM Specialist", description: "Mengelola visibilitas organik dan iklan berbayar di mesin pencari untuk menaikkan trafik." },
      { name: "Product Marketing Manager (PMM)", description: "Menyusun pesan produk dan strategi peluncuran (go-to-market) aplikasi ke pasar." },
      { name: "CRM & Retention Specialist", description: "Menjaga loyalitas konsumen lewat automasi program loyalitas dan komunikasi personal." },
      { name: "UX Researcher", description: "Menganalisis perilaku dan ekspektasi pengguna saat berinteraksi dengan platform digital." },
      { name: "AI Prompt Engineer for Business", description: "Mengoptimalkan implementasi alat kecerdasan buatan generatif untuk produktivitas tim bisnis." },
    ],
  },
  {
    name: "S1 Kewirausahaan",
    code: "KWR",
    industryField: "Kewirausahaan & Inovasi",
    courses: [
      // Semester 1
      { name: "Pendidikan Agama", credits: 2, semester: 1 },
      { name: "Pancasila", credits: 2, semester: 1 },
      { name: "Bahasa Indonesia", credits: 2, semester: 1 },
      { name: "Pengantar Bisnis", credits: 3, semester: 1 },
      { name: "Pengantar Manajemen", credits: 3, semester: 1 },
      { name: "Matematika Keuangan", credits: 3, semester: 1 },
      { name: "Berpikir Kreatif & Desain", credits: 3, semester: 1 },
      // Semester 2
      { name: "Kewarganegaraan", credits: 2, semester: 2 },
      { name: "Bahasa Inggris Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Akuntansi", credits: 3, semester: 2 },
      { name: "Statistika untuk Bisnis", credits: 3, semester: 2 },
      { name: "Hukum Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Kewirausahaan", credits: 3, semester: 2 },
      // Semester 3
      { name: "Identifikasi & Analisis Peluang Bisnis", credits: 3, semester: 3 },
      { name: "Desain Model Bisnis (Lean StartUp)", credits: 3, semester: 3 },
      { name: "Manajemen Keuangan Usaha Baru", credits: 3, semester: 3 },
      { name: "Komunikasi & Negosiasi Bisnis", credits: 3, semester: 3 },
      // Semester 4
      { name: "Riset Pasar & Validasi Produk", credits: 3, semester: 4 },
      { name: "Legalitas & Hak Kekayaan Intelektual (HKI)", credits: 3, semester: 4 },
      { name: "Manajemen Operasional Bisnis Baru", credits: 3, semester: 4 },
      { name: "Manajemen Penjualan", credits: 3, semester: 4 },
      // Semester 5
      { name: "Pendanaan & Valuasi Venture", credits: 3, semester: 5 },
      { name: "Jaringan Bisnis & Waralaba (Franchising)", credits: 3, semester: 5 },
      { name: "Kewirausahaan Sosial", credits: 3, semester: 5 },
      { name: "Manajemen Risiko Startup", credits: 3, semester: 5 },
      // Semester 6 (MBKM)
      { name: "Program Inkubasi Bisnis Riil / Akselerasi Produk di Pasar Berkelanjutan (MBKM)", credits: 20, semester: 6 },
      // Semester 7
      { name: "Strategi Scale-Up Bisnis", credits: 3, semester: 7 },
      { name: "Manajemen Bisnis Keluarga", credits: 3, semester: 7 },
      { name: "Tata Kelola Usaha Berkembang", credits: 3, semester: 7 },
      { name: "Kuliah Kerja Nyata (KKN)", credits: 4, semester: 7 },
      // Semester 8
      { name: "Skripsi / Laporan Evaluasi Kelayakan & Keberlanjutan Usaha Mandiri", credits: 6, semester: 8 },
    ],
    careers: [
      { name: "Startup Founder / Co-Founder", description: "Membangun dan menjalankan bisnis rintisan baru berbasis inovasi produk atau teknologi." },
      { name: "Venture Capital (VC) Analyst", description: "Menyeleksi dan menilai kelayakan investasi pada startup yang mengajukan pendanaan." },
      { name: "Business Incubator Manager", description: "Mengelola program pendampingan, pelatihan, dan fasilitas untuk UMKM atau startup baru." },
      { name: "Corporate Innovation Specialist", description: "Mendorong inovasi produk dan model bisnis baru dari dalam korporasi besar (intrapreneur)." },
      { name: "Franchise Manager", description: "Merancang sistem, SOP, dan memperluas jaringan kemitraan waralaba bisnis." },
      { name: "Social Entrepreneur", description: "Mendirikan usaha mandiri yang fokus menyelesaikan masalah sosial atau lingkungan." },
      { name: "Business Model Consultant", description: "Membantu bisnis tradisional mendesain ulang model pendapatan mereka agar relevan." },
      { name: "Product Developer", description: "Merancang konsep produk baru, dari purwarupa awal hingga siap diproduksi massal." },
      { name: "Angel Investor Liaison", description: "Menjembatani hubungan dan negosiasi antara pelaku usaha dengan jaringan investor perorangan." },
      { name: "Strategic Partnerships Manager", description: "Membangun ekosistem kolaborasi antar-perusahaan untuk memperluas jangkauan pasar." },
    ],
  },
  {
    name: "S1 Manajemen Bisnis Internasional",
    code: "MBI",
    industryField: "Bisnis Internasional & Ekspor-Impor",
    courses: [
      // Semester 1
      { name: "Pendidikan Agama", credits: 2, semester: 1 },
      { name: "Pancasila", credits: 2, semester: 1 },
      { name: "Bahasa Indonesia", credits: 2, semester: 1 },
      { name: "Pengantar Bisnis", credits: 3, semester: 1 },
      { name: "Pengantar Manajemen", credits: 3, semester: 1 },
      { name: "Matematika Ekonomi", credits: 3, semester: 1 },
      { name: "Geografi Ekonomi Dunia", credits: 3, semester: 1 },
      // Semester 2
      { name: "Kewarganegaraan", credits: 2, semester: 2 },
      { name: "Bahasa Inggris Bisnis Lanjutan", credits: 3, semester: 2 },
      { name: "Pengantar Akuntansi", credits: 3, semester: 2 },
      { name: "Statistika Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Ekonomi Mikro & Makro", credits: 3, semester: 2 },
      { name: "Hukum Bisnis", credits: 3, semester: 2 },
      // Semester 3
      { name: "Lingkungan Bisnis Global", credits: 3, semester: 3 },
      { name: "Pemasaran Internasional", credits: 3, semester: 3 },
      { name: "Hukum Bisnis Internasional", credits: 3, semester: 3 },
      { name: "Kebijakan Perdagangan Dunia", credits: 3, semester: 3 },
      { name: "Perbandingan Budaya Bisnis", credits: 3, semester: 3 },
      // Semester 4
      { name: "Keuangan Internasional", credits: 3, semester: 4 },
      { name: "Strategi Korporasi Global", credits: 3, semester: 4 },
      { name: "Manajemen Logistik Global", credits: 3, semester: 4 },
      { name: "Analisis Risiko Negara (Country Risk Assessment)", credits: 3, semester: 4 },
      // Semester 5
      { name: "Manajemen SDM Global", credits: 3, semester: 5 },
      { name: "Ekonomi Ekspor-Impor", credits: 3, semester: 5 },
      { name: "Komunikasi Bisnis Multikultural", credits: 3, semester: 5 },
      { name: "Aliansi Strategis & Investasi Asing Langsung (FDI)", credits: 3, semester: 5 },
      // Semester 6 (MBKM)
      { name: "Program Pertukaran Pelajar Internasional / Magang di MNC (MBKM)", credits: 20, semester: 6 },
      // Semester 7
      { name: "Tata Kelola Korporat Global", credits: 3, semester: 7 },
      { name: "Rantai Pasok Global (Global Supply Chain)", credits: 3, semester: 7 },
      { name: "Isu Kontemporer Ekonomi Global", credits: 3, semester: 7 },
      { name: "Kuliah Kerja Nyata (KKN)", credits: 4, semester: 7 },
      // Semester 8
      { name: "Skripsi / Analisis Kasus Kasus Bisnis Multinasional", credits: 6, semester: 8 },
    ],
    careers: [
      { name: "Global Business Development", description: "Membuka jaringan kemitraan baru dan mencari peluang ekpansi di luar negeri." },
      { name: "International Trade Compliance Officer", description: "Memastikan operasional bisnis luar negeri patuh pada regulasi hukum antarnegara." },
      { name: "Country Manager", description: "Memimpin, mewakili, dan mengelola operasional anak perusahaan asing di wilayah lokal." },
      { name: "Foreign Exchange (Forex) Risk Analyst", description: "Mengelola risiko keuangan perusahaan akibat fluktuasi nilai tukar mata uang asing." },
      { name: "Cross-Border E-commerce Specialist", description: "Mengelola logistik, pemasaran, dan penjualan toko digital yang melayani pasar internasional." },
      { name: "Global Supply Chain Analyst", description: "Mengoordinasikan alur bahan baku internasional agar bebas hambatan geopolitik." },
      { name: "International Relations Officer (Corporate)", description: "Menangani diplomasi bisnis korporasi dengan pemerintah atau mitra asing." },
      { name: "Expatriate Management Specialist", description: "Mengelola proses pemindahan, visa, hukum, dan kompensasi tenaga kerja antarnegara." },
      { name: "Global Brand Strategist", description: "Menyesuaikan kampanye produk global agar sesuai dengan preferensi budaya lokal di negara tujuan." },
      { name: "MNC Strategy Consultant", description: "Konsultan strategis khusus untuk mengatasi hambatan tarif dan non-tarif di pasar internasional." },
    ],
  },
  // 3. Rumpun Ekonomi & Keuangan Syariah
  {
    name: "S1 Ekonomi Syariah",
    code: "EKS",
    industryField: "Ekonomi & Keuangan Syariah",
    courses: [
      // Semester 1
      { name: "Pendidikan Agama & Tahsin", credits: 2, semester: 1 },
      { name: "Pancasila", credits: 2, semester: 1 },
      { name: "Bahasa Indonesia", credits: 2, semester: 1 },
      { name: "Pengantar Ekonomi", credits: 3, semester: 1 },
      { name: "Islam & Ilmu Pengetahuan", credits: 3, semester: 1 },
      { name: "Pengantar Ekonomi Islam", credits: 3, semester: 1 },
      // Semester 2
      { name: "Kewarganegaraan", credits: 2, semester: 2 },
      { name: "Bahasa Inggris Akademik", credits: 3, semester: 2 },
      { name: "Matematika Ekonomi Dasar", credits: 3, semester: 2 },
      { name: "Pengantar Fiqh Muamalah", credits: 3, semester: 2 },
      { name: "Sejarah Pemikiran Ekonomi Islam", credits: 3, semester: 2 },
      // Semester 3
      { name: "Ushul Fiqh", credits: 3, semester: 3 },
      { name: "Fiqh Muamalah 1 (Akad-akad Klasik)", credits: 3, semester: 3 },
      { name: "Ekonomi Mikro Islam", credits: 3, semester: 3 },
      { name: "Akuntansi Syariah Dasar", credits: 3, semester: 3 },
      { name: "Statistika Ekonomi", credits: 3, semester: 3 },
      // Semester 4
      { name: "Fiqh Muamalah 2 (Kontemporer)", credits: 3, semester: 4 },
      { name: "Ekonomi Makro Islam", credits: 3, semester: 4 },
      { name: "Manajemen Zakat & Wakaf", credits: 3, semester: 4 },
      { name: "Lembaga Keuangan Syariah Non-Bank", credits: 3, semester: 4 },
      // Semester 5
      { name: "Ayat & Hadis Ekonomi", credits: 3, semester: 5 },
      { name: "Teori Moneter Islam", credits: 3, semester: 5 },
      { name: "Metode Penelitian Ekonomi Syariah", credits: 3, semester: 5 },
      { name: "Kebijakan Publik Fiskal Islam", credits: 3, semester: 5 },
      { name: "Keuangan Sosial Islam", credits: 3, semester: 5 },
      // Semester 6 (MBKM)
      { name: "Magang Lembaga Filantropi (LAZNAS/BWI) / Magang Riset (MBKM)", credits: 20, semester: 6 },
      // Semester 7
      { name: "Halal Value Chain & Sertifikasi Industri", credits: 3, semester: 7 },
      { name: "Etika Bisnis Islam", credits: 3, semester: 7 },
      { name: "Tata Kelola Ekonomi Syariah", credits: 3, semester: 7 },
      { name: "Kuliah Kerja Nyata (KKN)", credits: 4, semester: 7 },
      // Semester 8
      { name: "Skripsi / Tugas Akhir Ekonomi Syariah", credits: 6, semester: 8 },
    ],
    careers: [
      { name: "Shariah Compliance Officer", description: "Memastikan seluruh operasional dan produk perusahaan investasi sejalan dengan prinsip syariah." },
      { name: "Halal Industry Consultant", description: "Membantu perusahaan kuliner, farmasi, atau kosmetik dalam proses sertifikasi halal resmi." },
      { name: "Islamic Economic Researcher", description: "Meneliti perkembangan makroekonomi Islam di lembaga riset seperti BRIN atau Bank Indonesia." },
      { name: "Shariah Fund Manager", description: "Mengelola portofolio aset, seperti saham syariah dan sukuk, dalam reksadana syariah." },
      { name: "Zakat & Waqf (ZWS) Administrator", description: "Mengelola lembaga amil zakat atau badan wakaf secara modern dan transparan." },
      { name: "Islamic FinTech Product Developer", description: "Merancang fitur-fitur keuangan digital (P2P lending atau crowdfunding) berbasis syariah." },
      { name: "Shariah Microfinance Manager", description: "Memimpin operasional lembaga keuangan mikro seperti Baitul Maal wat Tamwil (BMT)." },
      { name: "Halal Supply Chain Auditor", description: "Memeriksa kepatuhan unsur kehalalan produk dari hulu (peternakan) hingga ke hilir (distribusi)." },
      { name: "Islamic Wealth Planner", description: "Konsultan perencana keuangan pribadi yang berbasis pada alokasi instrumen syariah dan waris Islam." },
      { name: "Policy Drafter (Shariah Economy)", description: "Penyusun konsep regulasi ekonomi syariah di bawah KNEKS atau kementerian terkait." },
    ],
  },
  {
    name: "S1 Perbankan Syariah",
    code: "PBS",
    industryField: "Perbankan Syariah",
    courses: [
      // Semester 1
      { name: "Pendidikan Agama", credits: 2, semester: 1 },
      { name: "Pancasila", credits: 2, semester: 1 },
      { name: "Bahasa Indonesia", credits: 2, semester: 1 },
      { name: "Pengantar Bisnis", credits: 3, semester: 1 },
      { name: "Pengantar Manajemen", credits: 3, semester: 1 },
      { name: "Matematika Bisnis", credits: 3, semester: 1 },
      { name: "Pengantar Perbankan", credits: 3, semester: 1 },
      // Semester 2
      { name: "Kewarganegaraan", credits: 2, semester: 2 },
      { name: "Bahasa Inggris Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Akuntansi", credits: 3, semester: 2 },
      { name: "Pengantar Fiqh Muamalah", credits: 3, semester: 2 },
      { name: "Statistika Bisnis", credits: 3, semester: 2 },
      { name: "Hukum Bisnis & Perbankan", credits: 3, semester: 2 },
      // Semester 3
      { name: "Fiqh Muamalah Perbankan", credits: 3, semester: 3 },
      { name: "Manajemen Perbankan Syariah", credits: 3, semester: 3 },
      { name: "Akuntansi Perbankan Syariah", credits: 3, semester: 3 },
      { name: "Manajemen Dana & Likuiditas Bank Syariah", credits: 3, semester: 3 },
      // Semester 4
      { name: "Analisis Pembiayaan Syariah", credits: 3, semester: 4 },
      { name: "Pemasaran Bank Syariah", credits: 3, semester: 4 },
      { name: "Manajemen Risiko Perbankan Syariah", credits: 3, semester: 4 },
      { name: "Hukum Perikatan & Akad Perbankan", credits: 3, semester: 4 },
      // Semester 5
      { name: "Treasury & Pasar Uang Syariah", credits: 3, semester: 5 },
      { name: "Audit Internal Bank Syariah", credits: 3, semester: 5 },
      { name: "Fintech & Digital Islamic Banking", credits: 3, semester: 5 },
      { name: "Penyelamatan Pembiayaan Bermasalah", credits: 3, semester: 5 },
      // Semester 6 (MBKM)
      { name: "Magang Industri di Bank Umum Syariah / BPRS / BMT (MBKM)", credits: 20, semester: 6 },
      // Semester 7
      { name: "Islamic Corporate Governance", credits: 3, semester: 7 },
      { name: "Asset & Liability Management (ALMA)", credits: 3, semester: 7 },
      { name: "Asuransi Syariah", credits: 3, semester: 7 },
      { name: "Kuliah Kerja Nyata (KKN)", credits: 4, semester: 7 },
      // Semester 8
      { name: "Skripsi / Tugas Akhir Studi Kasus Perbankan Syariah", credits: 6, semester: 8 },
    ],
    careers: [
      { name: "Shariah Financing Analyst", description: "Menganalisis kelayakan risiko pemberian pembiayaan (akad Murabahah, Mudharabah, dll)." },
      { name: "Islamic Funding Officer", description: "Mencari nasabah untuk penempatan dana pihak ketiga pada produk tabungan atau deposito syariah." },
      { name: "Shariah Bank Operations Specialist", description: "Mengelola alur transaksi harian loket dan administrasi perbankan syariah." },
      { name: "Islamic Treasury Analyst", description: "Mengatur likuiditas bank dan mengelola instrumen pasar uang syariah antarbank." },
      { name: "Shariah Risk Management Specialist", description: "Mengidentifikasi dan memitigasi risiko kredit, pasar, maupun operasional bank syariah." },
      { name: "Relationship Manager (Wholesale Shariah Banking)", description: "Menangani kemitraan pembiayaan untuk nasabah skala korporasi besar." },
      { name: "Islamic Wealth Management Advisor", description: "Konsultan investasi khusus untuk nasabah prioritas perbankan syariah." },
      { name: "Shariah Digital Banking Specialist", description: "Mengembangkan fitur, UI/UX, dan layanan perbankan syariah digital pada aplikasi mobile." },
      { name: "Internal Shariah Auditor (Banking)", description: "Mengaudit internal kesesuaian akad yang dijalankan staf bank dengan fatwa DSN-MUI." },
      { name: "Product Development Officer", description: "Merancang skema akad baru untuk produk tabungan, kartu pembiayaan, atau investasi bank." },
    ],
  },
  {
    name: "S1 Akuntansi Syariah",
    code: "AKS",
    industryField: "Akuntansi Syariah",
    courses: [
      // Semester 1
      { name: "Pendidikan Agama", credits: 2, semester: 1 },
      { name: "Pancasila", credits: 2, semester: 1 },
      { name: "Bahasa Indonesia", credits: 2, semester: 1 },
      { name: "Pengantar Bisnis", credits: 3, semester: 1 },
      { name: "Pengantar Manajemen", credits: 3, semester: 1 },
      { name: "Matematika Ekonomi", credits: 3, semester: 1 },
      { name: "Pengantar Akuntansi 1", credits: 3, semester: 1 },
      // Semester 2
      { name: "Kewarganegaraan", credits: 2, semester: 2 },
      { name: "Bahasa Inggris Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Akuntansi 2", credits: 3, semester: 2 },
      { name: "Pengantar Fiqh Muamalah", credits: 3, semester: 2 },
      { name: "Statistika Ekonomi", credits: 3, semester: 2 },
      { name: "Hukum Bisnis", credits: 3, semester: 2 },
      // Semester 3
      { name: "Fiqh Muamalah untuk Akuntan", credits: 3, semester: 3 },
      { name: "Akuntansi Keuangan Syariah 1", credits: 3, semester: 3 },
      { name: "Akuntansi Biaya", credits: 3, semester: 3 },
      { name: "Perpajakan Korporasi", credits: 3, semester: 3 },
      { name: "Sistem Informasi Keuangan", credits: 3, semester: 3 },
      // Semester 4
      { name: "Akuntansi Keuangan Syariah 2", credits: 3, semester: 4 },
      { name: "Akuntansi Lembaga Keuangan Syariah (LKS)", credits: 3, semester: 4 },
      { name: "SIA Syariah", credits: 3, semester: 4 },
      { name: "Audit Syariah 1 (Dasar-dasar Kepatuhan)", credits: 3, semester: 4 },
      // Semester 5
      { name: "Audit Syariah 2 (Praktik Lanjutan)", credits: 3, semester: 5 },
      { name: "Akuntansi Zakat, Infaq, Sedekah & Wakaf", credits: 3, semester: 5 },
      { name: "Standar Akuntansi Syariah (PSAK Syariah)", credits: 3, semester: 5 },
      { name: "Teori Akuntansi Islam", credits: 3, semester: 5 },
      // Semester 6 (MBKM)
      { name: "Magang Audit di Divisi Syariah KAP (MBKM)", credits: 20, semester: 6 },
      // Semester 7
      { name: "Tata Kelola & Etika Profesi Syariah", credits: 3, semester: 7 },
      { name: "Akuntansi Sosial & Lingkungan Islam", credits: 3, semester: 7 },
      { name: "Sistem Pengendalian Internal Lembaga Syariah", credits: 3, semester: 7 },
      { name: "Kuliah Kerja Nyata (KKN)", credits: 4, semester: 7 },
      // Semester 8
      { name: "Skripsi / Tugas Akhir Akuntansi Syariah", credits: 6, semester: 8 },
    ],
    careers: [
      { name: "Shariah Accountant", description: "Menyusun laporan keuangan entitas syariah berdasarkan standar PSAK Syariah yang berlaku." },
      { name: "Islamic Tax Specialist", description: "Menyusun strategi pajak korporasi yang terintegrasi dengan perhitungan zakat pengurang penghasilan kena pajak." },
      { name: "External Shariah Auditor (KAP)", description: "Melakukan audit keuangan eksternal pada bank syariah, asuransi syariah, atau lembaga zakat." },
      { name: "Financial Controller (Halal Industry)", description: "Mengendalikan pengeluaran, anggaran, dan kesehatan keuangan di perusahaan manufaktur halal." },
      { name: "Zakat Accountant", description: "Mengelola pembukuan keuangan amil zakat berskala nasional sesuai regulasi akuntansi nirlaba Islam." },
      { name: "Shariah Compliance Auditor", description: "Auditor internal yang berfokus melacak aliran modal agar terbebas dari unsur riba, gharar, dan maysir." },
      { name: "Islamic Finance Consultant", description: "Konsultan akuntansi yang membantu konversi sistem keuangan perusahaan konvensional ke syariah." },
      { name: "Cost Accountant (Islamic Manufacturing)", description: "Menghitung efisiensi biaya produksi produk pada pabrik bersertifikasi halal." },
      { name: "Accounting Trainer (Shariah Sector)", description: "Melatih dan meningkatkan kapasitas staf keuangan instansi mengenai standar akuntansi Islam." },
      { name: "Shariah Financial Systems Analyst", description: "Mengonfigurasi arsitektur akun (Chart of Accounts) bernuansa syariah pada software ERP perusahaan." },
    ],
  },
  // 4. Rumpun Spesifik & Terapan
  {
    name: "S1 Manajemen Logistik",
    code: "LOG",
    industryField: "Logistik & Supply Chain",
    courses: [
      // Semester 1
      { name: "Pendidikan Agama", credits: 2, semester: 1 },
      { name: "Pancasila", credits: 2, semester: 1 },
      { name: "Bahasa Indonesia", credits: 2, semester: 1 },
      { name: "Pengantar Bisnis", credits: 3, semester: 1 },
      { name: "Pengantar Manajemen", credits: 3, semester: 1 },
      { name: "Matematika Bisnis", credits: 3, semester: 1 },
      { name: "Pengantar Logistik", credits: 3, semester: 1 },
      // Semester 2
      { name: "Kewarganegaraan", credits: 2, semester: 2 },
      { name: "Bahasa Inggris Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Akuntansi", credits: 3, semester: 2 },
      { name: "Statistika Industri", credits: 3, semester: 2 },
      { name: "Ekonomi Manajerial", credits: 3, semester: 2 },
      { name: "Hukum & Regulasi Logistik", credits: 3, semester: 2 },
      // Semester 3
      { name: "Manajemen Pergudangan (Warehouse)", credits: 3, semester: 3 },
      { name: "Perencanaan & Pengendalian Persediaan", credits: 3, semester: 3 },
      { name: "Manajemen Transportasi & Distribusi", credits: 3, semester: 3 },
      { name: "Sistem Informasi Logistik", credits: 3, semester: 3 },
      // Semester 4
      { name: "Manajemen Pembelian & Sourcing", credits: 3, semester: 4 },
      { name: "Desain Tata Letak Fasilitas", credits: 3, semester: 4 },
      { name: "Logistik Ekspor-Impor", credits: 3, semester: 4 },
      { name: "Analisis Biaya Operasional Logistik", credits: 3, semester: 4 },
      // Semester 5
      { name: "Strategi Rantai Pasok (SCM)", credits: 3, semester: 5 },
      { name: "Riset Operasional Logistik", credits: 3, semester: 5 },
      { name: "Manajemen Hubungan Vendor (SRM)", credits: 3, semester: 5 },
      { name: "Manajemen Risiko Rantai Pasok", credits: 3, semester: 5 },
      // Semester 6 (MBKM)
      { name: "Magang Kerja di Perusahaan Logistik / Industri Manufaktur / Pusat E-Commerce (MBKM)", credits: 20, semester: 6 },
      // Semester 7
      { name: "Green Logistics & Sustainable Supply Chain", credits: 3, semester: 7 },
      { name: "Halal Logistics", credits: 3, semester: 7 },
      { name: "Kuliah Kerja Nyata (KKN)", credits: 4, semester: 7 },
      { name: "Seminar Isu Kontemporer Rantai Pasok", credits: 3, semester: 7 },
      // Semester 8
      { name: "Skripsi / Proyek Akhir Optimasi Sistem Logistik", credits: 6, semester: 8 },
    ],
    careers: [
      { name: "Supply Chain Planner", description: "Meramalkan permintaan pasar untuk menyusun jadwal produksi dan pengadaan barang yang efisien." },
      { name: "Logistics Operations Manager", description: "Mengatur pergerakan fisik barang dari pabrik, gudang, hingga sampai ke tangan konsumen." },
      { name: "Procurement Specialist", description: "Menangani proses pembelian bahan baku, negosiasi harga, dan seleksi vendor penyuplai." },
      { name: "Warehouse Manager", description: "Mengoptimalkan tata letak gudang, kapasitas penyimpanan, dan akurasi sistem inventory control." },
      { name: "Fleet Manager", description: "Mengelola armada transportasi perusahaan, rute pengantaran, dan konsumsi bahan bakar untuk efisiensi biaya." },
      { name: "Distribution Network Analyst", description: "Menggunakan perangkat data spasial untuk memetakan rute logistik tercepat dan termurah." },
      { name: "Last-Mile Delivery Specialist", description: "Mengoptimalkan efisiensi kurir tahap akhir di industri e-commerce dan ekspedisi." },
      { name: "Inventory Analyst", description: "Memantau perputaran stok barang di gudang agar tidak terjadi penumpukan modal atau kekurangan barang." },
      { name: "Supply Chain Risk Specialist", description: "Merancang rencana cadangan (mitigasi) apabila terjadi gangguan jalur distribusi global." },
      { name: "Sourcing Manager", description: "Berburu penyuplai strategis berskala global untuk mendapatkan bahan baku berkualitas dengan harga terbaik." },
    ],
  },
  {
    name: "S1 Aktuaria",
    code: "AKR",
    industryField: "Aktuaria & Manajemen Risiko",
    courses: [
      // Semester 1
      { name: "Pendidikan Agama", credits: 2, semester: 1 },
      { name: "Pancasila", credits: 2, semester: 1 },
      { name: "Bahasa Indonesia", credits: 2, semester: 1 },
      { name: "Kalkulus 1", credits: 3, semester: 1 },
      { name: "Pengantar Pengolahan Data", credits: 3, semester: 1 },
      { name: "Aljabar Linear Elementer", credits: 3, semester: 1 },
      // Semester 2
      { name: "Kewarganegaraan", credits: 2, semester: 2 },
      { name: "Bahasa Inggris Teknik", credits: 3, semester: 2 },
      { name: "Kalkulus 2", credits: 3, semester: 2 },
      { name: "Teori Probabilitas Dasar", credits: 3, semester: 2 },
      { name: "Pengantar Teori Ekonomi (Mikro & Makro)", credits: 3, semester: 2 },
      // Semester 3
      { name: "Matematika Keuangan", credits: 3, semester: 3 },
      { name: "Statistika Matematika 1", credits: 3, semester: 3 },
      { name: "Teori Risiko Finansial", credits: 3, semester: 3 },
      { name: "Algoritma Pemrograman untuk Aktuaria (R/Python)", credits: 3, semester: 3 },
      // Semester 4
      { name: "Matematika Aktuaria 1", credits: 3, semester: 4 },
      { name: "Statistika Matematika 2", credits: 3, semester: 4 },
      { name: "Model Linear Terapan", credits: 3, semester: 4 },
      { name: "Ekonomi Keuangan Dasar", credits: 3, semester: 4 },
      // Semester 5
      { name: "Matematika Aktuaria 2", credits: 3, semester: 5 },
      { name: "Kontinjensi Jiwa", credits: 3, semester: 5 },
      { name: "Analisis Deret Waktu (Time Series)", credits: 3, semester: 5 },
      { name: "Teori Kredibilitas", credits: 3, semester: 5 },
      { name: "Demografi Aktuaria", credits: 3, semester: 5 },
      // Semester 6 (MBKM)
      { name: "Magang di Korporasi Asuransi Jiwa / Asuransi Umum / BPJS / Konsultan Aktuaria (MBKM)", credits: 20, semester: 6 },
      // Semester 7
      { name: "Model Stokastik", credits: 3, semester: 7 },
      { name: "Akuntansi Asuransi & Solvabilitas (PSAK 74 / IFRS 17)", credits: 3, semester: 7 },
      { name: "Pemodelan Risiko Bencana & Perubahan Iklim", credits: 3, semester: 7 },
      { name: "Kuliah Kerja Nyata (KKN)", credits: 4, semester: 7 },
      // Semester 8
      { name: "Skripsi / Karya Alternatif Ujian Profesi Aktuaris (Sertifikasi PAI)", credits: 6, semester: 8 },
    ],
    careers: [
      { name: "Actuarial Analyst (Life Insurance)", description: "Menghitung probabilitas mortalitas dan menentukan tarif premi asuransi jiwa." },
      { name: "General Insurance Actuary", description: "Menghitung premi risiko untuk asuransi kerugian seperti properti, kendaraan, dan bencana alam." },
      { name: "Health Actuarial Consultant", description: "Mendesain skema premi dan kecukupan cadangan klaim untuk asuransi kesehatan swasta maupun jaminan sosial." },
      { name: "Pension Fund Actuary", description: "Memastikan kecukupan akumulasi dana pensiun perusahaan untuk membayar karyawannya di masa depan." },
      { name: "Risk Modeler", description: "Membuat simulasi algoritma matematika untuk memprediksi potensi kerugian finansial akibat krisis pasar." },
      { name: "Investment Actuary", description: "Menyelaraskan struktur aset investasi dengan kewajiban klaim masa depan (Asset-Liability Management)." },
      { name: "Reinsurance Specialist", description: "Menghitung porsi risiko klaim besar yang perlu dialihkan atau diasuransikan kembali ke perusahaan reasuransi." },
      { name: "Data Analyst (InsurTech)", description: "Mengolah big data perilaku pengguna gawai/sensor untuk menentukan premi asuransi digital yang dinamis." },
      { name: "Financial Solvency Analyst", description: "Memastikan tingkat kesehatan keuangan perusahaan asuransi telah memenuhi rasio modal minimum OJK." },
      { name: "Catastrophe Risk Analyst", description: "Pemodel matematika khusus yang menghitung dampak finansial perusahaan akibat risiko perubahan iklim ekstrim." },
    ],
  },
  {
    name: "S1 Perdagangan Internasional",
    code: "PIN",
    industryField: "Perdagangan Internasional",
    courses: [
      // Semester 1
      { name: "Pendidikan Agama", credits: 2, semester: 1 },
      { name: "Pancasila", credits: 2, semester: 1 },
      { name: "Bahasa Indonesia", credits: 2, semester: 1 },
      { name: "Pengantar Bisnis", credits: 3, semester: 1 },
      { name: "Pengantar Manajemen", credits: 3, semester: 1 },
      { name: "Matematika Ekonomi", credits: 3, semester: 1 },
      { name: "Pengantar Hukum Dagang", credits: 3, semester: 1 },
      // Semester 2
      { name: "Kewarganegaraan", credits: 2, semester: 2 },
      { name: "Bahasa Inggris Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Akuntansi", credits: 3, semester: 2 },
      { name: "Pengantar Ekonomi Internasional", credits: 3, semester: 2 },
      { name: "Regulasi Kepabeanan Dasar", credits: 3, semester: 2 },
      { name: "Statistika", credits: 3, semester: 2 },
      // Semester 3
      { name: "Dokumen & Prosedur Ekspor-Impor", credits: 3, semester: 3 },
      { name: "Manajemen Kepabeanan & Cukai", credits: 3, semester: 3 },
      { name: "Pembiayaan Dagang Internasional (L/C & Non-L/C)", credits: 3, semester: 3 },
      { name: "Hukum Perdagangan Internasional", credits: 3, semester: 3 },
      // Semester 4
      { name: "Pemasaran Ekspor Global", credits: 3, semester: 4 },
      { name: "Manajemen Pengapalan & Kargo (Freight Forwarding)", credits: 3, semester: 4 },
      { name: "Negosiasi Perdagangan Bilateral & Multilateral", credits: 3, semester: 4 },
      { name: "Manajemen Risiko Dagang", credits: 3, semester: 4 },
      // Semester 5
      { name: "Karantina & Standar Mutu Komoditas Global", credits: 3, semester: 5 },
      { name: "Cross-Border E-Commerce", credits: 3, semester: 5 },
      { name: "Kebijakan Tarif & Non-Tarif", credits: 3, semester: 5 },
      { name: "Strategi Penetrasi Pasar Global", credits: 3, semester: 5 },
      // Semester 6 (MBKM)
      { name: "Magang di DJBC / Perusahaan Dagang / Otoritas Pelabuhan (MBKM)", credits: 20, semester: 6 },
      // Semester 7
      { name: "Manajemen Operasional Pelabuhan & Terminal", credits: 3, semester: 7 },
      { name: "Diplomasi Ekonomi", credits: 3, semester: 7 },
      { name: "Kuliah Kerja Nyata (KKN)", credits: 4, semester: 7 },
      { name: "Isu Proteksionisme Dagang Kontemporer", credits: 3, semester: 7 },
      // Semester 8
      { name: "Skripsi / Proyek Aplikasi Rencana Bisnis Ekspor-Impor Komprehensif", credits: 6, semester: 8 },
    ],
    careers: [
      { name: "Export-Import (Exim) Specialist", description: "Mengelola seluruh kelengkapan dokumen kepabeanan (Bill of Lading, Invoice) dan izin ekspor-impor." },
      { name: "Customs Broker (PPJK)", description: "Ahli resmi yang mewakili perusahaan dalam pengurusan dan penyelesaian kewajiban pabean di Bea Cukai." },
      { name: "International Sourcing Specialist", description: "Bertanggung jawab mencari komoditas atau material berkualitas langsung dari produsen luar negeri." },
      { name: "Trade Finance Analyst", description: "Mengelola instrumen pembayaran internasional seperti Letter of Credit (L/C) dan jaminan bank." },
      { name: "Freight Forwarder Operations", description: "Mengatur pengapalan, pemesanan kontainer, dan konsolidasi kargo logistik internasional." },
      { name: "Trade Policy Advisor", description: "Konsultan bagi asosiasi industri yang memetakan tarif bea masuk atau hambatan dagang proteksionisme." },
      { name: "Global Procurement Officer", description: "Menangani pengadaan barang modal berskala besar lintas negara untuk kebutuhan korporasi." },
      { name: "Port Operations Officer", description: "Mengelola kelancaran arus bongkar muat komoditas ekspor-impor di area pelabuhan laut/udara." },
      { name: "International Market Entry Strategist", description: "Melakukan riset regulasi non-tarif suatu negara tujuan sebelum perusahaan melakukan ekspansi." },
      { name: "Commodity Trader", description: "Pelaku transaksi jual-beli kontrak komoditas global seperti minyak kelapa sawit (CPO), nikel, atau batubara." },
    ],
  },
  {
    name: "S1 Manajemen Keuangan",
    code: "MKU",
    industryField: "Keuangan & Investasi",
    courses: [
      // Semester 1
      { name: "Pendidikan Agama", credits: 2, semester: 1 },
      { name: "Pancasila", credits: 2, semester: 1 },
      { name: "Bahasa Indonesia", credits: 2, semester: 1 },
      { name: "Pengantar Bisnis", credits: 3, semester: 1 },
      { name: "Pengantar Manajemen", credits: 3, semester: 1 },
      { name: "Matematika Keuangan", credits: 3, semester: 1 },
      { name: "Pengantar Ekonomi Mikro", credits: 3, semester: 1 },
      // Semester 2
      { name: "Kewarganegaraan", credits: 2, semester: 2 },
      { name: "Bahasa Inggris Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Akuntansi", credits: 3, semester: 2 },
      { name: "Statistika Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Ekonomi Makro", credits: 3, semester: 2 },
      { name: "Dasar Pemasaran & Finansial", credits: 3, semester: 2 },
      // Semester 3
      { name: "Keuangan Korporasi Dasar", credits: 3, semester: 3 },
      { name: "Manajemen Pemasaran Strategis", credits: 3, semester: 3 },
      { name: "Pasar Uang & Pasar Modal", credits: 3, semester: 3 },
      { name: "Perilaku Konsumen Kontemporer", credits: 3, semester: 3 },
      // Semester 4
      { name: "Analisis Investasi & Portofolio", credits: 3, semester: 4 },
      { name: "Manajemen Produk & Strategi Merek", credits: 3, semester: 4 },
      { name: "Fintech & Inovasi Pemasaran", credits: 3, semester: 4 },
      { name: "Komunikasi Pemasaran Terpadu", credits: 3, semester: 4 },
      // Semester 5
      { name: "Manajemen Keuangan Internasional", credits: 3, semester: 5 },
      { name: "Digital Marketing & MarTech", credits: 3, semester: 5 },
      { name: "Manajemen Risiko Finansial", credits: 3, semester: 5 },
      { name: "Riset Pasar & Metode Kuantitatif Keuangan", credits: 3, semester: 5 },
      // Semester 6 (MBKM)
      { name: "Magang Kerja di Perusahaan Sekuritas / Perbankan / Digital Agency / VC (MBKM)", credits: 20, semester: 6 },
      // Semester 7
      { name: "Keuangan Perilaku (Behavioral Finance)", credits: 3, semester: 7 },
      { name: "Pemodelan Keuangan Korporat", credits: 3, semester: 7 },
      { name: "Strategic Brand Management", credits: 3, semester: 7 },
      { name: "Kuliah Kerja Nyata (KKN)", credits: 4, semester: 7 },
      // Semester 8
      { name: "Skripsi / Laporan Kampanye Pemasaran & Evaluasi Valuasi Korporasi", credits: 6, semester: 8 },
    ],
    careers: [
      { name: "Financial Planner", description: "Membantu klien perorangan atau korporasi kecil merencanakan portofolio investasi dan masa depan keuangan." },
      { name: "Corporate Finance Analyst", description: "Mengelola struktur modal, pendanaan utang-saham, serta keputusan merger dan akuisisi (M&A)." },
      { name: "Investment Banking Analyst", description: "Membantu emiten/perusahaan mempersiapkan penerbitan saham baru di bursa (IPO) atau obligasi." },
      { name: "Portfolio Manager", description: "Mengelola kumpulan aset reksadana atau dana institusi agar menghasilkan imbal hasil (return) optimal." },
      { name: "Asset Management Specialist", description: "Spesialis penempatan dana pada instrumen pasar modal dan pasar uang untuk nasabah korporat." },
    ],
  },
  {
    name: "S1 Manajemen Pemasaran",
    code: "MPS",
    industryField: "Pemasaran & Branding",
    courses: [
      // Semester 1
      { name: "Pendidikan Agama", credits: 2, semester: 1 },
      { name: "Pancasila", credits: 2, semester: 1 },
      { name: "Bahasa Indonesia", credits: 2, semester: 1 },
      { name: "Pengantar Bisnis", credits: 3, semester: 1 },
      { name: "Pengantar Manajemen", credits: 3, semester: 1 },
      { name: "Matematika Keuangan", credits: 3, semester: 1 },
      { name: "Pengantar Ekonomi Mikro", credits: 3, semester: 1 },
      // Semester 2
      { name: "Kewarganegaraan", credits: 2, semester: 2 },
      { name: "Bahasa Inggris Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Akuntansi", credits: 3, semester: 2 },
      { name: "Statistika Bisnis", credits: 3, semester: 2 },
      { name: "Pengantar Ekonomi Makro", credits: 3, semester: 2 },
      { name: "Dasar Pemasaran & Finansial", credits: 3, semester: 2 },
      // Semester 3
      { name: "Keuangan Korporasi Dasar", credits: 3, semester: 3 },
      { name: "Manajemen Pemasaran Strategis", credits: 3, semester: 3 },
      { name: "Pasar Uang & Pasar Modal", credits: 3, semester: 3 },
      { name: "Perilaku Konsumen Kontemporer", credits: 3, semester: 3 },
      // Semester 4
      { name: "Analisis Investasi & Portofolio", credits: 3, semester: 4 },
      { name: "Manajemen Produk & Strategi Merek", credits: 3, semester: 4 },
      { name: "Fintech & Inovasi Pemasaran", credits: 3, semester: 4 },
      { name: "Komunikasi Pemasaran Terpadu", credits: 3, semester: 4 },
      // Semester 5
      { name: "Manajemen Keuangan Internasional", credits: 3, semester: 5 },
      { name: "Digital Marketing & MarTech", credits: 3, semester: 5 },
      { name: "Manajemen Risiko Finansial", credits: 3, semester: 5 },
      { name: "Riset Pasar & Metode Kuantitatif Keuangan", credits: 3, semester: 5 },
      // Semester 6 (MBKM)
      { name: "Magang Kerja di Perusahaan Sekuritas / Perbankan / Digital Agency / VC (MBKM)", credits: 20, semester: 6 },
      // Semester 7
      { name: "Keuangan Perilaku (Behavioral Finance)", credits: 3, semester: 7 },
      { name: "Pemodelan Keuangan Korporat", credits: 3, semester: 7 },
      { name: "Strategic Brand Management", credits: 3, semester: 7 },
      { name: "Kuliah Kerja Nyata (KKN)", credits: 4, semester: 7 },
      // Semester 8
      { name: "Skripsi / Laporan Kampanye Pemasaran & Evaluasi Valuasi Korporasi", credits: 6, semester: 8 },
    ],
    careers: [
      { name: "Market Researcher", description: "Mengumpulkan data primer-sekunder mengenai tren perilaku konsumen sebelum produk baru dirilis." },
      { name: "Performance Marketing Specialist", description: "Mengoptimalkan anggaran iklan digital berbayar (Meta, Google, TikTok Ads) berbasis ROI yang ketat." },
      { name: "Content Marketing Strategist", description: "Merancang ekosistem narasi dan konten kreatif untuk membangun kedekatan audiens dengan brand." },
      { name: "Brand Manager", description: "Mengawal kesehatan finansial produk, posisi di pasar, dan konsistensi pesan pemasaran sebuah produk." },
      { name: "Product Marketing Executive", description: "Bertanggung jawab menerjemahkan fitur teknis produk baru menjadi bahasa promosi yang menjual bagi konsumen." },
    ],
  },
];

async function main() {
  console.log(`\nDeleting existing non-demo universities and associated data...`);
  
  // Get demo university ID to protect it
  const demoUniv = await prisma.university.findFirst({
    where: { code: "UID" },
  });

  const demoUnivId = demoUniv?.id;

  // Delete all study programs and universities except UID (demo)
  if (demoUnivId) {
    // Delete career weights associated with real universities
    await prisma.careerWeight.deleteMany({
      where: {
        careerTarget: {
          studyProgram: {
            universityId: { not: demoUnivId },
          },
        },
      },
    });

    // Delete courses
    await prisma.course.deleteMany({
      where: {
        studyProgram: {
          universityId: { not: demoUnivId },
        },
      },
    });

    // Delete career targets
    await prisma.careerTarget.deleteMany({
      where: {
        studyProgram: {
          universityId: { not: demoUnivId },
        },
      },
    });

    // Delete study programs
    await prisma.studyProgram.deleteMany({
      where: {
        universityId: { not: demoUnivId },
      },
    });

    // Delete universities
    await prisma.university.deleteMany({
      where: {
        id: { not: demoUnivId },
      },
    });
  } else {
    // If no demo university (fresh DB), clean everything safely
    await prisma.careerWeight.deleteMany();
    await prisma.course.deleteMany();
    await prisma.careerTarget.deleteMany();
    await prisma.studyProgram.deleteMany();
    await prisma.university.deleteMany();
  }

  console.log(`Seeding ${universitiesData.length} universities...`);

  // Build the arrays of data to insert
  const universitiesToInsert: any[] = [];
  const studyProgramsToInsert: any[] = [];
  const coursesToInsert: any[] = [];
  const careerTargetsToInsert: any[] = [];
  const careerWeightsToInsert: any[] = [];

  for (const u of universitiesData) {
    const universityId = randomUUID();
    
    universitiesToInsert.push({
      id: universityId,
      name: u.name,
      code: u.code,
      accreditation: u.accreditation,
      city: u.city,
      province: u.province,
      isActive: true,
    });

    for (const prog of studyProgramsTemplate) {
      const studyProgramId = randomUUID();
      const programCode = `${u.code}-${prog.code}`.slice(0, 20);

      studyProgramsToInsert.push({
        id: studyProgramId,
        universityId: universityId,
        name: prog.name,
        code: programCode,
        degree: "S1",
        accreditation: u.accreditation,
        isActive: true,
      });

      // Map courses created for this study program
      const createdCourses: any[] = [];
      let courseIndex = 1;
      for (const course of prog.courses) {
        const courseId = randomUUID();
        const courseCode = `${prog.code}${course.semester}${String(courseIndex).padStart(2, "0")}-${u.code}`.slice(0, 20);
        const courseData = {
          id: courseId,
          studyProgramId: studyProgramId,
          name: course.name,
          code: courseCode,
          credits: course.credits,
          semester: course.semester,
          isActive: true,
        };
        coursesToInsert.push(courseData);
        createdCourses.push(courseData);
        courseIndex++;
      }

      // Map career targets and calculate equal weights
      for (const career of prog.careers) {
        const careerTargetId = randomUUID();
        
        careerTargetsToInsert.push({
          id: careerTargetId,
          studyProgramId: studyProgramId,
          name: career.name,
          description: career.description,
          industryField: prog.industryField,
          linkedinKeyword: career.name.toLowerCase().replace(/\s+/g, "-"),
          jobstreetKeyword: career.name.toLowerCase(),
          glintsKeyword: career.name.toLowerCase(),
          isActive: true,
        });

        // Distribute weights equally: 1.0 / createdCourses.length
        const weightValue = Number((1.0 / createdCourses.length).toFixed(4));
        for (let i = 0; i < createdCourses.length; i++) {
          careerWeightsToInsert.push({
            id: randomUUID(),
            careerTargetId: careerTargetId,
            courseId: createdCourses[i].id,
            weight: weightValue,
          });
        }
      }
    }
  }

  // Execute bulk inserts safely in batches
  console.log(`Inserting ${universitiesToInsert.length} universities...`);
  await prisma.university.createMany({ data: universitiesToInsert });

  console.log(`Inserting ${studyProgramsToInsert.length} study programs...`);
  await prisma.studyProgram.createMany({ data: studyProgramsToInsert });

  console.log(`Inserting ${coursesToInsert.length} courses...`);
  await safeCreateMany(prisma.course, coursesToInsert);

  console.log(`Inserting ${careerTargetsToInsert.length} career targets...`);
  await safeCreateMany(prisma.careerTarget, careerTargetsToInsert);

  console.log(`Inserting ${careerWeightsToInsert.length} career weights...`);
  await safeCreateMany(prisma.careerWeight, careerWeightsToInsert);

  console.log(`\nSeeding completed successfully!`);
  console.log(`- Universities: ${universitiesToInsert.length}`);
  console.log(`- Study Programs: ${studyProgramsToInsert.length}`);
  console.log(`- Courses: ${coursesToInsert.length}`);
  console.log(`- Career Targets: ${careerTargetsToInsert.length}`);
  console.log(`- Career Weights: ${careerWeightsToInsert.length}`);
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
