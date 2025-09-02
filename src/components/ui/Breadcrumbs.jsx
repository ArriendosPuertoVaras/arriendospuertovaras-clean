import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { generateStructuredData, insertStructuredData } from '@/components/utils/seo';

const Breadcrumbs = ({ crumbs }) => {
  if (!crumbs || crumbs.length === 0) {
    return null;
  }

  // Generate structured data for breadcrumbs
  React.useEffect(() => {
    const fullCrumbs = [
      { label: 'Inicio', href: createPageUrl('Home') },
      ...crumbs
    ];
    const breadcrumbsData = generateStructuredData('breadcrumbs', fullCrumbs);
    insertStructuredData(breadcrumbsData);
  }, [crumbs]);

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-slate-500 flex-wrap">
        <li>
          <Link to={createPageUrl("Home")} className="hover:text-blue-600">
            Inicio
          </Link>
        </li>
        {crumbs.map((crumb, index) => (
          <li key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            {crumb.href ? (
              <Link to={crumb.href} className="hover:text-blue-600 truncate">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-700 truncate">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;