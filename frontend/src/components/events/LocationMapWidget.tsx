import React from 'react';

interface LocationMapWidgetProps {
  location?: string | null;
}

const LocationMapWidget: React.FC<LocationMapWidgetProps> = ({ location }) => {
  const trimmedLocation = location?.trim();
  const hasLocation = Boolean(trimmedLocation);

  if (!hasLocation) {
    return null;
  }

  const encodedLocation = encodeURIComponent(trimmedLocation!);
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  const embedUrl = `https://maps.google.com/maps?q=${encodedLocation}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="mt-4 space-y-3">
      <a
        href={mapsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-600 hover:text-primary-700 font-medium"
      >
        View on Google Maps
      </a>

      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <iframe
          title={`Map preview for ${trimmedLocation}`}
          src={embedUrl}
          className="w-full h-64"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default LocationMapWidget;
