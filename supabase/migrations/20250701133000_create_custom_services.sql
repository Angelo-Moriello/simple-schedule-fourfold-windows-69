
-- Create custom_services table
CREATE TABLE IF NOT EXISTS custom_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_categories JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE custom_services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own services" ON custom_services
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own services" ON custom_services
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services" ON custom_services
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services" ON custom_services
    FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime
ALTER TABLE custom_services REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE custom_services;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_custom_services_updated_at
    BEFORE UPDATE ON custom_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
