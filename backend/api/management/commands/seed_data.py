import os
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from api.models import (
    CustomerAddress, Restaurant, MenuCategory, MenuItem,
    Order, OrderItem, Payment, Coupon, GroupOrder,
    BitePointsLedger, LastCallBite, MealPassSubscription,
    Review, RiderProfile, RiderEarningsLedger, SupportTicket
)

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed QuickBite initial data with authentic Kerala restaurants, items, and users'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Cleaning existing data...'))
        
        # Create users
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@quickbite.in',
                'first_name': 'Admin',
                'last_name': 'QuickBite',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'phone': '+91 98470 00000',
            }
        )
        admin_user.set_password('admin123')
        admin_user.save()

        customer_user, _ = User.objects.get_or_create(
            username='customer',
            defaults={
                'email': 'rahul.nair@example.com',
                'first_name': 'Rahul',
                'last_name': 'Nair',
                'role': 'customer',
                'phone': '+91 98470 12345',
                'profile_photo': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                'dietary_preferences': ['halal', 'non-veg'],
            }
        )
        customer_user.set_password('quickbite123')
        customer_user.save()

        restaurant_user, _ = User.objects.get_or_create(
            username='restaurant_owner',
            defaults={
                'email': 'priya.menon@paragon.in',
                'first_name': 'Priya',
                'last_name': 'Menon',
                'role': 'restaurant_owner',
                'phone': '+91 98471 22334',
                'profile_photo': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
            }
        )
        restaurant_user.set_password('quickbite123')
        restaurant_user.save()

        rider_user, _ = User.objects.get_or_create(
            username='rider',
            defaults={
                'email': 'amal.rider@quickbite.in',
                'first_name': 'Amal',
                'last_name': 'Jose',
                'role': 'rider',
                'phone': '+91 94471 99887',
                'profile_photo': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            }
        )
        rider_user.set_password('quickbite123')
        rider_user.save()

        # Rider profile
        rider_profile, _ = RiderProfile.objects.get_or_create(
            user=rider_user,
            defaults={
                'vehicle_type': 'Motorcycle (Hero Splendor)',
                'vehicle_number': 'KL-07-CD-4512',
                'license_number': 'KL1420230008912',
                'is_online': True,
                'verification_status': 'approved',
                'total_deliveries': 148,
                'wallet_balance': Decimal('1840.50'),
                'rating': 4.88,
                'current_latitude': 9.9816,
                'current_longitude': 76.2999,
            }
        )

        # Customer Addresses
        CustomerAddress.objects.get_or_create(
            user=customer_user,
            label='home',
            defaults={
                'address_line1': 'Flat 4B, Skyline Imperial Heights',
                'address_line2': 'Near High Court, Marine Drive',
                'landmark': 'Opposite Rainbow Bridge',
                'city': 'Kochi',
                'state': 'Kerala',
                'postal_code': '682031',
                'latitude': 9.9835,
                'longitude': 76.2755,
                'is_default': True,
                'delivery_instructions': 'Leave with security guard if not answering bell.'
            }
        )

        CustomerAddress.objects.get_or_create(
            user=customer_user,
            label='work',
            defaults={
                'address_line1': 'Carnival Infopark, Phase 2, 4th Floor',
                'address_line2': 'Kakkanad IT Expressway',
                'landmark': 'Near SmartCity Entrance',
                'city': 'Kochi',
                'state': 'Kerala',
                'postal_code': '682042',
                'latitude': 10.0104,
                'longitude': 76.3637,
                'is_default': False,
                'delivery_instructions': 'Call when at Main Reception Tower.'
            }
        )

        # Coupons
        coupons_data = [
            {'code': 'QUICK50', 'title': '50% OFF Festive Welcome', 'description': '50% off up to ₹100 on orders above ₹199', 'discount_percent': Decimal('50.00'), 'max_discount_amount': Decimal('100.00'), 'min_order_amount': Decimal('199.00')},
            {'code': 'KERALA20', 'title': 'Taste of God\'s Own Country', 'description': 'Flat 20% off up to ₹150 on authentic Kerala dishes', 'discount_percent': Decimal('20.00'), 'max_discount_amount': Decimal('150.00'), 'min_order_amount': Decimal('250.00')},
            {'code': 'FREESHIP', 'title': 'Zero Delivery Fee', 'description': 'Enjoy free delivery on orders above ₹299', 'discount_flat': Decimal('35.00'), 'min_order_amount': Decimal('299.00')},
            {'code': 'BUDGET99', 'title': 'QuickBite Pocket Saver', 'description': 'Flat ₹30 off on Budget Mode meals', 'discount_flat': Decimal('30.00'), 'min_order_amount': Decimal('99.00')},
        ]
        for c in coupons_data:
            Coupon.objects.update_or_create(code=c['code'], defaults=c)

        # Restaurants
        restaurants_data = [
            {
                'name': 'Malabar Grand by Paragon',
                'slug': 'malabar-grand-paragon',
                'tagline': 'Legendary Malabar Dum Biryani & Coastal Delights',
                'description': 'Award-winning culinary destination serving authentic Malabar biryanis, slow-simmered seafood gravies, and delicate Malabar parottas prepared using heirloom spice blends.',
                'logo_url': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
                'banner_url': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
                'cuisines': ['Kerala', 'Malabar', 'Biryani', 'Seafood'],
                'city': 'Kochi',
                'area': 'Marine Drive',
                'address': 'Ground Floor, Shanmugham Road, Marine Drive, Kochi, Kerala 682031',
                'phone': '+91 484 236 8800',
                'rating': 4.8,
                'total_reviews': 3420,
                'price_range': '$$',
                'is_pure_veg': False,
                'is_open': True,
                'approval_status': 'approved',
                'avg_delivery_time_mins': 25,
                'delivery_fee_base': Decimal('30.00'),
                'min_order_amount': Decimal('149.00'),
                'featured': True,
                'owner': restaurant_user,
            },
            {
                'name': 'Kuttanad Toddy & Coastal Kitchen',
                'slug': 'kuttanad-toddy-coastal-kitchen',
                'tagline': 'Fiery Backwater Fish Curry, Kappa & Duck Roast',
                'description': 'Savour authentic toddy shop delicacies from the backwaters of Alappuzha. Clay-pot Karimeen pollichathu, steaming kappa with spicy fish curry, and shallot-infused duck roast.',
                'logo_url': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80',
                'banner_url': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
                'cuisines': ['Kerala', 'Seafood', 'Spicy', 'Traditional'],
                'city': 'Kochi',
                'area': 'Panampilly Nagar',
                'address': 'Main Avenue, Panampilly Nagar, Kochi, Kerala 682036',
                'phone': '+91 484 231 4500',
                'rating': 4.7,
                'total_reviews': 2140,
                'price_range': '$$',
                'is_pure_veg': False,
                'is_open': True,
                'approval_status': 'approved',
                'avg_delivery_time_mins': 32,
                'delivery_fee_base': Decimal('35.00'),
                'min_order_amount': Decimal('199.00'),
                'featured': True,
            },
            {
                'name': 'Aaryas Heritage Pure Veg',
                'slug': 'aaryas-heritage-pure-veg',
                'tagline': 'Ghee Roast Dosas, Steaming Puttu & Filter Coffee',
                'description': '100% vegetarian culinary tradition offering hot ghee roast dosas, string hoppers (idiappam) with vegetable stew, red rice Kerala sadya meals, and authentic Kumbakonam filter coffee.',
                'logo_url': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=200&q=80',
                'banner_url': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
                'cuisines': ['South Indian', 'Pure Veg', 'Breakfast', 'Kerala'],
                'city': 'Kochi',
                'area': 'MG Road',
                'address': 'Opposite Shenoys Theatre, MG Road, Kochi, Kerala 682035',
                'phone': '+91 484 238 1200',
                'rating': 4.6,
                'total_reviews': 1890,
                'price_range': '$',
                'is_pure_veg': True,
                'is_open': True,
                'approval_status': 'approved',
                'avg_delivery_time_mins': 20,
                'delivery_fee_base': Decimal('25.00'),
                'min_order_amount': Decimal('99.00'),
                'featured': True,
            },
            {
                'name': 'Calicut Street & Halwa Junction',
                'slug': 'calicut-street-halwa-junction',
                'tagline': 'Fresh Pazham Pori, Beef Fry, Sulaimani & Halwa',
                'description': 'Experience the bustling flavours of SM Street Calicut right in Kochi. Golden banana fritters (pazham pori) paired with crispy beef fry, authentic Kozhikodan halwa, and fragrant mint Sulaimani.',
                'logo_url': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80',
                'banner_url': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
                'cuisines': ['Kerala Street Food', 'Snacks', 'Desserts', 'Beverages'],
                'city': 'Kochi',
                'area': 'Edappally',
                'address': 'Metro Pillar 384, Edappally Toll, Kochi, Kerala 682024',
                'phone': '+91 484 255 9012',
                'rating': 4.6,
                'total_reviews': 1420,
                'price_range': '$',
                'is_pure_veg': False,
                'is_open': True,
                'approval_status': 'approved',
                'avg_delivery_time_mins': 22,
                'delivery_fee_base': Decimal('25.00'),
                'min_order_amount': Decimal('99.00'),
                'featured': False,
            },
            {
                'name': 'Fort Kochi Colonial Cafe & Grill',
                'slug': 'fort-kochi-colonial-cafe',
                'tagline': 'Wood-fired Sourdough, Tiger Prawns & Dutch Stew',
                'description': 'A bohemian heritage cafe blending colonial Portuguese-Dutch influences with Kerala spices. Fresh seafood catch grilled with lemon garlic butter and coconut curry bowls.',
                'logo_url': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=80',
                'banner_url': 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=1200&q=80',
                'cuisines': ['Cafe', 'Continental', 'Seafood', 'European'],
                'city': 'Kochi',
                'area': 'Fort Kochi',
                'address': 'Princess Street, Fort Kochi, Kerala 682001',
                'phone': '+91 484 221 6670',
                'rating': 4.7,
                'total_reviews': 980,
                'price_range': '$$$',
                'is_pure_veg': False,
                'is_open': True,
                'approval_status': 'approved',
                'avg_delivery_time_mins': 35,
                'delivery_fee_base': Decimal('40.00'),
                'min_order_amount': Decimal('250.00'),
                'featured': False,
            },
            {
                'name': 'Dragon Kerala Bowl & Wok',
                'slug': 'dragon-kerala-bowl-wok',
                'tagline': 'Indo-Chinese Delights & Kerala Spicy Chilli Beef',
                'description': 'Beloved Kochi fusion hotspot serving smoky Schezwan fried rice, Dragon chicken, Kerala-style crispy dry chilli beef, and comforting Sweet corn chicken soup.',
                'logo_url': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=200&q=80',
                'banner_url': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80',
                'cuisines': ['Chinese', 'Asian', 'Indo-Chinese', 'Fast Food'],
                'city': 'Kochi',
                'area': 'Kakkanad',
                'address': 'Opposite Infopark Main Gate, Kakkanad, Kochi, Kerala 682030',
                'phone': '+91 484 242 7711',
                'rating': 4.5,
                'total_reviews': 1650,
                'price_range': '$$',
                'is_pure_veg': False,
                'is_open': True,
                'approval_status': 'approved',
                'avg_delivery_time_mins': 28,
                'delivery_fee_base': Decimal('30.00'),
                'min_order_amount': Decimal('149.00'),
                'featured': False,
            }
        ]

        restaurants_by_slug = {}
        for rdata in restaurants_data:
            slug = rdata.pop('slug')
            rest, _ = Restaurant.objects.update_or_create(slug=slug, defaults=rdata)
            restaurants_by_slug[slug] = rest

        # Menu Items for Malabar Grand by Paragon
        p_rest = restaurants_by_slug['malabar-grand-paragon']
        cat_biryani, _ = MenuCategory.objects.get_or_create(restaurant=p_rest, name='Signature Malabar Biryanis', display_order=1)
        cat_curry, _ = MenuCategory.objects.get_or_create(restaurant=p_rest, name='Kerala Coastal Curries', display_order=2)
        cat_breads, _ = MenuCategory.objects.get_or_create(restaurant=p_rest, name='Breads & Sides', display_order=3)
        cat_beverages, _ = MenuCategory.objects.get_or_create(restaurant=p_rest, name='Beverages & Desserts', display_order=4)

        items_paragon = [
            {
                'restaurant': p_rest,
                'category': cat_biryani,
                'name': 'Thalassery Chicken Dum Biryani',
                'description': 'Fragrant Jeerakasala (Khaima) rice slow-cooked with tender chicken marinated in green chilli paste, fennel, fried golden onions, cashews, and pure Malabar ghee. Served with date pickle, raita & coconut chammanthi.',
                'price': Decimal('220.00'),
                'image_url': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
                'is_veg': False,
                'is_available': True,
                'preparation_time_mins': 18,
                'spice_level': 'medium',
                'portion_size': 'Serves 1-2 (approx 650g)',
                'ingredients': ['Khaima Rice', 'Farm Fresh Chicken', 'Malabar Ghee', 'Green Chillies', 'Mint & Coriander', 'Cashews', 'Sultanas', 'Cardamom & Cloves'],
                'allergens': ['Dairy (Ghee)', 'Nuts (Cashews)'],
                'calories': 680,
                'protein_g': 34.0,
                'carbs_g': 78.0,
                'fat_g': 22.0,
                'customization_options': [
                    {'title': 'Spice Adjustment', 'options': [{'name': 'Medium Spicy (Original)', 'price': 0}, {'name': 'Extra Spicy', 'price': 0}]},
                    {'title': 'Add-ons', 'options': [{'name': 'Extra Biryani Rice (300g)', 'price': 80}, {'name': 'Double Chicken Piece', 'price': 70}, {'name': 'Boiled Egg', 'price': 15}]}
                ],
                'is_bestseller': True,
            },
            {
                'restaurant': p_rest,
                'category': cat_biryani,
                'name': 'Malabar Mutton Biryani',
                'description': 'Succulent grass-fed tender mutton cooked to melting perfection with spices and aged Khaima rice, infused with fragrant screwpine water and golden saffron.',
                'price': Decimal('290.00'),
                'image_url': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
                'is_veg': False,
                'is_available': True,
                'preparation_time_mins': 22,
                'spice_level': 'medium',
                'portion_size': 'Serves 1-2 (approx 700g)',
                'ingredients': ['Khaima Rice', 'Tender Goat Meat', 'Desi Ghee', 'Kewra Water', 'Shallots', 'Ginger-Garlic Paste'],
                'allergens': ['Dairy (Ghee)', 'Nuts'],
                'calories': 760,
                'protein_g': 42.0,
                'carbs_g': 72.0,
                'fat_g': 28.0,
                'customization_options': [
                    {'title': 'Portion', 'options': [{'name': 'Regular', 'price': 0}, {'name': 'Large (+400g)', 'price': 140}]}
                ],
                'is_bestseller': True,
            },
            {
                'restaurant': p_rest,
                'category': cat_curry,
                'name': 'Kerala Fish Mango Curry (Meen Manga Curry)',
                'description': 'Fresh Seer Fish (Neymeen) simmered in tangy raw mango slices, thick coconut milk, turmeric, fenugreek, and fresh curry leaves tempered in coconut oil.',
                'price': Decimal('260.00'),
                'image_url': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
                'is_veg': False,
                'is_available': True,
                'preparation_time_mins': 20,
                'spice_level': 'spicy',
                'portion_size': 'Serves 2 (approx 450ml with 2 fish steaks)',
                'ingredients': ['King Fish (Seer)', 'Raw Green Mango', 'Pressed Coconut Milk', 'Shallots', 'Curry Leaves', 'Cold-Pressed Coconut Oil', 'Kashmiri Chilli'],
                'allergens': ['Fish'],
                'calories': 410,
                'protein_g': 28.0,
                'carbs_g': 12.0,
                'fat_g': 24.0,
                'customization_options': [
                    {'title': 'Spice Choice', 'options': [{'name': 'Traditional Kerala Spicy', 'price': 0}, {'name': 'Mild (Extra Coconut Cream)', 'price': 20}]}
                ],
                'is_bestseller': True,
            },
            {
                'restaurant': p_rest,
                'category': cat_curry,
                'name': 'Malabar Chicken Stew (Ishtu)',
                'description': 'Gentle and velvety stew prepared with chicken, potatoes, and whole spices simmered in first-press coconut milk. The quintessential breakfast & dinner pairing for appams.',
                'price': Decimal('190.00'),
                'image_url': 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
                'is_veg': False,
                'is_available': True,
                'preparation_time_mins': 15,
                'spice_level': 'mild',
                'portion_size': 'Serves 1-2 (400ml)',
                'ingredients': ['Chicken', 'Potatoes', 'Carrots', 'First & Second Coconut Milk', 'Ginger', 'Green Chillies', 'Curry Leaves'],
                'allergens': [],
                'calories': 380,
                'protein_g': 24.0,
                'carbs_g': 16.0,
                'fat_g': 18.0,
                'is_bestseller': False,
            },
            {
                'restaurant': p_rest,
                'category': cat_breads,
                'name': 'Crispy Flaky Malabar Parotta (Pack of 3)',
                'description': 'Multi-layered, flaky, golden flatbread hand-stretched and beaten to achieve whisper-thin airy layers. Served piping hot.',
                'price': Decimal('60.00'),
                'image_url': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
                'is_veg': True,
                'is_available': True,
                'preparation_time_mins': 8,
                'spice_level': 'none',
                'portion_size': '3 pieces',
                'ingredients': ['Refined Wheat Flour (Maida)', 'Salt', 'Milk', 'Veg Oil'],
                'allergens': ['Gluten', 'Dairy'],
                'calories': 480,
                'protein_g': 9.0,
                'carbs_g': 68.0,
                'fat_g': 16.0,
                'is_bestseller': True,
            },
            {
                'restaurant': p_rest,
                'category': cat_breads,
                'name': 'Lacy Kallappam / Vellayappam (Pack of 4)',
                'description': 'Soft fermented rice pancakes with a pillowy soft spongy centre and crispy lacy edges. Naturally fermented with tender coconut water.',
                'price': Decimal('65.00'),
                'image_url': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
                'is_veg': True,
                'is_available': True,
                'preparation_time_mins': 10,
                'spice_level': 'none',
                'portion_size': '4 pieces',
                'ingredients': ['Raw Rice', 'Grated Coconut', 'Coconut Toddy/Yeast', 'Sugar', 'Cumin'],
                'allergens': [],
                'calories': 320,
                'protein_g': 5.0,
                'carbs_g': 64.0,
                'fat_g': 3.0,
                'is_bestseller': False,
            },
            {
                'restaurant': p_rest,
                'category': cat_beverages,
                'name': 'Kozhikodan Kulukki Sarbath',
                'description': 'Refreshing shaken Kerala lemonade with crushed ice, basil seeds (sabja), fresh sweet green chilli, and chopped pineapple.',
                'price': Decimal('50.00'),
                'image_url': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
                'is_veg': True,
                'is_available': True,
                'preparation_time_mins': 5,
                'spice_level': 'mild',
                'portion_size': '350 ml',
                'ingredients': ['Lime Juice', 'Sabja Seeds', 'Pineapple chunks', 'Green Chilli', 'Sugar Syrup', 'Rock Salt'],
                'allergens': [],
                'calories': 120,
                'protein_g': 1.0,
                'carbs_g': 28.0,
                'fat_g': 0.2,
                'is_bestseller': True,
            }
        ]

        for item in items_paragon:
            MenuItem.objects.update_or_create(
                restaurant=item['restaurant'],
                name=item['name'],
                defaults=item
            )

        # Menu Items for Kuttanad Coastal Kitchen
        k_rest = restaurants_by_slug['kuttanad-toddy-coastal-kitchen']
        k_cat_special, _ = MenuCategory.objects.get_or_create(restaurant=k_rest, name='Toddy Shop Seafood Specials', display_order=1)
        k_cat_meat, _ = MenuCategory.objects.get_or_create(restaurant=k_rest, name='Backwater Meat Delicacies', display_order=2)
        k_cat_staples, _ = MenuCategory.objects.get_or_create(restaurant=k_rest, name='Kappa & Staples', display_order=3)

        items_kuttanad = [
            {
                'restaurant': k_rest,
                'category': k_cat_special,
                'name': 'Karimeen Pollichathu (Pearl Spot in Banana Leaf)',
                'description': 'The crown jewel of Kerala cuisine! Fresh backwater Pearl Spot fish coated in shallot and fiery red chilli masala, wrapped in tender plantain leaves and pan-roasted on a slow iron skillet.',
                'price': Decimal('320.00'),
                'image_url': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80',
                'is_veg': False,
                'is_available': True,
                'preparation_time_mins': 25,
                'spice_level': 'extra_spicy',
                'portion_size': '1 Whole Fish (approx 350g)',
                'ingredients': ['Fresh Pearl Spot Fish (Karimeen)', 'Shallots', 'Kudampuli (Malabar Tamarind)', 'Crushed Ginger-Garlic', 'Plantain Leaves', 'Cold Pressed Coconut Oil'],
                'allergens': ['Fish'],
                'calories': 460,
                'protein_g': 38.0,
                'carbs_g': 8.0,
                'fat_g': 22.0,
                'is_bestseller': True,
            },
            {
                'restaurant': k_rest,
                'category': k_cat_staples,
                'name': 'Steamed Tapioca with Red Fish Curry (Kappa & Meen Curry)',
                'description': 'Chunky boiled tapioca mashed with turmeric, grated coconut and crushed cumin, paired with clay-pot spicy red sardine/seer fish curry in Kodampuli gravy.',
                'price': Decimal('160.00'),
                'image_url': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
                'is_veg': False,
                'is_available': True,
                'preparation_time_mins': 15,
                'spice_level': 'spicy',
                'portion_size': 'Serves 1-2 (450g Kappa + 250ml Curry)',
                'ingredients': ['Tapioca (Kappa)', 'Fresh Fish', 'Grated Coconut', 'Red Chilli Powder', 'Kodampuli', 'Curry Leaves'],
                'allergens': ['Fish'],
                'calories': 520,
                'protein_g': 26.0,
                'carbs_g': 82.0,
                'fat_g': 12.0,
                'is_bestseller': True,
            },
            {
                'restaurant': k_rest,
                'category': k_cat_meat,
                'name': 'Kuttanadan Duck Roast (Tharavu Roast)',
                'description': 'Country duck pieces slow-roasted in thick caramelised shallot gravy with black pepper, crushed coriander seeds, and sliced coconut shards (thenga kothu).',
                'price': Decimal('280.00'),
                'image_url': 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=600&q=80',
                'is_veg': False,
                'is_available': True,
                'preparation_time_mins': 22,
                'spice_level': 'spicy',
                'portion_size': 'Serves 1-2 (approx 400g)',
                'ingredients': ['Country Duck', 'Small Onions', 'Tellicherry Black Pepper', 'Coconut Shards', 'Fennel', 'Curry Leaves'],
                'allergens': [],
                'calories': 610,
                'protein_g': 36.0,
                'carbs_g': 14.0,
                'fat_g': 38.0,
                'is_bestseller': True,
            }
        ]

        for item in items_kuttanad:
            MenuItem.objects.update_or_create(
                restaurant=item['restaurant'],
                name=item['name'],
                defaults=item
            )

        # Menu Items for Aaryas Pure Veg
        a_rest = restaurants_by_slug['aaryas-heritage-pure-veg']
        a_cat_dosa, _ = MenuCategory.objects.get_or_create(restaurant=a_rest, name='Crisp Dosas & Tiffins', display_order=1)
        a_cat_traditional, _ = MenuCategory.objects.get_or_create(restaurant=a_rest, name='Traditional Kerala Veg Breakfast', display_order=2)
        a_cat_beverages, _ = MenuCategory.objects.get_or_create(restaurant=a_rest, name='Hot Beverages', display_order=3)

        items_aaryas = [
            {
                'restaurant': a_rest,
                'category': a_cat_dosa,
                'name': 'Golden Ghee Roast Masala Dosa',
                'description': 'Ultra crisp, golden fermented rice and lentil crepe roasted in pure cow ghee, stuffed with spiced potato and onion bhaji. Served with 3 coconut chutneys and hot sambar.',
                'price': Decimal('110.00'),
                'image_url': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
                'is_veg': True,
                'is_available': True,
                'preparation_time_mins': 12,
                'spice_level': 'mild',
                'portion_size': '1 large crispy Dosa with 3 dips',
                'ingredients': ['Rice & Urad Dal Batter', 'Pure Desi Cow Ghee', 'Potatoes', 'Mustard Seeds', 'Curry Leaves', 'Turmeric'],
                'allergens': ['Dairy (Ghee)'],
                'calories': 390,
                'protein_g': 8.5,
                'carbs_g': 52.0,
                'fat_g': 16.0,
                'customization_options': [
                    {'title': 'Chutney Preference', 'options': [{'name': 'All 3 (Coconut, Tomato, Mint)', 'price': 0}, {'name': 'Extra Sambar Cup', 'price': 15}]}
                ],
                'is_bestseller': True,
            },
            {
                'restaurant': a_rest,
                'category': a_cat_traditional,
                'name': 'Kerala Rice Puttu with Black Chickpea Curry (Kadala Curry)',
                'description': 'Steamed cylindrical rice cake layered with freshly grated coconut, served with a rich and spicy black chickpea curry flavoured with roasted coconut paste and mustard seeds.',
                'price': Decimal('95.00'),
                'image_url': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
                'is_veg': True,
                'is_available': True,
                'preparation_time_mins': 10,
                'spice_level': 'medium',
                'portion_size': '1 Puttu Log + 250ml Kadala Curry',
                'ingredients': ['Coarse Rice Flour', 'Fresh Grated Coconut', 'Black Chickpeas', 'Roasted Coconut Masala', 'Shallots', 'Curry Leaves'],
                'allergens': [],
                'calories': 420,
                'protein_g': 14.0,
                'carbs_g': 72.0,
                'fat_g': 8.0,
                'customization_options': [
                    {'title': 'Add Papad & Banana', 'options': [{'name': 'Small Nendran Banana + Papad', 'price': 20}, {'name': 'No extra', 'price': 0}]}
                ],
                'is_bestseller': True,
            },
            {
                'restaurant': a_rest,
                'category': a_cat_traditional,
                'name': 'Deluxe Kerala Vegetarian Sadya Bento Box',
                'description': 'An authentic 12-item festival feast in a travel-safe bento: Steamed Matta Rice, Sambar, Parippu with Ghee, Avial, Thoran, Olan, Pachadi, Ginger Pickle (Inji Puli), Pappadam & Sweet Paalada Payasam.',
                'price': Decimal('180.00'),
                'image_url': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
                'is_veg': True,
                'is_available': True,
                'preparation_time_mins': 14,
                'spice_level': 'medium',
                'portion_size': 'Complete Meal for 1 (Full Sadya)',
                'ingredients': ['Kerala Red Matta Rice', 'Mixed Vegetables', 'Lentils', 'Coconut Milk', 'Yogurt', 'Ghee', 'Payasam with Rice Flakes'],
                'allergens': ['Dairy'],
                'calories': 680,
                'protein_g': 18.0,
                'carbs_g': 110.0,
                'fat_g': 16.0,
                'is_bestseller': True,
            },
            {
                'restaurant': a_rest,
                'category': a_cat_beverages,
                'name': 'South Indian Degree Filter Coffee',
                'description': 'Frothy, aromatic chicory-infused filter coffee decoction whipped with whole milk in a traditional brass dabarah set.',
                'price': Decimal('40.00'),
                'image_url': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
                'is_veg': True,
                'is_available': True,
                'preparation_time_mins': 4,
                'spice_level': 'none',
                'portion_size': '180 ml',
                'ingredients': ['Plantation A Coffee Beans', 'Chicory', 'Full Cream Milk', 'Cane Sugar'],
                'allergens': ['Dairy'],
                'calories': 95,
                'protein_g': 3.5,
                'carbs_g': 12.0,
                'fat_g': 4.0,
                'is_bestseller': True,
            }
        ]

        for item in items_aaryas:
            MenuItem.objects.update_or_create(
                restaurant=item['restaurant'],
                name=item['name'],
                defaults=item
            )

        # Menu Items for Calicut Street
        c_rest = restaurants_by_slug['calicut-street-halwa-junction']
        c_cat_snack, _ = MenuCategory.objects.get_or_create(restaurant=c_rest, name='Kozhikodan Evening Snacks', display_order=1)
        
        items_calicut = [
            {
                'restaurant': c_rest,
                'category': c_cat_snack,
                'name': 'Pazham Pori with Spicy Beef Roast (Combo)',
                'description': 'The iconic Malayali pairing! Sweet golden ripe plantain fritters served alongside dark, pepper-crusted Kerala beef roast with coconut slivers.',
                'price': Decimal('160.00'),
                'image_url': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
                'is_veg': False,
                'is_available': True,
                'preparation_time_mins': 12,
                'spice_level': 'spicy',
                'portion_size': '2 Large Pazham Pori + 150g Beef Roast',
                'ingredients': ['Ripe Nendran Plantain', 'Beef Meat', 'Black Pepper', 'Cardamom Batter', 'Curry Leaves', 'Coconut Oil'],
                'allergens': ['Gluten'],
                'calories': 560,
                'protein_g': 28.0,
                'carbs_g': 64.0,
                'fat_g': 20.0,
                'is_bestseller': True,
            },
            {
                'restaurant': c_rest,
                'category': c_cat_snack,
                'name': 'Royal Calicut Black Halwa (250g Box)',
                'description': 'Glossy, melt-in-mouth slow-stirred Kozhikodan halwa cooked with pure coconut oil, jaggery and crushed cashews.',
                'price': Decimal('120.00'),
                'image_url': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
                'is_veg': True,
                'is_available': True,
                'preparation_time_mins': 5,
                'spice_level': 'none',
                'portion_size': '250 grams pack',
                'ingredients': ['Wheat Flour', 'Dark Palm Jaggery', 'Cold-Pressed Coconut Oil', 'Cashews', 'Cardamom'],
                'allergens': ['Gluten', 'Nuts'],
                'calories': 510,
                'protein_g': 4.0,
                'carbs_g': 85.0,
                'fat_g': 18.0,
                'is_bestseller': True,
            }
        ]
        for item in items_calicut:
            MenuItem.objects.update_or_create(
                restaurant=item['restaurant'],
                name=item['name'],
                defaults=item
            )

        # LastCall Bites (Surplus Offers)
        LastCallBite.objects.update_or_create(
            restaurant=p_rest,
            title='Late Night Thalassery Biryani Feast Pack',
            defaults={
                'description': 'Restaurant-quality Thalassery Chicken Biryani + 2 Malabar Parottas prepared fresh for evening service, discounted to avoid food waste.',
                'image_url': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
                'original_price': Decimal('280.00'),
                'discounted_price': Decimal('159.00'),
                'quantity_total': 12,
                'quantity_remaining': 7,
                'pickup_deadline': '10:45 PM',
                'is_active': True,
            }
        )

        LastCallBite.objects.update_or_create(
            restaurant=a_rest,
            title='Evening Tiffin Combo Bento',
            defaults={
                'description': '2 Ghee Roast Dosas + 2 Puttu slices with Kadala curry and filter coffee flask.',
                'image_url': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
                'original_price': Decimal('220.00'),
                'discounted_price': Decimal('119.00'),
                'quantity_total': 15,
                'quantity_remaining': 4,
                'pickup_deadline': '10:15 PM',
                'is_active': True,
            }
        )

        # Sample Orders
        order1, created1 = Order.objects.update_or_create(
            order_number='QB-20261025-0101',
            defaults={
                'customer': customer_user,
                'restaurant': p_rest,
                'delivery_partner': rider_user,
                'status': 'DELIVERED',
                'items_subtotal': Decimal('280.00'),
                'tax_amount': Decimal('14.00'),
                'delivery_fee': Decimal('30.00'),
                'platform_fee': Decimal('5.00'),
                'discount_amount': Decimal('50.00'),
                'coupon_code': 'QUICK50',
                'total_amount': Decimal('279.00'),
                'payment_method': 'upi',
                'payment_status': 'paid',
                'delivery_address': {
                    'label': 'Home',
                    'address_line1': 'Flat 4B, Skyline Imperial Heights',
                    'city': 'Kochi',
                    'area': 'Marine Drive',
                    'postal_code': '682031'
                },
                'preparation_time_mins': 20,
            }
        )
        if created1 or not order1.items.exists():
            item1 = MenuItem.objects.filter(restaurant=p_rest, name='Thalassery Chicken Dum Biryani').first()
            parotta = MenuItem.objects.filter(restaurant=p_rest, name__icontains='Parotta').first()
            if item1:
                OrderItem.objects.create(
                    order=order1,
                    menu_item=item1,
                    item_name=item1.name,
                    quantity=1,
                    price_per_unit=item1.price,
                    total_price=item1.price
                )
            if parotta:
                OrderItem.objects.create(
                    order=order1,
                    menu_item=parotta,
                    item_name=parotta.name,
                    quantity=1,
                    price_per_unit=parotta.price,
                    total_price=parotta.price
                )

        Payment.objects.get_or_create(
            order=order1,
            defaults={
                'razorpay_order_id': 'order_OCmK1092kl8',
                'razorpay_payment_id': 'pay_OCmL9931kLp',
                'amount': Decimal('279.00'),
                'status': 'success',
                'payment_method': 'UPI (Google Pay)',
            }
        )

        # Add review for order1
        Review.objects.get_or_create(
            order=order1,
            defaults={
                'customer': customer_user,
                'restaurant': p_rest,
                'rating': 5,
                'food_rating': 5,
                'delivery_rating': 5,
                'taste_score': 5,
                'quantity_score': 5,
                'packaging_score': 5,
                'value_score': 5,
                'comment': 'Sensational biryani! The aroma of Malabar ghee and tender chicken pieces was outstanding. Delivered hot in 22 minutes by Amal.',
                'is_verified_purchase': True,
            }
        )

        # Active Order (Preparing in Kitchen)
        order2, created2 = Order.objects.update_or_create(
            order_number='QB-20261025-0102',
            defaults={
                'customer': customer_user,
                'restaurant': p_rest,
                'delivery_partner': rider_user,
                'status': 'PREPARING',
                'items_subtotal': Decimal('325.00'),
                'tax_amount': Decimal('16.25'),
                'delivery_fee': Decimal('30.00'),
                'platform_fee': Decimal('5.00'),
                'discount_amount': Decimal('0.00'),
                'total_amount': Decimal('376.25'),
                'payment_method': 'upi',
                'payment_status': 'paid',
                'delivery_address': {
                    'label': 'Home',
                    'address_line1': 'Flat 4B, Skyline Imperial Heights',
                    'city': 'Kochi',
                    'area': 'Marine Drive',
                    'postal_code': '682031'
                },
                'preparation_time_mins': 20,
                'estimated_delivery_time': timezone.now() + timedelta(minutes=25)
            }
        )
        if created2 or not order2.items.exists():
            curry = MenuItem.objects.filter(restaurant=p_rest, name__icontains='Mango').first()
            if curry:
                OrderItem.objects.create(
                    order=order2,
                    menu_item=curry,
                    item_name=curry.name,
                    quantity=1,
                    price_per_unit=curry.price,
                    total_price=curry.price
                )

        Payment.objects.get_or_create(
            order=order2,
            defaults={
                'razorpay_order_id': 'order_Live821092',
                'razorpay_payment_id': 'pay_Live773819',
                'amount': Decimal('376.25'),
                'status': 'success',
                'payment_method': 'UPI (PhonePe)',
            }
        )

        # BitePoints Ledger
        BitePointsLedger.objects.get_or_create(
            user=customer_user,
            transaction_type='welcome_bonus',
            defaults={
                'points': 100,
                'description': 'Welcome bonus for joining QuickBite Kerala!'
            }
        )
        BitePointsLedger.objects.get_or_create(
            user=customer_user,
            transaction_type='order_reward',
            order=order1,
            defaults={
                'points': 28,
                'description': 'Reward points earned on Order #QB-20261025-0101'
            }
        )

        # Rider Earnings
        RiderEarningsLedger.objects.get_or_create(
            rider=rider_user,
            order=order1,
            defaults={
                'amount': Decimal('55.00'),
                'earning_type': 'delivery_fee',
                'description': 'Base payout + on-time incentive for Order #QB-20261025-0101'
            }
        )

        # MealPass Subscription
        MealPassSubscription.objects.get_or_create(
            user=customer_user,
            plan_name='Malabar Homestyle Lunch Pass',
            defaults={
                'plan_duration': 'weekly',
                'meal_type': 'lunch',
                'start_date': timezone.now().date(),
                'end_date': timezone.now().date() + timedelta(days=7),
                'status': 'active',
                'price_paid': Decimal('899.00'),
                'paused_dates': []
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded QuickBite platform with demo data!'))
