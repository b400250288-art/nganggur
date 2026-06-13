"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  BookOpen,
  Search,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { gradeSchema, type GradeInput } from "@/validators";
import {
  getStudentGrades,
  getAvailableCourses,
  addGradeAction,
  updateGradeAction,
  deleteGradeAction,
} from "@/features/student/actions";

function getLetterGradeColor(letter: string) {
  switch (letter) {
    case "A":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
    case "AB":
      return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300";
    case "B":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "BC":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    case "C":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    case "D":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200";
  }
}

export default function StudentGradesPage() {
  const { toast } = useToast();
  const [grades, setGrades] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editGrade, setEditGrade] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GradeInput>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      courseId: "",
      numericGrade: 0,
      semester: 1,
      academicYear: "2024/2025",
      notes: "",
    },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gradesData, coursesData] = await Promise.all([
        getStudentGrades(),
        getAvailableCourses(),
      ]);
      setGrades(gradesData);
      setCourses(coursesData);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat data nilai",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddDialog = () => {
    reset({
      courseId: "",
      numericGrade: 0,
      semester: 1,
      academicYear: "2024/2025",
      notes: "",
    });
    setEditGrade(null);
    setIsAddOpen(true);
  };

  const openEditDialog = (grade: any) => {
    setEditGrade(grade);
    reset({
      courseId: grade.courseId,
      numericGrade: Number(grade.numericGrade),
      semester: grade.semester,
      academicYear: grade.academicYear,
      notes: grade.notes || "",
    });
    setIsAddOpen(true);
  };

  const onSubmit = async (data: GradeInput) => {
    setSaving(true);
    try {
      const result = editGrade
        ? await updateGradeAction(editGrade.id, data)
        : await addGradeAction(data);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: result.message,
        });
        setIsAddOpen(false);
        await fetchData();
      } else {
        toast({
          variant: "destructive",
          title: "Gagal",
          description: result.error,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menyimpan nilai",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const result = await deleteGradeAction(deleteId);
      if (result.success) {
        toast({ title: "Berhasil", description: result.message });
        await fetchData();
      } else {
        toast({ variant: "destructive", title: "Gagal", description: result.error });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Gagal menghapus nilai" });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // Courses already graded
  const gradedCourseIds = new Set(grades.map((g: any) => g.courseId));
  const availableForNew = courses.filter((c: any) => !gradedCourseIds.has(c.id));

  const filteredGrades = grades.filter((g: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.course.name.toLowerCase().includes(q) ||
      g.course.code.toLowerCase().includes(q) ||
      String(g.semester).includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Input & Kelola Nilai
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola nilai mata kuliah Anda untuk analisis kesiapan karir
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2 shrink-0" disabled={availableForNew.length === 0}>
          <Plus className="h-4 w-4" />
          Tambah Nilai
        </Button>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="card-glow">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs font-semibold text-muted-foreground">Total MK</p>
            <p className="text-2xl font-extrabold">{grades.length}</p>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs font-semibold text-muted-foreground">Rata-rata</p>
            <p className="text-2xl font-extrabold">
              {grades.length > 0
                ? (grades.reduce((s: number, g: any) => s + Number(g.numericGrade), 0) / grades.length).toFixed(1)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs font-semibold text-muted-foreground">Tertinggi</p>
            <p className="text-2xl font-extrabold text-emerald-600">
              {grades.length > 0
                ? Math.max(...grades.map((g: any) => Number(g.numericGrade))).toFixed(0)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs font-semibold text-muted-foreground">Terendah</p>
            <p className="text-2xl font-extrabold text-red-500">
              {grades.length > 0
                ? Math.min(...grades.map((g: any) => Number(g.numericGrade))).toFixed(0)
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari mata kuliah..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-8"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Grades Table - Hidden on Mobile */}
      <Card className="hidden md:block card-glow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Mata Kuliah</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Kode</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Nilai</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Huruf</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Semester</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Tahun</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredGrades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">
                        {searchQuery ? "Tidak ditemukan" : "Belum ada nilai yang diinput"}
                      </p>
                      <p className="text-xs mt-1">
                        {!searchQuery && "Klik 'Tambah Nilai' untuk mulai input nilai mata kuliah"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredGrades.map((grade: any, i: number) => (
                    <motion.tr
                      key={grade.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{grade.course.name}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground text-xs font-mono">
                        {grade.course.code}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{Number(grade.numericGrade).toFixed(0)}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${getLetterGradeColor(grade.letterGrade)}`}
                        >
                          {grade.letterGrade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{grade.semester}</td>
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                        {grade.academicYear}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => openEditDialog(grade)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteId(grade.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Grades Cards - Shown on Mobile */}
      <div className="block md:hidden space-y-3">
        {filteredGrades.length === 0 ? (
          <Card className="card-glow py-12 text-center text-muted-foreground">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <BookOpen className="h-10 w-10 mb-3 opacity-30 text-teal-600" />
              <p className="font-medium">
                {searchQuery ? "Tidak ditemukan" : "Belum ada nilai yang diinput"}
              </p>
              <p className="text-xs mt-1">
                {!searchQuery && "Klik 'Tambah Nilai' untuk mulai input nilai mata kuliah"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {filteredGrades.map((grade: any, i: number) => (
              <motion.div
                key={grade.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="card-glow relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-foreground line-clamp-2 leading-snug">{grade.course.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {grade.course.code} &bull; Smt {grade.semester}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Tahun Akademik: {grade.academicYear}
                        </p>
                      </div>
                      <div className="text-right space-y-1.5 shrink-0">
                        <p className="text-lg font-extrabold text-foreground leading-none">{Number(grade.numericGrade).toFixed(0)}</p>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${getLetterGradeColor(grade.letterGrade)}`}
                        >
                          {grade.letterGrade}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border mt-3 pt-2">
                      {grade.notes ? (
                        <p className="text-[10px] text-muted-foreground italic truncate max-w-[50%]">
                          "{grade.notes}"
                        </p>
                      ) : (
                        <div />
                      )}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1"
                          onClick={() => openEditDialog(grade)}
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 gap-1"
                          onClick={() => setDeleteId(grade.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editGrade ? "Edit Nilai" : "Tambah Nilai"}</DialogTitle>
            <DialogDescription>
              {editGrade
                ? "Perbarui nilai mata kuliah Anda"
                : "Input nilai baru untuk mata kuliah"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Course Select */}
            <div className="space-y-2">
              <Label>Mata Kuliah</Label>
              <Select
                value={watch("courseId")}
                onValueChange={(v) => setValue("courseId", v)}
                disabled={!!editGrade}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih mata kuliah" />
                </SelectTrigger>
                <SelectContent>
                  {(editGrade ? courses : availableForNew).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.code}) — Smt {c.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.courseId && (
                <p className="text-xs text-destructive">{errors.courseId.message}</p>
              )}
            </div>

            {/* Numeric Grade */}
            <div className="space-y-2">
              <Label htmlFor="numericGrade">Nilai (0-100)</Label>
              <Input
                id="numericGrade"
                type="number"
                min={0}
                max={100}
                step={0.01}
                {...register("numericGrade")}
              />
              {errors.numericGrade && (
                <p className="text-xs text-destructive">{errors.numericGrade.message}</p>
              )}
            </div>

            {/* Semester */}
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select
                value={String(watch("semester"))}
                onValueChange={(v) => setValue("semester", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      Semester {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Academic Year */}
            <div className="space-y-2">
              <Label htmlFor="academicYear">Tahun Akademik</Label>
              <Input
                id="academicYear"
                placeholder="2024/2025"
                {...register("academicYear")}
              />
              {errors.academicYear && (
                <p className="text-xs text-destructive">{errors.academicYear.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Input id="notes" placeholder="Catatan tambahan..." {...register("notes")} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editGrade ? "Simpan Perubahan" : "Simpan Nilai"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Nilai</DialogTitle>
            <DialogDescription>
              Anda yakin ingin menghapus nilai ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2">
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
