export const EGYPTIAN_GOVERNORATES = [
  "Cairo",           // القاهرة
  "Giza",            // الجيزة
  "Qalyubia",        // القليوبية
  "Alexandria",      // الإسكندرية
  "Beheira",         // البحيرة
  "Matrouh",         // مطروح
  "Kafr El Sheikh",  // كفر الشيخ
  "Dakahlia",        // الدقهلية
  "Damietta",        // دمياط
  "Sharqia",         // الشرقية
  "Gharbia",         // الغربية
  "Monufia",         // المنوفية
  "Port Said",       // بورسعيد
  "Ismailia",        // الإسماعيلية
  "Suez",            // السويس
  "North Sinai",     // شمال سيناء
  "South Sinai",     // جنوب سيناء
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
  "New Valley",      // الوادي الجديد
] as const;

export type EgyptianGovernorate = typeof EGYPTIAN_GOVERNORATES[number];
