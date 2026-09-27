import { useState } from "react";
import { FlaskConical, UserPlus } from "lucide-react";

import { ConfirmDeleteButton } from "@/components/confirm-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import {
  emptyStudentForm,
  validateStudentField,
  validateStudentForm,
  type StudentFormErrors,
  type StudentFormValues,
} from "@/lib/student-validation";

const programOptions = [
  { value: "CPE", label: "CPE — วิศวกรรมคอมพิวเตอร์" },
  { value: "ISNE", label: "ISNE — วิศวกรรมระบบสารสนเทศและเครือข่าย" },
];

export default function AdminStudentsPage() {
  const { students, addStudent, removeStudent } = useEnrollmentStore();

  // (1)(2)(3) state ที่ต้องถือเองสามก้อน
  const [values, setValues] = useState<StudentFormValues>(emptyStudentForm);
  const [errors, setErrors] = useState<StudentFormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof StudentFormValues, boolean>>
  >({});

  // (4) ตรวจช่องเดียว แล้วอัปเดต errors เฉพาะช่องนั้น
  const checkField = (
    name: keyof StudentFormValues,
    next: StudentFormValues,
  ) => {
    setErrors((prev) => ({
      ...prev,
      [name]: validateStudentField(name, next, students),
    }));
  };

  const handleChange = (name: keyof StudentFormValues, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    // ช่องที่เคยออกไปแล้ว (touched) ให้เช็กใหม่ทันทีตอนแก้ — error จะหายเมื่อแก้ถูก
    if (touched[name]) checkField(name, next);
  };

  // เทียบได้กับ mode: "onBlur" — เช็กตอนออกจากช่อง ไม่กวนระหว่างพิมพ์
  const handleBlur = (name: keyof StudentFormValues) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    checkField(name, values);
  };

  // (7) ด่านตรวจก่อนเข้า store
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validateStudentForm(values, students);
    setErrors(nextErrors);
    setTouched({
      studentId: true,
      firstName: true,
      lastName: true,
      program: true,
    });
    if (Object.keys(nextErrors).length > 0) return; // ไม่ผ่าน → ไม่เรียก addStudent

    addStudent({
      studentId: values.studentId.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      program: values.program as "CPE" | "ISNE", // ต้อง cast เอง (Zod infer ให้)
    });
    setValues(emptyStudentForm);
    setErrors({});
    setTouched({});
  };

  // หัวข้อที่ 6 (Before): เรียก addStudent ตัวเดียวกันแต่ "ไม่มีด่านตรวจ"
  const handleAddWithoutValidate = () => {
    addStudent({
      studentId: "65061",
      firstName: "Garbage",
      lastName: "",
      program: "CPE",
    });
  };

  // (5)(6) ต้องต่อ id / aria-* / ข้อความ error เองทุกช่อง
  const errorOf = (name: keyof StudentFormValues) =>
    touched[name] ? errors[name] : undefined;

  const fieldError = (name: keyof StudentFormValues) => {
    const message = errorOf(name);
    return message ? (
      <p id={`${name}-error`} className="text-sm text-destructive">
        {message}
      </p>
    ) : null;
  };

  const invalidProps = (name: keyof StudentFormValues) => ({
    "aria-invalid": errorOf(name) ? true : undefined,
    "aria-describedby": errorOf(name) ? `${name}-error` : undefined,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการนักศึกษา</h1>
        <p className="text-sm text-muted-foreground">
          Lecture 17 (Starter): รับข้อมูลและตรวจสอบก่อนเข้าสู่ระบบ — Validate
          แบบเขียนเอง ยังไม่ใช้ Zod / React Hook Form
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>เพิ่มนักศึกษา</CardTitle>
          <CardDescription>
            ลองเว้นช่องว่าง หรือใส่รหัสนักศึกษาไม่ครบ 9 หลัก แล้วกดบันทึก
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="studentId">รหัสนักศึกษา</Label>
              <Input
                id="studentId"
                placeholder="650610099"
                inputMode="numeric"
                value={values.studentId}
                onChange={(e) => handleChange("studentId", e.target.value)}
                onBlur={() => handleBlur("studentId")}
                {...invalidProps("studentId")}
              />
              {fieldError("studentId")}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="firstName">ชื่อ</Label>
                <Input
                  id="firstName"
                  value={values.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  onBlur={() => handleBlur("firstName")}
                  {...invalidProps("firstName")}
                />
                {fieldError("firstName")}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="lastName">นามสกุล</Label>
                <Input
                  id="lastName"
                  value={values.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  onBlur={() => handleBlur("lastName")}
                  {...invalidProps("lastName")}
                />
                {fieldError("lastName")}
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="program">หลักสูตร</Label>
              <Select
                items={programOptions}
                value={values.program || null}
                onValueChange={(v) => {
                  // Select ไม่มี blur ชัดเจน — ถือว่าแตะแล้วตั้งแต่เลือก
                  const next = {
                    ...values,
                    program: v as StudentFormValues["program"],
                  };
                  setValues(next);
                  setTouched((prev) => ({ ...prev, program: true }));
                  checkField("program", next);
                }}
              >
                <SelectTrigger
                  id="program"
                  className="w-full"
                  {...invalidProps("program")}
                >
                  <SelectValue placeholder="เลือกหลักสูตร" />
                </SelectTrigger>
                <SelectContent>
                  {programOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError("program")}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit">
                <UserPlus className="h-4 w-4" />
                บันทึก (ผ่าน Validate)
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddWithoutValidate}
              >
                <FlaskConical className="h-4 w-4" />
                จำลองข้อมูลจากฟอร์ม (ไม่ Validate)
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสนักศึกษา</TableHead>
              <TableHead>ชื่อ</TableHead>
              <TableHead>นามสกุล</TableHead>
              <TableHead>หลักสูตร</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((s, i) => (
              // ใช้ index ร่วมด้วย เพราะปุ่ม "ไม่ Validate" ใส่รหัสซ้ำได้ (นี่แหละปัญหา)
              <TableRow key={`${s.studentId}-${i}`}>
                <TableCell>{s.studentId}</TableCell>
                <TableCell>{s.firstName}</TableCell>
                <TableCell>
                  {s.lastName || <Badge variant="destructive">ว่างเปล่า</Badge>}
                </TableCell>
                <TableCell>{s.program}</TableCell>
                <TableCell>
                  <ConfirmDeleteButton
                    label={`ลบ ${s.studentId}`}
                    title="ลบนักศึกษา?"
                    description={`ลบ ${s.studentId} ${s.firstName} ${s.lastName} พร้อมการลงทะเบียนทั้งหมด`}
                    onConfirm={() => removeStudent(s.studentId)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
