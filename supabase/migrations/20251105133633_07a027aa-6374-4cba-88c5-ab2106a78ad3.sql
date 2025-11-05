-- Add geolocation fields to properties table
ALTER TABLE public.properties
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric;

-- Add index for geolocation queries
CREATE INDEX idx_properties_location ON public.properties USING btree(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.properties.latitude IS 'Latitude coordinate for property location (optional)';
COMMENT ON COLUMN public.properties.longitude IS 'Longitude coordinate for property location (optional)';