# EyeTrackTask - Supabase Setup Guide

## ขั้นตอนการตั้งค่า Supabase Database

### 1. สร้าง Supabase Tables
1. ไปที่ Supabase Console → เลือก project ของคุณ
2. ไปที่ **SQL Editor** 
3. คัดลอกโค้ดทั้งหมดจากไฟล์ `SUPABASE_SCHEMA.sql`
4. รันคำสั่ง SQL

### 2. สร้าง Storage Bucket (สำหรับ Profile Pictures)
1. ไปที่ **Storage** → **Buckets**
2. สร้าง Bucket ใหม่ชื่อ `profile-pictures`
3. ตั้ง **Public access** เป็น Public (หรือ Private และเพิ่ม RLS policies)

### 3. Environment Variables
ตรวจสอบว่า `.env` มีค่า:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. การทำงาน
หลังจากตั้งค่าแล้ว:

#### การเข้าสู่ระบบ (Sign Up / Sign In)
1. ไปที่ `/login`
2. เข้าสู่ระบบด้วย Email/Password
3. ระบบจะสร้างโปรเจคตัวอย่างให้อัตโนมัติ

#### ใช้งาน
- **Dashboard** (`/`) - ดูและจัดการ tasks
- **Projects** - สร้าง/แก้ไข projects ใน sidebar
- **Profile** - จัดการข้อมูลส่วนตัวและ logout

## โครงสร้าง Database

### Tables
- **projects** - เก็บข้อมูลโปรเจค
- **tasks** - เก็บ tasks แต่ละ project
- **subtasks** - เก็บ subtasks แต่ละ task

## Troubleshooting

### Error: "Error fetching projects: {}"
**สาเหตุ:** Tables ยังไม่สร้าง หรือ RLS policies ผิด

**วิธีแก้:**
1. ตรวจสอบว่าเรียกใช้ SQL schema ทั้งหมดแล้ว
2. ตรวจสอบ RLS policies ใน Supabase Console
3. ดู Browser Console ประเมาณข้อมูล error ที่ละเอียด

### Error: "User not authenticated"
ต้องเข้าสู่ระบบ `/login` ก่อน

### Projects ไม่แสดงใน dashboard
- ตรวจสอบ RLS policies ถูกต้องหรือไม่
- ลองสร้างโปรเจคใหม่
- ดู Browser Console เพื่อแสดงข้อมูลที่ละเอียด

## Architecture

```
┌─────────────────────────┐
│   Frontend (Next.js)    │
├─────────────────────────┤
│   Auth (Login/Profile)  │
│   KanbanBoard           │
│   Projects Management   │
└────────────┬────────────┘
             │
        Supabase SSR Middleware
             │
┌────────────▼────────────┐
│    Supabase Backend     │
├─────────────────────────┤
│   Auth (Email/Password) │
│   PostgreSQL Database   │
│   RLS Policies          │
│   Storage (Bucket)      │
└─────────────────────────┘
```

## Features

✅ **Authentication** - Email/Password with Supabase Auth
✅ **Session Management** - Server-side sessions via middleware
✅ **Projects** - Create, read, update, delete projects
✅ **Tasks** - Kanban board with drag-and-drop
✅ **SubTasks** - Track subtasks for each task
✅ **Profile** - User profile with avatar upload
✅ **Security** - Row Level Security (RLS) policies
