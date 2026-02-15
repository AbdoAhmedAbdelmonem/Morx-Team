/**
 * Egyptian Governorates (المحافظات المصرية)
 * All 27 governorates of Egypt
 */

export const EGYPTIAN_GOVERNORATES = [
  // Greater Cairo
  "Cairo",           // القاهرة
  "Giza",            // الجيزة
  "Qalyubia",        // القليوبية
  
  // Alexandria and North Coast
  "Alexandria",      // الإسكندرية
  "Beheira",         // البحيرة
  "Matrouh",         // مطروح
  
  // Delta Region
  "Kafr El Sheikh",  // كفر الشيخ
  "Dakahlia",        // الدقهلية
  "Damietta",        // دمياط
  "Sharqia",         // الشرقية
  "Gharbia",         // الغربية
  "Monufia",         // المنوفية
  
  // Canal Cities
  "Port Said",       // بورسعيد
  "Ismailia",        // الإسماعيلية
  "Suez",            // السويس
  
  // Sinai
  "North Sinai",     // شمال سيناء
  "South Sinai",     // جنوب سيناء
  
  // Upper Egypt
  "Fayoum",          // الفيوم
  "Beni Suef",       // بني سويف
  "Minya",           // المنيا
  "Asyut",           // أسيوط
  "Sohag",           // سوهاج
  "Qena",            // قنا
  "Luxor",           // الأقصر
  "Aswan",           // أسوان
  "Banha",           // بنها
  "Red Sea",         // البحر الأحمر
  
  // New Cities
  "New Valley",      // الوادي الجديد
] as const;

export type EgyptianGovernorate = typeof EGYPTIAN_GOVERNORATES[number];
