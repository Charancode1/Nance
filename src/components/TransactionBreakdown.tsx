import React, { useState, useMemo } from 'react';
import { Transaction, WeeklyCalculation } from '../types';
import { formatINR, formatDateLabel } from '../utils/formatters';
import { isEligibleTransaction } from '../services/budgetCalculator';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  QrCode,
  CreditCard,
  Banknote,
  Building,
  Utensils,
  ShoppingBag,
  Bus,
  Film,
  HeartPulse,
  Home,
  ArrowRightLeft,
} from 'lucide-react';

interface TransactionBreakdownProps {
  transactions: Transaction[];
  weeks: WeeklyCalculation[];
  selectedWeekIndex: number | null;
  onSelectWeek: (weekIndex: number | null) => void;
  onOpenAddTxn: () => void;
}

export const TransactionBreakdown: React.FC<TransactionBreakdownProps> = ({
  transactions,
  weeks,
  selectedWeekIndex,
  onSelectWeek,
  onOpenAddTxn,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState<'all' | 'eligible' | 'excluded'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Categories list
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    transactions.forEach((t) => cats.add(t.main_category));
    return Array.from(cats).sort();
  }, [transactions]);

  // Determine week range if selected
  const activeWeek = useMemo(() => {
    if (!selectedWeekIndex) return null;
    return weeks.find((w) => w.weekIndex === selectedWeekIndex) || null;
  }, [selectedWeekIndex, weeks]);

  // Filter transactions
  const filteredTxns = useMemo(() => {
    return transactions.filter((t) => {
      // Week filter
      if (activeWeek) {
        if (t.txn_date < activeWeek.startDate || t.txn_date > activeWeek.endDate) {
          return false;
        }
      }

      // Eligibility filter
      const eligible = isEligibleTransaction(t);
      if (eligibilityFilter === 'eligible' && !eligible) return false;
      if (eligibilityFilter === 'excluded' && eligible) return false;

      // Category filter
      if (categoryFilter !== 'all' && t.main_category !== categoryFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchMerchant = t.merchant_name.toLowerCase().includes(q);
        const matchCategory = t.main_category.toLowerCase().includes(q);
        const matchSub = t.sub_category.toLowerCase().includes(q);
        const matchPerson = t.person_name?.toLowerCase().includes(q);
        if (!matchMerchant && !matchCategory && !matchSub && !matchPerson) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, activeWeek, eligibilityFilter, categoryFilter, searchQuery]);

  // Category Icon Resolver
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food & Dining':
        return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'Groceries':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'Transportation':
        return <Bus className="w-4 h-4 text-blue-500" />;
      case 'Entertainment':
        return <Film className="w-4 h-4 text-purple-500" />;
      case 'Shopping':
        return <ShoppingBag className="w-4 h-4 text-pink-500" />;
      case 'Personal Care':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'Rent':
        return <Home className="w-4 h-4 text-amber-600" />;
      case 'Self Transfers':
      case 'Lend':
      case 'Borrow':
        return <ArrowRightLeft className="w-4 h-4 text-slate-500" />;
      default:
        return <Building className="w-4 h-4 text-slate-500" />;
    }
  };

  // Payment Mode Badge
  const getPaymentModeBadge = (mode: string) => {
    switch (mode) {
      case 'UPI':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            <QrCode className="w-3 h-3" /> UPI
          </span>
        );
      case 'Card':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
            <CreditCard className="w-3 h-3" /> Card
          </span>
        );
      case 'Cash':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
            <Banknote className="w-3 h-3" /> Cash
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
            {mode}
          </span>
        );
    }
  };

  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-subtle">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Transaction Breakdown</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
              {filteredTxns.length} records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full audit log of student expenses. Toggle filters to inspect eligible debits vs excluded fixed commitments.
          </p>
        </div>

        <button
          onClick={onOpenAddTxn}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm active:scale-95"
        >
          <span>+ Add Transaction</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 my-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search merchant, item, canteen, Blinkit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Filter Badges & Week Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Week Selector */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
            <button
              onClick={() => onSelectWeek(null)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                selectedWeekIndex === null
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Weeks
            </button>
            {weeks.map((w) => (
              <button
                key={w.weekCode}
                onClick={() => onSelectWeek(w.weekIndex)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  selectedWeekIndex === w.weekIndex
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {w.weekCode}
              </button>
            ))}
          </div>

          {/* Eligibility Filter */}
          <select
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value as any)}
            className="text-xs font-semibold px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
            aria-label="Filter transactions by eligibility"
          >
            <option value="all">All Spending</option>
            <option value="eligible">Only Flexible Debits</option>
            <option value="excluded">Only Excluded (Rent/Transfers)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
            aria-label="Filter transactions by category"
          >
            <option value="all">All Categories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
        {filteredTxns.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-slate-600">No transactions match your criteria</p>
            <p className="text-xs mt-1">Try clearing search or filters.</p>
          </div>
        ) : (
          filteredTxns.map((tx) => {
            const isEligible = isEligibleTransaction(tx);

            return (
              <div
                key={tx.txn_id}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
              >
                {/* Left: Category Icon, Merchant & Details */}
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    {getCategoryIcon(tx.main_category)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {tx.merchant_name}
                      </span>
                      {getPaymentModeBadge(tx.payment_mode)}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-medium text-slate-700">{tx.main_category}</span>
                      <span>•</span>
                      <span>{tx.sub_category}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{formatDateLabel(tx.txn_date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Eligibility Status */}
                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto">
                  {/* Eligibility Reason Badge */}
                  {isEligible ? (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                      title="Counts towards weekly flexible budget"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Flexible Debit</span>
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200"
                      title={
                        tx.main_category === 'Rent'
                          ? 'Fixed PG Rent commitment (outside flexible budget)'
                          : 'Excluded non-flexible outflow (avoids double counting)'
                      }
                    >
                      <XCircle className="w-3 h-3 text-slate-400" />
                      <span>{tx.main_category === 'Rent' ? 'Fixed Rent' : 'Excluded'}</span>
                    </span>
                  )}

                  {/* Amount */}
                  <div className="text-right">
                    <span
                      className={`text-base font-extrabold ${
                        isEligible ? 'text-slate-900' : 'text-slate-400 line-through decoration-slate-300'
                      }`}
                    >
                      {formatINR(tx.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {tx.txn_time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Audit Summary */}
      <div className="mt-4 pt-3 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <span>
          Showing {filteredTxns.length} of {transactions.length} total transactions
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Eligible for Weekly Limit
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> Excluded (Rent / Transfers)
          </span>
        </div>
      </div>
    </section>
  );
};
