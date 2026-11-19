#!/usr/bin/env python3
"""
Verification script for simplified Nance Weekly Wins SQLite database and calculations
"""
import sqlite3
import os

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "..", "nance_weekly_wins.db")

ELIGIBLE_CATEGORIES = {
    'Food & Dining', 'Groceries', 'Shopping', 'Bills', 'Travel',
    'Transportation', 'Fuel / EV Charging', 'Entertainment',
    'Subscriptions', 'Housing & Utilities', 'Personal Care',
    'Hospitals & Pharmacy', 'Fitness & Wellness', 'Education',
    'Gifts & Donations', 'Electronics', 'Insurance Premiums', 'EMIs & Loans', 'General Merchandise'
}

def verify_database():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # 1. Verify Monthly Budget
    cursor.execute("SELECT amount FROM budgets WHERE period_type = 'monthly'")
    monthly_budget = cursor.fetchone()[0]
    assert monthly_budget == 10000.0, f"Expected monthly budget 10000, got {monthly_budget}"

    # 2. Verify 4 Weekly Budgets
    cursor.execute("SELECT week_index, amount, from_date, to_date, is_completed FROM budgets WHERE period_type = 'weekly' ORDER BY week_index")
    weekly_rows = cursor.fetchall()
    assert len(weekly_rows) == 4, f"Expected 4 weekly budgets, got {len(weekly_rows)}"

    total_weekly_allocated = sum(r[1] for r in weekly_rows)
    assert total_weekly_allocated <= monthly_budget, "Weekly allocations exceed monthly budget"

    # 3. Calculate Week 1 Spending using eligible debits
    w1_start, w1_end = weekly_rows[0][2], weekly_rows[0][3]
    cursor.execute("""
        SELECT COALESCE(SUM(amount), 0.0) FROM transactions
        WHERE transaction_type = 'debit'
          AND txn_date >= ? AND txn_date <= ?
          AND main_category IN ({})
    """.format(','.join('?' for _ in ELIGIBLE_CATEGORIES)), (w1_start, w1_end, *ELIGIBLE_CATEGORIES))
    w1_spent = cursor.fetchone()[0]

    # Week 1 should be 1,600 spent on 2,000 budget
    assert w1_spent == 1600.0, f"Expected Week 1 spending 1600.0, got {w1_spent}"
    w1_diff = weekly_rows[0][1] - w1_spent
    w1_pct = round((w1_diff / weekly_rows[0][1]) * 100)
    assert w1_diff == 400.0, f"Expected 400 under budget, got {w1_diff}"
    assert w1_pct == 20, f"Expected 20% under budget, got {w1_pct}"

    # 4. Excluded transactions count
    cursor.execute("""
        SELECT COUNT(*) FROM transactions
        WHERE main_category IN ('Credit Card Settlements', 'Cash Withdrawals', 'Self Transfers', 'Lend')
    """)
    excluded_count = cursor.fetchone()[0]
    assert excluded_count == 4, f"Expected 4 excluded transactions, got {excluded_count}"

    conn.close()
    print("ALL SIMPLIFIED CALCULATIONS VERIFIED AGAINST SQLITE DATABASE SUCCESSFULLY!")

if __name__ == "__main__":
    verify_database()
