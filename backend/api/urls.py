from django.urls import path
from . import views

urlpatterns = [
    # Auth & Profile
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/me/', views.me_view, name='me'),
    path('auth/switch-demo-role/', views.switch_demo_role_view, name='switch_demo_role'),
    
    # Addresses
    path('addresses/', views.address_list_create, name='address_list_create'),
    path('addresses/<int:pk>/', views.address_detail, name='address_detail'),
    
    # Restaurants & Menus
    path('restaurants/', views.restaurant_list, name='restaurant_list'),
    path('restaurants/<str:slug_or_id>/', views.restaurant_detail, name='restaurant_detail'),
    path('menu-items/', views.menu_items_management, name='menu_items_list_create'),
    path('menu-items/<int:pk>/', views.menu_items_management, name='menu_items_update'),
    
    # SmartBite AI & Budget Mode
    path('smartbite/query/', views.smartbite_ai_query, name='smartbite_ai_query'),
    path('budget-mode/', views.budget_mode_view, name='budget_mode'),
    
    # Cart & Orders
    path('cart/calculate/', views.calculate_cart_view, name='calculate_cart'),
    path('orders/', views.orders_view, name='orders'),
    path('orders/<str:order_number>/', views.order_tracking_detail, name='order_tracking_detail'),
    path('orders/<str:order_number>/status/', views.update_order_status, name='update_order_status'),
    path('orders/<str:order_number>/refund/', views.request_order_refund, name='request_order_refund'),
    
    # Payments
    path('payments/verify/', views.razorpay_verify_payment, name='razorpay_verify_payment'),
    
    # GroupBite
    path('group-orders/', views.group_orders_view, name='group_orders_create'),
    path('group-orders/<str:room_code>/', views.group_orders_view, name='group_orders_detail'),
    path('group-orders/<str:room_code>/add-item/', views.group_order_add_item, name='group_order_add_item'),
    
    # BitePoints
    path('bitepoints/', views.bitepoints_view, name='bitepoints_view'),
    path('bitepoints/redeem/', views.redeem_bitepoints, name='redeem_bitepoints'),
    
    # LastCall Bites & MealPass
    path('lastcall-bites/', views.lastcall_bites_view, name='lastcall_bites'),
    path('mealpass/', views.mealpass_view, name='mealpass'),
    
    # Reviews & Support
    path('reviews/', views.reviews_view, name='reviews'),
    path('support-tickets/', views.support_tickets_view, name='support_tickets'),
    
    # Restaurant Owner Dashboard
    path('restaurant/dashboard/', views.restaurant_dashboard_overview, name='restaurant_dashboard'),
    
    # Rider App
    path('rider/dashboard/', views.rider_dashboard_view, name='rider_dashboard'),
    path('rider/toggle-status/', views.rider_toggle_status, name='rider_toggle_status'),
    
    # Admin Dashboard
    path('admin/overview/', views.admin_overview_metrics, name='admin_overview'),
    path('admin/restaurants/', views.admin_restaurants_management, name='admin_restaurants'),
    path('admin/restaurants/<int:pk>/approval/', views.admin_restaurants_management, name='admin_restaurant_approval'),
    path('admin/users/', views.admin_users_list, name='admin_users'),
]
