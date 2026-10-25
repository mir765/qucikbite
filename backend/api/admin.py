from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, CustomerAddress, Restaurant, MenuCategory, MenuItem,
    Order, OrderItem, Payment, Coupon, GroupOrder, BitePointsLedger,
    LastCallBite, MealPassSubscription, Review, RiderProfile,
    RiderEarningsLedger, SupportTicket
)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'phone', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('QuickBite Profile', {'fields': ('role', 'phone', 'profile_photo', 'dietary_preferences', 'notification_preferences', 'is_phone_verified')}),
    )

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'area', 'rating', 'approval_status', 'is_open', 'is_active')
    list_filter = ('city', 'approval_status', 'is_open', 'is_pure_veg')
    search_fields = ('name', 'city', 'area')

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'category', 'price', 'is_veg', 'is_available')
    list_filter = ('is_veg', 'is_available', 'spice_level')
    search_fields = ('name', 'restaurant__name')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'restaurant', 'customer', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'payment_status', 'created_at')
    search_fields = ('order_number', 'customer__username', 'restaurant__name')

admin.site.register(CustomerAddress)
admin.site.register(MenuCategory)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(Coupon)
admin.site.register(GroupOrder)
admin.site.register(BitePointsLedger)
admin.site.register(LastCallBite)
admin.site.register(MealPassSubscription)
admin.site.register(Review)
admin.site.register(RiderProfile)
admin.site.register(RiderEarningsLedger)
admin.site.register(SupportTicket)
