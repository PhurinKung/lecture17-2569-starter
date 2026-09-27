import type { Student } from "@/lib/types";

/**
 *   studentId → z.string().regex(/^\d{9}$/, "รหัสนักศึกษาต้องเป็นตัวเลข 9 หลัก")
 *   firstName → z.string().min(1, "กรอกชื่อ")
 *   lastName  → z.string().min(1, "กรอกนามสกุล")
 *   program   → z.enum(["CPE", "ISNE"], { message: "เลือกหลักสูตร" })
 */
export type StudentFormValues = {
  studentId: string;
  firstName: string;
  lastName: string;
  program: Student["program"] | "";
};

export type StudentFormErrors = Partial<
  Record<keyof StudentFormValues, string>
>;

export const emptyStudentForm: StudentFormValues = {
  studentId: "",
  firstName: "",
  lastName: "",
  program: "",
};

/** ตรวจทีละ field — คืนข้อความ error ภาษาไทย หรือ undefined ถ้าผ่าน */
export function validateStudentField(
  name: keyof StudentFormValues,
  values: StudentFormValues,
  existingStudents: Student[],
): string | undefined {
  switch (name) {
    case "studentId": {
      const id = values.studentId.trim();
      if (!/^\d{9}$/.test(id)) return "รหัสนักศึกษาต้องเป็นตัวเลข 9 หลัก";
      if (existingStudents.some((s) => s.studentId === id))
        return "รหัสนักศึกษานี้มีอยู่แล้ว";
      return undefined;
    }
    case "firstName":
      return values.firstName.trim() === "" ? "กรอกชื่อ" : undefined;
    case "lastName":
      return values.lastName.trim() === "" ? "กรอกนามสกุล" : undefined;
    case "program":
      return values.program !== "CPE" && values.program !== "ISNE"
        ? "เลือกหลักสูตร"
        : undefined;
  }
}

/** ตรวจทั้งฟอร์มตอนกด Submit — errors ว่าง = ผ่านทุก field */
export function validateStudentForm(
  values: StudentFormValues,
  existingStudents: Student[],
): StudentFormErrors {
  const errors: StudentFormErrors = {};
  for (const name of Object.keys(values) as (keyof StudentFormValues)[]) {
    const message = validateStudentField(name, values, existingStudents);
    if (message) errors[name] = message;
  }
  return errors;
}
