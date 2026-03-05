const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');

const products = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    slug: 'wireless-noise-cancelling-headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and studio-quality sound. Perfect for travel, work, and everyday listening.',
    price: 249.99,
    comparePrice: 329.99,
    category: 'Electronics',
    subcategory: 'Audio',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
    brand: 'SoundWave',
    stock: 42,
    sku: 'SW-WNC-001',
    tags: ['headphones', 'wireless', 'noise-cancelling', 'audio'],
    rating: 4.7,
    numReviews: 128,
    featured: true,
  },
  {
    name: 'Minimalist Leather Wallet',
    slug: 'minimalist-leather-wallet',
    description: 'Slim bifold wallet handcrafted from full-grain Italian leather. Holds up to 8 cards plus cash. RFID blocking technology.',
    price: 49.99,
    category: 'Accessories',
    subcategory: 'Wallets',
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=600'],
    brand: 'Craftly',
    stock: 85,
    sku: 'CL-MLW-002',
    tags: ['wallet', 'leather', 'minimalist', 'rfid'],
    rating: 4.5,
    numReviews: 74,
    featured: false,
  },
  {
    name: 'Stainless Steel Water Bottle',
    slug: 'stainless-steel-water-bottle',
    description: 'Double-walled vacuum insulated bottle keeps drinks cold 24 hours or hot 12 hours. BPA-free, leak-proof lid. 32oz capacity.',
    price: 34.99,
    comparePrice: 44.99,
    category: 'Home & Kitchen',
    subcategory: 'Drinkware',
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600'],
    brand: 'HydroLife',
    stock: 120,
    sku: 'HL-SSB-003',
    tags: ['water bottle', 'insulated', 'eco-friendly'],
    rating: 4.8,
    numReviews: 203,
    featured: true,
  },
  {
    name: 'Mechanical Keyboard TKL',
    slug: 'mechanical-keyboard-tkl',
    description: 'Tenkeyless mechanical keyboard with Cherry MX switches, RGB backlight, and aluminum frame. Perfect for programmers and gamers.',
    price: 129.99,
    category: 'Electronics',
    subcategory: 'Peripherals',
    images: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600'],
    brand: 'TypeMaster',
    stock: 30,
    sku: 'TM-MKB-004',
    tags: ['keyboard', 'mechanical', 'rgb', 'gaming'],
    rating: 4.6,
    numReviews: 89,
    featured: true,
  },
  {
    name: 'Yoga Mat Premium',
    slug: 'yoga-mat-premium',
    description: 'Eco-friendly non-slip yoga mat made from natural rubber. 6mm thick for joint support. Includes carrying strap.',
    price: 59.99,
    category: 'Sports & Fitness',
    subcategory: 'Yoga',
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600'],
    brand: 'ZenFlow',
    stock: 65,
    sku: 'ZF-YMP-005',
    tags: ['yoga', 'fitness', 'eco-friendly', 'mat'],
    rating: 4.4,
    numReviews: 156,
    featured: false,
  },
  {
    name: 'Ceramic Pour-Over Coffee Set',
    slug: 'ceramic-pour-over-coffee-set',
    description: 'Handcrafted ceramic pour-over dripper with matching mug. Brews a clean, flavorful cup. Dishwasher safe.',
    price: 42.00,
    category: 'Home & Kitchen',
    subcategory: 'Coffee',
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'],
    brand: 'Artisan Brew',
    stock: 40,
    sku: 'AB-CPO-006',
    tags: ['coffee', 'pour-over', 'ceramic', 'kitchen'],
    rating: 4.9,
    numReviews: 61,
    featured: true,
  },
  {
    name: 'Running Shoes Ultra Boost',
    slug: 'running-shoes-ultra-boost',
    description: 'Lightweight performance running shoes with responsive foam cushioning and breathable mesh upper. Available in sizes 7-13.',
    price: 119.99,
    comparePrice: 149.99,
    category: 'Sports & Fitness',
    subcategory: 'Footwear',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
    brand: 'SwiftRun',
    stock: 75,
    sku: 'SR-RSU-007',
    tags: ['running', 'shoes', 'fitness', 'sports'],
    rating: 4.3,
    numReviews: 312,
    featured: false,
  },
  {
    name: 'Wireless Charging Pad',
    slug: 'wireless-charging-pad',
    description: '15W fast wireless charger compatible with all Qi-enabled devices. LED indicator, anti-slip surface, USB-C cable included.',
    price: 24.99,
    category: 'Electronics',
    subcategory: 'Accessories',
    images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600'],
    brand: 'ChargeFast',
    stock: 90,
    sku: 'CF-WCP-008',
    tags: ['wireless charging', 'charger', 'qi', 'accessories'],
    rating: 4.2,
    numReviews: 245,
    featured: false,
  },
];

// GET /api/seed?secret=market_seed_2024
router.get('/', async (req, res) => {
  try {
    const { secret } = req.query;
    if (secret !== 'market_seed_2024') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await Product.deleteMany({});
    await User.deleteMany({});

    await Product.insertMany(products);

    await User.create({
      name: 'Admin User',
      email: 'admin@shop.com',
      password: 'admin123',
      role: 'admin',
    });

    await User.create({
      name: 'Test User',
      email: 'test@shop.com',
      password: 'test1234',
    });

    res.json({
      success: true,
      message: '✅ Database seeded successfully',
      products: products.length,
      users: ['admin@shop.com / admin123', 'test@shop.com / test1234'],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;