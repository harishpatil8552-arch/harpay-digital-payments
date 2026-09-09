import { Delete } from "lucide-react";

interface NumericKeypadProps {
  value: string;
  onChange: (val: string) => void;
  maxLength?: number;
  allowDecimal?: boolean;
}

export default function NumericKeypad({ value, onChange, maxLength = 10, allowDecimal = true }: NumericKeypadProps) {
  function press(key: string) {
    if (key === "backspace") {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === "." && !allowDecimal) return;
    if (key === "." && value.includes(".")) return;
    if (value.length >= maxLength) return;
    if (key === "." && value === "") {
      onChange("0.");
      return;
    }
    if (value === "0" && key !== ".") {
      onChange(key);
      return;
    }
    onChange(value + key);
  }

  const keys = ["1","2","3","4","5","6","7","8","9",".","0","backspace"];

  return (
    <div className="grid grid-cols-3 gap-2 px-4">
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => press(k)}
          className="h-14 rounded-2xl flex items-center justify-center text-xl font-semibold
            bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100
            active:bg-gray-200 dark:active:bg-gray-700 active:scale-95 transition-all
            shadow-sm hover:shadow-md"
        >
          {k === "backspace" ? <Delete size={22} className="text-gray-500 dark:text-gray-400" /> : k}
        </button>
      ))}
    </div>
  );
}
