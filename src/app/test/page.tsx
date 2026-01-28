"use client"; // เพราะเราจะใช้ useEffect

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // เรียกตัวเชื่อมต่อมา

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    // ฟังก์ชันดึงข้อมูล
    const fetchTasks = async () => {
      // คำสั่ง SQL ภาษา JS: "ไปที่ table 'tasks' แล้วเลือกมาทุก column (*)"
      let { data, error } = await supabase
        .from('tasks')
        .select('*');

      if (error) console.log('error', error);
      else setTasks(data || []);
    };

    fetchTasks();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Supabase Connection Test</h1>
      <pre>{JSON.stringify(tasks, null, 2)}</pre>
      
      {tasks.length === 0 && <p>ยังไม่มีข้อมูล (ลองไป Insert เล่นในเว็บ Supabase ดูสิ)</p>}
    </div>
  );
}