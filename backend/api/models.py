import uuid
from decimal import Decimal
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('restaurant_owner', 'Restaurant Owner'),
        ('rider', 'Delivery Partner'),
        ('admin', 'Administrator'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=20, blank=True, default='')
    profile_photo = models.URLField(blank=True, default='')
    dietary_preferences = models.JSONField(default=list, blank=True)
    notification_preferences = models.JSONField(default=dict, blank=True)
    is_phone_verified = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class CustomerAddress(models.Model):
    LABEL_CHOICES = [
        ('home', 'Home'),
        ('work', 'Work'),
        ('other', 'Other'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=20, choices=LABEL_CHOICES, default='home')
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True, default='')
    landmark = models.CharField(max_length=150, blank=True, default='')
    city = models.CharField(max_length=100, default='Kochi')
    state = models.CharField(max_length=100, default='Kerala')
    postal_code = models.CharField(max_length=10, default='682001')
    latitude = models.FloatField(default=9.9816)
    longitude = models.FloatField(default=76.2999)
    is_default = models.BooleanField(default=False)
    delivery_instructions = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.is_default:
            CustomerAddress.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.label}: {self.address_line1}"


class Restaurant(models.Model):
    APPROVAL_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved & Active'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    ]
    PRICE_CHOICES = [
        ('$', 'Budget (₹)'),
        ('$$', 'Moderate (₹₹)'),
        ('$$$', 'Premium (₹₹₹)'),
    ]

    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_restaurants')
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    tagline = models.CharField(max_length=255, blank=True, default='')
    description = models.TextField(blank=True, default='')
    logo_url = models.URLField(blank=True, default='')
    banner_url = models.URLField(blank=True, default='')
    cuisines = models.JSONField(default=list, blank=True)
    city = models.CharField(max_length=100, default='Kochi')
    area = models.CharField(max_length=100, default='Marine Drive')
    address = models.TextField()
    latitude = models.FloatField(default=9.9816)
    longitude = models.FloatField(default=76.2999)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, default='')
    
    fssai_license = models.CharField(max_length=50, blank=True, default='11322007000142')
    fssai_verified = models.BooleanField(default=True)
    bank_account_verified = models.BooleanField(default=True)
    
    rating = models.FloatField(default=4.5)
    total_reviews = models.IntegerField(default=120)
    price_range = models.CharField(max_length=5, choices=PRICE_CHOICES, default='$$')
    
    is_pure_veg = models.BooleanField(default=False)
    is_open = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default='approved')
    
    opening_time = models.TimeField(default='08:00')
    closing_time = models.TimeField(default='23:00')
    avg_delivery_time_mins = models.IntegerField(default=30)
    delivery_fee_base = models.DecimalField(max_digits=6, decimal_places=2, default=35.00)
    min_order_amount = models.DecimalField(max_digits=6, decimal_places=2, default=99.00)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.area}, {self.city})"


class MenuCategory(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'name']

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"


class MenuItem(models.Model):
    SPICE_CHOICES = [
        ('none', 'Not Spicy'),
        ('mild', 'Mild'),
        ('medium', 'Medium'),
        ('spicy', 'Spicy'),
        ('extra_spicy', 'Extra Spicy'),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=200)
    description = models.TextField()
    image_url = models.URLField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_veg = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    preparation_time_mins = models.IntegerField(default=15)
    spice_level = models.CharField(max_length=20, choices=SPICE_CHOICES, default='medium')
    portion_size = models.CharField(max_length=100, default='Serves 1')
    
    # RealPlate Transparency fields
    ingredients = models.JSONField(default=list, blank=True)
    allergens = models.JSONField(default=list, blank=True)
    calories = models.IntegerField(null=True, blank=True)
    protein_g = models.FloatField(null=True, blank=True)
    carbs_g = models.FloatField(null=True, blank=True)
    fat_g = models.FloatField(null=True, blank=True)
    
    # Customization & Addons
    customization_options = models.JSONField(default=list, blank=True)
    stock_quantity = models.IntegerField(default=50)
    is_bestseller = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (₹{self.price}) - {self.restaurant.name}"


class Coupon(models.Model):
    code = models.CharField(max_length=30, unique=True)
    title = models.CharField(max_length=150)
    description = models.TextField()
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    discount_flat = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    min_order_amount = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    max_discount_amount = models.DecimalField(max_digits=6, decimal_places=2, default=150.00)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.code


class Order(models.Model):
    STATUS_CHOICES = [
        ('PLACED', 'Placed'),
        ('PAYMENT_PENDING', 'Payment Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('ACCEPTED', 'Accepted by Restaurant'),
        ('PREPARING', 'Preparing in Kitchen'),
        ('READY_FOR_PICKUP', 'Ready for Pickup'),
        ('PICKED_UP', 'Picked Up by Rider'),
        ('OUT_FOR_DELIVERY', 'Out for Delivery'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
        ('REFUND_PENDING', 'Refund Pending'),
        ('REFUNDED', 'Refunded'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('upi', 'UPI (Google Pay / PhonePe / Paytm)'),
        ('card', 'Credit / Debit Card'),
        ('netbanking', 'Net Banking'),
        ('cod', 'Cash on Delivery'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    order_number = models.CharField(max_length=32, unique=True)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='orders')
    delivery_partner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='deliveries')
    
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='CONFIRMED')
    items_subtotal = models.DecimalField(max_digits=8, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=6, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=6, decimal_places=2, default=5.00)
    discount_amount = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    coupon_code = models.CharField(max_length=50, blank=True, default='')
    total_amount = models.DecimalField(max_digits=8, decimal_places=2)
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='upi')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='paid')
    
    delivery_address = models.JSONField(default=dict)
    delivery_instructions = models.TextField(blank=True, default='')
    
    preparation_time_mins = models.IntegerField(default=20)
    estimated_delivery_time = models.DateTimeField(null=True, blank=True)
    delay_reason = models.TextField(blank=True, default='')
    cancellation_reason = models.TextField(blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number} ({self.status}) - ₹{self.total_amount}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.SET_NULL, null=True, blank=True)
    item_name = models.CharField(max_length=200)
    quantity = models.IntegerField(default=1)
    price_per_unit = models.DecimalField(max_digits=8, decimal_places=2)
    total_price = models.DecimalField(max_digits=8, decimal_places=2)
    customizations = models.JSONField(default=dict, blank=True)
    special_instructions = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.quantity}x {self.item_name} for {self.order.order_number}"


class Payment(models.Model):
    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment_record')
    razorpay_order_id = models.CharField(max_length=100, blank=True, default='')
    razorpay_payment_id = models.CharField(max_length=100, blank=True, default='')
    razorpay_signature = models.CharField(max_length=255, blank=True, default='')
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='success')
    payment_method = models.CharField(max_length=50, default='UPI')
    refund_id = models.CharField(max_length=100, blank=True, default='')
    refund_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.razorpay_payment_id or self.id} - ₹{self.amount} ({self.status})"


class GroupOrder(models.Model):
    room_code = models.CharField(max_length=12, unique=True)
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_groups')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=[
        ('open', 'Open for selections'),
        ('locked', 'Locked / Reviewing'),
        ('completed', 'Order Placed'),
        ('cancelled', 'Cancelled')
    ], default='open')
    per_person_budget = models.DecimalField(max_digits=6, decimal_places=2, default=250.00)
    deadline = models.DateTimeField(null=True, blank=True)
    members_data = models.JSONField(default=list, blank=True)
    final_order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"GroupOrder #{self.room_code} - {self.restaurant.name}"


class BitePointsLedger(models.Model):
    TYPE_CHOICES = [
        ('order_reward', 'Order Reward (+10 pts per ₹100)'),
        ('redemption', 'Discount Coupon Redemption'),
        ('referral_bonus', 'Referral Bonus (+50 pts)'),
        ('welcome_bonus', 'Welcome Bonus (+100 pts)'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bitepoints')
    points = models.IntegerField()
    transaction_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    description = models.CharField(max_length=255)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.points} pts ({self.transaction_type})"


class LastCallBite(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='lastcall_bites')
    title = models.CharField(max_length=200)
    description = models.TextField()
    image_url = models.URLField()
    original_price = models.DecimalField(max_digits=6, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=6, decimal_places=2)
    quantity_total = models.IntegerField(default=10)
    quantity_remaining = models.IntegerField(default=10)
    pickup_deadline = models.CharField(max_length=50, default='10:30 PM')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} (₹{self.discounted_price}) at {self.restaurant.name}"


class MealPassSubscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mealpass_subscriptions')
    plan_name = models.CharField(max_length=150)
    plan_duration = models.CharField(max_length=20, choices=[('weekly', '7 Days'), ('monthly', '30 Days')])
    meal_type = models.CharField(max_length=20, choices=[('lunch', 'Lunch'), ('dinner', 'Dinner'), ('both', 'Lunch & Dinner')])
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled')
    ], default='active')
    price_paid = models.DecimalField(max_digits=8, decimal_places=2)
    paused_dates = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.plan_name} ({self.status})"


class Review(models.Model):
    order = models.OneToOneField(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='review')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(default=5)
    food_rating = models.IntegerField(default=5)
    delivery_rating = models.IntegerField(default=5)
    taste_score = models.IntegerField(default=5)
    quantity_score = models.IntegerField(default=5)
    packaging_score = models.IntegerField(default=5)
    value_score = models.IntegerField(default=5)
    comment = models.TextField(blank=True, default='')
    is_verified_purchase = models.BooleanField(default=True)
    is_reported = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review {self.rating}★ by {self.customer.username} for {self.restaurant.name}"


class RiderProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='rider_profile')
    vehicle_type = models.CharField(max_length=50, default='Motorcycle')
    vehicle_number = models.CharField(max_length=30, default='KL-07-CD-4512')
    license_number = models.CharField(max_length=50, default='KL1420230008912')
    is_online = models.BooleanField(default=True)
    current_latitude = models.FloatField(default=9.9816)
    current_longitude = models.FloatField(default=76.2999)
    verification_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending Verification'),
        ('approved', 'Approved & Active'),
        ('rejected', 'Rejected')
    ], default='approved')
    total_deliveries = models.IntegerField(default=0)
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    rating = models.FloatField(default=4.85)

    def __str__(self):
        return f"Rider: {self.user.username} ({'Online' if self.is_online else 'Offline'})"


class RiderEarningsLedger(models.Model):
    rider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rider_earnings')
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    earning_type = models.CharField(max_length=30, choices=[
        ('delivery_fee', 'Base Delivery Fee'),
        ('distance_bonus', 'Distance Bonus'),
        ('tip', 'Customer Tip'),
        ('incentive', 'Surge / Performance Incentive'),
        ('payout', 'Bank Payout Withdrawal'),
    ])
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"₹{self.amount} - {self.rider.username} ({self.earning_type})"


class SupportTicket(models.Model):
    ticket_number = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    category = models.CharField(max_length=30, choices=[
        ('missing_item', 'Missing Items'),
        ('damaged_food', 'Food Quality / Spillage'),
        ('late_delivery', 'Delay & Tracking'),
        ('refund_request', 'Refund Request'),
        ('general', 'General Query')
    ], default='general')
    subject = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=[
        ('open', 'Open'),
        ('in_investigation', 'In Investigation'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed')
    ], default='open')
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ], default='medium')
    resolution_notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.ticket_number} - {self.subject} ({self.status})"
