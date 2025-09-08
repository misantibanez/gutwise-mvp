import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import { AzureOpenAIService } from "./azure-openai.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Auth helper function
async function getUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { user: null, error: 'No access token provided' };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  return { user, error };
}

// Helper function to ensure profile exists
async function ensureProfileExists(user: any) {
  // Check if profile already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();
  
  if (existingProfile) {
    return { profile: existingProfile, created: false };
  }
  
  // Create profile if it doesn't exist
  console.log('Creating missing profile for user:', user.id);
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
      }
    ])
    .select()
    .single();
  
  if (error) {
    console.log('Profile creation error:', error);
    return { profile: null, error, created: false };
  }
  
  console.log('Profile created successfully:', newProfile.id);
  return { profile: newProfile, created: true };
}

// Health check endpoint (no auth required)
app.get("/make-server-10f495ea/health", (c) => {
  console.log('Health check endpoint called');
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    message: "GutWise server is running"
  });
});

// Auth endpoints
app.post("/make-server-10f495ea/signup", async (c) => {
  try {
    const { email, password, fullName } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
        }
      ]);

    if (profileError) {
      console.log('Profile creation error:', profileError);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Profile endpoints
app.get("/make-server-10f495ea/profile", async (c) => {
  const { user, error } = await getUser(c.req.raw);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  // Ensure profile exists and get it
  const { profile, error: profileError } = await ensureProfileExists(user);
  
  if (profileError) {
    console.log('Failed to ensure profile exists:', profileError);
    return c.json({ error: 'Failed to get user profile' }, 500);
  }

  // Get full profile data
  const { data: fullProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (fetchError) {
    console.log('Profile fetch error:', fetchError);
    return c.json({ error: 'Profile not found' }, 404);
  }

  return c.json({ profile: fullProfile });
});

app.put("/make-server-10f495ea/profile", async (c) => {
  const { user, error } = await getUser(c.req.raw);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const updates = await c.req.json();
    console.log('Profile update request:', updates);
    
    // Ensure profile exists before updating
    const { profile, error: profileError } = await ensureProfileExists(user);
    
    if (profileError) {
      console.log('Failed to ensure profile exists:', profileError);
      return c.json({ error: 'Failed to create/get user profile' }, 500);
    }
    
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.log('Profile update error:', updateError);
      return c.json({ error: `Failed to update profile: ${updateError.message}` }, 400);
    }

    console.log('Profile updated successfully:', data);
    return c.json({ profile: data });
  } catch (error) {
    console.log('Profile update exception:', error);
    return c.json({ error: `Server error: ${error.message}` }, 500);
  }
});

// Meal endpoints
app.post("/make-server-10f495ea/meals", async (c) => {
  const { user, error } = await getUser(c.req.raw);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  // Ensure profile exists before creating meal
  const { profile, error: profileError } = await ensureProfileExists(user);
  
  if (profileError) {
    console.log('Failed to ensure profile exists:', profileError);
    return c.json({ error: 'Failed to create user profile' }, 500);
  }

  const mealData = await c.req.json();
  
  const { data, error: mealError } = await supabase
    .from('meals')
    .insert([
      {
        user_id: user.id,
        ...mealData,
        meal_time: mealData.meal_time || new Date().toISOString(),
      }
    ])
    .select()
    .single();

  if (mealError) {
    console.log('Meal creation error:', mealError);
    return c.json({ error: 'Failed to log meal' }, 400);
  }

  return c.json({ meal: data });
});

app.get("/make-server-10f495ea/meals", async (c) => {
  const { user, error } = await getUser(c.req.raw);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  const limit = c.req.query('limit') || '50';
  
  const { data: meals, error: mealsError } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(parseInt(limit));

  if (mealsError) {
    console.log('Meals fetch error:', mealsError);
    return c.json({ error: 'Failed to fetch meals' }, 400);
  }

  return c.json({ meals });
});

// Symptom endpoints
app.post("/make-server-10f495ea/symptoms", async (c) => {
  const { user, error } = await getUser(c.req.raw);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  // Ensure profile exists before creating symptoms
  const { profile, error: profileError } = await ensureProfileExists(user);
  
  if (profileError) {
    console.log('Failed to ensure profile exists:', profileError);
    return c.json({ error: 'Failed to create user profile' }, 500);
  }

  const symptomData = await c.req.json();
  
  const { data, error: symptomError } = await supabase
    .from('symptoms')
    .insert([
      {
        user_id: user.id,
        ...symptomData,
        recorded_at: symptomData.recorded_at || new Date().toISOString(),
      }
    ])
    .select()
    .single();

  if (symptomError) {
    console.log('Symptom creation error:', symptomError);
    return c.json({ error: 'Failed to log symptoms' }, 400);
  }

  return c.json({ symptom: data });
});

app.get("/make-server-10f495ea/symptoms", async (c) => {
  const { user, error } = await getUser(c.req.raw);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  const { data: symptoms, error: symptomsError } = await supabase
    .from('symptoms')
    .select(`
      *,
      meals (
        dish_name,
        restaurant_name,
        meal_time
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (symptomsError) {
    console.log('Symptoms fetch error:', symptomsError);
    return c.json({ error: 'Failed to fetch symptoms' }, 400);
  }

  return c.json({ symptoms });
});

// Insights endpoint
app.get("/make-server-10f495ea/insights", async (c) => {
  const { user, error } = await getUser(c.req.raw);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    // Get recent meals and symptoms for insights
    const [mealsResult, symptomsResult] = await Promise.all([
      supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false }),
      
      supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
    ]);

    const meals = mealsResult.data || [];
    const symptoms = symptomsResult.data || [];

    // Simple insights calculation
    const totalMeals = meals.length;
    const symptomsWithProblems = symptoms.filter(s => 
      s.overall_feeling && !['great', 'good'].includes(s.overall_feeling)
    ).length;
    const safeRatio = totalMeals > 0 ? ((totalMeals - symptomsWithProblems) / totalMeals) * 100 : 0;

    // Top trigger analysis
    const triggerFoods: Record<string, number> = {};
    symptoms.forEach(symptom => {
      if (symptom.symptoms && Array.isArray(symptom.symptoms)) {
        symptom.symptoms.forEach((s: string) => {
          triggerFoods[s] = (triggerFoods[s] || 0) + 1;
        });
      }
    });

    const topTriggers = Object.entries(triggerFoods)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([food, count]) => ({ name: food, frequency: count }));

    const insights = {
      totalMeals,
      safeRatio: Math.round(safeRatio),
      topTriggers,
      recentTrend: symptomsWithProblems < (symptoms.length / 2) ? 'improving' : 'stable'
    };

    return c.json({ insights });
  } catch (error) {
    console.log('Insights calculation error:', error);
    return c.json({ error: 'Failed to calculate insights' }, 500);
  }
});

// KV Store fallback endpoints for when database isn't set up
app.post("/make-server-10f495ea/kv-meals", async (c) => {
  const { user, error } = await getUser(c.req.raw);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const mealData = await c.req.json();
    const key = `user_${user.id}_meal_${mealData.id}`;
    
    await kv.set(key, mealData);
    console.log('Meal stored in KV with key:', key);
    
    return c.json({ 
      success: true, 
      message: 'Meal logged successfully using KV store',
      meal: mealData 
    });
  } catch (error) {
    console.log('KV meal storage error:', error);
    return c.json({ error: 'Failed to store meal in KV' }, 500);
  }
});

app.get("/make-server-10f495ea/kv-meals", async (c) => {
  const { user, error } = await getUser(c.req.raw);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const userMealsPrefix = `user_${user.id}_meal_`;
    const meals = await kv.getByPrefix(userMealsPrefix);
    
    // Sort by created_at descending
    const sortedMeals = meals.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    return c.json({ meals: sortedMeals });
  } catch (error) {
    console.log('KV meals fetch error:', error);
    return c.json({ error: 'Failed to fetch meals from KV' }, 500);
  }
});

// Restaurant detection endpoints
app.post("/make-server-10f495ea/restaurants/nearby", async (c) => {
  const { user, error } = await getUser(c.req.raw);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const { latitude, longitude, radius = 0.1 } = await c.req.json();
    
    if (!latitude || !longitude) {
      return c.json({ error: 'Latitude and longitude are required' }, 400);
    }

    // Return mock restaurants based on location
    const mockRestaurants = [
      {
        id: "la-nonna-ristorante",
        name: "La Nonna Ristorante",
        address: "123 Main St",
        latitude: latitude + 0.001,
        longitude: longitude + 0.001,
        cuisine_type: "Italian",
        distance: 0.1
      },
      {
        id: "green-bowl-cafe",
        name: "Green Bowl Cafe", 
        address: "456 Health Ave",
        latitude: latitude + 0.002,
        longitude: longitude + 0.002,
        cuisine_type: "Healthy",
        distance: 0.15
      },
      {
        id: "spice-route-indian",
        name: "Spice Route Indian Cuisine",
        address: "789 Curry Lane",
        latitude: latitude + 0.0015,
        longitude: longitude - 0.001,
        cuisine_type: "Indian",
        distance: 0.12
      },
      {
        id: "taco-libre-mexican",
        name: "Taco Libre",
        address: "321 Fiesta Blvd",
        latitude: latitude - 0.001,
        longitude: longitude + 0.002,
        cuisine_type: "Mexican",
        distance: 0.18
      }
    ];

    // Filter by radius and sort by distance
    const nearbyRestaurants = mockRestaurants
      .filter(restaurant => restaurant.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return c.json({ restaurants: nearbyRestaurants });
  } catch (error) {
    console.log('Restaurant search error:', error);
    return c.json({ error: 'Failed to find nearby restaurants' }, 500);
  }
});

// Menu analysis endpoints
app.post("/make-server-10f495ea/analyze-menu", async (c) => {
  const { user, error } = await getUser(c.req.raw);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const azureOpenAI = new AzureOpenAIService();
    const { menuItems, userConditions, dietaryRestrictions } = await c.req.json();
    
    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
      return c.json({ error: 'Menu items array is required' }, 400);
    }

    // Get user profile to understand their conditions
    const { data: profile } = await supabase
      .from('profiles')
      .select('dietary_restrictions, health_conditions')
      .eq('id', user.id)
      .single();

    const analysisRequest = {
      menuItems,
      userConditions: userConditions || profile?.health_conditions || [],
      dietaryRestrictions: dietaryRestrictions || profile?.dietary_restrictions || []
    };

    const analysis = await azureOpenAI.analyzeMenu(analysisRequest);
    
    return c.json({ analysis });
  } catch (error) {
    console.log('Menu analysis error:', error);
    return c.json({ 
      error: error.message || 'Failed to analyze menu',
      details: error.toString()
    }, 500);
  }
});

app.post("/make-server-10f495ea/analyze-dish", async (c) => {
  const { user, error } = await getUser(c.req.raw);
  
  if (!user) {
    return c.json({ error: error || 'Unauthorized' }, 401);
  }

  try {
    const azureOpenAI = new AzureOpenAIService();
    const { dishName, userConditions } = await c.req.json();
    
    if (!dishName) {
      return c.json({ error: 'Dish name is required' }, 400);
    }

    // Get user profile to understand their conditions
    const { data: profile } = await supabase
      .from('profiles')
      .select('health_conditions')
      .eq('id', user.id)
      .single();

    const conditions = userConditions || profile?.health_conditions || [];
    const analysis = await azureOpenAI.analyzeSingleDish(dishName, conditions);
    
    return c.json({ analysis });
  } catch (error) {
    console.log('Dish analysis error:', error);
    return c.json({ 
      error: error.message || 'Failed to analyze dish',
      details: error.toString()
    }, 500);
  }
});

Deno.serve(app.fetch);