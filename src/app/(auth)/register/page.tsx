"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Compass,
  User,
  Mail,
  Lock,
  GraduationCap,
  BookOpen,
  Calendar,
  Briefcase,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Search,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { registerSchema, type RegisterInput } from "@/validators";
import {
  registerAction,
  getUniversityOptions,
  getStudyProgramOptions,
  getCareerTargetOptions,
} from "@/features/auth/actions";
import type { SelectOption } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Dropdown options states
  const [universities, setUniversities] = useState<SelectOption[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<SelectOption[]>([]);
  const [careerTargets, setCareerTargets] = useState<SelectOption[]>([]);

  // Loading states for dynamic dropdowns
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [loadingProdi, setLoadingProdi] = useState(false);
  const [loadingCareer, setLoadingCareer] = useState(false);

  // University combobox state
  const [univOpen, setUnivOpen] = useState(false);
  const [univSearch, setUnivSearch] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      universityId: "",
      studyProgramId: "",
      semester: 1,
      careerTargetId: "",
    },
  });

  const selectedUniversity = watch("universityId");
  const selectedProdi = watch("studyProgramId");

  const selectedUniversityLabel = universities.find(
    (u) => u.value === selectedUniversity
  )?.label;

  const filteredUniversities = universities.filter((u) =>
    u.label.toLowerCase().includes(univSearch.toLowerCase())
  );

  // Fetch universities on mount
  useEffect(() => {
    async function loadUniversities() {
      setLoadingUniversities(true);
      const options = await getUniversityOptions();
      setUniversities(options);
      setLoadingUniversities(false);
    }
    loadUniversities();
  }, []);

  // Fetch study programs when university changes
  useEffect(() => {
    async function loadProdi() {
      if (!selectedUniversity) {
        setStudyPrograms([]);
        setValue("studyProgramId", "");
        return;
      }
      setLoadingProdi(true);
      const options = await getStudyProgramOptions(selectedUniversity);
      setStudyPrograms(options);
      setValue("studyProgramId", "");
      setLoadingProdi(false);
    }
    loadProdi();
  }, [selectedUniversity, setValue]);

  // Fetch career targets when study program changes
  useEffect(() => {
    async function loadCareers() {
      if (!selectedProdi) {
        setCareerTargets([]);
        setValue("careerTargetId", "");
        return;
      }
      setLoadingCareer(true);
      const options = await getCareerTargetOptions(selectedProdi);
      setCareerTargets(options);
      setValue("careerTargetId", "");
      setLoadingCareer(false);
    }
    loadCareers();
  }, [selectedProdi, setValue]);

  const handleNextStep = async () => {
    let fieldsToValidate: Array<keyof RegisterInput> = [];

    if (step === 1) {
      fieldsToValidate = ["fullName", "email", "password", "confirmPassword"];
    } else if (step === 2) {
      fieldsToValidate = ["universityId", "studyProgramId", "semester"];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const response = await registerAction(data);

      if (response.success) {
        toast({
          title: "Registrasi Berhasil",
          description: response.message || "Silakan cek email Anda untuk aktivasi akun.",
        });

        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        toast({
          variant: "destructive",
          title: "Registrasi Gagal",
          description: response.error || "Terjadi kesalahan saat pendaftaran",
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Registration submission error:", error);
      toast({
        variant: "destructive",
        title: "Koneksi Bermasalah",
        description: "Gagal terhubung ke server. Silakan coba kembali.",
      });
      setIsLoading(false);
    }
  };

  // Step names
  const steps = [
    { title: "Akun", desc: "Informasi login dasar" },
    { title: "Akademik", desc: "Detail universitas" },
    { title: "Target Karir", desc: "Jalur karir AI" },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Mobile view Logo */}
      <div className="flex md:hidden flex-col items-center justify-center space-y-2 text-center mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 shadow-md">
          <Compass className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Industry Mirror</h1>
      </div>

      <div className="flex flex-col space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-extrabold tracking-tight">Daftar Akun Baru</h2>
        <p className="text-sm text-muted-foreground">
          Lengkapi data untuk mendapatkan dashboard karir berbasis AI Anda
        </p>
      </div>

      {/* Progress Tracker dots */}
      <div className="flex items-center justify-between gap-2 border-b border-border pb-4">
        {steps.map((s, i) => {
          const idx = i + 1;
          const isCurrent = step === idx;
          const isDone = step > idx;

          return (
            <div key={idx} className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
                    isCurrent
                      ? "bg-teal-600 text-white"
                      : isDone
                        ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {idx}
                </span>
                <span
                  className={`hidden sm:inline text-xs font-semibold ${
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    placeholder="Budi Santoso"
                    disabled={isLoading}
                    {...register("fullName")}
                    className="pl-10"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs font-medium text-destructive mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="budi@mahasiswa.ac.id"
                    disabled={isLoading}
                    {...register("email")}
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-medium text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...register("password")}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs font-medium text-destructive mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...register("confirmPassword")}
                      className="pl-10 pr-10"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs font-medium text-destructive mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* University — Searchable Combobox */}
              <div className="space-y-2">
                <Label htmlFor="universityId">Universitas</Label>
                <Popover open={univOpen} onOpenChange={setUnivOpen}>
                  <PopoverTrigger asChild>
                    <button
                      id="universityId"
                      type="button"
                      role="combobox"
                      aria-expanded={univOpen}
                      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        !selectedUniversityLabel ? "text-muted-foreground" : "text-foreground"
                      }`}
                      disabled={loadingUniversities}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {loadingUniversities
                          ? "Memuat universitas..."
                          : selectedUniversityLabel || "Cari dan pilih universitas Anda..."}
                      </span>
                      {loadingUniversities ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    {/* Search input */}
                    <div className="flex items-center gap-2 border-b px-3 py-2">
                      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <input
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Ketik nama universitas..."
                        value={univSearch}
                        onChange={(e) => setUnivSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    {/* Results list */}
                    <div className="max-h-64 overflow-y-auto">
                      {filteredUniversities.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                          Universitas tidak ditemukan.
                        </p>
                      ) : (
                        filteredUniversities.map((u) => (
                          <button
                            key={u.value}
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-left"
                            onClick={() => {
                              setValue("universityId", u.value);
                              setUnivSearch("");
                              setUnivOpen(false);
                            }}
                          >
                            <Check
                              className={`h-4 w-4 shrink-0 ${
                                selectedUniversity === u.value
                                  ? "text-teal-600 opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {u.label}
                          </button>
                        ))
                      )}
                    </div>
                    <p className="border-t px-3 py-1.5 text-xs text-muted-foreground">
                      {filteredUniversities.length} universitas tersedia
                    </p>
                  </PopoverContent>
                </Popover>
                {errors.universityId && (
                  <p className="text-xs font-medium text-destructive mt-1">
                    {errors.universityId.message}
                  </p>
                )}
              </div>

              {/* Study Program */}
              <div className="space-y-2">
                <Label htmlFor="studyProgramId">Program Studi (Prodi)</Label>
                <div className="relative flex items-center">
                  <BookOpen className="absolute left-3 h-4 w-4 text-muted-foreground z-10" />
                  <Select
                    onValueChange={(val) => setValue("studyProgramId", val)}
                    defaultValue={watch("studyProgramId")}
                    disabled={!selectedUniversity || loadingProdi}
                  >
                    <SelectTrigger className="pl-10 bg-background text-left">
                      {loadingProdi ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          <span>Memuat Prodi...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder={selectedUniversity ? "Pilih Program Studi" : "Pilih Universitas terlebih dahulu"} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {studyPrograms.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.studyProgramId && (
                  <p className="text-xs font-medium text-destructive mt-1">
                    {errors.studyProgramId.message}
                  </p>
                )}
              </div>

              {/* Semester */}
              <div className="space-y-2">
                <Label htmlFor="semester">Semester Saat Ini</Label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground z-10" />
                  <Select
                    onValueChange={(val) => setValue("semester", Number(val))}
                    defaultValue={watch("semester").toString()}
                  >
                    <SelectTrigger className="pl-10 bg-background text-left">
                      <SelectValue placeholder="Pilih Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <SelectItem key={s} value={s.toString()}>
                          Semester {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.semester && (
                  <p className="text-xs font-medium text-destructive mt-1">
                    {errors.semester.message}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="careerTargetId">Target Karir Pertama Anda</Label>
                <div className="relative flex items-center">
                  <Briefcase className="absolute left-3 h-4 w-4 text-muted-foreground z-10" />
                  <Select
                    onValueChange={(val) => setValue("careerTargetId", val)}
                    defaultValue={watch("careerTargetId")}
                    disabled={!selectedProdi || loadingCareer}
                  >
                    <SelectTrigger className="pl-10 bg-background text-left">
                      {loadingCareer ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                          <span>Memuat Pilihan Karir...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder={selectedProdi ? "Pilih Target Karir" : "Pilih Program Studi terlebih dahulu"} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {careerTargets.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Pilihan karir ini akan digunakan oleh kecerdasan buatan (AI) kami untuk menganalisis
                  kecocokan mata kuliah dan kompetensi Anda. Anda dapat merubah target karir ini kapan
                  saja di dashboard.
                </p>
                {errors.careerTargetId && (
                  <p className="text-xs font-medium text-destructive mt-1">
                    {errors.careerTargetId.message}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons navigation */}
        <div className="flex items-center gap-4 pt-4">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              className="flex-1 gap-2"
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Sebelumnya</span>
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              className="flex-1 gap-2"
              disabled={isLoading}
            >
              <span>Berikutnya</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="flex-1 gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <>
                  <span>Selesaikan Pendaftaran</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Sudah memiliki akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-teal-600 hover:text-teal-500 transition-colors duration-200"
        >
          Masuk Disini
        </Link>
      </div>
    </div>
  );
}
