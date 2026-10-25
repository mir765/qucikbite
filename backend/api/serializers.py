from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    CustomerAddress, Restaurant, MenuCategory, MenuItem,
    Order, OrderItem, Payment, Coupon, GroupOrder,
    BitePointsLedger, LastCallBite, MealPassSubscription,
    Review, RiderProfile, RiderEarningsLedger, SupportTicket
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'profile_photo', 'dietary_preferences',
            'notification_preferences', 'is_phone_verified', 'is_staff'
        ]
        read_only_fields = ['id', 'is_staff']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'phone', 'first_name', 'last_name']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # If rider, create profile
        if user.role == 'rider':
            RiderProfile.objects.get_or_create(user=user)
        # Award welcome BitePoints for new customers
        if user.role == 'customer':
            BitePointsLedger.objects.create(
                user=user,
                points=100,
                transaction_type='welcome_bonus',
                description='Welcome to QuickBite Kerala! 100 bonus points.'
            )
        return user


class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at']


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = '__all__'


class MenuCategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'description', 'display_order', 'is_active', 'items']


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    customer_username = serializers.CharField(source='customer.username', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class RestaurantListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'slug', 'tagline', 'logo_url', 'banner_url',
            'cuisines', 'city', 'area', 'rating', 'total_reviews',
            'price_range', 'is_pure_veg', 'is_open', 'approval_status',
            'avg_delivery_time_mins', 'delivery_fee_base', 'min_order_amount',
            'featured'
        ]


class RestaurantDetailSerializer(serializers.ModelSerializer):
    categories = MenuCategorySerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = '__all__'


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'
        read_only_fields = ['id', 'order']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    restaurant_phone = serializers.CharField(source='restaurant.phone', read_only=True)
    restaurant_address = serializers.CharField(source='restaurant.address', read_only=True)
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    delivery_partner_name = serializers.CharField(source='delivery_partner.get_full_name', read_only=True)
    delivery_partner_phone = serializers.CharField(source='delivery_partner.phone', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


class GroupOrderSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.get_full_name', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)

    class Meta:
        model = GroupOrder
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class BitePointsLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = BitePointsLedger
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class LastCallBiteSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    restaurant_area = serializers.CharField(source='restaurant.area', read_only=True)

    class Meta:
        model = LastCallBite
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class MealPassSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPassSubscription
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class RiderProfileSerializer(serializers.ModelSerializer):
    rider_name = serializers.CharField(source='user.get_full_name', read_only=True)
    rider_phone = serializers.CharField(source='user.phone', read_only=True)

    class Meta:
        model = RiderProfile
        fields = '__all__'


class RiderEarningsLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiderEarningsLedger
        fields = '__all__'


class SupportTicketSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = SupportTicket
        fields = '__all__'
        read_only_fields = ['id', 'ticket_number', 'created_at', 'updated_at']
