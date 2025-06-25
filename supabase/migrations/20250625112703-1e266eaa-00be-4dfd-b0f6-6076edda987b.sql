
-- Create a profiles table to store additional user information
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Add RLS policies to existing tables to protect data
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_treatments ENABLE ROW LEVEL SECURITY;

-- Create policies for employees (all authenticated users can manage employees)
CREATE POLICY "Authenticated users can view employees" 
  ON public.employees 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert employees" 
  ON public.employees 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update employees" 
  ON public.employees 
  FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete employees" 
  ON public.employees 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Create policies for appointments (all authenticated users can manage appointments)
CREATE POLICY "Authenticated users can view appointments" 
  ON public.appointments 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert appointments" 
  ON public.appointments 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update appointments" 
  ON public.appointments 
  FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete appointments" 
  ON public.appointments 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Create policies for clients (all authenticated users can manage clients)
CREATE POLICY "Authenticated users can view clients" 
  ON public.clients 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert clients" 
  ON public.clients 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" 
  ON public.clients 
  FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete clients" 
  ON public.clients 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Create policies for recurring treatments (all authenticated users can manage them)
CREATE POLICY "Authenticated users can view recurring treatments" 
  ON public.recurring_treatments 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can insert recurring treatments" 
  ON public.recurring_treatments 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update recurring treatments" 
  ON public.recurring_treatments 
  FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete recurring treatments" 
  ON public.recurring_treatments 
  FOR DELETE 
  TO authenticated 
  USING (true);
