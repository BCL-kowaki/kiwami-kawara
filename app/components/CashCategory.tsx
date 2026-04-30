"use client";

import { CashData, CashDetail, Currency } from "@/types/portfolio";
import { useTheme, getThemeStyles } from "./ThemeContext";

interface CashCategoryProps {
  data: CashData;
  onChange: (data: CashData) => void;
}

export default function CashCategory({ data, onChange }: CashCategoryProps) {
  const theme = useTheme();
  const s = getThemeStyles(theme);

  const addDetailRow = () => {
    if (data.details.length >= 20) return;
    onChange({
      ...data,
      details: [
        ...data.details,
        { sizeMode: "percentage", currency: "JPY", amount: undefined },
      ],
    });
  };

  const updateDetailRow = (index: number, row: CashDetail) => {
    const newDetails = [...data.details];
    newDetails[index] = row;
    onChange({ ...data, details: newDetails });
  };

  const deleteDetailRow = (index: number) => {
    onChange({
      ...data,
      details: data.details.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold mb-2" style={s.labelColor}>内訳（任意）</h4>
        {data.details.map((row, index) => (
          <div key={index} className="rounded-[2px] p-4 mb-3" style={s.cardBg}>
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-sm" style={s.headingColor}>内訳 {index + 1}</h4>
              <button
                type="button"
                onClick={() => deleteDetailRow(index)}
                className="text-sm font-medium hover:opacity-80"
                style={s.deleteColor}
              >
                削除
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={s.labelColor}>
                通貨
              </label>
              <select
                value={(row.currency || "JPY") as Currency}
                onChange={(e) =>
                  updateDetailRow(index, {
                    ...row,
                    currency: e.target.value as Currency,
                  })
                }
                className="w-full px-3 py-2 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                style={s.selectBg}
              >
                <option value="JPY" style={s.optionBg}>JPY</option>
                <option value="USD" style={s.optionBg}>USD</option>
                <option value="EUR" style={s.optionBg}>EUR</option>
                <option value="GBP" style={s.optionBg}>GBP</option>
                <option value="AUD" style={s.optionBg}>AUD</option>
                <option value="定期預金" style={s.optionBg}>定期預金</option>
              </select>

              <label className="block text-sm font-medium mb-1" style={s.labelColor}>
              総資産に対する割合（%）
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={row.amount !== undefined && row.amount !== null ? String(row.amount) : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === "" ? undefined : Number(value);
                  if (value === "" || (!isNaN(numValue!) && numValue! >= 0 && numValue! <= 100)) {
                    updateDetailRow(index, {
                      ...row,
                      sizeMode: "percentage",
                      amount: numValue,
                    });
                  }
                }}
                placeholder="例: 10"
                className="w-full px-3 py-2 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                style={s.inputBg}
              />
            </div>
          </div>
        ))}

        {data.details.length < 20 && (
          <button
            type="button"
            onClick={addDetailRow}
            className="mt-2 px-4 py-2 rounded-full transition-colors text-sm font-medium"
            style={s.addBtnBg}
          >
            + 内訳を追加
          </button>
        )}
        {data.details.length >= 20 && (
          <p className="mt-2 text-sm" style={s.maxTextColor}>最大20行まで追加できます</p>
        )}
      </div>
    </div>
  );
}
