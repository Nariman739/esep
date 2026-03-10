import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("ru-KZ").format(amount);
}

const ones = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять",
  "десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать",
  "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"];
const tens = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
const hundreds = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];

function threeDigits(n: number, feminine = false): string {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  let result = hundreds[h] ? hundreds[h] + " " : "";
  if (t === 1) {
    result += ones[10 + o];
  } else {
    result += tens[t] ? tens[t] + " " : "";
    if (feminine && o === 1) result += "одна";
    else if (feminine && o === 2) result += "две";
    else result += ones[o];
  }
  return result.trim();
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export function amountInWords(amount: number): string {
  const intPart = Math.floor(amount);
  const fracPart = Math.round((amount - intPart) * 100);

  const billions = Math.floor(intPart / 1_000_000_000);
  const millions = Math.floor((intPart % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((intPart % 1_000_000) / 1_000);
  const remainder = intPart % 1_000;

  let result = "";

  if (billions > 0) {
    result += threeDigits(billions) + " " + plural(billions, "миллиард", "миллиарда", "миллиардов") + " ";
  }
  if (millions > 0) {
    result += threeDigits(millions) + " " + plural(millions, "миллион", "миллиона", "миллионов") + " ";
  }
  if (thousands > 0) {
    result += threeDigits(thousands, true) + " " + plural(thousands, "тысяча", "тысячи", "тысяч") + " ";
  }
  if (remainder > 0 || intPart === 0) {
    result += threeDigits(remainder) + " ";
  }

  result = result.trim();
  result += " " + plural(intPart, "тенге", "тенге", "тенге");
  result += " " + String(fracPart).padStart(2, "0") + " тиын";

  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-KZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
