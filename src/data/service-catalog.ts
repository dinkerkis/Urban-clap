export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  duration: string;
  rating: number;
  reviews: string;
  icon: string;
  tint: string;
};

export type ServiceSubcategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tint: string;
  services: ServiceItem[];
};

export type ServiceCategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  tint: string;
  subcategories: ServiceSubcategory[];
};

const service = (
  id: string,
  title: string,
  description: string,
  price: number,
  originalPrice: number,
  duration: string,
  rating: number,
  reviews: string,
  icon: string,
  tint: string,
): ServiceItem => ({ id, title, description, price, originalPrice, duration, rating, reviews, icon, tint });

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'cleaning',
    title: 'Cleaning',
    subtitle: 'Home, kitchen & bathroom',
    icon: '🧹',
    tint: '#E9F8F1',
    subcategories: [
      {
        id: 'full-home-cleaning',
        title: 'Full Home Cleaning',
        subtitle: 'Deep cleaning for every room',
        icon: '🏠',
        tint: '#E7F7F0',
        services: [
          service('2bhk-deep-clean', '2 BHK deep cleaning', 'Complete floor, furniture and surface cleaning', 2799, 3299, '4 hrs', 4.86, '2.8k', '✨', '#E7F7F0'),
          service('3bhk-deep-clean', '3 BHK deep cleaning', 'Detailed home cleaning with professional equipment', 3499, 4099, '5 hrs', 4.82, '1.9k', '🏡', '#EFF5FF'),
        ],
      },
      {
        id: 'bathroom-cleaning',
        title: 'Bathroom Cleaning',
        subtitle: 'Stain removal and sanitisation',
        icon: '🚿',
        tint: '#EAF4FF',
        services: [
          service('bathroom-classic', 'Classic bathroom cleaning', 'Floor, tiles, fixtures and mirror cleaning', 449, 549, '50 mins', 4.79, '6.1k', '🚿', '#EAF4FF'),
          service('bathroom-intensive', 'Intensive bathroom cleaning', 'Machine scrubbing for stubborn stains', 649, 799, '75 mins', 4.88, '3.4k', '🫧', '#E9F8F1'),
        ],
      },
      {
        id: 'kitchen-cleaning',
        title: 'Kitchen Cleaning',
        subtitle: 'Degreasing and cabinet cleaning',
        icon: '🍳',
        tint: '#FFF4E6',
        services: [
          service('kitchen-basic', 'Basic kitchen cleaning', 'Counter, sink, stove and floor cleaning', 899, 1099, '2 hrs', 4.76, '2.2k', '🍳', '#FFF4E6'),
          service('kitchen-deep', 'Complete kitchen deep clean', 'Appliances, cabinets, tiles and tough grease', 1699, 1999, '3 hrs', 4.9, '1.5k', '✨', '#FFF0E9'),
        ],
      },
    ],
  },
  {
    id: 'ac-appliance',
    title: 'AC & Appliance',
    subtitle: 'Service and repair',
    icon: '❄️',
    tint: '#EBF3FF',
    subcategories: [
      {
        id: 'ac-service',
        title: 'AC Service & Repair',
        subtitle: 'Cooling, gas and maintenance',
        icon: '❄️',
        tint: '#EAF3FF',
        services: [
          service('ac-power-jet', 'Power jet AC service', 'Deep indoor and outdoor unit cleaning', 599, 749, '60 mins', 4.89, '12k', '❄️', '#EAF3FF'),
          service('ac-repair', 'AC repair visit', 'Complete diagnosis by a verified technician', 299, 399, '45 mins', 4.78, '8.6k', '🧰', '#EEF0FF'),
        ],
      },
      {
        id: 'washing-machine',
        title: 'Washing Machine',
        subtitle: 'Installation and repair',
        icon: '🫧',
        tint: '#EEF7FF',
        services: [
          service('washer-repair', 'Washing machine repair', 'Inspection and repair estimate', 299, 399, '45 mins', 4.77, '4.4k', '🫧', '#EEF7FF'),
          service('washer-install', 'Washing machine installation', 'Safe inlet and outlet connection', 399, 499, '60 mins', 4.81, '2.1k', '🔧', '#EDF7F2'),
        ],
      },
      {
        id: 'refrigerator',
        title: 'Refrigerator',
        subtitle: 'Cooling and compressor repair',
        icon: '🧊',
        tint: '#ECF8FA',
        services: [
          service('fridge-repair', 'Refrigerator repair visit', 'Expert inspection for cooling issues', 299, 399, '45 mins', 4.74, '3.9k', '🧊', '#ECF8FA'),
          service('fridge-service', 'Refrigerator maintenance', 'Coil cleaning and performance check', 499, 599, '60 mins', 4.83, '1.8k', '✨', '#EAF7F0'),
        ],
      },
    ],
  },
  {
    id: 'salon-women',
    title: 'Salon for Women',
    subtitle: 'Beauty services at home',
    icon: '💇‍♀️',
    tint: '#FFF0F5',
    subcategories: [
      {
        id: 'waxing',
        title: 'Waxing',
        subtitle: 'Rica and roll-on options',
        icon: '🌸',
        tint: '#FFF0F5',
        services: [
          service('rica-wax', 'Full arms & legs Rica wax', 'Premium low-temperature wax', 899, 1099, '75 mins', 4.87, '5.2k', '🌸', '#FFF0F5'),
          service('roll-on-wax', 'Full body roll-on wax', 'Hygienic and gentle waxing service', 1499, 1799, '2 hrs', 4.9, '3.1k', '✨', '#FFF3F7'),
        ],
      },
      {
        id: 'facial-cleanup',
        title: 'Facial & Cleanup',
        subtitle: 'Glow and skin care',
        icon: '🧖‍♀️',
        tint: '#F4EDFF',
        services: [
          service('instant-glow', 'Instant glow cleanup', 'Cleanse, scrub, massage and mask', 699, 849, '50 mins', 4.84, '4.8k', '🧖‍♀️', '#F4EDFF'),
          service('hydrating-facial', 'Hydrating facial', 'Deep hydration for soft glowing skin', 1299, 1599, '75 mins', 4.91, '2.7k', '💧', '#EBF5FF'),
        ],
      },
      {
        id: 'manicure-pedicure',
        title: 'Manicure & Pedicure',
        subtitle: 'Nail and foot care',
        icon: '💅',
        tint: '#FFF2F6',
        services: [
          service('mani-pedi', 'Classic mani-pedi', 'Nail shaping, scrub and massage', 999, 1199, '90 mins', 4.85, '3.6k', '💅', '#FFF2F6'),
          service('spa-pedi', 'Luxury spa pedicure', 'Soak, mask and extended foot massage', 799, 999, '60 mins', 4.88, '2.2k', '🌿', '#EDF8F0'),
        ],
      },
    ],
  },
  {
    id: 'salon-men',
    title: 'Salon for Men',
    subtitle: 'Grooming at home',
    icon: '💇‍♂️',
    tint: '#F1F2FF',
    subcategories: [
      {
        id: 'haircut-beard',
        title: 'Haircut & Beard',
        subtitle: 'Professional grooming',
        icon: '✂️',
        tint: '#F1F2FF',
        services: [
          service('mens-haircut', "Men's haircut", 'Consultation, haircut and styling', 349, 449, '45 mins', 4.86, '9.3k', '✂️', '#F1F2FF'),
          service('haircut-beard', 'Haircut & beard styling', 'Complete haircut and beard shape', 549, 699, '60 mins', 4.89, '6.8k', '💈', '#F6F0EA'),
        ],
      },
      {
        id: 'mens-facial',
        title: 'Facial & Cleanup',
        subtitle: 'Skin care for men',
        icon: '🧖‍♂️',
        tint: '#EEF4FF',
        services: [
          service('mens-cleanup', "Men's face cleanup", 'Cleanse, scrub and face massage', 599, 749, '45 mins', 4.8, '3.7k', '🧖‍♂️', '#EEF4FF'),
          service('detan-facial', 'De-tan facial', 'De-tan treatment and hydration', 899, 1099, '60 mins', 4.85, '2.9k', '✨', '#FFF4E9'),
        ],
      },
      {
        id: 'massage-men',
        title: 'Massage for Men',
        subtitle: 'Relaxation at home',
        icon: '💆‍♂️',
        tint: '#EDF8F2',
        services: [
          service('stress-relief', 'Stress relief massage', 'Full body relaxation massage', 1199, 1399, '60 mins', 4.88, '5.6k', '💆‍♂️', '#EDF8F2'),
          service('deep-tissue', 'Deep tissue massage', 'Targeted pressure for muscle relief', 1499, 1799, '75 mins', 4.91, '3.4k', '🌿', '#EAF5EE'),
        ],
      },
    ],
  },
  {
    id: 'plumbing',
    title: 'Plumbing',
    subtitle: 'Leaks, fittings and repair',
    icon: '🚰',
    tint: '#EAF7FB',
    subcategories: [
      {
        id: 'tap-repair',
        title: 'Tap & Mixer',
        subtitle: 'Repair and replacement',
        icon: '🚰',
        tint: '#EAF7FB',
        services: [
          service('tap-repair-service', 'Tap repair', 'Fix leakage or low water flow', 199, 249, '30 mins', 4.73, '7.2k', '🚰', '#EAF7FB'),
          service('mixer-install', 'Mixer installation', 'Install wall or basin mixer', 349, 449, '45 mins', 4.8, '3.1k', '🔧', '#EEF4FF'),
        ],
      },
      {
        id: 'toilet-repair',
        title: 'Toilet Repair',
        subtitle: 'Flush and drainage issues',
        icon: '🛠️',
        tint: '#F0F5FF',
        services: [
          service('flush-repair', 'Flush tank repair', 'Repair flush mechanism and leakage', 299, 399, '45 mins', 4.76, '4.5k', '🛠️', '#F0F5FF'),
          service('toilet-install', 'Toilet seat installation', 'Safe removal and new installation', 499, 599, '60 mins', 4.82, '2.4k', '🔧', '#EDF7F2'),
        ],
      },
      {
        id: 'drainage',
        title: 'Drainage',
        subtitle: 'Blockage and cleaning',
        icon: '🪠',
        tint: '#FFF4E8',
        services: [
          service('drain-unclog', 'Drain blockage removal', 'Unclog bathroom or kitchen drain', 349, 449, '45 mins', 4.79, '5.8k', '🪠', '#FFF4E8'),
          service('pipe-repair', 'Pipe leakage repair', 'Identify and repair exposed pipe leaks', 299, 399, '45 mins', 4.77, '4.1k', '🔧', '#EEF4FF'),
        ],
      },
    ],
  },
  {
    id: 'electrical',
    title: 'Electrical',
    subtitle: 'Wiring, lights and switches',
    icon: '💡',
    tint: '#FFF8DE',
    subcategories: [
      {
        id: 'switch-socket',
        title: 'Switch & Socket',
        subtitle: 'Repair and installation',
        icon: '🔌',
        tint: '#FFF8DE',
        services: [
          service('switch-repair', 'Switch or socket repair', 'Repair one faulty switch or socket', 149, 199, '30 mins', 4.78, '8.1k', '🔌', '#FFF8DE'),
          service('socket-install', 'New socket installation', 'Install and safely connect a socket', 249, 349, '40 mins', 4.82, '3.7k', '⚡', '#FFF4DF'),
        ],
      },
      {
        id: 'fan-repair',
        title: 'Fan',
        subtitle: 'Installation and repair',
        icon: '🌀',
        tint: '#EAF7FA',
        services: [
          service('fan-repair-service', 'Ceiling fan repair', 'Noise, speed or capacitor diagnosis', 249, 349, '45 mins', 4.8, '6.3k', '🌀', '#EAF7FA'),
          service('fan-install', 'Ceiling fan installation', 'Assembly and secure installation', 349, 449, '45 mins', 4.85, '4.9k', '🛠️', '#EDF4FF'),
        ],
      },
      {
        id: 'light-install',
        title: 'Light Installation',
        subtitle: 'Fixtures and decorative lights',
        icon: '💡',
        tint: '#FFF8DE',
        services: [
          service('light-install-service', 'Light fixture installation', 'Install ceiling or wall light', 199, 299, '30 mins', 4.79, '5.6k', '💡', '#FFF8DE'),
          service('chandelier-install', 'Chandelier installation', 'Assembly and secure ceiling mounting', 599, 799, '75 mins', 4.87, '1.8k', '✨', '#FFF1E5'),
        ],
      },
    ],
  },
  {
    id: 'painting',
    title: 'Painting',
    subtitle: 'Walls and complete homes',
    icon: '🎨',
    tint: '#FFF0EA',
    subcategories: [
      {
        id: 'wall-painting',
        title: 'Wall Painting',
        subtitle: 'Refresh one or more rooms',
        icon: '🎨',
        tint: '#FFF0EA',
        services: [
          service('painting-consult', 'Painting consultation', 'Measurement, colour advice and quote', 199, 299, '45 mins', 4.83, '2.8k', '🎨', '#FFF0EA'),
          service('single-wall', 'Single wall painting', 'Material and labour estimate after visit', 799, 999, '3 hrs', 4.8, '1.9k', '🖌️', '#F4EDFF'),
        ],
      },
      {
        id: 'waterproofing',
        title: 'Waterproofing',
        subtitle: 'Leak and damp protection',
        icon: '💧',
        tint: '#EAF5FF',
        services: [
          service('waterproof-inspect', 'Waterproofing inspection', 'Identify leakage and recommend treatment', 299, 399, '60 mins', 4.79, '1.7k', '💧', '#EAF5FF'),
          service('terrace-waterproof', 'Terrace waterproofing', 'Site inspection and detailed quotation', 499, 699, '90 mins', 4.86, '1.2k', '🏠', '#EDF7F2'),
        ],
      },
      {
        id: 'wood-polish',
        title: 'Wood Polish',
        subtitle: 'Furniture restoration',
        icon: '🪵',
        tint: '#F7EFE7',
        services: [
          service('wood-inspect', 'Wood polish consultation', 'Finish selection and price estimate', 199, 299, '45 mins', 4.76, '980', '🪵', '#F7EFE7'),
          service('door-polish', 'Door polish service', 'Sanding and polishing estimate after visit', 699, 899, '3 hrs', 4.81, '740', '✨', '#FFF4E6'),
        ],
      },
    ],
  },
  {
    id: 'pest-control',
    title: 'Pest Control',
    subtitle: 'Cockroach, termite and more',
    icon: '🛡️',
    tint: '#EFF7E8',
    subcategories: [
      {
        id: 'cockroach-control',
        title: 'Cockroach Control',
        subtitle: 'Odourless gel treatment',
        icon: '🛡️',
        tint: '#EFF7E8',
        services: [
          service('cockroach-1bhk', 'Cockroach control – 1 BHK', 'Safe gel treatment with 30-day warranty', 899, 1099, '75 mins', 4.84, '4.9k', '🛡️', '#EFF7E8'),
          service('cockroach-2bhk', 'Cockroach control – 2 BHK', 'Kitchen and complete home treatment', 1099, 1399, '90 mins', 4.87, '3.6k', '🏠', '#EDF7F2'),
        ],
      },
      {
        id: 'termite-control',
        title: 'Termite Control',
        subtitle: 'Inspection and treatment',
        icon: '🪵',
        tint: '#F7F0E7',
        services: [
          service('termite-inspection', 'Termite inspection', 'Detailed inspection and treatment plan', 299, 499, '60 mins', 4.81, '2.3k', '🔎', '#F7F0E7'),
          service('termite-treatment', 'Termite treatment visit', 'Price adjusted after property inspection', 1499, 1899, '2 hrs', 4.86, '1.7k', '🛡️', '#EFF7E8'),
        ],
      },
      {
        id: 'mosquito-control',
        title: 'Mosquito Control',
        subtitle: 'Indoor and outdoor treatment',
        icon: '🌿',
        tint: '#EDF8F0',
        services: [
          service('mosquito-1bhk', 'Mosquito control – 1 BHK', 'Targeted spray treatment', 699, 899, '60 mins', 4.74, '1.9k', '🌿', '#EDF8F0'),
          service('mosquito-2bhk', 'Mosquito control – 2 BHK', 'Complete indoor treatment', 899, 1099, '75 mins', 4.79, '1.5k', '🛡️', '#EFF7E8'),
        ],
      },
    ],
  },
];

export const featuredServices = [
  serviceCategories[1].subcategories[0].services[0],
  serviceCategories[0].subcategories[1].services[0],
  serviceCategories[2].subcategories[1].services[1],
];

export const allServices = serviceCategories.flatMap((category) =>
  category.subcategories.flatMap((subcategory) => subcategory.services),
);
