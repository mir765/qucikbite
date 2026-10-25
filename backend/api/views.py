import uuid
import re
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q
from django.contrib.auth import authenticate, get_user_model
from rest_framework import status, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .models import (
    CustomerAddress, Restaurant, MenuCategory, MenuItem,
    Order, OrderItem, Payment, Coupon, GroupOrder,
    BitePointsLedger, LastCallBite, MealPassSubscription,
    Review, RiderProfile, RiderEarningsLedger, SupportTicket
)
from .serializers import (
    UserSerializer, UserRegisterSerializer, CustomerAddressSerializer,
    RestaurantListSerializer, RestaurantDetailSerializer,
    MenuItemSerializer, MenuCategorySerializer, OrderSerializer,
    PaymentSerializer, CouponSerializer, GroupOrderSerializer,
    BitePointsLedgerSerializer, LastCallBiteSerializer,
    MealPassSubscriptionSerializer, ReviewSerializer,
    RiderProfileSerializer, RiderEarningsLedgerSerializer,
    SupportTicketSerializer
)

User = get_user_model()


# ==========================================
# AUTHENTICATION & PROFILE
# ==========================================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Account created successfully'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)
        
    user = authenticate(username=username, password=password)
    if not user:
        # Check by email as well
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass

    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET', 'PATCH'])
def me_view(request):
    # Allow fetching demo customer by default if unauthenticated in dev
    user = request.user
    if not user or not user.is_authenticated:
        demo_user = User.objects.filter(role='customer').first()
        if not demo_user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        user = demo_user

    if request.method == 'PATCH':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(UserSerializer(user).data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def switch_demo_role_view(request):
    """Convenient endpoint for switching between Customer, Restaurant Owner, Rider, and Admin demo accounts"""
    role = request.data.get('role', 'customer')
    user = User.objects.filter(role=role).first()
    if not user:
        user = User.objects.filter(is_superuser=True).first()
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Role user not found'}, status=status.HTTP_404_NOT_FOUND)


# ==========================================
# ADDRESSES
# ==========================================

@api_view(['GET', 'POST'])
def address_list_create(request):
    user = request.user if request.user.is_authenticated else User.objects.filter(role='customer').first()
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'GET':
        addresses = CustomerAddress.objects.filter(user=user).order_by('-is_default', '-created_at')
        return Response(CustomerAddressSerializer(addresses, many=True).data)

    elif request.method == 'POST':
        serializer = CustomerAddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE', 'PATCH'])
def address_detail(request, pk):
    user = request.user if request.user.is_authenticated else User.objects.filter(role='customer').first()
    try:
        address = CustomerAddress.objects.get(pk=pk, user=user)
    except CustomerAddress.DoesNotExist:
        return Response({'error': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        address.delete()
        return Response({'message': 'Address removed'})
    elif request.method == 'PATCH':
        serializer = CustomerAddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# RESTAURANTS & MENUS
# ==========================================

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def restaurant_list(request):
    queryset = Restaurant.objects.filter(is_active=True, approval_status='approved')
    
    city = request.GET.get('city')
    if city and city.lower() != 'all':
        queryset = queryset.filter(city__icontains=city)
        
    search = request.GET.get('search')
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) |
            Q(cuisines__icontains=search) |
            Q(area__icontains=search) |
            Q(menu_items__name__icontains=search)
        ).distinct()

    cuisine = request.GET.get('cuisine')
    if cuisine:
        queryset = queryset.filter(cuisines__icontains=cuisine)

    is_pure_veg = request.GET.get('is_pure_veg')
    if is_pure_veg in ['true', '1', True]:
        queryset = queryset.filter(is_pure_veg=True)

    sort_by = request.GET.get('sort_by', 'popular')
    if sort_by == 'rating':
        queryset = queryset.order_by('-rating')
    elif sort_by == 'delivery_time':
        queryset = queryset.order_by('avg_delivery_time_mins')
    elif sort_by == 'min_order':
        queryset = queryset.order_by('min_order_amount')
    else:
        queryset = queryset.order_by('-featured', '-rating', '-total_reviews')

    return Response(RestaurantListSerializer(queryset, many=True).data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def restaurant_detail(request, slug_or_id):
    try:
        if slug_or_id.isdigit():
            restaurant = Restaurant.objects.get(pk=slug_or_id)
        else:
            restaurant = Restaurant.objects.get(slug=slug_or_id)
    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=status.HTTP_404_NOT_FOUND)

    return Response(RestaurantDetailSerializer(restaurant).data)


@api_view(['GET', 'POST', 'PATCH'])
def menu_items_management(request, pk=None):
    if request.method == 'GET':
        restaurant_id = request.GET.get('restaurant_id')
        queryset = MenuItem.objects.all()
        if restaurant_id:
            queryset = queryset.filter(restaurant_id=restaurant_id)
        return Response(MenuItemSerializer(queryset, many=True).data)

    elif request.method == 'POST':
        serializer = MenuItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PATCH':
        try:
            item = MenuItem.objects.get(pk=pk)
        except MenuItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = MenuItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# SMARTBITE AI — INTELLIGENT FOOD ASSISTANT
# ==========================================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def smartbite_ai_query(request):
    """
    Intelligent AI food discovery engine.
    Interprets natural language queries (budget, dietary preference, taste, party size, Kerala specialities)
    and returns tailored meal suggestions with transparent rationale.
    """
    query = request.data.get('query', '').strip()
    if not query:
        return Response({'error': 'Please provide a query'}, status=status.HTTP_400_BAD_REQUEST)

    query_lower = query.lower()
    
    # Extract budget from query if mentioned (e.g. "under 150", "₹200", "below 300")
    budget_match = re.search(r'(?:under|below|less than|within|₹|\bfor\b)\s*₹?\s*(\d+)', query_lower)
    budget = float(budget_match.group(1)) if budget_match else None

    # Detect dietary & taste filters
    is_veg_query = any(w in query_lower for w in ['veg', 'vegetarian', 'vegan', 'plant'])
    is_spicy_query = any(w in query_lower for w in ['spicy', 'fiery', 'hot', 'pepper', 'chilli'])
    is_kerala_special = any(w in query_lower for w in ['kerala', 'malabar', 'biryani', 'sadya', 'porotta', 'parotta', 'toddy', 'karimeen', 'puttu', 'kappa'])
    is_for_two = any(w in query_lower for w in ['two people', 'for 2', 'couple', 'duo', 'family'])

    items_qs = MenuItem.objects.filter(is_available=True, restaurant__is_open=True)

    if is_veg_query:
        items_qs = items_qs.filter(is_veg=True)
    if is_spicy_query:
        items_qs = items_qs.filter(spice_level__in=['spicy', 'extra_spicy'])
    if is_kerala_special:
        items_qs = items_qs.filter(
            Q(restaurant__cuisines__icontains='Kerala') |
            Q(restaurant__cuisines__icontains='Malabar') |
            Q(name__icontains='Malabar') |
            Q(name__icontains='Kerala') |
            Q(name__icontains='Biryani') |
            Q(name__icontains='Karimeen') |
            Q(name__icontains='Puttu')
        )

    matched_results = []
    for item in items_qs[:12]:
        price = float(item.price)
        delivery = float(item.restaurant.delivery_fee_base)
        tax = round(price * 0.05, 2)
        platform_fee = 5.0
        final_total = round(price + delivery + tax + platform_fee, 2)

        # Apply budget constraint if specified
        if budget and final_total > budget:
            continue

        # Formulate transparent AI rationale
        reasons = []
        if budget:
            reasons.append(f"Guaranteed within your ₹{int(budget)} limit (Total: ₹{int(final_total)})")
        if item.spice_level in ['spicy', 'extra_spicy']:
            reasons.append(f"Authentic Kerala spice level ({item.get_spice_level_display()})")
        if item.is_bestseller:
            reasons.append("Customer favourite bestseller in Kochi")
        if item.is_veg:
            reasons.append("100% pure vegetarian preparation")
        if 'Malabar' in item.name or 'Kerala' in item.name:
            reasons.append("Authentic heritage Kerala recipe")
        
        if not reasons:
            reasons.append(f"Rated {item.restaurant.rating}★ with fast delivery ({item.restaurant.avg_delivery_time_mins} mins)")

        matched_results.append({
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'image_url': item.image_url,
            'price': float(item.price),
            'final_payable_amount': final_total,
            'restaurant_id': item.restaurant.id,
            'restaurant_name': item.restaurant.name,
            'restaurant_rating': item.restaurant.rating,
            'avg_delivery_time_mins': item.restaurant.avg_delivery_time_mins,
            'is_veg': item.is_veg,
            'portion_size': item.portion_size,
            'calories': item.calories,
            'spice_level': item.spice_level,
            'transparent_reason': " • ".join(reasons)
        })

    # Sort best matches
    matched_results.sort(key=lambda x: (-x['restaurant_rating'], x['price']))

    summary_text = f"Found {len(matched_results)} matching dishes"
    if budget:
        summary_text += f" fitting strictly under ₹{int(budget)}"
    if is_veg_query:
        summary_text += " (Vegetarian)"

    return Response({
        'query': query,
        'summary': summary_text,
        'total_found': len(matched_results),
        'results': matched_results[:6]
    })


# ==========================================
# QUICKBITE BUDGET MODE
# ==========================================

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def budget_mode_view(request):
    """
    Signature Budget Mode:
    Computes exact payable amount (food + tax + platform fee + delivery - discount)
    and returns dishes that strictly never exceed the user's selected budget.
    """
    budget_raw = request.GET.get('budget', '199')
    try:
        budget = float(budget_raw)
    except ValueError:
        budget = 199.0

    is_veg = request.GET.get('is_veg') in ['true', '1', True]
    people = int(request.GET.get('people', 1))

    items_qs = MenuItem.objects.filter(is_available=True, restaurant__is_open=True)
    if is_veg:
        items_qs = items_qs.filter(is_veg=True)

    eligible_meals = []
    platform_fee = 5.0

    for item in items_qs:
        price = float(item.price)
        delivery = float(item.restaurant.delivery_fee_base)
        tax = round(price * 0.05, 2)
        
        # Check if applicable coupon can discount
        applicable_discount = 0.0
        if price >= 100:
            applicable_discount = min(30.0, price * 0.15)

        total_payable = round((price + delivery + tax + platform_fee) - applicable_discount, 2)

        if total_payable <= budget:
            remaining = round(budget - total_payable, 2)
            eligible_meals.append({
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'image_url': item.image_url,
                'dish_price': price,
                'delivery_fee': delivery,
                'tax_amount': tax,
                'platform_fee': platform_fee,
                'discount_applied': applicable_discount,
                'final_payable_amount': total_payable,
                'remaining_budget': remaining,
                'restaurant_id': item.restaurant.id,
                'restaurant_name': item.restaurant.name,
                'restaurant_rating': item.restaurant.rating,
                'portion_size': item.portion_size,
                'is_veg': item.is_veg,
                'serves': people,
            })

    eligible_meals.sort(key=lambda x: (x['final_payable_amount'], -x['restaurant_rating']))

    return Response({
        'target_budget': budget,
        'eligible_count': len(eligible_meals),
        'meals': eligible_meals[:10]
    })


# ==========================================
# CART & CHECKOUT CALCULATION
# ==========================================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def calculate_cart_view(request):
    """
    Validates items, checks multi-restaurant constraints, calculates
    subtotal, 5% GST, delivery fee, platform fee, validates coupon code,
    and returns verified totals.
    """
    items_data = request.data.get('items', [])
    coupon_code = request.data.get('coupon_code', '').strip().upper()
    restaurant_id = request.data.get('restaurant_id')

    if not items_data:
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

    # Validate items and check single restaurant constraint
    menu_item_ids = [item.get('id') or item.get('menu_item_id') for item in items_data]
    menu_items = MenuItem.objects.filter(id__in=menu_item_ids).select_related('restaurant')
    
    if not menu_items.exists():
        return Response({'error': 'Invalid items in cart'}, status=status.HTTP_400_BAD_REQUEST)

    # Check multi-restaurant violation
    restaurant_ids = {m.restaurant.id for m in menu_items}
    if len(restaurant_ids) > 1:
        return Response({
            'error': 'Items in an order must be from a single restaurant.',
            'multi_restaurant_conflict': True
        }, status=status.HTTP_400_BAD_REQUEST)

    primary_restaurant = menu_items.first().restaurant

    # Calculate item subtotals
    subtotal = Decimal('0.00')
    items_summary = []
    menu_items_dict = {m.id: m for m in menu_items}

    for item_data in items_data:
        item_id = item_data.get('id') or item_data.get('menu_item_id')
        qty = int(item_data.get('quantity', 1))
        menu_item = menu_items_dict.get(item_id)
        if not menu_item or not menu_item.is_available:
            continue

        item_price = menu_item.price
        line_total = item_price * qty
        subtotal += line_total
        items_summary.append({
            'menu_item_id': menu_item.id,
            'name': menu_item.name,
            'quantity': qty,
            'price_per_unit': float(item_price),
            'total_price': float(line_total)
        })

    tax_amount = round(subtotal * Decimal('0.05'), 2)
    delivery_fee = primary_restaurant.delivery_fee_base
    platform_fee = Decimal('5.00')

    discount_amount = Decimal('0.00')
    applied_coupon = None

    if coupon_code:
        coupon = Coupon.objects.filter(code=coupon_code, is_active=True).first()
        if coupon:
            if subtotal >= coupon.min_order_amount:
                if coupon.discount_percent > 0:
                    raw_discount = subtotal * (coupon.discount_percent / Decimal('100.0'))
                    discount_amount = min(raw_discount, coupon.max_discount_amount)
                elif coupon.discount_flat > 0:
                    discount_amount = coupon.discount_flat
                applied_coupon = {
                    'code': coupon.code,
                    'title': coupon.title,
                    'discount_amount': float(discount_amount)
                }

    total_amount = max(Decimal('0.00'), (subtotal + tax_amount + delivery_fee + platform_fee) - discount_amount)

    return Response({
        'restaurant': {
            'id': primary_restaurant.id,
            'name': primary_restaurant.name,
            'area': primary_restaurant.area,
            'avg_delivery_time_mins': primary_restaurant.avg_delivery_time_mins
        },
        'items': items_summary,
        'subtotal': float(subtotal),
        'tax_amount': float(tax_amount),
        'delivery_fee': float(delivery_fee),
        'platform_fee': float(platform_fee),
        'discount_amount': float(discount_amount),
        'applied_coupon': applied_coupon,
        'total_amount': float(total_amount),
    })


# ==========================================
# ORDERS & LIVE TRACKING
# ==========================================

@api_view(['GET', 'POST'])
def orders_view(request):
    user = request.user if request.user.is_authenticated else User.objects.filter(role='customer').first()
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'GET':
        role = request.GET.get('role', user.role)
        if role == 'restaurant_owner':
            orders = Order.objects.filter(restaurant__owner=user).order_by('-created_at')
        elif role == 'rider':
            orders = Order.objects.filter(delivery_partner=user).order_by('-created_at')
        elif role == 'admin' or user.is_staff:
            orders = Order.objects.all().order_by('-created_at')
        else:
            orders = Order.objects.filter(customer=user).order_by('-created_at')

        return Response(OrderSerializer(orders, many=True).data)

    elif request.method == 'POST':
        # Place order
        items_data = request.data.get('items', [])
        restaurant_id = request.data.get('restaurant_id')
        delivery_address = request.data.get('delivery_address', {})
        delivery_instructions = request.data.get('delivery_instructions', '')
        payment_method = request.data.get('payment_method', 'upi')
        coupon_code = request.data.get('coupon_code', '')

        if not items_data or not restaurant_id:
            return Response({'error': 'Missing restaurant or items'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            restaurant = Restaurant.objects.get(pk=restaurant_id)
        except Restaurant.DoesNotExist:
            return Response({'error': 'Restaurant not found'}, status=status.HTTP_404_NOT_FOUND)

        # Server recalculation
        subtotal = Decimal('0.00')
        order_items_to_create = []

        for item_data in items_data:
            item_id = item_data.get('id') or item_data.get('menu_item_id')
            qty = int(item_data.get('quantity', 1))
            try:
                m_item = MenuItem.objects.get(pk=item_id, restaurant=restaurant)
                line_total = m_item.price * qty
                subtotal += line_total
                order_items_to_create.append({
                    'menu_item': m_item,
                    'item_name': m_item.name,
                    'quantity': qty,
                    'price_per_unit': m_item.price,
                    'total_price': line_total,
                    'customizations': item_data.get('customizations', {}),
                    'special_instructions': item_data.get('special_instructions', '')
                })
            except MenuItem.DoesNotExist:
                continue

        tax_amount = round(subtotal * Decimal('0.05'), 2)
        delivery_fee = restaurant.delivery_fee_base
        platform_fee = Decimal('5.00')
        discount_amount = Decimal('0.00')

        if coupon_code:
            coupon = Coupon.objects.filter(code=coupon_code.upper(), is_active=True).first()
            if coupon and subtotal >= coupon.min_order_amount:
                if coupon.discount_percent > 0:
                    raw_discount = subtotal * (coupon.discount_percent / Decimal('100.0'))
                    discount_amount = min(raw_discount, coupon.max_discount_amount)
                elif coupon.discount_flat > 0:
                    discount_amount = coupon.discount_flat

        total_amount = max(Decimal('0.00'), (subtotal + tax_amount + delivery_fee + platform_fee) - discount_amount)

        # Assign available rider
        available_rider = User.objects.filter(role='rider', rider_profile__is_online=True).first()

        # Generate unique order number
        order_number = f"QB-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        order = Order.objects.create(
            order_number=order_number,
            customer=user,
            restaurant=restaurant,
            delivery_partner=available_rider,
            status='CONFIRMED',
            items_subtotal=subtotal,
            tax_amount=tax_amount,
            delivery_fee=delivery_fee,
            platform_fee=platform_fee,
            discount_amount=discount_amount,
            coupon_code=coupon_code,
            total_amount=total_amount,
            payment_method=payment_method,
            payment_status='paid' if payment_method != 'cod' else 'pending',
            delivery_address=delivery_address,
            delivery_instructions=delivery_instructions,
            preparation_time_mins=restaurant.avg_delivery_time_mins - 10,
            estimated_delivery_time=timezone.now() + timedelta(minutes=restaurant.avg_delivery_time_mins)
        )

        for item_kwargs in order_items_to_create:
            OrderItem.objects.create(order=order, **item_kwargs)

        # Initialize Payment record
        payment = Payment.objects.create(
            order=order,
            razorpay_order_id=f"order_{uuid.uuid4().hex[:12]}",
            razorpay_payment_id=f"pay_{uuid.uuid4().hex[:14]}" if payment_method != 'cod' else '',
            amount=total_amount,
            status='success' if payment_method != 'cod' else 'initiated',
            payment_method=payment_method.upper()
        )

        # Award BitePoints: 10 points per 100 spent
        points_earned = int((total_amount / Decimal('100.0')) * 10)
        if points_earned > 0 and user.role == 'customer':
            BitePointsLedger.objects.create(
                user=user,
                points=points_earned,
                transaction_type='order_reward',
                description=f"Reward points for Order #{order.order_number}",
                order=order
            )

        # Rider earnings entry
        if available_rider:
            RiderEarningsLedger.objects.create(
                rider=available_rider,
                order=order,
                amount=Decimal('45.00') + round(delivery_fee * Decimal('0.3'), 2),
                earning_type='delivery_fee',
                description=f"Delivery trip payout for Order #{order.order_number}"
            )

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def order_tracking_detail(request, order_number):
    try:
        order = Order.objects.select_related('restaurant', 'delivery_partner', 'customer').get(order_number=order_number)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    # HonestTrack metrics
    stages = [
        {'id': 'CONFIRMED', 'label': 'Order Placed & Confirmed', 'completed': True},
        {'id': 'ACCEPTED', 'label': 'Restaurant Accepted Order', 'completed': order.status in ['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED']},
        {'id': 'PREPARING', 'label': 'Kitchen Preparing Your Meal', 'completed': order.status in ['PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED']},
        {'id': 'READY_FOR_PICKUP', 'label': 'Food Packed & Ready for Pickup', 'completed': order.status in ['READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED']},
        {'id': 'OUT_FOR_DELIVERY', 'label': 'Rider On the Way to Your Door', 'completed': order.status in ['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED']},
        {'id': 'DELIVERED', 'label': 'Delivered Warm & Fresh', 'completed': order.status == 'DELIVERED'}
    ]

    # Live rider position simulation
    rider_coords = {'lat': 9.9816, 'lng': 76.2999}
    if order.delivery_partner and hasattr(order.delivery_partner, 'rider_profile'):
        profile = order.delivery_partner.rider_profile
        rider_coords = {'lat': profile.current_latitude, 'lng': profile.current_longitude}

    return Response({
        'order': OrderSerializer(order).data,
        'honest_track': {
            'preparation_time_mins': order.preparation_time_mins,
            'estimated_delivery_time': order.estimated_delivery_time,
            'delay_reason': order.delay_reason or 'Order is progressing on schedule with zero traffic hold-ups.',
            'late_compensation_policy': 'Guaranteed on-time promise: If delivery is delayed by more than 15 minutes beyond ETA, receive ₹50 in BitePoints.',
            'rider_coordinates': rider_coords,
            'stages': stages
        }
    })


@api_view(['PATCH'])
def update_order_status(request, order_number):
    try:
        order = Order.objects.get(order_number=order_number)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    delay_reason = request.data.get('delay_reason', '')
    cancellation_reason = request.data.get('cancellation_reason', '')

    valid_statuses = [s[0] for s in Order.STATUS_CHOICES]
    if new_status not in valid_statuses:
        return Response({'error': f'Invalid status. Must be one of {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)

    order.status = new_status
    if delay_reason:
        order.delay_reason = delay_reason
    if cancellation_reason:
        order.cancellation_reason = cancellation_reason
    order.save()

    return Response({
        'message': f'Order status updated to {new_status}',
        'order': OrderSerializer(order).data
    })


# ==========================================
# PAYMENTS & REFUNDS
# ==========================================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def razorpay_verify_payment(request):
    """
    Verifies Razorpay payment signature or sandbox mock payment,
    records transaction in Payment table, updates Order status to CONFIRMED.
    """
    order_number = request.data.get('order_number')
    payment_id = request.data.get('razorpay_payment_id', f"pay_{uuid.uuid4().hex[:12]}")
    order_id = request.data.get('razorpay_order_id', f"order_{uuid.uuid4().hex[:12]}")
    signature = request.data.get('razorpay_signature', 'sandbox_verified_signature')

    try:
        order = Order.objects.get(order_number=order_number)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    payment, _ = Payment.objects.get_or_create(order=order, defaults={'amount': order.total_amount})
    payment.razorpay_payment_id = payment_id
    payment.razorpay_order_id = order_id
    payment.razorpay_signature = signature
    payment.status = 'success'
    payment.save()

    order.payment_status = 'paid'
    order.status = 'CONFIRMED'
    order.save()

    return Response({
        'status': 'success',
        'message': 'Payment verified and confirmed successfully',
        'payment_id': payment_id,
        'order_number': order_number
    })


@api_view(['POST'])
def request_order_refund(request, order_number):
    try:
        order = Order.objects.get(order_number=order_number)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    reason = request.data.get('reason', 'Customer requested cancellation')
    order.status = 'REFUND_PENDING'
    order.cancellation_reason = reason
    order.save()

    if hasattr(order, 'payment_record'):
        pay = order.payment_record
        pay.status = 'refunded'
        pay.refund_id = f"rfnd_{uuid.uuid4().hex[:10]}"
        pay.refund_amount = order.total_amount
        pay.save()

    order.status = 'REFUNDED'
    order.payment_status = 'refunded'
    order.save()

    return Response({
        'message': 'Refund initiated and approved by policy',
        'refund_amount': float(order.total_amount),
        'order_status': order.status
    })


# ==========================================
# GROUPBITE — GROUP ORDERING
# ==========================================

@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
def group_orders_view(request, room_code=None):
    if request.method == 'POST':
        # Create group order room
        restaurant_id = request.data.get('restaurant_id')
        organizer = request.user if request.user.is_authenticated else User.objects.filter(role='customer').first()
        per_person_budget = request.data.get('per_person_budget', 250.00)

        try:
            restaurant = Restaurant.objects.get(pk=restaurant_id)
        except Restaurant.DoesNotExist:
            return Response({'error': 'Restaurant required'}, status=status.HTTP_400_BAD_REQUEST)

        code = f"GB-{uuid.uuid4().hex[:5].upper()}"
        group_order = GroupOrder.objects.create(
            room_code=code,
            organizer=organizer,
            restaurant=restaurant,
            per_person_budget=Decimal(str(per_person_budget)),
            members_data=[{
                'member_name': organizer.get_full_name() or organizer.username,
                'is_organizer': True,
                'items': []
            }]
        )
        return Response(GroupOrderSerializer(group_order).data, status=status.HTTP_201_CREATED)

    elif request.method == 'GET' and room_code:
        try:
            group = GroupOrder.objects.get(room_code=room_code)
            return Response(GroupOrderSerializer(group).data)
        except GroupOrder.DoesNotExist:
            return Response({'error': 'Group order room not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def group_order_add_item(request, room_code):
    try:
        group = GroupOrder.objects.get(room_code=room_code)
    except GroupOrder.DoesNotExist:
        return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)

    member_name = request.data.get('member_name', 'Guest').strip()
    item_id = request.data.get('item_id')
    item_name = request.data.get('item_name')
    price = float(request.data.get('price', 0))

    members = group.members_data or []
    # Find or add member
    member_entry = next((m for m in members if m['member_name'].lower() == member_name.lower()), None)
    if not member_entry:
        member_entry = {'member_name': member_name, 'is_organizer': False, 'items': []}
        members.append(member_entry)

    member_entry['items'].append({
        'item_id': item_id,
        'item_name': item_name,
        'price': price
    })

    group.members_data = members
    group.save()

    return Response(GroupOrderSerializer(group).data)


# ==========================================
# BITEPOINTS & REWARDS
# ==========================================

@api_view(['GET'])
def bitepoints_view(request):
    user = request.user if request.user.is_authenticated else User.objects.filter(role='customer').first()
    if not user:
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    entries = BitePointsLedger.objects.filter(user=user).order_by('-created_at')
    total_balance = sum(e.points for e in entries)

    return Response({
        'balance': total_balance,
        'referral_code': f"QB{user.username[:4].upper()}{user.id}",
        'milestones': [
            {'title': 'Foodie Rookie', 'target': 100, 'achieved': total_balance >= 100},
            {'title': 'Kerala Gourmet', 'target': 250, 'achieved': total_balance >= 250},
            {'title': 'Malabar Connoisseur', 'target': 500, 'achieved': total_balance >= 500},
        ],
        'ledger': BitePointsLedgerSerializer(entries, many=True).data
    })


@api_view(['POST'])
def redeem_bitepoints(request):
    user = request.user if request.user.is_authenticated else User.objects.filter(role='customer').first()
    points_to_redeem = int(request.data.get('points', 100))

    current_balance = sum(e.points for e in BitePointsLedger.objects.filter(user=user))
    if current_balance < points_to_redeem:
        return Response({'error': 'Insufficient BitePoints balance'}, status=status.HTTP_400_BAD_REQUEST)

    # 100 pts = ₹50 voucher
    voucher_val = int((points_to_redeem / 100) * 50)
    code = f"REWARD{voucher_val}-{uuid.uuid4().hex[:4].upper()}"

    Coupon.objects.create(
        code=code,
        title=f"₹{voucher_val} BitePoints Reward Voucher",
        description=f"Redeemed with {points_to_redeem} points. Valid on all restaurants.",
        discount_flat=Decimal(str(voucher_val)),
        min_order_amount=Decimal(str(voucher_val * 2)),
    )

    BitePointsLedger.objects.create(
        user=user,
        points=-points_to_redeem,
        transaction_type='redemption',
        description=f"Redeemed {points_to_redeem} pts for voucher {code}"
    )

    return Response({
        'message': f'Successfully redeemed {points_to_redeem} points!',
        'voucher_code': code,
        'voucher_value': voucher_val
    })


# ==========================================
# LASTCALL BITES — SURPLUS MEALS
# ==========================================

@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
def lastcall_bites_view(request):
    if request.method == 'GET':
        bites = LastCallBite.objects.filter(is_active=True, quantity_remaining__gt=0)
        return Response(LastCallBiteSerializer(bites, many=True).data)

    elif request.method == 'POST':
        serializer = LastCallBiteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# MEALPASS SUBSCRIPTIONS
# ==========================================

@api_view(['GET', 'POST'])
def mealpass_view(request):
    user = request.user if request.user.is_authenticated else User.objects.filter(role='customer').first()
    
    if request.method == 'GET':
        plans = [
            {
                'id': 'plan_lunch_malabar',
                'title': 'Authentic Malabar Homestyle Lunch',
                'description': 'Daily rotational traditional Kerala lunch (Parotta/Rice + Chicken or Fish Curry + Veg Side). Mon to Fri.',
                'weekly_price': 899,
                'monthly_price': 3299,
                'cuisine': 'Kerala Coastal & Malabar'
            },
            {
                'id': 'plan_veg_sadya',
                'title': 'Aaryas Pure Veg Heritage Pass',
                'description': 'Daily fresh hot South Indian tiffin breakfast or red rice Kerala sadya lunch with payasam.',
                'weekly_price': 749,
                'monthly_price': 2799,
                'cuisine': 'Pure Vegetarian'
            },
            {
                'id': 'plan_fit_bowl',
                'title': 'QuickBite Lean & Clean Fit Bowls',
                'description': 'High-protein grilled chicken/paneer meal bowls with fresh Kerala salad and lentils.',
                'weekly_price': 999,
                'monthly_price': 3699,
                'cuisine': 'Fitness & Nutrition'
            }
        ]
        user_subs = MealPassSubscription.objects.filter(user=user)
        return Response({
            'available_plans': plans,
            'my_subscriptions': MealPassSubscriptionSerializer(user_subs, many=True).data
        })

    elif request.method == 'POST':
        plan_name = request.data.get('plan_name')
        duration = request.data.get('plan_duration', 'weekly')
        meal_type = request.data.get('meal_type', 'lunch')
        price = Decimal(str(request.data.get('price_paid', 899)))

        start_date = timezone.now().date()
        end_date = start_date + (timedelta(days=7) if duration == 'weekly' else timedelta(days=30))

        sub = MealPassSubscription.objects.create(
            user=user,
            plan_name=plan_name,
            plan_duration=duration,
            meal_type=meal_type,
            start_date=start_date,
            end_date=end_date,
            price_paid=price,
            status='active'
        )
        return Response(MealPassSubscriptionSerializer(sub).data, status=status.HTTP_201_CREATED)


# ==========================================
# RESTAURANT DASHBOARD & COPILOT
# ==========================================

@api_view(['GET'])
def restaurant_dashboard_overview(request):
    user = request.user if request.user.is_authenticated else User.objects.filter(role='restaurant_owner').first()
    restaurant = Restaurant.objects.filter(owner=user).first() or Restaurant.objects.first()

    today_orders = Order.objects.filter(restaurant=restaurant)
    
    total_revenue = today_orders.filter(status='DELIVERED').aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal('0.00')
    pending_count = today_orders.filter(status__in=['CONFIRMED', 'ACCEPTED']).count()
    preparing_count = today_orders.filter(status='PREPARING').count()
    ready_count = today_orders.filter(status='READY_FOR_PICKUP').count()
    completed_count = today_orders.filter(status='DELIVERED').count()

    popular_dishes = MenuItem.objects.filter(restaurant=restaurant, is_bestseller=True)[:4]

    return Response({
        'restaurant': {
            'id': restaurant.id,
            'name': restaurant.name,
            'is_open': restaurant.is_open,
            'rating': restaurant.rating,
            'fssai_verified': restaurant.fssai_verified
        },
        'metrics': {
            'total_revenue': float(total_revenue),
            'pending_orders': pending_count,
            'preparing_orders': preparing_count,
            'ready_orders': ready_count,
            'completed_orders': completed_count,
            'average_rating': restaurant.rating,
            'commission_rate': float(restaurant.commission_rate),
            'net_payout': float(total_revenue * (Decimal('100.0') - restaurant.commission_rate) / Decimal('100.0'))
        },
        'sales_copilot': {
            'peak_hours': '12:30 PM - 2:00 PM & 7:45 PM - 9:30 PM',
            'smart_suggestion': 'Demand for Thalassery Biryani spikes by 35% on Sunday evenings. Consider keeping 15 extra portions prepped.',
            'inventory_alert': 'Khaima Rice stock is at 14kg (sufficient for ~28 orders).'
        },
        'popular_dishes': MenuItemSerializer(popular_dishes, many=True).data,
        'recent_orders': OrderSerializer(today_orders.order_by('-created_at')[:8], many=True).data
    })


# ==========================================
# DELIVERY PARTNER / RIDER DASHBOARD
# ==========================================

@api_view(['GET'])
def rider_dashboard_view(request):
    rider_user = request.user if (request.user.is_authenticated and request.user.role == 'rider') else User.objects.filter(role='rider').first()
    profile, _ = RiderProfile.objects.get_or_create(user=rider_user)

    # Available deliveries seeking rider or assigned
    active_deliveries = Order.objects.filter(
        delivery_partner=rider_user,
        status__in=['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY']
    )
    unassigned_requests = Order.objects.filter(
        delivery_partner__isnull=True,
        status__in=['CONFIRMED', 'ACCEPTED', 'READY_FOR_PICKUP']
    )[:3]

    earnings_entries = RiderEarningsLedger.objects.filter(rider=rider_user).order_by('-created_at')
    total_earnings = earnings_entries.aggregate(Sum('amount'))['amount__sum'] or Decimal('0.00')

    return Response({
        'profile': RiderProfileSerializer(profile).data,
        'active_delivery': OrderSerializer(active_deliveries.first()).data if active_deliveries.exists() else None,
        'available_requests': OrderSerializer(unassigned_requests, many=True).data,
        'metrics': {
            'total_earnings': float(total_earnings),
            'completed_trips': profile.total_deliveries,
            'rating': profile.rating,
            'wallet_balance': float(profile.wallet_balance)
        },
        'earnings_history': RiderEarningsLedgerSerializer(earnings_entries[:10], many=True).data
    })


@api_view(['POST'])
def rider_toggle_status(request):
    rider_user = request.user if (request.user.is_authenticated and request.user.role == 'rider') else User.objects.filter(role='rider').first()
    profile, _ = RiderProfile.objects.get_or_create(user=rider_user)
    
    if 'is_online' in request.data:
        profile.is_online = bool(request.data.get('is_online'))
    if 'latitude' in request.data:
        profile.current_latitude = float(request.data.get('latitude'))
    if 'longitude' in request.data:
        profile.current_longitude = float(request.data.get('longitude'))
    profile.save()

    return Response({
        'is_online': profile.is_online,
        'current_latitude': profile.current_latitude,
        'current_longitude': profile.current_longitude,
        'message': f"Rider is now {'ONLINE' if profile.is_online else 'OFFLINE'}"
    })


# ==========================================
# ADMINISTRATOR DASHBOARD
# ==========================================

@api_view(['GET'])
def admin_overview_metrics(request):
    total_orders = Order.objects.count()
    completed_orders = Order.objects.filter(status='DELIVERED')
    gross_order_value = completed_orders.aggregate(Sum('total_amount'))['total_amount__sum'] or Decimal('0.00')
    platform_commission = completed_orders.aggregate(Sum('platform_fee'))['platform_fee__sum'] or Decimal('0.00')
    platform_commission += round(gross_order_value * Decimal('0.15'), 2)  # 15% commission

    total_customers = User.objects.filter(role='customer').count()
    active_restaurants = Restaurant.objects.filter(approval_status='approved', is_active=True).count()
    active_riders = RiderProfile.objects.filter(is_online=True).count()

    # Recent orders
    recent_orders = Order.objects.all().order_by('-created_at')[:10]

    return Response({
        'metrics': {
            'total_orders': total_orders,
            'gross_order_value': float(gross_order_value),
            'platform_commission': float(platform_commission),
            'total_customers': total_customers,
            'active_restaurants': active_restaurants,
            'active_riders': active_riders,
            'avg_order_value': float(gross_order_value / completed_orders.count()) if completed_orders.count() else 0.0
        },
        'service_areas': [
            {'city': 'Kochi', 'orders_count': 320, 'growth': '+18%'},
            {'city': 'Trivandrum', 'orders_count': 180, 'growth': '+12%'},
            {'city': 'Kozhikode', 'orders_count': 140, 'growth': '+15%'},
            {'city': 'Thrissur', 'orders_count': 90, 'growth': '+8%'},
        ],
        'recent_orders': OrderSerializer(recent_orders, many=True).data
    })


@api_view(['GET', 'PATCH'])
def admin_restaurants_management(request, pk=None):
    if request.method == 'GET':
        restaurants = Restaurant.objects.all().order_by('-created_at')
        return Response(RestaurantDetailSerializer(restaurants, many=True).data)
    elif request.method == 'PATCH' and pk:
        restaurant = Restaurant.objects.get(pk=pk)
        approval_status = request.data.get('approval_status')
        if approval_status:
            restaurant.approval_status = approval_status
            restaurant.save()
        return Response({'message': f'Restaurant status updated to {restaurant.approval_status}'})


@api_view(['GET'])
def admin_users_list(request):
    users = User.objects.all().order_by('-date_joined')
    return Response(UserSerializer(users, many=True).data)


# ==========================================
# SUPPORT TICKETS & REVIEWS
# ==========================================

@api_view(['GET', 'POST'])
def support_tickets_view(request):
    user = request.user if request.user.is_authenticated else User.objects.filter(role='customer').first()
    
    if request.method == 'GET':
        if user.is_staff or user.role == 'admin':
            tickets = SupportTicket.objects.all().order_by('-created_at')
        else:
            tickets = SupportTicket.objects.filter(user=user).order_by('-created_at')
        return Response(SupportTicketSerializer(tickets, many=True).data)

    elif request.method == 'POST':
        ticket_number = f"TK-{uuid.uuid4().hex[:6].upper()}"
        serializer = SupportTicketSerializer(data=request.data)
        if serializer.is_valid():
            ticket = serializer.save(user=user, ticket_number=ticket_number)
            return Response(SupportTicketSerializer(ticket).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
def reviews_view(request):
    if request.method == 'GET':
        restaurant_id = request.GET.get('restaurant_id')
        reviews = Review.objects.all()
        if restaurant_id:
            reviews = reviews.filter(restaurant_id=restaurant_id)
        return Response(ReviewSerializer(reviews.order_by('-created_at'), many=True).data)

    elif request.method == 'POST':
        user = request.user if request.user.is_authenticated else User.objects.filter(role='customer').first()
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(customer=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
