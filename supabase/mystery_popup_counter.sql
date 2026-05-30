-- Table to store batch counter and winning positions
CREATE TABLE IF NOT EXISTS public.mystery_popup_counter (
    id INT PRIMARY KEY,
    batch_counter INT DEFAULT 0,
    win_pos_1 INT NOT NULL,
    win_pos_2 INT NOT NULL
);

-- Enable RLS
ALTER TABLE public.mystery_popup_counter ENABLE ROW LEVEL SECURITY;

-- Allow public to select
CREATE POLICY "mystery_popup_counter_public_select" ON public.mystery_popup_counter
    FOR SELECT TO public USING (true);

-- Insert initial row if not exists
INSERT INTO public.mystery_popup_counter (id, batch_counter, win_pos_1, win_pos_2)
VALUES (1, 0, 3, 7)
ON CONFLICT (id) DO NOTHING;

-- RPC Function to atomically increment and check popup eligibility
CREATE OR REPLACE FUNCTION public.increment_and_check_mystery_popup()
RETURNS JSON AS $$
DECLARE
    row_data RECORD;
    v_show_popup BOOLEAN := FALSE;
    v_next_counter INT;
    v_win_1 INT;
    v_win_2 INT;
BEGIN
    -- Obtain row-level lock on the counter row to prevent race conditions
    SELECT * INTO row_data
    FROM public.mystery_popup_counter
    WHERE id = 1
    FOR UPDATE;

    -- Increment counter
    v_next_counter := row_data.batch_counter + 1;

    -- Check if it matches either winning position
    IF v_next_counter = row_data.win_pos_1 OR v_next_counter = row_data.win_pos_2 THEN
        v_show_popup := TRUE;
    END IF;

    -- If counter reaches 10, reset and generate 2 new unique random winning positions
    IF v_next_counter >= 10 THEN
        v_next_counter := 0;
        
        -- Generate first winning position (1 to 10)
        v_win_1 := floor(random() * 10) + 1;
        
        -- Generate second winning position (1 to 10, must be unique)
        LOOP
            v_win_2 := floor(random() * 10) + 1;
            EXIT WHEN v_win_2 != v_win_1;
        END LOOP;
        
        -- Update with new positions and reset counter
        UPDATE public.mystery_popup_counter
        SET batch_counter = v_next_counter,
            win_pos_1 = v_win_1,
            win_pos_2 = v_win_2
        WHERE id = 1;
    ELSE
        -- Update only the counter
        UPDATE public.mystery_popup_counter
        SET batch_counter = v_next_counter
        WHERE id = 1;
    END IF;

    -- Return JSON response
    RETURN json_build_object('showPopup', v_show_popup);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.increment_and_check_mystery_popup() TO anon;
GRANT EXECUTE ON FUNCTION public.increment_and_check_mystery_popup() TO authenticated;
