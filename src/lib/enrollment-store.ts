import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
  enrollments as initialEnrollments,
} from "@/lib/mock-data";
import type { Course, Enrollment, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  /** Admin ลงทะเบียนวิชาให้นักศึกษาคนใดก็ได้ (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  enroll: (studentId: string, courseId: string) => void;
  /** Admin ยกเลิกการลงทะเบียนของนักศึกษาคนใดก็ได้ */
  drop: (studentId: string, courseId: string) => void;
  /**
   * เพิ่มนักศึกษาใหม่ — ตั้งใจ "ไม่ตรวจอะไรเลย" (lecture 17) หน้าที่ Validate เป็นของ
   * ฟอร์มที่เรียกฟังก์ชันนี้ ไม่ใช่ของ store — ส่งอะไรมาก็เก็บตามนั้น
   */
  addStudent: (student: Student) => void;
  /** ลบนักศึกษา พร้อมการลงทะเบียนทั้งหมดของคนนั้น */
  removeStudent: (studentId: string) => void;
  /**
   * เพิ่มวิชาใหม่ — เหมือน addStudent คือ "ไม่ตรวจอะไรเลย" (lecture 17) หน้าที่ Validate
   * (รหัส 6 หลัก / ชื่อวิชา / ผู้สอน / รหัสซ้ำ) เป็นของฟอร์มใน AddNewCourseDialog
   */
  addCourse: (course: Course) => void;
  /** ลบผู้สอนหนึ่งคนออกจากวิชานั้น (ปุ่ม X บน Badge ผู้สอนในตารางวิชา) */
  removeInstructorFromCourse: (courseId: string, instructor: string) => void;
  /** ลบวิชาออกจากรายวิชาที่เปิดสอน พร้อม cascade ลบ enrollment ที่อ้างถึงวิชานั้นทั้งหมด */
  removeCourse: (courseId: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,
      enrollments: initialEnrollments,

      enroll: (studentId, courseId) =>
        set((state) => ({
          enrollments: state.enrollments.some(
            (e) => e.studentId === studentId && e.courseId === courseId
          )
            ? state.enrollments // กันลงทะเบียนซ้ำ — ถ้ามีอยู่แล้วคืน array เดิม ไม่ใส่ซ้ำ
            : [...state.enrollments, { studentId, courseId }],
        })),

      drop: (studentId, courseId) =>
        set((state) => ({
          enrollments: state.enrollments.filter(
            (e) => !(e.studentId === studentId && e.courseId === courseId)
          ),
        })),

      addStudent: (student) =>
        set((state) => ({ students: [...state.students, student] })),

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter((s) => s.studentId !== studentId),
          enrollments: state.enrollments.filter((e) => e.studentId !== studentId),
        })),

      addCourse: (course) =>
        set((state) => ({ courses: [...state.courses, course] })),

      removeInstructorFromCourse: (courseId, instructor) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.courseId === courseId
              ? {
                  ...course,
                  instructors: course.instructors.filter(
                    (name) => name !== instructor
                  ),
                }
              : course
          ),
        })),

      removeCourse: (courseId) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseId !== courseId),
          enrollments: state.enrollments.filter((e) => e.courseId !== courseId),
        })),
    }),
    {
      name: "lecture17-starter-storage",
      // เก็บเฉพาะ students/courses ลง localStorage — enrollments ไม่ persist
      // ตั้งใจให้รีเซ็ตกลับเป็นค่าตั้งต้นทุกครั้งที่รีเฟรช เพื่อ demo enroll/drop ซ้ำได้ง่าย
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    }
  )
);
