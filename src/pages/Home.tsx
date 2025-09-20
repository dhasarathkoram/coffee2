import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { 
  CoffeeIcon, 
  ClockIcon, 
  StarIcon,
  DevicePhoneMobileIcon,
  TruckIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const { addItem } = useCart();

  const popularItems = [
    {
      id: '1',
      name: 'Signature Espresso',
      description: 'Rich, bold espresso with perfect crema',
      price: 120,
      image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Caramel Macchiato',
      description: 'Smooth espresso with steamed milk and caramel',
      price: 220,
      image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9
    },
    {
      id: '3',
      name: 'Artisan Croissant',
      description: 'Buttery, flaky pastry baked fresh daily',
      price: 80,
      image: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7
    }
  ];

  const features = [
    {
      icon: DevicePhoneMobileIcon,
      title: 'Easy Ordering',
      description: 'Order your favorite drinks with just a few taps. Customize, schedule, and pay seamlessly.'
    },
    {
      icon: ClockIcon,
      title: 'Real-Time Tracking',
      description: 'Track your order from brewing to pickup. Get notified when your coffee is ready.'
    },
    {
      icon: GiftIcon,
      title: 'Loyalty Rewards',
      description: 'Earn points with every purchase. Unlock exclusive perks and free drinks.'
    }
  ];

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-900 to-amber-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Craft Your Perfect
                <span className="text-amber-300 block">Coffee Experience</span>
              </h1>
              <p className="text-xl mb-8 text-amber-100">
                From artisan roasts to personalized blends, discover a world of premium coffee 
                delivered right to your hands.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/menu"
                  className="bg-amber-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center"
                >
                  <CoffeeIcon className="h-5 w-5 mr-2" />
                  Order Now
                </Link>
                <Link
                  to="/register"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-amber-900 transition-colors flex items-center justify-center"
                >
                  <GiftIcon className="h-5 w-5 mr-2" />
                  Join Rewards
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Premium Coffee"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BrewCraft?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the future of coffee ordering
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-amber-50 transition-colors">
                <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Items
            </h2>
            <p className="text-xl text-gray-600">
              Customer favorites you can't miss
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-w-16 aspect-h-12">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-amber-600">₹{item.price}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="bg-amber-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-amber-700 transition-colors inline-flex items-center"
            >
              View Full Menu
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Coffee Journey?
          </h2>
          <p className="text-xl mb-8 text-amber-100">
            Join thousands of coffee lovers who trust BrewCraft for their daily dose of perfection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/menu"
              className="bg-white text-amber-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Order Now
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-amber-600 transition-colors"
            >
              Sign Up for Rewards
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;