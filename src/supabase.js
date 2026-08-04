import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yfeoiqyueksspjkenqhz.supabase.co'
const SUPABASE_KEY = 'sb_publishable_02SQdcBM7sPGQ3mI_pOs7Q_DKhmq0l9'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
