export function numberToWordsINR(amount: number): string {
  if (isNaN(amount) || amount === 0) return "Indian Rupee Zero Only";

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    const t = Math.floor(n / 10);
    const o = n % 10;
    return tens[t] + (o > 0 ? " " + ones[o] : "");
  }

  function convertThreeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    if (h > 0 && rem > 0) {
      return ones[h] + " Hundred " + convertTwoDigits(rem);
    }
    if (h > 0) {
      return ones[h] + " Hundred";
    }
    return convertTwoDigits(rem);
  }

  function convertRupees(n: number): string {
    if (n === 0) return "";
    let res = "";

    // Crores (1,00,00,000)
    const crores = Math.floor(n / 10000000);
    let rem = n % 10000000;
    if (crores > 0) {
      res += (res ? " " : "") + convertRupees(crores) + " Crore";
    }

    // Lakhs (1,00,000)
    const lakhs = Math.floor(rem / 100000);
    rem = rem % 100000;
    if (lakhs > 0) {
      res += (res ? " " : "") + convertTwoDigits(lakhs) + " Lakh";
    }

    // Thousands (1,000)
    const thousands = Math.floor(rem / 1000);
    rem = rem % 1000;
    if (thousands > 0) {
      res += (res ? " " : "") + convertTwoDigits(thousands) + " Thousand";
    }

    // Remaining hundreds and units
    if (rem > 0) {
      res += (res ? " " : "") + convertThreeDigits(rem);
    }

    return res;
  }

  let words = convertRupees(rupees);
  if (!words) words = "Zero";

  let result = `Indian Rupee ${words}`;
  if (paise > 0) {
    result += ` and ${convertTwoDigits(paise)} Paise`;
  }
  result += " Only";

  return isNegative ? `Minus ${result}` : result;
}
