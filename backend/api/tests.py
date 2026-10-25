from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Restaurant, MenuCategory, MenuItem, Order, Coupon, BitePointsLedger

User = get_user_model()

class QuickBiteAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            username='test_customer',
            email='customer@test.com',
            password='testpassword123',
            role='customer',
            phone='+919847011111'
        )
        self.restaurant_owner = User.objects.create_user(
            username='test_owner',
            email='owner@test.com',
            password='testpassword123',
            role='restaurant_owner'
        )
        self.restaurant = Restaurant.objects.create(
            owner=self.restaurant_owner,
            name='Test Malabar Kitchen',
            slug='test-malabar-kitchen',
            cuisines=['Kerala', 'Biryani'],
            city='Kochi',
            area='Marine Drive',
            address='123 Marine Drive, Kochi',
            phone='+914842223333',
            delivery_fee_base=Decimal('30.00'),
            min_order_amount=Decimal('100.00'),
            is_open=True,
            is_active=True,
            approval_status='approved'
        )
        self.category = MenuCategory.objects.create(
            restaurant=self.restaurant,
            name='Biryanis'
        )
        self.dish = MenuItem.objects.create(
            restaurant=self.restaurant,
            category=self.category,
            name='Authentic Thalassery Biryani',
            description='Slow cooked biryani with ghee and spices',
            image_url='https://example.com/biryani.jpg',
            price=Decimal('200.00'),
            is_veg=False,
            is_available=True,
            spice_level='medium'
        )
        self.coupon = Coupon.objects.create(
            code='SAVE50',
            title='50 Off',
            description='Test coupon',
            discount_flat=Decimal('50.00'),
            min_order_amount=Decimal('150.00')
        )

    def test_restaurant_listing(self):
        response = self.client.get('/api/restaurants/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Malabar Kitchen')

    def test_smartbite_ai_query(self):
        response = self.client.post('/api/smartbite/query/', {'query': 'Find biryani under 300'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertTrue(len(response.data['results']) >= 1)
        self.assertIn('transparent_reason', response.data['results'][0])

    def test_budget_mode_calculation(self):
        response = self.client.get('/api/budget-mode/?budget=260')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('meals', response.data)
        for meal in response.data['meals']:
            self.assertLessEqual(meal['final_payable_amount'], 260.0)

    def test_cart_calculation(self):
        payload = {
            'restaurant_id': self.restaurant.id,
            'items': [{'id': self.dish.id, 'quantity': 2}],
            'coupon_code': 'SAVE50'
        }
        response = self.client.post('/api/cart/calculate/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['subtotal'], 400.0)
        self.assertEqual(response.data['discount_amount'], 50.0)

    def test_order_creation_and_points(self):
        self.client.force_authenticate(user=self.customer)
        payload = {
            'restaurant_id': self.restaurant.id,
            'items': [{'id': self.dish.id, 'quantity': 1}],
            'delivery_address': {'address_line1': 'Flat 2A, Kochi'},
            'payment_method': 'upi'
        }
        response = self.client.post('/api/orders/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order_number = response.data['order_number']
        self.assertTrue(order_number.startswith('QB-'))

        # Verify BitePoints allocated
        ledger_count = BitePointsLedger.objects.filter(user=self.customer, order__order_number=order_number).count()
        self.assertEqual(ledger_count, 1)
