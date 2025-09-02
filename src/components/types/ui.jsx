/**
 * TypeScript-like interfaces for UI components
 * Using JSDoc for type checking in JavaScript
 */

/**
 * @typedef {Object} FeaturedProperty
 * @property {string} id - Unique identifier
 * @property {string} title - Property title
 * @property {string} location - Property location
 * @property {'cabaña'|'departamento'|'casa'|'vehículo'|'actividad'} category - Property category
 * @property {number} price_per_night - Price per night in CLP
 * @property {string[]} images - Array of image URLs
 * @property {number} rating - Average rating (0-5)
 * @property {number} total_reviews - Total number of reviews
 * @property {number} max_guests - Maximum number of guests
 * @property {string} [description] - Optional description
 */

/**
 * @typedef {Object} HomeServiceCategory
 * @property {string} id - Unique identifier
 * @property {string} name - Category name
 * @property {string} slug - URL-friendly slug
 * @property {string} description - Category description
 * @property {string} icon - Lucide icon name
 * @property {'home_services'|'tourism_experiences'|'transport_services'|'classes_workshops'} group - Category group
 * @property {string[]} keywords - Keywords for search
 * @property {boolean} active - Whether category is active
 * @property {number} [display_order] - Optional display order
 * @property {boolean} [show_on_homepage] - Whether to show on homepage
 */

/**
 * @typedef {Object} HomepageData
 * @property {FeaturedProperty[]} featuredProperties - Featured properties to display
 * @property {HomeServiceCategory[]} serviceCategories - Service categories to display
 * @property {boolean} loading - Loading state
 * @property {Error|null} error - Error state if any
 */

/**
 * @typedef {Object} SEOMetadata
 * @property {string} title - Page title
 * @property {string} description - Meta description
 * @property {string} [canonical] - Canonical URL
 * @property {string} [ogImage] - Open Graph image URL
 * @property {string[]} [keywords] - Meta keywords
 */

/**
 * @typedef {Object} UIComponentProps
 * @property {string} [className] - Additional CSS classes
 * @property {React.CSSProperties} [style] - Inline styles
 * @property {string} [testId] - Test identifier
 * @property {string} [ariaLabel] - Accessibility label
 */

/**
 * @typedef {Object} LoadingState
 * @property {boolean} loading - Whether component is loading
 * @property {string} [loadingText] - Custom loading text
 * @property {React.ReactNode} [loadingComponent] - Custom loading component
 */

/**
 * @typedef {Object} ErrorState
 * @property {Error|null} error - Error object if any
 * @property {string} [errorMessage] - Custom error message
 * @property {() => void} [onRetry] - Retry function
 * @property {React.ReactNode} [errorComponent] - Custom error component
 */

/**
 * @typedef {UIComponentProps & LoadingState & ErrorState} BaseComponentProps
 */

export default {
  // Export empty object since this is a type-only file
  // Types are used via JSDoc comments in actual components
};