
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import LazyImage from "@/components/ui/LazyImage";
import {
  Search,
  MapPin,
  Users,
  Star,
  Grid,
  List as ListIcon,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { setDefaultMeta } from '@/components/utils/seo';
import { safeEntityCall } from "@/components/utils/apiUtils";
import { useTranslation } from "@/components/utils/i18n";
import { getLocalizedCategory } from "@/components/utils/propertyHelpers"; // Removed getLocalizedPropertyText, getLocalizedAmenities as they are unused

// Datos mock para la página de propiedades
const MOCK_PROPERTIES = [
  {
    id: "prop-1",
    title: "Cabaña Vista al Lago",
    location: "Puerto Varas",
    category: "cabaña",
    price_per_night: 65000,
    images: ["https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop"],
    rating: 4.8,
    total_reviews: 12,
    max_guests: 4
  },
  {
    id: "prop-2",
    title: "Departamento Centro",
    location: "Puerto Varas",
    category: "departamento",
    price_per_night: 45000,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"],
    rating: 4.5,
    total_reviews: 8,
    max_guests: 2
  },
  {
    id: "prop-3",
    title: "Casa Familiar",
    location: "Frutillar",
    category: "casa",
    price_per_night: 85000,
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop"],
    rating: 4.7,
    total_reviews: 15,
    max_guests: 6
  },
  {
    id: "prop-4",
    title: "Cabaña Familiar con Quincho",
    location: "Puerto Varas",
    category: "cabaña",
    price_per_night: 75000,
    images: ["https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop"],
    rating: 4.9,
    total_reviews: 23,
    max_guests: 8
  },
  {
    id: "prop-5",
    title: "Departamento Moderno",
    location: "Puerto Montt",
    category: "departamento",
    price_per_night: 55000,
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop"],
    rating: 4.6,
    total_reviews: 18,
    max_guests: 3
  },
  {
    id: "prop-6",
    title: "Casa con Vista Panorámica",
    location: "Llanquihue",
    category: "casa",
    price_per_night: 95000,
    images: ["https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=400&h=300&fit=crop"],
    rating: 4.8,
    total_reviews: 31,
    max_guests: 10
  },
  {
    id: "prop-7",
    title: "Acogedora Cabaña en el Bosque",
    location: "Pucón",
    category: "cabaña",
    price_per_night: 70000,
    images: ["https://images.unsplash.com/photo-1506748687220-b1d6431952a2?w=400&h=300&fit=crop"],
    rating: 4.7,
    total_reviews: 10,
    max_guests: 4
  },
  {
    id: "prop-8",
    title: "Loft Urbano",
    location: "Santiago",
    category: "departamento",
    price_per_night: 60000,
    images: ["https://images.unsplash.com/photo-1517404215737-02a6b8946890?w=400&h=300&fit=crop"],
    rating: 4.4,
    total_reviews: 15,
    max_guests: 2
  },
  {
    id: "prop-9",
    title: "Amplia Casa de Campo",
    location: "Valdivia",
    category: "casa",
    price_per_night: 110000,
    images: ["https://images.unsplash.com/photo-1494526585095-c41746248156?w=400&h=300&fit=crop"],
    rating: 4.9,
    total_reviews: 28,
    max_guests: 12
  },
  {
    id: "prop-10",
    title: "Casa Rodante Aventura",
    location: "Ruta 7",
    category: "vehículo",
    price_per_night: 50000,
    images: ["https://images.unsplash.com/photo-1533048386341-a6b637a28e7e?w=400&h=300&fit=crop"],
    rating: 4.2,
    total_reviews: 7,
    max_guests: 4
  },
  {
    id: "prop-11",
    title: "Tour de Kayak en el Lago",
    location: "Pucón",
    category: "actividad",
    price_per_night: 30000,
    images: ["https://images.unsplash.com/photo-1531686705701-d7d8f5d0f1b2?w=400&h=300&fit=crop"],
    rating: 4.9,
    total_reviews: 35,
    max_guests: 1
  },
  {
    id: "prop-12",
    title: "Cabaña con Sauna Privado",
    location: "Puerto Varas",
    category: "cabaña",
    price_per_night: 90000,
    images: ["https://images.unsplash.com/photo-1547466542-a279c656d091?w=400&h=300&fit=crop"],
    rating: 4.8,
    total_reviews: 18,
    max_guests: 4
  },
  {
    id: "prop-13",
    title: "Casa de diseño moderno",
    location: "Valparaíso",
    category: "casa",
    price_per_night: 120000,
    images: ["https://images.unsplash.com/photo-1582236940801-447a2f5b5f6d?w=400&h=300&fit=crop"],
    rating: 4.6,
    total_reviews: 20,
    max_guests: 8
  },
  {
    id: "prop-14",
    title: "Departamento con vista al mar",
    location: "Viña del Mar",
    category: "departamento",
    price_per_night: 70000,
    images: ["https://images.unsplash.com/photo-1570535352670-b74c2d61d1e4?w=400&h=300&fit=crop"],
    rating: 4.5,
    total_reviews: 10,
    max_guests: 3
  },
  {
    id: "prop-15",
    title: "Furgón camper para 2",
    location: "San Pedro de Atacama",
    category: "vehículo",
    price_per_night: 45000,
    images: ["https://images.unsplash.com/photo-1594916327343-85e3e20e6f21?w=400&h=300&fit=crop"],
    rating: 4.3,
    total_reviews: 5,
    max_guests: 2
  },
  {
    id: "prop-16",
    title: "Clase de surf en Pichilemu",
    location: "Pichilemu",
    category: "actividad",
    price_per_night: 25000,
    images: ["https://images.unsplash.com/photo-1502422588327-0c7f1a92e807?w=400&h=300&fit=crop"],
    rating: 4.7,
    total_reviews: 12,
    max_guests: 1
  }
];


const PROPERTIES_PER_PAGE = 12;

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false); // For mock data, usually false
  const [totalCount, setTotalCount] = useState(0);
  const [user, setUser] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 500000]);

  const { t } = useTranslation();

  // Function to simulate loading properties
  const loadProperties = useCallback(async (page = 1, append = false) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      let mockResults = [...MOCK_PROPERTIES];

      // Apply filters
      if (selectedCategory !== 'all') {
        mockResults = mockResults.filter(p => p.category === selectedCategory);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        mockResults = mockResults.filter(p =>
          p.title.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
        );
      }

      // For mock data, we usually don't paginate; just return the filtered set.
      // If full pagination simulation is needed, this part would change to slice the array.
      if (append) {
        setProperties(prev => [...prev, ...mockResults]);
      } else {
        setProperties(mockResults);
      }

      setTotalCount(mockResults.length);
      setHasNextPage(false); // For mock data, there are generally no more pages to load.

    } catch (error) {
      console.error("Error loading properties:", error);
      if (!append) {
        setProperties(MOCK_PROPERTIES); // Fallback to all mock data on error
        setTotalCount(MOCK_PROPERTIES.length);
      }
    } finally {
      if (page === 1) setLoading(false);
      else setLoadingMore(false);
    }
  }, [selectedCategory, searchQuery]); // Dependencies ensure loadProperties updates when filters change

  // This `loadMore` function is kept for completeness, but will not be triggered
  // as `hasNextPage` is set to `false` with mock data.
  const loadMore = useCallback(() => {
    if (!loadingMore && hasNextPage) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadProperties(nextPage, true);
    }
  }, [currentPage, loadingMore, hasNextPage, loadProperties]);

  // Apply client-side filters (e.g., price range)
  const applyClientFilters = useCallback(() => {
    let filtered = [...properties];

    // Price filter
    filtered = filtered.filter(property =>
      property.price_per_night >= priceRange[0] &&
      property.price_per_night <= priceRange[1]
    );

    setFilteredProperties(filtered);
  }, [properties, priceRange]);

  // Initial load effect: Reads URL, sets state, loads user, sets initial SEO.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchFromUrl = urlParams.get('search') || '';
    const categoryFromUrl = urlParams.get('category') || 'all';

    // Set initial states from URL.
    setSearchQuery(searchFromUrl);
    setSelectedCategory(categoryFromUrl);

    // Load user data
    const tryLoadUser = async () => {
      setUser(await safeEntityCall(() => User.me(), null));
    };
    tryLoadUser();

    // Set initial SEO based on URL category
    if (categoryFromUrl && ['cabaña', 'departamento', 'casa'].includes(categoryFromUrl)) {
      setDefaultMeta(`category-${categoryFromUrl}`);
    } else {
      setDefaultMeta('properties');
    }

    // Trigger initial property load after a short delay to allow state to settle
    // and ensure `loadProperties` sees the latest `searchQuery` and `selectedCategory`
    const handler = setTimeout(() => {
        loadProperties(1, false);
    }, 100);

    return () => clearTimeout(handler);
  }, [loadProperties]); // Fixed: added loadProperties as dependency

  // Effect to trigger property loading when filters change (debounced for search)
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1); // Reset page to 1 for new search/category
      loadProperties(1, false);
    }, 500); // Debounce for search query and for category changes for consistency

    return () => clearTimeout(handler);
  }, [searchQuery, selectedCategory, loadProperties]); // Fixed: included loadProperties

  // Apply client-side filters when properties or price range changes
  useEffect(() => {
    applyClientFilters();
  }, [applyClientFilters]);

  const categories = [
    { label: t('search.all_categories'), value: 'all' },
    { label: t('search.cabins'), value: 'cabaña' },
    { label: t('search.apartments'), value: 'departamento' },
    { label: t('search.houses'), value: 'casa' },
    { label: t('search.vehicles'), value: 'vehículo' },
    { label: t('search.experiences'), value: 'actividad' }
  ];

  const renderPropertyCard = (property, index) => {
    const imageUrl = (property.images && property.images[0])
      ? property.images[0]
      : "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop";

    return (
      <Link key={property.id} to={createPageUrl("PropertyDetail") + `?id=${property.id}`} className="flex">
        <Card className="neuro-card-inset card-hover overflow-hidden border-0 flex flex-col w-full">
          <div className="aspect-[4/3] relative overflow-hidden">
            <LazyImage
              src={imageUrl}
              alt={property.title}
              width={400}
              height={300}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={index < 4}
              className="w-full h-full"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/90 text-slate-800 backdrop-blur-sm">
                {getLocalizedCategory(property.category)}
              </Badge>
            </div>
          </div>

          <CardContent className="p-3 flex flex-col flex-grow bg-transparent">
            <div className="flex-grow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-semibold text-slate-900 line-clamp-2">
                  {property.title}
                </h3>
              </div>
              <div className="flex items-center text-slate-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{property.location}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div>
                <span className="text-lg font-bold text-slate-900">
                  ${property.price_per_night?.toLocaleString()}
                </span>
                <span className="text-slate-600 text-xs">{t('property.per_night')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  const renderListItem = (property, index) => {
    const imageUrl = (property.images && property.images[0])
      ? property.images[0]
      : "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop";

    return (
      <Link key={property.id} to={createPageUrl("PropertyDetail") + `?id=${property.id}`}>
        <Card className="neuro-card-inset card-hover overflow-hidden border-0 flex flex-col md:flex-row">
          <div className="md:w-1/3 aspect-[4/3] relative overflow-hidden flex-shrink-0 bg-slate-100">
            <LazyImage
              src={imageUrl}
              alt={property.title}
              width={400}
              height={300}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index < 4}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-4 flex-1 bg-transparent">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                {property.title}
              </h3>
            </div>

            <div className="flex items-center text-slate-600 mb-3">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.location}</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-slate-900">
                  ${property.price_per_night?.toLocaleString()}
                </span>
                <span className="text-slate-600 text-sm">{t('property.per_night')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-manto">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-manto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          {t('nav.properties')}
        </h1>
      </div>

      {/* UNIFIED FILTER AND SORT BAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Filters */}
        <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

          {/* Search */}
          <div className="relative">
            <Input
              placeholder={t('common.search') + "..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neuro-input pl-4 h-12 text-base w-full"
            />
          </div>

          {/* Category */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="neuro-input h-12 text-base w-full">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Placeholder filters */}
          <div className="neuro-input h-12 flex items-center justify-center text-slate-500">
            Más filtros próximamente
          </div>

          {/* Price Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="neuro-input h-12 text-base w-full justify-start text-left font-normal">
                <DollarSign className="mr-2 h-4 w-4" />
                <span>
                  {priceRange[0] > 0 || priceRange[1] < 500000
                    ? `$${Math.round(priceRange[0]/1000)}k - $${Math.round(priceRange[1]/1000)}k`
                    : t('search.price_range')}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-6 neuro-card-outset" align="start">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">{t('search.price_range')}</h4>
                <p className="text-sm text-slate-500">
                  Selecciona un rango de precio por noche.
                </p>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={500000}
                  min={0}
                  step={10000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-600">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>${priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort by - placeholder */}
          <div className="neuro-input h-12 flex items-center justify-center text-slate-500">
            Orden: Recientes
          </div>
        </div>

        {/* View Toggles */}
        <div className="hidden md:flex items-center neuro-card-outset rounded-lg p-1 h-12">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`neuro-view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={`neuro-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
          >
            <ListIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="w-full">
        {/* Properties Grid/List */}
        {filteredProperties.length === 0 ? (
          <Card className="p-12 text-center neuro-card-inset">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-slate-600">
              Intenta ajustar tus filtros o buscar con otros términos
            </p>
          </Card>
        ) : viewMode === 'list' ? (
          <div className="space-y-6">
            {filteredProperties.map((property, index) => renderListItem(property, index))}
            {/* Load More Button removed for mock data as hasNextPage is false */}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredProperties.map((property, index) => renderPropertyCard(property, index))}
            </div>

            {/* Load More Button removed for mock data as hasNextPage is false */}
          </>
        )}
      </div>
    </div>
  );
}
