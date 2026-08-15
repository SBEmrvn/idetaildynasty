import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://oowoyyheujpxdixvzztl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vd295eWhldWpweGRpeHZ6enRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDk3NDcsImV4cCI6MjA5MDEyNTc0N30.KfmWh7zNLsEcGC3FSIzu5G8FMYxcMFUmeZlW7qar1cY'
)

const activities = `Pre-rinse
Full vehicle rinsed top to bottom with clean water to loosen surface dirt before any contact wash
Snow foam application
Thick foam applied and left to dwell, lifting heavy soiling from the paintwork without scratching
Two-bucket hand wash
Safe two-bucket method used with a clean wash mitt to wash the body panels, door jambs and bumpers
Clay bar decontamination
Clay bar treatment on all painted panels to remove bonded contamination, tar spots and industrial fallout
Exterior glass polish
All exterior glass surfaces cleaned and polished streak-free using a dedicated glass cleaner
Microfiber dry
Vehicle dried completely with a soft microfiber towel — zero water spots, zero swirls
Full interior vacuum
Seats, floor mats, boot, under-seat areas and all crevices vacuumed thoroughly with a narrow nozzle
Steam cleaning
Steam applied to dashboard, console, door cards and vents to lift embedded grime without chemicals
APC surface treatment
All-purpose cleaner applied and agitated on all hard interior surfaces for a deep clean
Leather clean & condition
Leather seats and trim cleaned with a pH-balanced cleaner then conditioned to restore suppleness
Interior glass cleaning
All interior windows cleaned and polished streak-free
Odour elimination
Odour neutraliser applied throughout the cabin to eliminate smells at the source — not just mask them
Tyre shine included
Tyre dressing applied to all four sidewalls for a clean satin finish — no extra charge
Air freshener
Light interior fragrance applied at the end of the service`

const { error } = await supabase
  .from('services')
  .update({ activities })
  .eq('id', '6d169193-e46d-4fe6-839a-4bc7ead3afba')

if (error) console.error('Error:', error.message)
else console.log('✅ Done!')
