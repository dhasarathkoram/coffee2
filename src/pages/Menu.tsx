import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { StarIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Menu: React.FC = () => {
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'coffee', name: 'Coffee' },
    { id: 'tea', name: 'Tea' },
    { id: 'cold', name: 'Cold Beverages' },
    { id: 'pastries', name: 'Pastries' },
    { id: 'sandwiches', name: 'Sandwiches' }
  ];

  const menuItems = [
    {
      id: '1',
      name: 'Signature Espresso',
      description: 'Rich, bold espresso with perfect crema',
      price: 120,
      category: 'coffee',
      image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      isPopular: true,
      isVegetarian: true
    },
    {
      id: '2',
      name: 'Caramel Macchiato',
      description: 'Smooth espresso with steamed milk and caramel drizzle',
      price: 180,
      category: 'coffee',
      image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      isPopular: true,
      isVegetarian: true
    },
    {
      id: '3',
      name: 'Cappuccino',
      description: 'Classic cappuccino with steamed milk foam',
      price: 160,
      category: 'coffee',
      image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      isVegetarian: true
    },
    {
      id: '4',
      name: 'Americano',
      description: 'Espresso shots with hot water',
      price: 140,
      category: 'coffee',
      image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.6,
      isVegetarian: true
    },
    {
      id: '5',
      name: 'English Breakfast Tea',
      description: 'Traditional black tea blend',
      price: 100,
      category: 'tea',
      image: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.5,
      isVegetarian: true
    },
    {
      id: '6',
      name: 'Green Tea',
      description: 'Refreshing green tea with antioxidants',
      price: 90,
      category: 'tea',
      image: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.4,
      isVegetarian: true
    },
    {
      id: '7',
      name: 'Iced Coffee',
      description: 'Refreshing cold brew coffee',
      price: 150,
      category: 'cold',
      image: 'https://images.pexels.com/photos/1549200/pexels-photo-1549200.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.6,
      isVegetarian: true
    },
    {
      id: '8',
      name: 'Chocolate Frappe',
      description: 'Rich chocolate blended with ice',
      price: 200,
      category: 'cold',
      image: 'https://images.pexels.com/photos/1549200/pexels-photo-1549200.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      isPopular: true,
      isVegetarian: true
    },
    {
      id: '9',
      name: 'Butter Croissant',
      description: 'Buttery, flaky pastry baked fresh daily',
      price: 80,
      category: 'pastries',
      image: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      isVegetarian: true
    },
    {
      id: '10',
      name: 'Chocolate Muffin',
      description: 'Rich chocolate muffin with chocolate chips',
      price: 120,
      category: 'pastries',
      image: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.6,
      isVegetarian: true
    },
    {
      id: '11',
      name: 'Club Sandwich',
      description: 'Triple-layered sandwich with chicken and vegetables',
      price: 250,
      category: 'sandwiches',
      image: 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.5
    },
    {
      id: '12',
      name: 'Veggie Panini',
      description: 'Grilled sandwich with fresh vegetables and cheese',
      price: 200,
      category: 'sandwiches',
      image: 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.4,
      isVegetarian: true
    }
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image
    });
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Menu</h1>
          <p className="text-xl text-gray-600">Discover our delicious selection of coffee, tea, and treats</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full md:w-96">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-amber-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.isPopular && (
                  <div className="absolute top-2 left-2 bg-amber-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Popular
                  </div>
                )}
                {item.isVegetarian && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white p-1 rounded-full">
                    <span className="text-xs">🌱</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                  <div className="flex items-center ml-2">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-amber-600">₹{item.price}</span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-amber-600 text-white p-2 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;