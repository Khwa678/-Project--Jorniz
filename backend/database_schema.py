# ─── database_schema.py — Unified Healthy Universe DB Schema ────────────────
import os
import sqlite3

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None

DATABASE_URL = os.getenv("DATABASE_URL", "")

def init_db(db_path="healthy_universe.db"):
    """Initializes unified database tables (SQLite for local, PostgreSQL for production)."""
    if not os.path.isabs(db_path):
        backend_dir = os.path.dirname(__file__)
        db_path = os.path.join(backend_dir, db_path)

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # 1. Users Table (Patients, Doctors, Sellers, Admins)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        role TEXT NOT NULL DEFAULT 'Patient',
        specialty TEXT,
        hospital TEXT,
        verification_doc TEXT,
        verification_doc_url TEXT,
        verification_status TEXT DEFAULT 'not_required',
        is_verified INTEGER DEFAULT 0,
        avatar_url TEXT,
        wallet_balance REAL DEFAULT 0.0,
        coins INTEGER DEFAULT 0,
        hu_coins INTEGER DEFAULT 500,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Ensure missing columns exist in existing table
    for col, col_type in [
        ("role", "TEXT DEFAULT 'Patient'"),
        ("specialty", "TEXT"),
        ("hospital", "TEXT"),
        ("verification_doc", "TEXT"),
        ("verification_doc_url", "TEXT"),
        ("verification_status", "TEXT DEFAULT 'not_required'"),
        ("is_verified", "INTEGER DEFAULT 0"),
        ("avatar_url", "TEXT"),
        ("wallet_balance", "REAL DEFAULT 0.0"),
        ("coins", "INTEGER DEFAULT 0"),
        ("hu_coins", "INTEGER DEFAULT 500")
    ]:
        try:
            cur.execute(f"ALTER TABLE users ADD COLUMN {col} {col_type}")
        except sqlite3.OperationalError:
            pass

    # 2. Doctors Profile Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS doctors (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        qualification TEXT,
        experience_years INTEGER DEFAULT 5,
        fee REAL DEFAULT 500.0,
        rating REAL DEFAULT 4.9,
        reviews_count INTEGER DEFAULT 120,
        hospital TEXT,
        location TEXT,
        avatar TEXT,
        bio TEXT,
        available_days TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # 3. Doctor Availability Slots Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS doctor_slots (
        id TEXT PRIMARY KEY,
        doctor_id TEXT NOT NULL,
        slot_time TEXT NOT NULL,
        price REAL DEFAULT 500.0,
        is_booked INTEGER DEFAULT 0,
        booked_by_user_id TEXT,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    );
    """)

    # 4. Appointments / Consultations Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        doctor_id TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        slot_time TEXT NOT NULL,
        status TEXT DEFAULT 'Scheduled',
        notes TEXT,
        prescription TEXT,
        payment_status TEXT DEFAULT 'Paid',
        amount REAL DEFAULT 500.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id),
        FOREIGN KEY (patient_id) REFERENCES users(id)
    );
    """)

    # 5. Product Categories Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        description TEXT
    );
    """)

    # 6. Marketplace Products Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category_id TEXT,
        seller_id TEXT,
        price REAL NOT NULL,
        original_price REAL,
        image_url TEXT,
        description TEXT,
        ingredients TEXT,
        stock INTEGER DEFAULT 50,
        rating REAL DEFAULT 4.8,
        reviews_count INTEGER DEFAULT 45,
        is_featured INTEGER DEFAULT 0,
        reward_coins_earn INTEGER DEFAULT 10,
        max_coin_redemption_percent INTEGER DEFAULT 50,
        FOREIGN KEY (category_id) REFERENCES categories(id)
    );
    """)

    for col, col_type in [
        ("seller_id", "TEXT"),
        ("reward_coins_earn", "INTEGER DEFAULT 10"),
        ("max_coin_redemption_percent", "INTEGER DEFAULT 50")
    ]:
        try:
            cur.execute(f"ALTER TABLE products ADD COLUMN {col} {col_type}")
        except sqlite3.OperationalError:
            pass

    # 7. Shopping Cart Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS cart (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        price REAL NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
    """)

    # 8. Orders Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        total_amount REAL NOT NULL,
        wallet_spent REAL DEFAULT 0.0,
        gateway_spent REAL DEFAULT 0.0,
        coins_spent INTEGER DEFAULT 0,
        coins_discount REAL DEFAULT 0.0,
        coins_earned INTEGER DEFAULT 0,
        refund_status TEXT DEFAULT 'None',
        status TEXT DEFAULT 'Confirmed',
        shipping_address TEXT,
        payment_method TEXT DEFAULT 'Wallet+UPI',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    for col, col_type in [
        ("coins_spent", "INTEGER DEFAULT 0"),
        ("coins_discount", "REAL DEFAULT 0.0"),
        ("coins_earned", "INTEGER DEFAULT 0"),
        ("refund_status", "TEXT DEFAULT 'None'")
    ]:
        try:
            cur.execute(f"ALTER TABLE orders ADD COLUMN {col} {col_type}")
        except sqlite3.OperationalError:
            pass

    # 9. Order Items Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
    );
    """)

    # 9b. Ad Impressions and Clicks Tables
    cur.execute("""
    CREATE TABLE IF NOT EXISTS ad_impressions (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        creative_id TEXT NOT NULL,
        user_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS ad_clicks (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        creative_id TEXT NOT NULL,
        user_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 10. Diagnostic Tests Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS diagnostics (
        id TEXT PRIMARY KEY,
        test_name TEXT NOT NULL,
        department TEXT,
        price REAL NOT NULL,
        description TEXT,
        turnaround_hours INTEGER DEFAULT 24
    );
    """)

    # 11. Diagnostic Bookings Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS diagnostic_bookings (
        id TEXT PRIMARY KEY,
        test_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        collection_date TEXT NOT NULL,
        address TEXT NOT NULL,
        status TEXT DEFAULT 'Booked',
        report_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_id) REFERENCES diagnostics(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # 12. Social Posts Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT DEFAULT 'General Wellness',
        media_url TEXT,
        media_type TEXT,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        trusted_flag INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS post_comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS post_likes (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # 13. Notifications Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        actor_id TEXT,
        type TEXT NOT NULL,
        post_id TEXT,
        message TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 13b. Jobs Table (Module B)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        company_logo TEXT,
        location TEXT DEFAULT 'Remote',
        job_type TEXT DEFAULT 'Full-Time',
        specialty TEXT DEFAULT 'General Physician',
        salary TEXT,
        experience TEXT,
        deadline TEXT,
        tags TEXT,
        description TEXT,
        featured INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        applicants INTEGER DEFAULT 0,
        added_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 13c. Trending Topics Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS trending_topics (
        id TEXT PRIMARY KEY,
        hashtag TEXT NOT NULL,
        post_count TEXT DEFAULT '0',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 13d. Reports Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        reporter_id TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 14. User Sessions Table (Module A - 4.1 Multi-device & revocation)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        device_info TEXT,
        ip_address TEXT,
        refresh_token TEXT UNIQUE NOT NULL,
        is_revoked INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # 15. Creator & Professional Verifications Table (Module A - 4.1)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS creator_verifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        category TEXT NOT NULL,
        document_url TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # 16. User Blocks & Mutes (Module A - 4.2)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_blocks (
        blocker_id TEXT NOT NULL,
        blocked_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (blocker_id, blocked_id)
    );
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_mutes (
        muter_id TEXT NOT NULL,
        muted_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (muter_id, muted_id)
    );
    """)

    # 17. Follow Graph (Module A - 4.2)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS follows (
        follower_id TEXT NOT NULL,
        followed_id TEXT NOT NULL,
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (follower_id, followed_id)
    );
    """)

    # 18. Post Saves & Reposts (Module A - 4.2)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS post_saves (
        user_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id)
    );
    """)

    # 19. Media Resumable Upload Chunks (Module A - 4.3)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS media_chunks (
        id TEXT PRIMARY KEY,
        upload_id TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        total_chunks INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 20. Creator Analytics & Monetisation Dashboard (Module A - 4.4)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS creator_analytics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        post_id TEXT,
        views INTEGER DEFAULT 0,
        valid_views INTEGER DEFAULT 0,
        watch_time_sec INTEGER DEFAULT 0,
        completion_rate REAL DEFAULT 0.0,
        reach INTEGER DEFAULT 0,
        engagement_count INTEGER DEFAULT 0,
        earnings_state TEXT DEFAULT 'Estimated',
        amount REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # 21. Company Profiles & Recruiter Seats (Module B - 5)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS company_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_name TEXT NOT NULL,
        logo_url TEXT,
        website TEXT,
        industry TEXT,
        is_verified INTEGER DEFAULT 0,
        recruiter_seats INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # 22. Candidate Profiles & CV Management (Module B - 5)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS candidate_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        title TEXT,
        experience_summary TEXT,
        skills TEXT,
        certifications TEXT,
        portfolio_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS candidate_cvs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        cv_title TEXT NOT NULL,
        file_url TEXT NOT NULL,
        is_default INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # 23. Job Applications & Pipeline Tracking (Module B - 5)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS job_applications (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        candidate_id TEXT NOT NULL,
        selected_cv_id TEXT,
        cover_letter TEXT,
        status TEXT DEFAULT 'Submitted',
        recruiter_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id),
        FOREIGN KEY (candidate_id) REFERENCES users(id)
    );
    """)

    # 24. Job Interview Scheduling (Module B - 5)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS job_interviews (
        id TEXT PRIMARY KEY,
        application_id TEXT NOT NULL,
        recruiter_id TEXT NOT NULL,
        candidate_id TEXT NOT NULL,
        scheduled_time TIMESTAMP NOT NULL,
        timezone TEXT DEFAULT 'UTC',
        meeting_link TEXT,
        outcome TEXT DEFAULT 'Scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES job_applications(id)
    );
    """)

    # 25. Doctor Onboarding & Verifications (Module C - 6.1)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS doctor_onboarding (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        reg_number TEXT NOT NULL,
        qualification TEXT NOT NULL,
        specialty TEXT NOT NULL,
        jurisdiction TEXT NOT NULL,
        proof_document_url TEXT NOT NULL,
        fee REAL DEFAULT 500.0,
        status TEXT DEFAULT 'Pending Review',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # 26. Consultation Telemedicine Rooms & WebRTC (Module C - 6.2)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS consultation_rooms (
        id TEXT PRIMARY KEY,
        appointment_id TEXT UNIQUE NOT NULL,
        room_token TEXT NOT NULL,
        turn_credentials TEXT,
        status TEXT DEFAULT 'Waiting Room',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id)
    );
    """)

    # 27. Isolated Clinical Records & Prescriptions (Module C - 6.2)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS clinical_records (
        id TEXT PRIMARY KEY,
        appointment_id TEXT UNIQUE NOT NULL,
        patient_id TEXT NOT NULL,
        doctor_id TEXT NOT NULL,
        telemedicine_consent INTEGER DEFAULT 1,
        symptoms_description TEXT,
        doctor_clinical_notes TEXT,
        prescription_pdf_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id)
    );
    """)

    # 28. Advertisers & Ad Campaigns (Module D - 7.1)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS advertisers (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        company_name TEXT NOT NULL,
        verified INTEGER DEFAULT 1,
        prepaid_balance REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS ad_campaigns (
        id TEXT PRIMARY KEY,
        advertiser_id TEXT NOT NULL,
        title TEXT NOT NULL,
        objective TEXT DEFAULT 'Brand Awareness',
        total_budget REAL NOT NULL,
        daily_budget REAL NOT NULL,
        spent_amount REAL DEFAULT 0.0,
        bid_type TEXT DEFAULT 'CPM',
        bid_amount REAL DEFAULT 10.0,
        placement TEXT DEFAULT 'Feed',
        creative_url TEXT,
        target_geo TEXT DEFAULT 'Global',
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (advertiser_id) REFERENCES advertisers(id)
    );
    """)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS ad_creatives (
        id TEXT PRIMARY KEY,
        campaign_id TEXT,
        title TEXT,
        headline TEXT,
        body_text TEXT,
        cta_text TEXT,
        cta_link TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 29. Ad Analytics & Invalid Traffic Filtering (Module D - 7.1, 7.4)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS ad_analytics (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        user_id TEXT,
        event_type TEXT NOT NULL,
        ip_address TEXT,
        device_fp TEXT,
        is_valid INTEGER DEFAULT 1,
        revenue_amount REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES ad_campaigns(id)
    );
    """)

    # 30. Economic Formula Revenue Distribution Log (Module D - 7.2)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS revenue_distribution_logs (
        id TEXT PRIMARY KEY,
        period_date TEXT NOT NULL,
        gross_validated_revenue REAL DEFAULT 0.0,
        taxes_deducted REAL DEFAULT 0.0,
        payment_charges REAL DEFAULT 0.0,
        invalid_traffic_deduction REAL DEFAULT 0.0,
        refunds_deducted REAL DEFAULT 0.0,
        campaign_costs REAL DEFAULT 0.0,
        eligible_net_revenue REAL DEFAULT 0.0,
        creator_pool REAL DEFAULT 0.0,
        consumer_pool REAL DEFAULT 0.0,
        platform_share REAL DEFAULT 0.0,
        partner_share REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 31. Anti-Fraud Queue & Case Logs (Module D - 7.4)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS fraud_cases (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        trigger_reason TEXT NOT NULL,
        device_fp TEXT,
        ip_address TEXT,
        status TEXT DEFAULT 'Under Review',
        case_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # 32. Immutable Double-Entry Wallet Ledger (Module E - 8.1, 8.2)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS wallet_ledger (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        credit_debit TEXT NOT NULL,
        value_type TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'INR',
        source_type TEXT NOT NULL,
        source_id TEXT,
        idempotency_key TEXT UNIQUE NOT NULL,
        balance_before REAL DEFAULT 0.0,
        balance_after REAL DEFAULT 0.0,
        status TEXT DEFAULT 'Settled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # 33. Seller Profiles for Marketplace (Module F - 9)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS seller_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        store_name TEXT NOT NULL,
        gst_number TEXT,
        bank_account_number TEXT,
        ifsc_code TEXT,
        rating REAL DEFAULT 4.9,
        status TEXT DEFAULT 'Approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # 34. Professional Network Connections Graph (LinkedIn Style)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        requester_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
    );
    """)

    # 35. Skill Endorsements Table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS skill_endorsements (
        id TEXT PRIMARY KEY,
        endorser_id TEXT NOT NULL,
        recipient_id TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (endorser_id) REFERENCES users(id),
        FOREIGN KEY (recipient_id) REFERENCES users(id)
    );
    """)

    # 36. 5-Type Post Reactions (Like, Celebrate, Support, Insightful, Mindblowing)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS post_reactions (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        reaction_type TEXT DEFAULT 'like',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # 37. User Professional Experience Timeline
    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_experiences (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT,
        start_date TEXT,
        end_date TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    # 38. User Education & Qualifications
    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_education (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        degree TEXT NOT NULL,
        institution TEXT NOT NULL,
        field_of_study TEXT,
        year TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    """)

    conn.commit()
    seed_initial_data(conn)
    conn.close()
    print("[SUCCESS] Unified Healthy Universe Database initialized successfully!")

def seed_initial_data(conn):
    cur = conn.cursor()
    # Check if doctors exist
    cur.execute("SELECT COUNT(*) FROM doctors")
    if cur.fetchone()[0] == 0:
        print("[INFO] Seeding initial Doctors, Products, and Diagnostics data...")
        # Seed Doctors
        doctors_data = [
            ("doc_1", "usr_doc1", "Dr. Rajesh Sharma", "Cardiology", "MD, DM (Cardiology)", 14, 800.0, 4.9, 320, "AIIMS New Delhi", "Delhi", "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150", "Senior Cardiologist specializing in preventive heart care and hypertension management.", "Mon-Fri (10:00 AM - 4:00 PM)"),
            ("doc_2", "usr_doc2", "Dr. Ananya Roy", "Dermatology", "MD (Dermatology), DNB", 9, 650.0, 4.8, 210, "Apollo Hospitals", "Mumbai", "https://images.unsplash.com/photo-1594824813566-88855ce78961?w=150", "Expert dermatologist specializing in skincare, acne treatment, and holistic wellness.", "Tue-Sat (11:00 AM - 5:00 PM)"),
            ("doc_3", "usr_doc3", "Dr. Vikram Sethi", "Ayurvedic Doctor", "BAMS, MD (Ayurveda)", 12, 500.0, 4.9, 180, "Patanjali Wellness Center", "Bengaluru", "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150", "Holistic Ayurvedic physician dedicated to natural healing, Panchakarma, and dietary therapy.", "Mon-Sat (9:00 AM - 3:00 PM)"),
            ("doc_4", "usr_doc4", "Dr. Sneha Verma", "Pediatrics", "MD (Pediatrics)", 8, 600.0, 4.7, 145, "Fortis Healthcare", "Gurugram", "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150", "Compassionate child specialist specializing in infant nutrition, immunization, and growth.", "Mon-Fri (2:00 PM - 7:00 PM)")
        ]
        cur.executemany("INSERT INTO doctors (id, user_id, name, specialty, qualification, experience_years, fee, rating, reviews_count, hospital, location, avatar, bio, available_days) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", doctors_data)

        # Seed Doctor Slots
        slots = [
            ("slot_1", "doc_1", "Tomorrow, 10:30 AM", 800.0, 0, None),
            ("slot_2", "doc_1", "Tomorrow, 02:00 PM", 800.0, 0, None),
            ("slot_3", "doc_2", "Tomorrow, 11:15 AM", 650.0, 0, None),
            ("slot_4", "doc_3", "Tomorrow, 04:00 PM", 500.0, 0, None),
            ("slot_5", "doc_4", "Tomorrow, 03:30 PM", 600.0, 0, None)
        ]
        cur.executemany("INSERT INTO doctor_slots (id, doctor_id, slot_time, price, is_booked, booked_by_user_id) VALUES (?,?,?,?,?,?)", slots)

        # Seed Categories
        categories = [
            ("cat_1", "Vitamins & Supplements", "pharmacy", "Essential daily vitamins, minerals, and dietary supplements."),
            ("cat_2", "Ayurvedic & Herbal", "eco", "Natural Ayurvedic remedies, Chyawanprash, and herbal teas."),
            ("cat_3", "Fitness & Protein", "fitness_center", "Whey protein, plant protein, BCAAs, and workout nutrition."),
            ("cat_4", "Personal Care & Hygiene", "sanitizer", "Organic soaps, herbal shampoos, skincare, and sanitizers.")
        ]
        cur.executemany("INSERT INTO categories (id, name, icon, description) VALUES (?,?,?,?)", categories)

        # Seed Products
        products = [
            ("prod_1", "Organic Ashwagandha Extract 500mg", "cat_2", 499.0, 699.0, "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300", "Pure KSM-66 Ashwagandha for stress relief, stamina, and immune support.", "Ashwagandha Root Extract, Black Pepper Extract", 100, 4.9, 88, 1),
            ("prod_2", "Plant-Based Protein Powder (Chocolate)", "cat_3", 1299.0, 1599.0, "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=300", "Clean pea and brown rice protein with digestive enzymes and BCAA.", "Pea Protein Isolate, Brown Rice Protein, Cocoa", 60, 4.8, 64, 1),
            ("prod_3", "Vitamin D3 + K2 Immunity Softgels", "cat_1", 349.0, 499.0, "https://images.unsplash.com/photo-1550572017-edd951b55104?w=300", "High-potency Vitamin D3 (2000 IU) + K2 for bone health and cardiovascular support.", "Vitamin D3 (Cholecalciferol), Vitamin K2 (MK-7)", 150, 4.7, 112, 0),
            ("prod_4", "Cold-Pressed Virgin Coconut Oil 500ml", "cat_4", 399.0, 450.0, "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=300", "100% pure raw unrefined coconut oil for hair growth, skin moisturizing, and cooking.", "100% Pure Virgin Coconut Oil", 80, 4.9, 95, 0)
        ]
        cur.executemany("INSERT INTO products (id, name, category_id, price, original_price, image_url, description, ingredients, stock, rating, reviews_count, is_featured) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", products)

        # Seed Diagnostics
        diagnostics = [
            ("diag_1", "Full Body Health Checkup (75+ Parameters)", "General Health", 1499.0, "Comprehensive screening including CBC, Lipid Profile, Liver Function, Kidney Function, and Thyroid.", 24),
            ("diag_2", "Diabetes Care Profile (HbA1c & Fasting)", "Endocrinology", 599.0, "Includes HbA1c, Fasting Blood Sugar, Post Prandial Sugar, and Kidney Health Marker.", 12),
            ("diag_3", "Cardiac Risk Profile & Lipid Panel", "Cardiology", 899.0, "Cholesterol, Triglycerides, HDL/LDL ratio, hs-CRP, and Cardiac enzymes.", 24)
        ]
        cur.executemany("INSERT INTO diagnostics (id, test_name, department, price, description, turnaround_hours) VALUES (?,?,?,?,?,?)", diagnostics)

        conn.commit()

if __name__ == "__main__":
    init_db()
