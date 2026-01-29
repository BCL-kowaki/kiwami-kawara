"use client";

import { useState, FormEvent, useMemo } from "react";
import NetworkBackground from "./components/NetworkBackground";
import { FormState, PortfolioSubmission } from "@/types/portfolio";
import CategoryAccordion from "./components/CategoryAccordion";
import CashCategory from "./components/CashCategory";
import ListedStocksCategory from "./components/ListedStocksCategory";
import FundsCategory from "./components/FundsCategory";
import BondsCategory from "./components/BondsCategory";
import CommoditiesCategory from "./components/CommoditiesCategory";
import CryptoCategory from "./components/CryptoCategory";
import OtherCategory from "./components/OtherCategory";
import {
    CashData,
    ListedStocksData,
    FundsData,
    BondsData,
    CommoditiesData,
    CryptoData,
    OtherData,
} from "@/types/portfolio";

export default function Home() {
    const [formState, setFormState] = useState<FormState>("editing");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [cash, setCash] = useState<CashData>({
        details: [{ sizeMode: "percentage", currency: "JPY", amount: undefined }],
    });

    const [listedStocks, setListedStocks] = useState<ListedStocksData>({
        details: [{ sizeMode: "percentage", name: "", amount: undefined }],
    });

    const [funds, setFunds] = useState<FundsData>({
        details: [{ sizeMode: "percentage", name: "", amount: undefined }],
    });

    const [bonds, setBonds] = useState<BondsData>({
        details: [{ sizeMode: "percentage", name: "", amount: undefined }],
    });

    const [commodities, setCommodities] = useState<CommoditiesData>({
        details: [{ sizeMode: "percentage", name: "", amount: undefined }],
    });

    const [crypto, setCrypto] = useState<CryptoData>({
        details: [{ sizeMode: "percentage", name: "", amount: undefined }],
    });

    const [other, setOther] = useState<OtherData>({
        details: [{ sizeMode: "percentage", investmentType: undefined, name: "", amount: undefined }],
    });

    const [familyName, setFamilyName] = useState<string>("");
    const [givenName, setGivenName] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    const isValidCashRow = (row: any) =>
        (row.sizeMode === "amount" || row.sizeMode === "percentage") &&
        !!row.currency &&
        row.amount !== undefined &&
        row.amount > 0;

    const isValidNamedAmountRow = (row: any) =>
        row.name?.trim() &&
        (row.sizeMode === "amount" || row.sizeMode === "percentage") &&
        row.amount !== undefined &&
        row.amount > 0;

    const isValidCommoditiesRow = (row: any) =>
        (row.sizeMode === "amount" || row.sizeMode === "percentage") && row.amount !== undefined && row.amount > 0;

    const isValidOtherRow = (row: any) =>
        !!row.investmentType &&
        row.name?.trim() &&
        (row.sizeMode === "amount" || row.sizeMode === "percentage") &&
        row.amount !== undefined &&
        row.amount > 0;

    const getInputStatus = (details: any[], validator: (row: any) => boolean) => {
        const count = details.filter(validator).length;
        return count > 0 ? `入力済（${count}件）` : "未入力";
    };

    const cashStatus = getInputStatus(cash.details, isValidCashRow);
    const listedStocksStatus = getInputStatus(listedStocks.details, isValidNamedAmountRow);
    const fundsStatus = getInputStatus(funds.details, isValidNamedAmountRow);
    const bondsStatus = getInputStatus(bonds.details, isValidNamedAmountRow);
    const commoditiesStatus = getInputStatus(commodities.details, isValidCommoditiesRow);
    const cryptoStatus = getInputStatus(crypto.details, isValidNamedAmountRow);
    const otherStatus = getInputStatus(other.details, isValidOtherRow);

    const progress = useMemo(() => {
        const cashCompleted = cash.details.some(isValidCashRow);
        const listedStocksCompleted = listedStocks.details.some(isValidNamedAmountRow);
        const fundsCompleted = funds.details.some(isValidNamedAmountRow);
        const bondsCompleted = bonds.details.some(isValidNamedAmountRow);
        const commoditiesCompleted = commodities.details.some(isValidCommoditiesRow);
        const cryptoCompleted = crypto.details.some(isValidNamedAmountRow);
        const otherCompleted = other.details.some(isValidOtherRow);

        const completed = [
            cashCompleted,
            listedStocksCompleted,
            fundsCompleted,
            bondsCompleted,
            commoditiesCompleted,
            cryptoCompleted,
            otherCompleted,
        ].filter(Boolean).length;

        return { completed, total: 7 };
    }, [cash, listedStocks, funds, bonds, commodities, crypto, other]);

    // 入力合計値を計算
    const totalPercentage = useMemo(() => {
        let total = 0;
        
        // 現金・預金
        cash.details.forEach(row => {
            if (row.amount !== undefined && row.amount !== null) {
                total += row.amount;
            }
        });
        
        // 上場株
        listedStocks.details.forEach(row => {
            if (row.amount !== undefined && row.amount !== null) {
                total += row.amount;
            }
        });
        
        // ETF・投資信託・NISA
        funds.details.forEach(row => {
            if (row.amount !== undefined && row.amount !== null) {
                total += row.amount;
            }
        });
        
        // 債券
        bonds.details.forEach(row => {
            if (row.amount !== undefined && row.amount !== null) {
                total += row.amount;
            }
        });
        
        // 貴金属・コモディティ
        commodities.details.forEach(row => {
            if (row.amount !== undefined && row.amount !== null) {
                total += row.amount;
            }
        });
        
        // 暗号資産
        crypto.details.forEach(row => {
            if (row.amount !== undefined && row.amount !== null) {
                total += row.amount;
            }
        });
        
        // その他
        other.details.forEach(row => {
            if (row.amount !== undefined && row.amount !== null) {
                total += row.amount;
            }
        });
        
        return Math.round(total * 10) / 10; // 小数点以下1桁に丸める
    }, [cash, listedStocks, funds, bonds, commodities, crypto, other]);

    const filterRows = <T,>(details: T[], validator: (row: any) => boolean) =>
        details.filter(validator as any);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormState("submitting");
        setErrorMessage("");

        // 必須項目のバリデーション
        if (!familyName.trim()) {
            setFormState("editing");
            setErrorMessage("苗字を入力してください。");
            return;
        }
        if (!givenName.trim()) {
            setFormState("editing");
            setErrorMessage("名前を入力してください。");
            return;
        }
        if (!email.trim()) {
            setFormState("editing");
            setErrorMessage("メールアドレスを入力してください。");
            return;
        }

        try {
            const payload: PortfolioSubmission = {
                submittedAt: new Date().toISOString(),
                familyName: familyName.trim() || undefined,
                givenName: givenName.trim() || undefined,
                email: email.trim() || undefined,
                cash: { details: filterRows(cash.details, isValidCashRow) },
                listedStocks: { details: filterRows(listedStocks.details, isValidNamedAmountRow) },
                funds: { details: filterRows(funds.details, isValidNamedAmountRow) },
                bonds: { details: filterRows(bonds.details, isValidNamedAmountRow) },
                commodities: { details: filterRows(commodities.details, isValidCommoditiesRow) },
                crypto: { details: filterRows(crypto.details, isValidNamedAmountRow) },
                other: { details: filterRows(other.details, isValidOtherRow) },
            };

            const response = await fetch("/api/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorText = "";
                try {
                    const errorJson = await response.json();
                    errorText = errorJson.message || JSON.stringify(errorJson);
                } catch {
                    errorText = await response.text();
                }
                console.error("API Error Status:", response.status);
                console.error("API Error Response:", errorText);
                setFormState("error");
                setErrorMessage(errorText || "送信に失敗しました。時間をおいて再度お試しください。");
                return;
            }

            const result = await response.json();
            console.log("API Response:", result);

            if (result.ok) {
                setFormState("submitted");
            } else {
                setFormState("error");
                setErrorMessage(result.message || "送信に失敗しました。時間をおいて再度お試しください。");
            }
        } catch (error) {
            console.error("Submit error:", error);
            setFormState("error");
            setErrorMessage("送信に失敗しました。時間をおいて再度お試しください。");
        }
    };

    if (formState === "submitted") {
        return (
            <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#0b0e1f' }}>
                <NetworkBackground />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="relative z-10 max-w-md w-full">
                        <div className="p-[2px] rounded-[2px] shadow-2xl" style={{ background: 'linear-gradient(90deg, #2db8f9 0%, #7b5cfa 50%, #aa30ff 100%)' }}>
                            <div className="backdrop-blur-sm rounded-[2px] p-5 text-center" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)' }}>
                                <div className="mb-2 pt-6 pb-4">
                                    <div className="inline-flex items-center justify-center w-15 h-15 rounded-full shadow-lg animate-bounce" style={{ background: 'linear-gradient(135deg, #2db8f9 0%, #7b5cfa 50%, #aa30ff 100%)' }}>
                                        <svg
                                            className="w-10 h-10"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            style={{ color: '#ffffff' }}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <h1 className="text-xl font-extrabold mb-4" style={{ color: '#ffffff' }}>
                                    ご入力ありがとうございました
                                </h1>
                                <div className="space-y-4 mb-6">
                                    <p className="text-sm leading-relaxed" style={{ color: '#eeeeee' }}>
                                        ご入力いただいた内容を確認いたしました。
                                    </p>
                                    <div className="rounded-[2px] p-4 border text-sm" style={{ background: '#252535', borderColor: '#3a3a4a' }}>
                                        <p className="font-bold mb-1" style={{ color: '#ffffff' }}>
                                            3営業日以内に
                                        </p>
                                        <p style={{ color: '#cccccc' }}>
                                            ご登録いただいたメールアドレス宛に<br />
                                            <span className="font-bold" style={{ color: '#2db8f9' }}>結果のレポート</span>をお送りいたします。
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-1">
                                    <p className="text-sm" style={{ color: '#aaaaaa' }}>
                                        ご不明な点がございましたら、<br />
                                        お気軽にお問い合わせください。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="relative z-10 text-xs text-center py-4" style={{ color: '#ffffff' }}>
                    ©2026 株式会社投資の"KAWARA"版.com
                </p>
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen py-8 px-4 relative overflow-hidden"
            style={{
                background: '#0b0e1f',
            }}
        >
            {/* ネットワークアニメーション背景 */}
            <NetworkBackground />
            
            <div className="max-w-[640px] mx-auto relative z-10">
                <div className="p-[2px] rounded-[2px] shadow-2xl mb-6" style={{ background: 'linear-gradient(90deg, #2db8f9 0%, #7b5cfa 50%, #aa30ff 100%)' }}>
                <div className="backdrop-blur-sm rounded-[2px] p-4" style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)' }}>
                    <div className="text-center mb-4">
                        <div className="inline-block mb-4">
                            <div className="w-16 h-16 rounded-[2px] flex items-center justify-center mx-auto shadow-lg" style={{ background: 'linear-gradient(135deg, #2db8f9 0%, #7b5cfa 50%, #aa30ff 100%)' }}>
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-2xl mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#2db8f9] to-[#aa30ff]" style={{ fontWeight: 900 }}>
                            超精密！<br />
                            資産運用AI分析"極"
                        </h1>
                        <p className="text-xs mt-4 leading-relaxed" style={{ color: '#eeeeee' }}>
                            あなたの資産の詳細を入力ください。<br />
                            各項目、総資産の割合（%）で数値を入力ください。<br />
                            <span style={{ color: '#eeeeee' }}>*正確に100％とならなくても問題ありません。</span>
                        </p>
                    </div>

                    {formState === "error" && (
                        <div className="mb-6 p-4 rounded-[2px] animate-pulse" style={{ background: '#2a1a1a', borderLeft: '4px solid #ef4444' }}>
                            <p className="font-medium" style={{ color: '#fca5a5' }}>{errorMessage}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <CategoryAccordion title="1. ETF・投資信託・NISA" badge={fundsStatus}>
                            <FundsCategory data={funds} onChange={setFunds} />
                        </CategoryAccordion>

                        <CategoryAccordion title="2. 現金・預金" badge={cashStatus}>
                            <CashCategory data={cash} onChange={setCash} />
                        </CategoryAccordion>

                        <CategoryAccordion title="3. 上場株" badge={listedStocksStatus}>
                            <ListedStocksCategory
                                data={listedStocks}
                                onChange={setListedStocks}
                            />
                        </CategoryAccordion>

                        <CategoryAccordion title="4. 債券" badge={bondsStatus}>
                            <BondsCategory data={bonds} onChange={setBonds} />
                        </CategoryAccordion>

                        <CategoryAccordion title="5. 貴金属・コモディティ" badge={commoditiesStatus}>
                            <CommoditiesCategory
                                data={commodities}
                                onChange={setCommodities}
                            />
                        </CategoryAccordion>

                        <CategoryAccordion title="6. 暗号資産" badge={cryptoStatus}>
                            <CryptoCategory data={crypto} onChange={setCrypto} />
                        </CategoryAccordion>

                        <div className="mt-6 pt-6" style={{ borderTop: '1px solid #7b5cfa' }}>
                            <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#ffffff' }}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#2db8f9' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                お客様情報
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2" style={{ color: '#e5e5e5' }}>
                                        お名前 <span className="text-xs font-normal" style={{ color: '#f87171' }}>（必須）</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            id="familyName"
                                            value={familyName}
                                            onChange={(e) => setFamilyName(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-[2px] focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400"
                                            style={{ background: '#2a2a2a', border: '1px solid #4a4a4a', color: 'white' }}
                                            placeholder="山田"
                                        />
                                        <input
                                            type="text"
                                            id="givenName"
                                            value={givenName}
                                            onChange={(e) => setGivenName(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-[2px] focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400"
                                            style={{ background: '#2a2a2a', border: '1px solid #4a4a4a', color: 'white' }}
                                            placeholder="太郎"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#e5e5e5' }}>
                                        メールアドレス <span className="text-xs font-normal" style={{ color: '#f87171' }}>（必須）</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-[2px] focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-400"
                                        style={{ background: '#2a2a2a', border: '1px solid #4a4a4a', color: 'white' }}
                                        placeholder="example@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 mb-6">
                            <div className="mx-auto max-w-2xl text-left rounded-[2px] px-5 py-4 mb-6" style={{ background: '#1a1a1a', border: '1px solid #4a4a4a' }}>
                                <p className="text-xs leading-relaxed" style={{ color: '#eeeeee' }}>
                                    ※本サービスは投資助言・売買推奨を目的としたものではありません。<br />
                                    入力された情報をもとに、現在の資産状況を整理・可視化するための分析レポートを作成します。
                                </p>
                            </div>
                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    disabled={formState === "submitting"}
                                    className={`w-[90%] py-4 rounded-full font-bold text-base transition-all transform hover:scale-[0.98] hover:shadow-md hover:translate-y-0.5 active:scale-95 active:shadow-sm active:translate-y-1 shadow-lg text-white ${formState === "submitting" ? "bg-gray-400 cursor-not-allowed" : ""}`}
                                    style={formState !== "submitting" ? { background: 'linear-gradient(135deg, #2db8f9 0%, #7b5cfa 50%, #aa30ff 100%)', color: '#ffffff' } : {}}
                                >
                                    {formState === "submitting" ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            送信中...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            送信する
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                </div>
                <p className="text-xs text-center mt-6" style={{ color: '#ffffff' }}>
                    ©2026 株式会社投資の"KAWARA"版.com
                </p>
            </div>

            {/* 入力合計値フローティングポップアップ */}
            <div 
                className="fixed bottom-6 right-6 z-50 rounded-full shadow-2xl px-5 py-3"
                style={{ 
                    background: 'linear-gradient(135deg, #2db8f9 0%, #7b5cfa 50%, #aa30ff 100%)',
                }}
            >
                <div className="text-center">
                    <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>入力合計値</p>
                    <p className="text-xl font-bold" style={{ color: '#ffffff' }}>
                        {totalPercentage}<span className="text-sm ml-1">%</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
