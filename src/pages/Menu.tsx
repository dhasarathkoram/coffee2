import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { StarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
      popular: true
    },
    {
      id: '2',
      name: 'Caramel Macchiato',
      description: 'Smooth espresso with steamed milk and caramel',
      price: 220,
      category: 'coffee',
      image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      popular: true
    },
    {
      id: '3',
      name: 'Cappuccino',
      description: 'Classic cappuccino with perfect foam art',
      price: 180,
      category: 'coffee',
      image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7
    },
    {
      id: '4',
      name: 'Americano',
      description: 'Espresso with hot water for a clean taste',
      price: 150,
      category: 'coffee',
      image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.5
    },
    {
      id: '5',
      name: 'Earl Grey Tea',
      description: 'Classic black tea with bergamot',
      price: 100,
      category: 'tea',
      image: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.6
    },
    {
      id: '6',
      name: 'Green Tea',
      description: 'Refreshing green tea with antioxidants',
      price: 90,
      category: 'tea',
      image: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.4
    },
    {
      id: '7',
      name: 'Iced Coffee',
      description: 'Cold brew coffee served over ice',
      price: 160,
      category: 'cold',
      image: 'https://images.pexels.com/photos/1549200/pexels-photo-1549200.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7
    },
    {
      id: '8',
      name: 'Frappuccino',
      description: 'Blended coffee drink with whipped cream',
      price: 250,
      category: 'cold',
      image: 'https://images.pexels.com/photos/1549200/pexels-photo-1549200.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8
    },
    {
      id: '9',
      name: 'Artisan Croissant',
      description: 'Buttery, flaky pastry baked fresh daily',
      price: 80,
      category: 'pastries',
      image: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      popular: true
    },
    {
      id: '10',
      name: 'Chocolate Muffin',
      description: 'Rich chocolate muffin with chocolate chips',
      price: 120,
      category: 'pastries',
      image: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.6
    },
    {
      id: '11',
      name: 'Club Sandwich',
      description: 'Triple-layered sandwich with fresh ingredients',
      price: 250,
      category: 'sandwiches',
      image: 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.5
    },
    {
      id: '12',
      name: 'Grilled Panini',
      description: 'Grilled panini with cheese and vegetables',
      price: 200,
      category: 'sandwiches',
      image: 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.4
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

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                {item.popular && (
                  <div className="absolute top-4 left-4 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Popular
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-amber-600">₹{item.price}</span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;