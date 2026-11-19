#!/usr/bin/env python3
"""
Nance Weekly Wins - Simplified Synthetic Data Generator
Generates clean SQLite database and JSON export for user-controlled weekly & monthly budgeting.
Zero hardcoded personas, rent, or fixed allowances.
"""

import sqlite3
import json
import os
from datetime import datetime

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "..", "nance_weekly_wins.db")
JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "mockData.json")
PUBLIC_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "data", "mockData.json")

def init_db(cursor):
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        joined_on TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS budgets (
        budget_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        main_category TEXT NOT NULL,
        period_type TEXT NOT NULL,
        week_index INTEGER,
        amount REAL NOT NULL,
        from_date TEXT NOT NULL,
        to_date TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        txn_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        txn_date TEXT NOT NULL,
        txn_time TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_type TEXT NOT NULL,
        payment_mode TEXT NOT NULL,
        main_category TEXT NOT NULL,
        sub_category TEXT,
        merchant_name TEXT,
        person_name TEXT,
        source TEXT,
        arrived_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS app_activity (
        activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
    """)

def generate_data():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    for table in ["transactions", "budgets", "app_activity", "users"]:
        cursor.execute(f"DROP TABLE IF EXISTS {table};")

    init_db(cursor)

    # 1. Default User
    user_id = "user_demo"
    user_name = "Alex"
    cursor.execute("INSERT INTO users (user_id, name, joined_on) VALUES (?, ?, ?)",
                   (user_id, user_name, "2026-10-01"))

    # 2. Budgets: 1 Monthly Budget + 4 Weekly Budgets
    # Month: October 2026 (₹10,000)
    cursor.execute("""
        INSERT INTO budgets (budget_id, user_id, main_category, period_type, week_index, amount, from_date, to_date, is_completed)
        VALUES ('bgt_monthly', ?, 'All Expenses', 'monthly', NULL, 10000.0, '2026-10-01', '2026-10-28', 0)
    """, (user_id,))

    # 4 Weekly Budgets (User editable, example starting values: 2000, 2500, 2000, 2500)
    weekly_defs = [
        (1, 2000.0, "2026-10-01", "2026-10-07", 1, "2026-10-07T21:30:00"), # Week 1 already completed in demo
        (2, 2500.0, "2026-10-08", "2026-10-14", 0, None),
        (3, 2000.0, "2026-10-15", "2026-10-21", 0, None),
        (4, 2500.0, "2026-10-22", "2026-10-28", 0, None),
    ]

    for w_idx, amt, s_date, e_date, completed, comp_at in weekly_defs:
        cursor.execute("""
            INSERT INTO budgets (budget_id, user_id, main_category, period_type, week_index, amount, from_date, to_date, is_completed, completed_at)
            VALUES (?, ?, 'Flexible Spending', 'weekly', ?, ?, ?, ?, ?, ?)
        """, (f"bgt_w{w_idx}", user_id, w_idx, amt, s_date, e_date, completed, comp_at))

    # 3. Realistic Demo Transactions Across Categories
    # Week 1 (Oct 1 - Oct 7): ₹1,600 spent on ₹2,000 budget -> ₹400 under budget (20% Weekly Win!)
    # Categories: Food & Dining (450), Groceries (500), Transportation (200), Shopping (150), Entertainment (100), Bills (200) -> 1,600
    txns = [
        # Week 1 (Oct 1 - Oct 7)
        ("tx_01", "2026-10-01", "12:30:00", 40.0, "debit", "UPI", "Food & Dining", "Tea & Snacks", "Chai Point", "SMS"),
        ("tx_02", "2026-10-02", "18:00:00", 250.0, "debit", "UPI", "Groceries", "Fresh Vegetables", "Blinkit", "UPI Notification"),
        ("tx_03", "2026-10-03", "09:15:00", 60.0, "debit", "UPI", "Transportation", "Metro Commute", "Namma Metro", "SMS"),
        ("tx_04", "2026-10-03", "20:00:00", 410.0, "debit", "UPI", "Food & Dining", "Dinner with Friends", "Meghana Biryani", "SMS"),
        ("tx_05", "2026-10-04", "16:20:00", 250.0, "debit", "UPI", "Groceries", "Dairy & Essentials", "Zepto", "UPI Notification"),
        ("tx_06", "2026-10-05", "14:00:00", 140.0, "debit", "UPI", "Transportation", "Cab Ride", "Uber", "SMS"),
        ("tx_07", "2026-10-06", "11:30:00", 150.0, "debit", "Card", "Shopping", "Stationery & Notebooks", "Crossword Books", "Bank Feed"),
        ("tx_08", "2026-10-06", "19:45:00", 100.0, "debit", "UPI", "Entertainment", "Movie Snacks", "PVR Cinemas", "SMS"),
        ("tx_09", "2026-10-07", "10:00:00", 200.0, "debit", "UPI", "Bills", "Broadband Recharge", "Airtel Fiber", "Bank Feed"),

        # Week 2 (Oct 8 - Oct 14): Current active week in demo. Currently ₹1,400 spent on ₹2,500 budget (₹1,100 remaining)
        ("tx_10", "2026-10-08", "13:00:00", 180.0, "debit", "UPI", "Food & Dining", "Lunch Bowl", "EatFit", "SMS"),
        ("tx_11", "2026-10-09", "17:30:00", 520.0, "debit", "UPI", "Groceries", "Weekly Pantry", "Nature Basket", "SMS"),
        ("tx_12", "2026-10-10", "09:00:00", 80.0, "debit", "UPI", "Transportation", "Auto Ride", "Namma Yatri", "SMS"),
        ("tx_13", "2026-10-11", "15:00:00", 350.0, "debit", "Card", "Shopping", "T-shirt & Socks", "Decathlon", "Bank Feed"),
        ("tx_14", "2026-10-12", "18:45:00", 120.0, "debit", "UPI", "Personal Care", "Pharmacy Supplies", "Apollo Pharmacy", "SMS"),
        ("tx_15", "2026-10-13", "20:00:00", 150.0, "debit", "UPI", "Entertainment", "Music Subscription", "Spotify India", "Bank Feed"),

        # Excluded Transactions to test transparent rules & filtering
        ("tx_ex_1", "2026-10-04", "11:00:00", 1500.0, "debit", "Net Banking", "Credit Card Settlements", "Card Payment", "HDFC Bank Credit Card", "Bank Feed"),
        ("tx_ex_2", "2026-10-05", "15:30:00", 1000.0, "debit", "Cash", "Cash Withdrawals", "ATM Outflow", "SBI ATM", "Bank Feed"),
        ("tx_ex_3", "2026-10-10", "12:00:00", 500.0, "debit", "UPI", "Self Transfers", "Wallet Topup", "Paytm Wallet", "Bank Feed"),
        ("tx_ex_4", "2026-10-12", "16:00:00", 400.0, "debit", "UPI", "Lend", "Split for Dinner", "Friend UPI", "SMS"),
    ]

    for tx in txns:
        cursor.execute("""
            INSERT INTO transactions
            (txn_id, user_id, txn_date, txn_time, amount, transaction_type, payment_mode, main_category, sub_category, merchant_name, source, arrived_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (tx[0], user_id, tx[1], tx[2], tx[3], tx[4], tx[5], tx[6], tx[7], tx[8], tx[9], f"{tx[1]}T{tx[2]}"))

    conn.commit()
    print("Database populated successfully in:", DATABASE_PATH)

    # 4. JSON Export
    cursor.execute("SELECT budget_id, period_type, week_index, amount, from_date, to_date, is_completed, completed_at FROM budgets WHERE user_id = ?", (user_id,))
    budgets_data = [
        {
            "budget_id": r[0],
            "user_id": user_id,
            "period_type": r[1],
            "week_index": r[2],
            "amount": r[3],
            "from_date": r[4],
            "to_date": r[5],
            "is_completed": bool(r[6]),
            "completed_at": r[7],
        }
        for r in cursor.fetchall()
    ]

    cursor.execute("""
        SELECT txn_id, txn_date, txn_time, amount, transaction_type, payment_mode, main_category, sub_category, merchant_name, source, arrived_at
        FROM transactions WHERE user_id = ? ORDER BY txn_date ASC, txn_time ASC
    """, (user_id,))
    txns_data = [
        {
            "txn_id": r[0],
            "user_id": user_id,
            "txn_date": r[1],
            "txn_time": r[2],
            "amount": r[3],
            "transaction_type": r[4],
            "payment_mode": r[5],
            "main_category": r[6],
            "sub_category": r[7],
            "merchant_name": r[8],
            "source": r[9],
            "arrived_at": r[10],
        }
        for r in cursor.fetchall()
    ]

    export_obj = {
        "user": {
            "user_id": user_id,
            "name": user_name,
            "joined_on": "2026-10-01"
        },
        "monthly_budget": 10000.0,
        "weekly_budgets": [b for b in budgets_data if b["period_type"] == "weekly"],
        "transactions": txns_data,
    }

    os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)
    os.makedirs(os.path.dirname(PUBLIC_JSON_PATH), exist_ok=True)

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(export_obj, f, indent=2)
    print("Exported JSON data to:", JSON_PATH)

    with open(PUBLIC_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(export_obj, f, indent=2)
    print("Exported JSON data to:", PUBLIC_JSON_PATH)

    conn.close()

if __name__ == "__main__":
    generate_data()
