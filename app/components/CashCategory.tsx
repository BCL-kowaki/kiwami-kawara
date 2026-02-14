"use client";

import { CashData, CashDetail, Currency } from "@/types/portfolio";

interface CashCategoryProps {
  data: CashData;
  onChange: (data: CashData) => void;
}

export default function CashCategory({ data, onChange }: CashCategoryProps) {
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
        <h4 className="text-sm font-semibold mb-2" style={{ color: '#a0a0a0' }}>内訳（任意）</h4>
        {data.details.map((row, index) => (
          <div key={index} className="rounded-[2px] p-4 mb-3" style={{ background: '#1a1a1a', border: '1px solid #3a3a3a' }}>
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-sm" style={{ color: '#ffffff' }}>内訳 {index + 1}</h4>
              <button
                type="button"
                onClick={() => deleteDetailRow(index)}
                className="text-sm font-medium hover:opacity-80"
                style={{ color: '#f87171' }}
              >
                削除
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#a0a0a0' }}>
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
                style={{ background: '#2a2a2a', border: '1px solid #4a4a4a', color: 'white' }}
              >
                <option value="JPY" style={{ background: '#2a2a2a', color: 'white' }}>JPY</option>
                <option value="USD" style={{ background: '#2a2a2a', color: 'white' }}>USD</option>
                <option value="EUR" style={{ background: '#2a2a2a', color: 'white' }}>EUR</option>
                <option value="GBP" style={{ background: '#2a2a2a', color: 'white' }}>GBP</option>
                <option value="AUD" style={{ background: '#2a2a2a', color: 'white' }}>AUD</option>
                <option value="定期預金" style={{ background: '#2a2a2a', color: 'white' }}>定期預金</option>
              </select>

              <label className="block text-sm font-medium mb-1" style={{ color: '#a0a0a0' }}>
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
                style={{ background: '#2a2a2a', border: '1px solid #4a4a4a', color: 'white' }}
              />
            </div>
          </div>
        ))}

        {data.details.length < 20 && (
          <button
            type="button"
            onClick={addDetailRow}
            className="mt-2 px-4 py-2 rounded-full transition-colors text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #2db8f9 0%, #aa30ff 100%)', color: '#ffffff' }}
          >
            + 内訳を追加
          </button>
        )}
        {data.details.length >= 20 && (
          <p className="mt-2 text-sm" style={{ color: '#666666' }}>最大20行まで追加できます</p>
        )}
      </div>
    </div>
  );
}
