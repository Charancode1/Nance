#!/usr/bin/env python3
"""
Nance Weekly Wins - Synthetic Data Generator
Generates realistic SQLite database and JSON export for Indian college students living in PGs/hostels.
Demonstrates:
- Fixed rent vs flexible weekly spending
- 4 weeks with weekly wins, overspending, and cumulative recovery
- Eligible debits vs excluded non-flexible transactions (rent, transfers, investments, settlements)
"""

import sqlite3
import json
import os
from datetime import datetime, date

DATABASE_PATH = os.path.join(os.path.dirname(__file__), "..", "nance_weekly_wins.db")
JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "mockData.json")
PUBLIC_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "data", "mockData.json")

def init_db(cursor):
    # Base tables from prompt specification
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        joined_on TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_financial_profile (
        user_id TEXT PRIMARY KEY,
        life_stage TEXT NOT NULL,
        living_arrangement TEXT NOT NULL,
        monthly_allowance REAL NOT NULL,
        fixed_rent REAL NOT NULL,
        monthly_savings_target REAL NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS budgets (
        budget_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        main_category TEXT NOT NULL,
        period_type TEXT NOT NULL,
        amount REAL NOT NULL,
        from_date TEXT NOT NULL,
        to_date TEXT NOT NULL,
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
        sub_category TEXT NOT NULL,
        merchant_name TEXT NOT NULL,
        person_name TEXT,
        source TEXT NOT NULL,
        arrived_at TEXT NOT NULL,
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

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS weekly_budget_progress (
        progress_id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        week_start TEXT NOT NULL,
        week_end TEXT NOT NULL,
        budget_amount REAL NOT NULL,
        actual_spending REAL NOT NULL,
        under_budget_amount REAL NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
    """)

def generate_data():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # Drop existing tables to have fresh seed
    for table in ["weekly_budget_progress", "app_activity", "transactions", "budgets", "user_financial_profile", "users"]:
        cursor.execute(f"DROP TABLE IF EXISTS {table};")

    init_db(cursor)

    # 1. Users
    users = [
        {
            "user_id": "usr_aarav_01",
            "name": "Aarav Sharma",
            "city": "Bengaluru",
            "joined_on": "2026-08-10",
            "profile": {
                "life_stage": "Engineering Student (3rd Year, PES Univ)",
                "living_arrangement": "PG in Koramangala (Twin Sharing)",
                "monthly_allowance": 10000.0,
                "fixed_rent": 5000.0,
                "monthly_savings_target": 500.0,
                "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
                "tagline": "The Canonical Recovery Journey: Overspent in W2, disciplined recovery in W3 & W4!"
            }
        },
        {
            "user_id": "usr_sneha_02",
            "name": "Sneha Patel",
            "city": "Pune",
            "joined_on": "2026-07-01",
            "profile": {
                "life_stage": "Design Student (Symbiosis Institute)",
                "living_arrangement": "Girls PG in Viman Nagar",
                "monthly_allowance": 9000.0,
                "fixed_rent": 4500.0,
                "monthly_savings_target": 600.0,
                "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
                "tagline": "Consistent Disciplined Saver: 4 out of 4 Weekly Wins achieved!"
            }
        },
        {
            "user_id": "usr_rohan_03",
            "name": "Rohan Verma",
            "city": "New Delhi",
            "joined_on": "2026-09-01",
            "profile": {
                "life_stage": "Law Student (Delhi University)",
                "living_arrangement": "North Campus Hostel",
                "monthly_allowance": 12000.0,
                "fixed_rent": 6000.0,
                "monthly_savings_target": 800.0,
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
                "tagline": "Weekend Fest Overspender: Recovered by cooking at hostel in Week 3 & 4."
            }
        },
        {
            "user_id": "usr_ananya_04",
            "name": "Ananya Iyer",
            "city": "Chennai",
            "joined_on": "2026-08-20",
            "profile": {
                "life_stage": "Medical Intern (SRM Hospital)",
                "living_arrangement": "PG in Kattankulathur",
                "monthly_allowance": 11000.0,
                "fixed_rent": 5500.0,
                "monthly_savings_target": 500.0,
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                "tagline": "Unplanned Essential Spending: Managed emergency medicine costs without guilt."
            }
        }
    ]

    for u in users:
        cursor.execute(
            "INSERT INTO users (user_id, name, city, joined_on) VALUES (?, ?, ?, ?)",
            (u["user_id"], u["name"], u["city"], u["joined_on"])
        )
        p = u["profile"]
        cursor.execute(
            """INSERT INTO user_financial_profile 
               (user_id, life_stage, living_arrangement, monthly_allowance, fixed_rent, monthly_savings_target) 
               VALUES (?, ?, ?, ?, ?, ?)""",
            (u["user_id"], p["life_stage"], p["living_arrangement"], p["monthly_allowance"], p["fixed_rent"], p["monthly_savings_target"])
        )

    # 2. Budgets (4 Weekly Budgets for October 2026)
    # Week 1: 2026-10-01 to 2026-10-07
    # Week 2: 2026-10-08 to 2026-10-14
    # Week 3: 2026-10-15 to 2026-10-21
    # Week 4: 2026-10-22 to 2026-10-28
    
    weeks = [
        ("W1", "2026-10-01", "2026-10-07"),
        ("W2", "2026-10-08", "2026-10-14"),
        ("W3", "2026-10-15", "2026-10-21"),
        ("W4", "2026-10-22", "2026-10-28"),
    ]

    budget_amounts = {
        "usr_aarav_01": [1000.0, 1000.0, 1000.0, 1000.0],
        "usr_sneha_02": [900.0, 900.0, 900.0, 900.0],
        "usr_rohan_03": [1200.0, 1200.0, 1200.0, 1200.0],
        "usr_ananya_04": [1100.0, 1100.0, 1100.0, 1100.0],
    }

    for user_id, b_list in budget_amounts.items():
        for idx, (w_code, start_d, end_d) in enumerate(weeks):
            b_id = f"bgt_{user_id}_{w_code}"
            cursor.execute(
                """INSERT INTO budgets (budget_id, user_id, main_category, period_type, amount, from_date, to_date)
                   VALUES (?, ?, 'Flexible Spending', 'weekly', ?, ?, ?)""",
                (b_id, user_id, b_list[idx], start_d, end_d)
            )

    # 3. Transactions for Aarav Sharma (Primary User)
    # Target totals per prompt specification:
    # Week 1: Budget ₹1,000, Actual: ₹900 (Under: ₹100, 10% under budget)
    # Week 2: Budget ₹1,000, Actual: ₹1,050 (Over: ₹50, Above budget)
    # Week 3: Budget ₹1,000, Actual: ₹800 (Under: ₹200, 20% under budget - RECOVERED!)
    # Week 4: Budget ₹1,000, Actual: ₹850 (Under: ₹150, 15% under budget - FINISHED STRONG!)
    # Total Spending = ₹900 + ₹1,050 + ₹800 + ₹850 = ₹3,600
    # Total Budget = ₹4,000
    # Amount under budget = ₹400 (10% under budget!)
    #
    # Also includes EXCLUDED transactions:
    # - Fixed Rent ₹5,000
    # - Cash Withdrawal ₹1,000
    # - Self Transfer ₹500
    # - Credit Card Bill Settlement ₹1,200
    # - Lend to Friend ₹300

    aarav_txns = [
        # Rent (EXCLUDED from weekly flexible spending)
        ("tx_a_000", "2026-10-01", "09:00:00", 5000.0, "debit", "UPI", "Rent", "PG Accommodation", "Greenwood Stays Landlord", "Mr. Venkatesh", "Bank Feed", "2026-10-01T09:00:15"),

        # Week 1 (Oct 1 - Oct 7): Total Eligible = ₹900
        ("tx_a_101", "2026-10-01", "13:30:00", 90.0, "debit", "UPI", "Food & Dining", "College Canteen", "PES University Canteen", "Ramesh Canteen", "SMS", "2026-10-01T13:31:00"),
        ("tx_a_102", "2026-10-02", "18:15:00", 240.0, "debit", "UPI", "Groceries", "Instant Grocery", "Blinkit", "Blinkit Quick", "UPI Notification", "2026-10-02T18:15:20"),
        ("tx_a_103", "2026-10-03", "08:45:00", 40.0, "debit", "UPI", "Transportation", "Auto Rickshaw", "Namma Yatri Auto", "Manjunath Auto", "SMS", "2026-10-03T08:45:10"),
        ("tx_a_104", "2026-10-04", "20:00:00", 280.0, "debit", "UPI", "Food & Dining", "Dinner Delivery", "Swiggy", "Meghana Foods", "SMS", "2026-10-04T20:01:00"),
        ("tx_a_105", "2026-10-05", "16:20:00", 25.0, "debit", "UPI", "Food & Dining", "Tea & Snacks", "Chai Point Koramangala", "Chai Counter", "UPI Notification", "2026-10-05T16:20:30"),
        ("tx_a_106", "2026-10-06", "11:00:00", 145.0, "debit", "Card", "Shopping", "Stationery & Notes", "Sapna Book House", "Cashier 02", "Bank Feed", "2026-10-06T11:05:00"),
        ("tx_a_107", "2026-10-07", "19:10:00", 80.0, "debit", "UPI", "Transportation", "Metro Card Recharge", "BMRCL Metro", "Namma Metro", "SMS", "2026-10-07T19:11:00"),
        # Week 1 Excluded: Cash withdrawal (ATM)
        ("tx_a_108", "2026-10-05", "12:00:00", 1000.0, "debit", "Cash", "Cash Withdrawals", "ATM Outflow", "SBI ATM 5th Block", None, "Bank Feed", "2026-10-05T12:01:00"),

        # Week 2 (Oct 8 - Oct 14): Total Eligible = ₹1,050 (Over budget by ₹50)
        ("tx_a_201", "2026-10-08", "13:00:00", 120.0, "debit", "UPI", "Food & Dining", "Lunch", "Udupi Park Hotel", "Udupi Cashier", "SMS", "2026-10-08T13:02:00"),
        ("tx_a_202", "2026-10-09", "17:45:00", 310.0, "debit", "UPI", "Groceries", "Snacks & Milk", "Zepto", "Zepto Hub 12", "UPI Notification", "2026-10-09T17:46:00"),
        ("tx_a_203", "2026-10-10", "21:30:00", 350.0, "debit", "UPI", "Food & Dining", "Weekend Burger & Fries", "Zomato", "Truffles Koramangala", "SMS", "2026-10-10T21:32:00"),
        ("tx_a_204", "2026-10-12", "15:20:00", 180.0, "debit", "UPI", "Entertainment", "Movie ticket (student deal)", "BookMyShow", "PVR Forum Mall", "SMS", "2026-10-12T15:21:00"),
        ("tx_a_205", "2026-10-13", "19:00:00", 50.0, "debit", "UPI", "Transportation", "Auto Rickshaw", "Rapido Auto", "Suresh Rapido", "UPI Notification", "2026-10-13T19:01:00"),
        ("tx_a_206", "2026-10-14", "20:30:00", 40.0, "debit", "UPI", "Food & Dining", "Evening Roll", "Tibetan Momos Stall", "Stall Owner", "Manual", "2026-10-14T20:31:00"),
        # Week 2 Excluded: Self transfer to Paytm Wallet
        ("tx_a_207", "2026-10-12", "10:00:00", 500.0, "debit", "UPI", "Self Transfers", "Wallet Top-up", "Paytm Payments Bank", "Aarav Sharma", "Bank Feed", "2026-10-12T10:00:10"),

        # Week 3 (Oct 15 - Oct 21): Total Eligible = ₹800 (Mindful Recovery! Under by ₹200)
        ("tx_a_301", "2026-10-15", "12:45:00", 80.0, "debit", "UPI", "Food & Dining", "Mess Thali Extra", "Annapoorna Mess", "Mess Counter", "SMS", "2026-10-15T12:46:00"),
        ("tx_a_302", "2026-10-16", "18:00:00", 220.0, "debit", "UPI", "Groceries", "Fruits & Oats", "Fresh Mart Koramangala", "Fresh Mart Cashier", "SMS", "2026-10-16T18:01:00"),
        ("tx_a_303", "2026-10-17", "09:15:00", 45.0, "debit", "UPI", "Transportation", "Metro Token", "BMRCL Metro", "Namma Metro", "SMS", "2026-10-17T09:16:00"),
        ("tx_a_304", "2026-10-18", "14:10:00", 110.0, "debit", "UPI", "Food & Dining", "College Canteen Meals", "PES Canteen", "Ramesh", "UPI Notification", "2026-10-18T14:11:00"),
        ("tx_a_305", "2026-10-19", "16:30:00", 165.0, "debit", "Card", "Personal Care", "Haircut & Grooming", "Green Trends Salon", "Salon Desk", "Bank Feed", "2026-10-19T16:35:00"),
        ("tx_a_306", "2026-10-20", "20:00:00", 150.0, "debit", "UPI", "Food & Dining", "Dinner with Roommate", "Empire Restaurant", "Empire Counter", "SMS", "2026-10-20T20:02:00"),
        ("tx_a_307", "2026-10-21", "17:00:00", 30.0, "debit", "UPI", "Food & Dining", "Chai & Biscuit", "Chai Point", "Counter", "UPI Notification", "2026-10-21T17:01:00"),
        # Week 3 Excluded: Lend to friend + Credit Card Bill settlement
        ("tx_a_308", "2026-10-18", "16:00:00", 300.0, "debit", "UPI", "Lend", "Split for Router", "Nikhil Kumar", "Nikhil Kumar", "Manual", "2026-10-18T16:00:30"),
        ("tx_a_309", "2026-10-20", "11:00:00", 1200.0, "debit", "Net Banking", "Credit Card Settlements", "Card Repayment", "HDFC Credit Cards", None, "Bank Feed", "2026-10-20T11:01:00"),

        # Week 4 (Oct 22 - Oct 28): Total Eligible = ₹850 (Strong Finish! Under by ₹150)
        ("tx_a_401", "2026-10-22", "13:10:00", 95.0, "debit", "UPI", "Food & Dining", "Canteen Special Dosa", "PES Canteen", "Ramesh", "SMS", "2026-10-22T13:11:00"),
        ("tx_a_402", "2026-10-23", "17:30:00", 260.0, "debit", "UPI", "Groceries", "Biscuits & Milk Pack", "Zepto", "Zepto Bangalore", "UPI Notification", "2026-10-23T17:31:00"),
        ("tx_a_403", "2026-10-24", "19:00:00", 75.0, "debit", "UPI", "Transportation", "Auto Rickshaw", "Namma Yatri", "Kiran Auto", "SMS", "2026-10-24T19:01:00"),
        ("tx_a_404", "2026-10-25", "20:15:00", 220.0, "debit", "UPI", "Food & Dining", "Shawarma & Juice", "Al-Amanah Cafe", "Cafe Cashier", "SMS", "2026-10-25T20:16:00"),
        ("tx_a_405", "2026-10-26", "15:40:00", 50.0, "debit", "UPI", "Shopping", "Photocopy & Assignment Print", "Campus Xerox Shop", "Printer Desk", "Manual", "2026-10-26T15:41:00"),
        ("tx_a_406", "2026-10-27", "11:20:00", 110.0, "debit", "UPI", "Personal Care", "Soap, Toothpaste & Dettol", "Apollo Pharmacy", "Apollo Koramangala", "SMS", "2026-10-27T11:22:00"),
        ("tx_a_407", "2026-10-28", "21:00:00", 40.0, "debit", "UPI", "Food & Dining", "Ice Cream Celebration", "Corner House Ice Cream", "Billing Counter", "UPI Notification", "2026-10-28T21:02:00"),
    ]

    for tx in aarav_txns:
        cursor.execute(
            """INSERT INTO transactions 
               (txn_id, user_id, txn_date, txn_time, amount, transaction_type, payment_mode, 
                main_category, sub_category, merchant_name, person_name, source, arrived_at)
               VALUES (?, 'usr_aarav_01', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            tx
        )

    # 4. Generate transactions for Sneha, Rohan, Ananya
    # Sneha: Consistent Saver (W1: 780, W2: 820, W3: 750, W4: 810) - Total: 3160 vs Budget 3600 (Under by 440)
    sneha_txns = [
        ("tx_s_000", "2026-10-01", "09:30:00", 4500.0, "debit", "UPI", "Rent", "Hostel Room Fee", "Viman Girls PG", "Mrs. Kulkarni", "Bank Feed", "2026-10-01T09:30:15"),
        ("tx_s_101", "2026-10-02", "13:00:00", 350.0, "debit", "UPI", "Groceries", "Weekly Healthy Groceries", "Blinkit", "Blinkit Pune", "SMS", "2026-10-02T13:01:00"),
        ("tx_s_102", "2026-10-04", "19:00:00", 250.0, "debit", "UPI", "Food & Dining", "Cafe Salad & Coffee", "Cafe Peter", "Peter Cashier", "SMS", "2026-10-04T19:02:00"),
        ("tx_s_103", "2026-10-06", "11:00:00", 180.0, "debit", "UPI", "Transportation", "Auto rides", "Uber Auto", "Driver", "UPI Notification", "2026-10-06T11:01:00"),

        ("tx_s_201", "2026-10-09", "14:00:00", 320.0, "debit", "UPI", "Groceries", "Fruits & Dairy", "Zepto", "Zepto Viman Nagar", "SMS", "2026-10-09T14:01:00"),
        ("tx_s_202", "2026-10-11", "20:00:00", 360.0, "debit", "Card", "Shopping", "Art sketchbook & pencils", "Venus Traders", "Venus Cashier", "Bank Feed", "2026-10-11T20:02:00"),
        ("tx_s_203", "2026-10-13", "16:00:00", 140.0, "debit", "UPI", "Food & Dining", "Snacks with friends", "Irani Cafe", "Irani Cashier", "SMS", "2026-10-13T16:01:00"),

        ("tx_s_301", "2026-10-16", "13:00:00", 280.0, "debit", "UPI", "Groceries", "Grocery essentials", "Instamart", "Swiggy Instamart", "SMS", "2026-10-16T13:01:00"),
        ("tx_s_302", "2026-10-18", "19:30:00", 320.0, "debit", "UPI", "Food & Dining", "Weekend dinner", "FC Road Social", "Social Billing", "SMS", "2026-10-18T19:31:00"),
        ("tx_s_303", "2026-10-20", "12:00:00", 150.0, "debit", "UPI", "Personal Care", "Skincare product", "Nykaa Store", "Nykaa Mall", "UPI Notification", "2026-10-20T12:01:00"),

        ("tx_s_401", "2026-10-23", "13:00:00", 290.0, "debit", "UPI", "Groceries", "Groceries", "Zepto", "Zepto", "SMS", "2026-10-23T13:01:00"),
        ("tx_s_402", "2026-10-25", "18:00:00", 340.0, "debit", "UPI", "Food & Dining", "Dinner treat", "Vaishali FC Road", "Vaishali Cashier", "SMS", "2026-10-25T18:01:00"),
        ("tx_s_403", "2026-10-27", "10:00:00", 180.0, "debit", "UPI", "Transportation", "Metro / Cab", "Uber", "Driver", "SMS", "2026-10-27T10:01:00"),
    ]

    for tx in sneha_txns:
        cursor.execute(
            """INSERT INTO transactions 
               (txn_id, user_id, txn_date, txn_time, amount, transaction_type, payment_mode, 
                main_category, sub_category, merchant_name, person_name, source, arrived_at)
               VALUES (?, 'usr_sneha_02', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            tx
        )

    # Rohan: W1: 1150 (Win), W2: 1550 (Over by 350 - College Fest), W3: 1100 (Win), W4: 950 (Win - Cooked at PG)
    rohan_txns = [
        ("tx_r_000", "2026-10-01", "10:00:00", 6000.0, "debit", "UPI", "Rent", "Hostel Fee", "North Campus PG", "Landlord", "Bank Feed", "2026-10-01T10:00:15"),
        ("tx_r_101", "2026-10-03", "14:00:00", 550.0, "debit", "UPI", "Food & Dining", "Hudson Lane Cafe", "Big Yellow Door", "Cashier", "SMS", "2026-10-03T14:01:00"),
        ("tx_r_102", "2026-10-05", "18:00:00", 350.0, "debit", "UPI", "Groceries", "Snacks for room", "Blinkit", "Blinkit Delhi", "SMS", "2026-10-05T18:01:00"),
        ("tx_r_103", "2026-10-07", "11:00:00", 250.0, "debit", "UPI", "Transportation", "Delhi Metro Smartcard", "DMRC Metro", "DMRC", "UPI Notification", "2026-10-07T11:01:00"),

        ("tx_r_201", "2026-10-09", "21:00:00", 850.0, "debit", "UPI", "Entertainment", "Concert Pass & Merchandise", "DU College Fest", "Fest Committee", "SMS", "2026-10-09T21:01:00"),
        ("tx_r_202", "2026-10-11", "22:00:00", 450.0, "debit", "UPI", "Food & Dining", "Late night pizza", "Domino's Pizza", "Dominos GTB Nagar", "SMS", "2026-10-11T22:01:00"),
        ("tx_r_203", "2026-10-13", "19:00:00", 250.0, "debit", "UPI", "Transportation", "Cabs post fest", "Uber", "Driver", "UPI Notification", "2026-10-13T19:01:00"),

        ("tx_r_301", "2026-10-16", "13:00:00", 400.0, "debit", "UPI", "Groceries", "Vegetables & Rice (Cooking in room)", "Kamla Nagar Kirana", "Kirana Uncle", "SMS", "2026-10-16T13:01:00"),
        ("tx_r_302", "2026-10-18", "19:00:00", 420.0, "debit", "UPI", "Food & Dining", "Thali at canteen", "Arts Faculty Mess", "Mess Head", "SMS", "2026-10-18T19:01:00"),
        ("tx_r_303", "2026-10-20", "12:00:00", 280.0, "debit", "UPI", "Transportation", "Metro travel", "DMRC Metro", "DMRC", "SMS", "2026-10-20T12:01:00"),

        ("tx_r_401", "2026-10-23", "14:00:00", 350.0, "debit", "UPI", "Groceries", "Basic food supplies", "Blinkit", "Blinkit", "SMS", "2026-10-23T14:01:00"),
        ("tx_r_402", "2026-10-25", "18:00:00", 320.0, "debit", "UPI", "Food & Dining", "Campus dhaba", "Tom Uncle Maggi Point", "Uncle", "SMS", "2026-10-25T18:01:00"),
        ("tx_r_403", "2026-10-27", "11:00:00", 280.0, "debit", "UPI", "Shopping", "Study materials", "Book Corner", "Shopkeeper", "UPI Notification", "2026-10-27T11:01:00"),
    ]

    for tx in rohan_txns:
        cursor.execute(
            """INSERT INTO transactions 
               (txn_id, user_id, txn_date, txn_time, amount, transaction_type, payment_mode, 
                main_category, sub_category, merchant_name, person_name, source, arrived_at)
               VALUES (?, 'usr_rohan_03', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            tx
        )

    # Ananya: W1: 920 (Win), W2: 1400 (Over by 300 due to Pharmacy / Medical need), W3: 890 (Win), W4: 910 (Win)
    ananya_txns = [
        ("tx_n_000", "2026-10-01", "10:00:00", 5500.0, "debit", "UPI", "Rent", "PG Rent", "Sri Balaji PG", "Owner", "Bank Feed", "2026-10-01T10:00:15"),
        ("tx_n_101", "2026-10-03", "13:00:00", 420.0, "debit", "UPI", "Groceries", "Supplies & snacks", "Zepto", "Zepto Chennai", "SMS", "2026-10-03T13:01:00"),
        ("tx_n_102", "2026-10-05", "19:00:00", 320.0, "debit", "UPI", "Food & Dining", "Hospital canteen dinner", "SRM Canteen", "Manager", "SMS", "2026-10-05T19:01:00"),
        ("tx_n_103", "2026-10-07", "11:00:00", 180.0, "debit", "UPI", "Transportation", "Auto to campus", "Fastrack Cabs", "Driver", "UPI Notification", "2026-10-07T11:01:00"),

        ("tx_n_201", "2026-10-09", "10:30:00", 680.0, "debit", "Card", "Personal Care", "Prescription & Antibiotics (Viral Flu)", "Apollo Pharmacy Kattankulathur", "Pharmacist", "Bank Feed", "2026-10-09T10:31:00"),
        ("tx_n_202", "2026-10-10", "15:00:00", 320.0, "debit", "UPI", "Groceries", "Electrolytes & Citrus fruits", "Blinkit", "Blinkit", "SMS", "2026-10-10T15:01:00"),
        ("tx_n_203", "2026-10-12", "19:30:00", 400.0, "debit", "UPI", "Food & Dining", "Healthy soup & khichdi delivery", "Zomato", "Kitchen", "SMS", "2026-10-12T19:31:00"),

        ("tx_n_301", "2026-10-16", "13:00:00", 390.0, "debit", "UPI", "Groceries", "Weekly groceries", "Zepto", "Zepto", "SMS", "2026-10-16T13:01:00"),
        ("tx_n_302", "2026-10-18", "20:00:00", 320.0, "debit", "UPI", "Food & Dining", "Dinner", "Sangeetha Veg", "Cashier", "SMS", "2026-10-18T20:01:00"),
        ("tx_n_303", "2026-10-20", "11:00:00", 180.0, "debit", "UPI", "Transportation", "Auto travel", "Auto Namma Yatri", "Driver", "SMS", "2026-10-20T11:01:00"),

        ("tx_n_401", "2026-10-23", "14:00:00", 380.0, "debit", "UPI", "Groceries", "Supplies", "Blinkit", "Blinkit", "SMS", "2026-10-23T14:01:00"),
        ("tx_n_402", "2026-10-25", "19:00:00", 350.0, "debit", "UPI", "Food & Dining", "Dinner with batchmates", "Junior Kuppanna", "Cashier", "SMS", "2026-10-25T19:01:00"),
        ("tx_n_403", "2026-10-27", "11:00:00", 180.0, "debit", "UPI", "Transportation", "Hospital transport", "Uber Auto", "Driver", "SMS", "2026-10-27T11:01:00"),
    ]

    for tx in ananya_txns:
        cursor.execute(
            """INSERT INTO transactions 
               (txn_id, user_id, txn_date, txn_time, amount, transaction_type, payment_mode, 
                main_category, sub_category, merchant_name, person_name, source, arrived_at)
               VALUES (?, 'usr_ananya_04', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            tx
        )

    # 5. App Activity (Daily activity for contribution calendar & active streak)
    # Generate daily logins from Oct 01 to Oct 28
    for u in users:
        uid = u["user_id"]
        for day in range(1, 29):
            d_str = f"2026-10-{day:02d}"
            # 85% chance of login for student
            if (day % 7 != 0) or uid == "usr_aarav_01":
                cursor.execute(
                    "INSERT INTO app_activity (user_id, date) VALUES (?, ?)",
                    (uid, d_str)
                )

    # 6. Precompute weekly_budget_progress according to calculation rules
    # Calculation rules from prompt:
    # Included categories: Groceries, Food & Dining, Transportation, Shopping, Entertainment, Personal Care
    # Excluded: Rent, Self Transfers, Credit Card Payments, Credit Card Settlements, Investments (Outflow), Cash Withdrawals, Lend, Borrow
    ELIGIBLE_CATEGORIES = {
        "Groceries", "Food & Dining", "Transportation", "Shopping", "Entertainment", "Personal Care"
    }

    cursor.execute("""
        SELECT u.user_id, b.budget_id, b.from_date, b.to_date, b.amount
        FROM budgets b
        JOIN users u ON u.user_id = b.user_id
        ORDER BY b.from_date
    """)
    budget_rows = cursor.fetchall()

    progress_entries = []
    for b_row in budget_rows:
        uid, bid, start_d, end_d, budget_amt = b_row
        
        # Calculate actual spending for this week using eligible debits only
        cursor.execute("""
            SELECT COALESCE(SUM(amount), 0.0)
            FROM transactions
            WHERE user_id = ?
              AND transaction_type = 'debit'
              AND txn_date >= ?
              AND txn_date <= ?
              AND main_category IN ('Groceries', 'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Personal Care')
        """, (uid, start_d, end_d))
        actual_spent = cursor.fetchone()[0]
        
        under_budget = round(budget_amt - actual_spent, 2)
        status = "within_budget" if under_budget >= 0 else "above_budget"
        
        pid = f"prog_{bid}"
        cursor.execute("""
            INSERT INTO weekly_budget_progress
            (progress_id, user_id, week_start, week_end, budget_amount, actual_spending, under_budget_amount, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (pid, uid, start_d, end_d, budget_amt, actual_spent, under_budget, status))

    conn.commit()
    print("Database populated successfully in:", DATABASE_PATH)

    # 7. Export all database tables into JSON structure for instant web client consumption
    export_data = {
        "generated_at": datetime.now().isoformat(),
        "users": [],
        "eligible_categories": list(ELIGIBLE_CATEGORIES),
        "excluded_categories": [
            "Rent", "Self Transfers", "Credit Card Payments", "Credit Card Settlements",
            "Investments (Outflow)", "Cash Withdrawals", "Lend", "Borrow"
        ]
    }

    cursor.execute("SELECT user_id, name, city, joined_on FROM users")
    user_rows = cursor.fetchall()

    for u_row in user_rows:
        uid, uname, ucity, ujoined = u_row
        cursor.execute("""
            SELECT life_stage, living_arrangement, monthly_allowance, fixed_rent, monthly_savings_target
            FROM user_financial_profile WHERE user_id = ?
        """, (uid,))
        p_row = cursor.fetchone()
        
        # Get matching avatar/tagline from initial object
        match_meta = next(u for u in users if u["user_id"] == uid)["profile"]

        # Fetch budgets
        cursor.execute("""
            SELECT budget_id, main_category, period_type, amount, from_date, to_date
            FROM budgets WHERE user_id = ? ORDER BY from_date
        """, (uid,))
        b_rows = [
            {
                "budget_id": r[0],
                "main_category": r[1],
                "period_type": r[2],
                "amount": r[3],
                "from_date": r[4],
                "to_date": r[5]
            }
            for r in cursor.fetchall()
        ]

        # Fetch transactions
        cursor.execute("""
            SELECT txn_id, txn_date, txn_time, amount, transaction_type, payment_mode,
                   main_category, sub_category, merchant_name, person_name, source, arrived_at
            FROM transactions WHERE user_id = ? ORDER BY txn_date ASC, txn_time ASC
        """, (uid,))
        t_rows = [
            {
                "txn_id": r[0],
                "txn_date": r[1],
                "txn_time": r[2],
                "amount": r[3],
                "transaction_type": r[4],
                "payment_mode": r[5],
                "main_category": r[6],
                "sub_category": r[7],
                "merchant_name": r[8],
                "person_name": r[9],
                "source": r[10],
                "arrived_at": r[11],
                "is_eligible": r[6] in ELIGIBLE_CATEGORIES and r[4] == 'debit'
            }
            for r in cursor.fetchall()
        ]

        # Fetch progress
        cursor.execute("""
            SELECT progress_id, week_start, week_end, budget_amount, actual_spending, under_budget_amount, status
            FROM weekly_budget_progress WHERE user_id = ? ORDER BY week_start
        """, (uid,))
        prog_rows = [
            {
                "progress_id": r[0],
                "week_start": r[1],
                "week_end": r[2],
                "budget_amount": r[3],
                "actual_spending": r[4],
                "under_budget_amount": r[5],
                "status": r[6]
            }
            for r in cursor.fetchall()
        ]

        # Fetch app activity
        cursor.execute("SELECT date FROM app_activity WHERE user_id = ?", (uid,))
        activity_dates = [r[0] for r in cursor.fetchall()]

        user_obj = {
            "user_id": uid,
            "name": uname,
            "city": ucity,
            "joined_on": ujoined,
            "profile": {
                "life_stage": p_row[0],
                "living_arrangement": p_row[1],
                "monthly_allowance": p_row[2],
                "fixed_rent": p_row[3],
                "monthly_savings_target": p_row[4],
                "avatar": match_meta["avatar"],
                "tagline": match_meta["tagline"]
            },
            "budgets": b_rows,
            "transactions": t_rows,
            "weekly_progress": prog_rows,
            "app_activity": activity_dates
        }
        export_data["users"].append(user_obj)

    conn.close()

    # Ensure directories exist
    os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)
    os.makedirs(os.path.dirname(PUBLIC_JSON_PATH), exist_ok=True)

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(export_data, f, indent=2)
    print("Exported JSON data to:", JSON_PATH)

    with open(PUBLIC_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(export_data, f, indent=2)
    print("Exported JSON data to:", PUBLIC_JSON_PATH)

if __name__ == "__main__":
    generate_data()
