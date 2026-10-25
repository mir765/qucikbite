# 🍽️ QuickBite — Food Delivery Platform (Kerala, India)

**QuickBite** is a modern, production-grade food delivery ecosystem built for Kerala, India (launching in Kochi, expandable to Trivandrum, Kozhikode, and Thrissur). It features complete role-based workflows for **Customers**, **Restaurant Owners**, **Delivery Partners (Riders)**, and **Administrators**.

---

## 🚀 Live Running Endpoints

- **Frontend Application**: [http://127.0.0.1:3000/](http://127.0.0.1:3000/)
- **Backend API**: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
- **Swagger / OpenAPI Documentation**: [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
- **Redoc Documentation**: [http://127.0.0.1:8000/api/redoc/](http://127.0.0.1:8000/api/redoc/)
- **Django Admin Console**: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

---

## 🎭 Demo Personas & Credentials

The application includes an instant **QuickBite Ecosystem Role Switcher** at the top of the screen to switch between any of the 4 roles with a single click, or log in manually with these accounts:

| Role | Username | Password | Persona & Responsibilities |
|---|---|---|---|
| **Customer** | `customer` | `quickbite123` | Rahul Nair (Kochi). SmartBite AI, Budget Mode, RealPlate, GroupBite, Cart & Razorpay Checkout, Live Tracking. |
| **Restaurant Owner** | `restaurant_owner` | `quickbite123` | Priya Menon. Malabar Grand by Paragon. Kitchen Order Ticket (KOT) operations, Menu stock toggle, Sales Copilot. |
| **Delivery Partner** | `rider` | `quickbite123` | Amal Jose. Hero Splendor (`KL-07-CD-4512`). Online toggle, Trip navigation, Order pickup & delivery, Earnings ledger. |
| **Administrator** | `admin` | `admin123` | QuickBite Superadmin. Platform GMV, FSSAI restaurant approvals, Rider verification, User governance, Financial audit. |

---

## 🌟 Key Innovations & Signature Features

### 1. ✨ SmartBite AI — Intelligent Food Assistant
- Natural language discovery answering queries like:
  - *"Find a filling dinner under ₹150"*
  - *"Suggest spicy Kerala seafood near me"*
  - *"Find vegetarian food for two people under ₹400"*
  - *"Traditional Malabar Biryani specials"*
- Backed by an intelligent intent parser and recommendation engine with transparent explanations (*"Why this meal?"*).

### 2. 🏷️ QuickBite Budget Mode™
- Signature cost-capping feature (Presets: **₹99, ₹149, ₹199, ₹299**, or custom amount).
- Guaranteed equation:
  $$\text{Dish Price} + 5\% \text{ GST} + \text{Delivery Fee} + \text{Platform Fee } (₹5) - \text{Discount} \le \text{Target Budget}$$
- Displays exact fee breakdowns and remaining budget savings before ordering.

### 3. 🌿 RealPlate™ — Food Transparency
- Every dish card features complete nutritional and ingredient transparency:
  - Portion size (e.g. *Serves 1-2 • 650g*)
  - Exact ingredients list (e.g. *Khaima Rice, Farm Fresh Chicken, Malabar Ghee, Green Chillies*)
  - Allergen warnings (e.g. *Dairy, Nuts, Shellfish*)
  - Nutrition breakdown: Calories (kcal), Protein (g), Carbs (g), and Fat (g)
  - Spice meter (*Mild, Medium, Spicy, Extra Spicy*)

### 4. 👥 GroupBite™ — Collaborative Group Ordering
- Built for Infopark tech teams, college hostels, and family feasts.
- Generates a shareable 6-digit room code (e.g. `GB-8291`).
- Multiple participants add dishes from the same restaurant within a defined per-person budget gauge.
- Organiser reviews the combined cart and checks out in a single order.

### 5. ⏳ LastCall Bites™ — Surplus Discounted Food
- Daily evening surplus deals (30% to 50% off) to prevent food waste.
- Limited quantity counter with order cutoff countdown (10:45 PM).

### 6. ⏱️ HonestTrack™ — Transparent Delivery Stepper
- Controlled state transitions: `CONFIRMED` $\to$ `ACCEPTED` $\to$ `PREPARING` $\to$ `READY_FOR_PICKUP` $\to$ `OUT_FOR_DELIVERY` $\to$ `DELIVERED`.
- Live simulated GPS route between restaurant, moving rider, and customer.
- On-time delivery guarantee: If delayed by $>15$ minutes beyond ETA, receive ₹50 in BitePoints compensation.

### 7. 🪙 BitePoints™ & 🍱 MealPass™
- **BitePoints**: Earn 10 points for every ₹100 spent. Redeem for instant ₹50 vouchers.
- **MealPass**: Weekly and monthly rotational Kerala home-style lunch subscriptions.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Canvas-Confetti, Axios.
- **Backend**: Django 6.1, Django REST Framework (DRF), DRF Spectacular (OpenAPI 3 / Swagger).
- **Database**: SQLite default (zero-setup out of the box), PostgreSQL fully compatible via `DATABASE_URL`.
- **Payment Architecture**: Razorpay integration architecture + interactive sandbox simulation supporting UPI, Cards, Net Banking, and COD.

---

## 📦 Local Installation & Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)

### 1. Backend Setup (Django + DRF)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Activate virtual environment (Windows PowerShell)
venv\Scripts\Activate.ps1
# On Linux/macOS: source venv/bin/activate

# 3. Apply database migrations
python manage.py migrate

# 4. Seed database with Kerala restaurants, dishes, coupons, and demo users
python manage.py seed_data

# 5. Run backend unit tests
python manage.py test api

# 6. Start backend development server
python manage.py runserver 127.0.0.1:8000
```

### 2. Frontend Setup (React + TypeScript)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies (if not already installed)
npm install

# 3. Run production build
npm run build

# 4. Start frontend development server
npm run dev -- --port 3000
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

---

## 🧪 Testing Verification

- **Backend Tests**: 5 test suites covering restaurant listings, SmartBite AI natural queries, Budget Mode calculations, Cart calculation, and Order placement with BitePoints allocations:
  ```bash
  backend\venv\Scripts\python.exe backend\manage.py test api
  ```
- **Frontend Build**: Production bundle compilation with strict TypeScript checking:
  ```bash
  cmd /c "cd frontend && npm run build"
  ```
- **API Documentation**: Interactive Swagger testing at [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/)
