-- Create generation_history table for storing all AI generation history
CREATE TABLE public.generation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  modality TEXT NOT NULL CHECK (modality IN ('video', 'image', 'audio', 'text', 'code')),
  model_id TEXT NOT NULL,
  model_name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  parameters JSONB DEFAULT '{}',
  result_url TEXT,
  result_type TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('completed', 'failed', 'processing')),
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own generation history
CREATE POLICY "Users can view their own generation history"
ON public.generation_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own generation history
CREATE POLICY "Users can insert their own generation history"
ON public.generation_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own generation history
CREATE POLICY "Users can update their own generation history"
ON public.generation_history
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own generation history
CREATE POLICY "Users can delete their own generation history"
ON public.generation_history
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups by user and modality
CREATE INDEX idx_generation_history_user_id ON public.generation_history(user_id);
CREATE INDEX idx_generation_history_modality ON public.generation_history(modality);
CREATE INDEX idx_generation_history_created_at ON public.generation_history(created_at DESC);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.generation_history;