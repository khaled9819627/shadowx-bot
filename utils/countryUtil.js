function getCountryCode(number) {
  if (number.startsWith('963')) return 'سوريا 🇸🇾';
  if (number.startsWith('20')) return 'مصر 🇪🇬';
  if (number.startsWith('966')) return 'السعودية 🇸🇦';
  if (number.startsWith('212')) return 'المغرب 🇲🇦';
  if (number.startsWith('971')) return 'الإمارات 🇦🇪';
  if (number.startsWith('962')) return 'الأردن 🇯🇴';
  if (number.startsWith('965')) return 'الكويت 🇰🇼';
  if (number.startsWith('964')) return 'العراق 🇮🇶';
  if (number.startsWith('90')) return 'تركيا 🇹🇷';
  return 'غير معروف 🌐';
}

module.exports = { getCountryCode };
