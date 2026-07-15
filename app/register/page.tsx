"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HardHat, Eye, EyeOff, CheckCircle2, Copy, Upload, FileSpreadsheet, Loader2, AlertTriangle } from "lucide-react";
import { generateCompanyCode } from "@/lib/mock";
import { addQuoteItems } from "@/lib/quoteItemsStorage";

type Step = "form" | "import" | "complete";

interface ParsedQuoteItem {
  category: string;
  name: string;
  unit: string;
  unitPrice: number;
}

interface ParseResponse {
  needsReview: boolean;
  mapping: { nameColumn: number; quantityColumn: number; unitColumn: number; priceColumn: number };
  items: ParsedQuoteItem[];
  headerPreview: string[];
  rawPreview: string[][];
  error?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({
    companyName: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [companyCode, setCompanyCode] = useState("");
  const [copied, setCopied] = useState(false);

  // --- Onboarding: past-quote Excel import ---
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState("");
  const [parseResult, setParseResult] = useState<ParseResponse | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [manualMapping, setManualMapping] = useState({ nameColumn: 0, unitColumn: 1, priceColumn: 2 });
  const [importDone, setImportDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }
    if (form.password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const code = generateCompanyCode();
    setCompanyCode(code);
    setStep("import");
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(companyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runParse = async (mappingOverride?: typeof manualMapping) => {
    if (!importFile) return;
    setImportLoading(true);
    setImportError("");
    const body = new FormData();
    body.append("file", importFile);
    if (mappingOverride) body.append("mappingOverride", JSON.stringify(mappingOverride));

    try {
      const res = await fetch("/api/onboarding/parse-quotes", { method: "POST", body });
      const data: ParseResponse = await res.json();
      if (!res.ok) {
        setImportError(data.error ?? "解析に失敗しました");
        setImportLoading(false);
        return;
      }
      setParseResult(data);
      setSelectedItems(new Set(data.items.map((_, i) => i)));
    } catch {
      setImportError("通信エラーが発生しました。ネットワークをご確認ください。");
    }
    setImportLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImportFile(file);
    setParseResult(null);
    setImportError("");
    if (file) runParse();
  };

  const toggleItem = (i: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const confirmImport = () => {
    if (!parseResult) return;
    const chosen = parseResult.items.filter((_, i) => selectedItems.has(i));
    if (chosen.length > 0) addQuoteItems(chosen);
    setImportDone(true);
  };

  if (step === "import") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-3">
                <FileSpreadsheet size={26} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">過去の見積もりを取り込む(任意)</h2>
              <p className="text-gray-500 text-sm mt-1">
                過去の見積Excelをアップロードすると、AIが品目・単価パターンを読み取り、見積作成時のボタン候補として使えるようにします。
              </p>
            </div>

            {!parseResult && !importDone && (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-10 cursor-pointer hover:border-blue-400 transition-colors">
                <Upload size={28} className="text-gray-400" />
                <span className="text-sm text-gray-500">
                  {importFile ? importFile.name : "Excelファイルを選択 (.xlsx / .xls)"}
                </span>
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
              </label>
            )}

            {importLoading && (
              <div className="flex items-center justify-center gap-2 text-blue-600 text-sm py-6">
                <Loader2 size={18} className="animate-spin" />AIが解析しています…
              </div>
            )}

            {importError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mt-3">
                {importError}
              </div>
            )}

            {parseResult && !importDone && (
              <div className="mt-2 space-y-4">
                {parseResult.needsReview && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-700">
                      <p className="font-medium mb-1">列の判定に自信が持てませんでした。どの列が何を表すか確認してください。</p>
                      <p className="text-amber-600">
                        検出された列見出し: {parseResult.headerPreview.filter(Boolean).join(" / ") || "(見出しなし)"}
                      </p>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {(["nameColumn", "unitColumn", "priceColumn"] as const).map((key) => (
                          <div key={key}>
                            <label className="block text-[10px] text-amber-600 mb-0.5">
                              {key === "nameColumn" ? "品目名の列" : key === "unitColumn" ? "単位の列" : "単価の列"}
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={manualMapping[key]}
                              onChange={(e) =>
                                setManualMapping((m) => ({ ...m, [key]: Number(e.target.value) }))
                              }
                              className="w-full px-2 py-1 rounded-lg border border-amber-200 text-xs"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => runParse(manualMapping)}
                        className="mt-2 text-xs font-medium text-amber-700 underline"
                      >
                        この列指定で再解析する
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 mb-2">
                    抽出された品目({parseResult.items.length}件)。取り込む項目にチェックを入れてください。
                  </p>
                  <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                    {parseResult.items.map((item, i) => (
                      <label key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(i)}
                          onChange={() => toggleItem(i)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-gray-400 text-xs w-24 flex-shrink-0">{item.category}</span>
                        <span className="flex-1 text-gray-800">{item.name}</span>
                        <span className="text-gray-500 text-xs">
                          ¥{item.unitPrice.toLocaleString()} / {item.unit}
                        </span>
                      </label>
                    ))}
                    {parseResult.items.length === 0 && (
                      <p className="text-center text-gray-400 text-sm py-6">品目を検出できませんでした</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={confirmImport}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  選択した{selectedItems.size}件を取り込んで次へ
                </button>
              </div>
            )}

            {importDone && (
              <div className="text-center py-4">
                <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">品目パターンを取り込みました。</p>
              </div>
            )}

            <button
              onClick={() => setStep("complete")}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4"
            >
              {importDone ? "次へ進む →" : "スキップして次へ →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">登録完了！</h2>
            <p className="text-gray-500 text-sm mb-8">
              「{form.companyName}」の登録が完了しました。
              <br />
              以下の会社コードをメモしてください。
            </p>

            <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-5 mb-6">
              <p className="text-xs text-blue-500 font-medium mb-1">会社コード</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-mono font-bold text-blue-700 tracking-widest">
                  {companyCode}
                </span>
                <button
                  onClick={handleCopy}
                  className="text-blue-400 hover:text-blue-600 transition-colors"
                >
                  <Copy size={20} />
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-500 mt-2">コピーしました</p>
              )}
            </div>

            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-8 text-left">
              ⚠️ この会社コードはログイン時に必要です。必ずメモしておいてください。
            </p>

            <button
              onClick={() => router.push("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-base"
            >
              ログインへ進む
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <HardHat size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">設備工事管理</h1>
          <p className="text-gray-500 mt-1 text-sm">業務管理システム</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">新規会社登録</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                会社名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="例: 山田設備工事株式会社"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-800 text-base transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                担当者名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例: 山田太郎"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-800 text-base transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                パスワード <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="6文字以上"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-800 text-base transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                placeholder="もう一度入力"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-gray-800 text-base transition-colors"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors text-base mt-2"
            >
              {loading ? "登録中..." : "登録する"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              すでにアカウントをお持ちの方は{" "}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
