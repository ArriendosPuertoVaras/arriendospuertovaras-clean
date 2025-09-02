import React, { useState, useEffect } from "react";
import { PromotionalBanner } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import LazyImage from "@/components/ui/LazyImage";

export default function PromotionalBanners({ placement, userType = "all" }) {
  const [banners, setBanners] = useState([]);
  const [dismissedBanners, setDismissedBanners] = useState([]);

  useEffect(() => {
    loadBanners();
    loadDismissedBanners();
  }, [placement, userType]);

  const loadBanners = async () => {
    try {
      const now = new Date().toISOString();
      const allBanners = await PromotionalBanner.filter({
        placement: placement,
        active: true
      });

      // Filter active banners
      const activeBanners = allBanners.filter(banner => {
        // Check date range
        if (banner.start_date && new Date(banner.start_date) > new Date(now)) return false;
        if (banner.end_date && new Date(banner.end_date) < new Date(now)) return false;
        
        // Check target audience
        if (banner.target_audience !== "all" && banner.target_audience !== userType) return false;
        
        // Check seasonal trigger
        if (banner.seasonal_trigger) {
          const currentMonth = new Date().getMonth() + 1;
          const currentSeason = getCurrentSeason(currentMonth);
          if (banner.seasonal_trigger !== currentSeason) return false;
        }
        
        return true;
      });

      // Sort by priority
      activeBanners.sort((a, b) => (b.priority || 1) - (a.priority || 1));
      setBanners(activeBanners);
    } catch (error) {
      console.error("Error loading banners:", error);
    }
  };

  const loadDismissedBanners = () => {
    const dismissed = JSON.parse(localStorage.getItem('dismissedBanners') || '[]');
    setDismissedBanners(dismissed);
  };

  const getCurrentSeason = (month) => {
    // Southern hemisphere seasons
    if (month >= 12 || month <= 2) return 'summer';
    if (month >= 3 && month <= 5) return 'fall';
    if (month >= 6 && month <= 8) return 'winter';
    if (month >= 9 && month <= 11) return 'spring';
    
    // Special dates
    if (month === 12) return 'christmas';
    if (month === 1) return 'new_year';
    if (month === 9) return 'fiestas_patrias';
    
    return 'general';
  };

  const handleBannerClick = async (banner) => {
    try {
      // Track click
      await PromotionalBanner.update(banner.id, {
        click_count: (banner.click_count || 0) + 1
      });
      
      // Navigate to URL
      if (banner.call_to_action_url) {
        if (banner.call_to_action_url.startsWith('http')) {
          window.open(banner.call_to_action_url, '_blank');
        } else {
          window.location.href = banner.call_to_action_url;
        }
      }
    } catch (error) {
      console.error("Error tracking banner click:", error);
    }
  };

  const dismissBanner = (bannerId) => {
    const newDismissed = [...dismissedBanners, bannerId];
    setDismissedBanners(newDismissed);
    localStorage.setItem('dismissedBanners', JSON.stringify(newDismissed));
  };

  const trackImpression = async (banner) => {
    try {
      await PromotionalBanner.update(banner.id, {
        impression_count: (banner.impression_count || 0) + 1
      });
    } catch (error) {
      console.error("Error tracking impression:", error);
    }
  };

  // Filter out dismissed banners
  const visibleBanners = banners.filter(banner => !dismissedBanners.includes(banner.id));

  if (visibleBanners.length === 0) return null;

  // Render based on placement
  const renderBanner = (banner, index) => {
    // Track impression on first render
    React.useEffect(() => {
      trackImpression(banner);
    }, []);

    if (placement === "homepage_hero") {
      return (
        <div key={banner.id} className="relative w-full h-96 md:h-[500px] overflow-hidden rounded-xl group">
          <LazyImage
            src={window.innerWidth < 768 && banner.mobile_image_url ? banner.mobile_image_url : banner.image_url}
            alt={banner.title}
            className="w-full h-full object-cover"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-lg mx-auto text-center text-white p-8">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">{banner.title}</h2>
              <p className="text-lg md:text-xl mb-8 opacity-90">{banner.description}</p>
              {banner.call_to_action_text && (
                <Button 
                  size="lg" 
                  className="bg-white text-slate-900 hover:bg-slate-100"
                  onClick={() => handleBannerClick(banner)}
                >
                  {banner.call_to_action_text}
                </Button>
              )}
            </div>
          </div>
          <button
            onClick={() => dismissBanner(banner.id)}
            className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      );
    }

    if (placement === "homepage_secondary") {
      return (
        <div key={banner.id} className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{banner.title}</h3>
              <p className="text-blue-100 mb-4">{banner.description}</p>
              {banner.call_to_action_text && (
                <Button 
                  variant="outline" 
                  className="bg-white text-blue-700 border-white hover:bg-blue-50"
                  onClick={() => handleBannerClick(banner)}
                >
                  {banner.call_to_action_text}
                </Button>
              )}
            </div>
            {banner.image_url && (
              <LazyImage
                src={banner.image_url}
                alt={banner.title}
                className="w-32 h-32 object-cover rounded-lg ml-6"
                width={128}
                height={128}
              />
            )}
          </div>
          <button
            onClick={() => dismissBanner(banner.id)}
            className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      );
    }

    if (placement === "announcement") {
      return (
        <div key={banner.id} className="bg-amber-50 border-l-4 border-amber-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">{banner.title}</h3>
                <p className="text-sm text-amber-700 mt-1">{banner.description}</p>
                {banner.call_to_action_text && (
                  <Button 
                    size="sm" 
                    className="mt-2 bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => handleBannerClick(banner)}
                  >
                    {banner.call_to_action_text}
                  </Button>
                )}
              </div>
            </div>
            <button
              onClick={() => dismissBanner(banner.id)}
              className="text-amber-400 hover:text-amber-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    // Default card layout
    return (
      <div key={banner.id} className="relative bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {banner.image_url && (
          <LazyImage
            src={banner.image_url}
            alt={banner.title}
            className="w-full h-48 object-cover"
            width={400}
            height={192}
          />
        )}
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 mb-2">{banner.title}</h3>
          <p className="text-slate-600 text-sm mb-4">{banner.description}</p>
          {banner.call_to_action_text && (
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => handleBannerClick(banner)}
            >
              {banner.call_to_action_text}
            </Button>
          )}
        </div>
        <button
          onClick={() => dismissBanner(banner.id)}
          className="absolute top-2 right-2 w-6 h-6 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>
    );
  };

  return (
    <div className={`promotional-banners ${placement}`}>
      {visibleBanners.slice(0, placement === "homepage_hero" ? 1 : 3).map(renderBanner)}
    </div>
  );
}