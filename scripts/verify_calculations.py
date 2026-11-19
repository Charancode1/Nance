#!/usr/bin/env python3
"""
Unit and integration verification for Weekly Wins calculation engine in Python
"""
import sqlite3
import os

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "..", "nance_weekly_wins.db")

def test_aarav_calculations():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # Verify user profile
    cursor.execute("""
        SELECT monthly_allowance, fixed_rent, monthly_savings_target
        FROM user_financial_profile WHERE user_id = 'usr_aarav_01'
    """)
    allowance, rent, savings_target = cursor.fetchone()
    assert allowance == 10000.0, f"Expected 10000, got {allowance}"
    assert rent == 5000.0, f"Expected 5000, got {rent}"
    assert savings_target == 500.0, f"Expected 500, got {savings_target}"

    flexible_monthly_pool = allowance - rent
    assert flexible_monthly_pool == 5000.0, f"Expected 5000 flexible pool, got {flexible_monthly_pool}"

    # Verify weekly calculations
    cursor.execute("""
        SELECT week_start, week_end, budget_amount, actual_spending, under_budget_amount, status
        FROM weekly_budget_progress
        WHERE user_id = 'usr_aarav_01'
        ORDER BY week_start
    """)
    rows = cursor.fetchall()

    expected_weeks = [
        ("2026-10-01", "2026-10-07", 1000.0, 900.0, 100.0, "within_budget"),
        ("2026-10-08", "2026-10-14", 1000.0, 1050.0, -50.0, "above_budget"),
        ("2026-10-15", "2026-10-21", 1000.0, 800.0, 200.0, "within_budget"),
        ("2026-10-22", "2026-10-28", 1000.0, 850.0, 150.0, "within_budget"),
    ]

    total_actual = 0.0
    total_budget = 0.0

    for i, exp in enumerate(expected_weeks):
        actual_row = rows[i]
        assert actual_row[0] == exp[0], f"Week {i+1} start mismatch"
        assert actual_row[1] == exp[1], f"Week {i+1} end mismatch"
        assert actual_row[2] == exp[2], f"Week {i+1} budget mismatch: expected {exp[2]}, got {actual_row[2]}"
        assert actual_row[3] == exp[3], f"Week {i+1} actual mismatch: expected {exp[3]}, got {actual_row[3]}"
        assert actual_row[4] == exp[4], f"Week {i+1} under_budget mismatch: expected {exp[4]}, got {actual_row[4]}"
        assert actual_row[5] == exp[5], f"Week {i+1} status mismatch: expected {exp[5]}, got {actual_row[5]}"
        total_budget += actual_row[2]
        total_actual += actual_row[3]

    # Verify cumulative monthly calculations
    monthly_under_budget = total_budget - total_actual
    perf_pct = (monthly_under_budget / total_budget) * 100.0

    assert total_budget == 4000.0, f"Expected 4000, got {total_budget}"
    assert total_actual == 3600.0, f"Expected 3600, got {total_actual}"
    assert monthly_under_budget == 400.0, f"Expected 400, got {monthly_under_budget}"
    assert abs(perf_pct - 10.0) < 1e-5, f"Expected 10.0%, got {perf_pct}%"

    # Verify excluded transactions: Rent, Cash withdrawal, Self transfer, Card bill settlement, Lend
    cursor.execute("""
        SELECT COUNT(*) FROM transactions
        WHERE user_id = 'usr_aarav_01' AND main_category IN ('Rent', 'Cash Withdrawals', 'Self Transfers', 'Credit Card Settlements', 'Lend')
    """)
    excluded_count = cursor.fetchone()[0]
    assert excluded_count == 5, f"Expected 5 excluded transactions for Aarav, found {excluded_count}"

    conn.close()
    print("ALL AARAV SHARMA CALCULATIONS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_aarav_calculations()
